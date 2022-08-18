from fastapi import Response, status, APIRouter
from base.schema.dishorder_schema import OrderSummarySchema
from base.models.model import db, OrderSummary
from pony.orm import *
from datetime import date as from_date
from datetime import date as to_date
from datetime import date
from uuid import UUID

api = APIRouter(tags=['order_summary'])


@api.post('/', status_code=status.HTTP_201_CREATED)
async def create_order(order_summary: OrderSummarySchema, response: Response):
    try:
        with db_session:
            new_dish_order = OrderSummary(date=order_summary.date, number_of_employees=order_summary.number_of_employees,
                                          price=order_summary.price, total_amount=order_summary.total_amount, supplier=order_summary.supplier)
            commit()    # save to db

        result = OrderSummarySchema.from_orm(new_dish_order)
        return result
    except TransactionIntegrityError:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": f"Date already exist"}


@api.get('/grand_total/by_supplier/{id}/{from_date}/{to_date}/', status_code=status.HTTP_200_OK)
async def get_order_summary_total_by_supplier_sort_by_date_range(id: str, from_date: from_date, to_date: to_date):
    try:
        with db_session:
            total_employees = 0
            price = []
            grand_total = 0

            order = select(od for od in OrderSummary if between(
                od.date, from_date, to_date))
            order_by = order.filter(lambda o: o.supplier == id)

            for j in order_by:
                total_employees += j.number_of_employees
                price.append(j.price)
                grand_total += j.total_amount

            return [{"total_employees": total_employees, "price": price[0], "grand_total": grand_total}]
    except IndexError:
        return [{"total_employees": 0, "price": 0, "grand_total": 0}]


@api.get('/supplier/{id}/{from_date}/{to_date}/', status_code=status.HTTP_200_OK)
async def order_summary_total_by_supplier_sort_by_date_range(id: str, from_date: from_date, to_date: to_date):
    with db_session:
        ordered_dish = OrderSummary.select()

        total_employees = 0
        price = []
        grand_total = 0

        for i in ordered_dish:
            if i.supplier == id:
                order = select(od for od in OrderSummary if between(
                    od.date, from_date, to_date))
                order_by = order.order_by(lambda o: o.date)

                for j in order_by:
                    total_employees += j.number_of_employees
                    price.append(j.price)
                    grand_total += j.total_amount

                return [{"total_employees": total_employees, "price": price[0], "grand_total": grand_total}]
            else:
                return [{"total_employees": 0, "price": 0, "grand_total": 0}]


@api.get('/', status_code=status.HTTP_200_OK)
async def get_all_dish_order():
    with db_session:
        dishorder = OrderSummary.select()
        result = [OrderSummarySchema.from_orm(i) for i in dishorder]
    return result


@api.get('/search/range/{from_date}/{to_date}/', status_code=status.HTTP_200_OK)
async def get_all_dish_order_by_date_range(from_date: from_date, to_date: to_date):
    with db_session:
        dishorder = select(o for o in OrderSummary if between(
            o.date, from_date, to_date))

        result = [OrderSummarySchema.from_orm(i) for i in dishorder]
    return result


@api.get('/supplier/{id}/{from_date}/{to_date}/', status_code=status.HTTP_200_OK)
async def order_summary_by_supplier_sort_by_date_range(id: str, from_date: from_date, to_date: to_date):
    with db_session:
        ordered_dish = OrderSummary.select()

        for i in ordered_dish:
            if i.supplier == id:
                order = select(od for od in OrderSummary if between(
                    od.date, from_date, to_date))
                order_by = order.order_by(lambda o: o.date)
                res = [OrderSummarySchema.from_orm(i) for i in order_by]
                return res
            else:
                return []


@api.get('/search/by_supplier/{id}/{from_date}/{to_date}/', status_code=status.HTTP_200_OK)
async def get_order_summary_by_supplier_sort_by_date_range(id: str, from_date: from_date, to_date: to_date):
    with db_session:

        order = select(od for od in OrderSummary if between(
            od.date, from_date, to_date))
        fil = order.filter(lambda o: o.supplier == id)

        res = [OrderSummarySchema.from_orm(i) for i in fil]
        return res


@api.get('/grand_total/by_supplier/{id}/{from_date}/{to_date}/', status_code=status.HTTP_200_OK)
async def get_order_summary_total_by_supplier_sort_by_date_range(id: str, from_date: from_date, to_date: to_date):
    try:
        with db_session:
            total_employees = 0
            price = []
            grand_total = 0

            order = select(od for od in OrderSummary if between(
                od.date, from_date, to_date))
            order_by = order.filter(lambda o: o.supplier == id)

            for j in order_by:
                total_employees += j.number_of_employees
                price.append(j.price)
                grand_total += j.total_amount

            return [{"total_employees": total_employees, "price": price[0], "grand_total": grand_total}]
    except IndexError:
        return [{"total_employees": 0, "price": 0, "grand_total": 0}]


@api.get('/{date}', status_code=status.HTTP_200_OK)
async def get_all_dish_order(date: date, response: Response):
    try:
        with db_session:
            dishorder = OrderSummary.select().filter(lambda os: os.date == date)
            result = [OrderSummarySchema.from_orm(i) for i in dishorder]
        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"OrderSummary {date} not found"}


@api.get('/{id}/', status_code=status.HTTP_200_OK)
async def get_order(id: str, response: Response):
    try:
        with db_session:
            order_summary = OrderSummary[str(id)]
            result = OrderSummarySchema.from_orm(order_summary)

            return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"OrderSummary {id} not found"}


@api.put("/{id}/", status_code=status.HTTP_200_OK)
async def update_order(id: str, order_summary: OrderSummarySchema, response: Response):
    try:
        with db_session:
            updated_dish_order = OrderSummary[id]
            updated_dish_order.set(date=order_summary.date, number_of_employees=order_summary.number_of_employees,
                                   price=order_summary.price, total_amount=order_summary.total_amount, supplier=order_summary.supplier)
            commit()

        result = OrderSummarySchema.from_orm(updated_dish_order)
        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"OrderSummary {id} not found"}


@api.delete('/{id}/', status_code=status.HTTP_204_NO_CONTENT)
async def remove_order(id: str, response: Response):
    try:
        with db_session:
            order_summary = OrderSummary[id]
            order_summary.delete()

        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"OrderSummary {id} not found"}
