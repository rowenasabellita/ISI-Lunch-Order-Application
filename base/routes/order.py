from fastapi import APIRouter
from datetime import date
from fastapi import Response, status, APIRouter
from base.schema.orderschema import (
    OrderSchema,
    OrderDetails,
    SaveOrder,
    OrderSum,
)
from base.models.model import Order, OrderedDish
from pony.orm import *
from datetime import date as from_date
from datetime import date as to_date
from datetime import date
from uuid import UUID

api = APIRouter(tags=['order'])


@api.post('/', status_code=status.HTTP_201_CREATED)
async def create_order_with_empployee_name(order: OrderSchema, response: Response):
    try:
        with db_session:

            new_order = Order(order_date=order.order_date, user_id=order.user_id,
                              employee_name="sample")

            update_order = Order[new_order.id]
            order = Order.select().filter(lambda o: o.id == new_order.id)

            for od in order:
                update_order.set(employee_name=od.user_id.first_name)
                commit()

            res = SaveOrder.from_orm(update_order)
        return res

    except TransactionIntegrityError:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": f"User already exist on that order date"}


@api.get('/search/by_supplier/{id}/{from_date}/{to_date}/', status_code=status.HTTP_200_OK)
async def get_all_user_order_by_supplier_sort_by_date_range(id: str, from_date: from_date, to_date: to_date):
    with db_session:
        uid = UUID(id)

        order_dish = select(od for od in OrderedDish if between(
            od.order_id.order_date, from_date, to_date))
        fil = order_dish.filter(
            lambda f: f.dish_menu_id.dish_price_id.dish_id.supplier.id == uid)
        res = [OrderSum.from_orm(i) for i in fil]

        to_return = []
        ids = []
        for i in range(len(fil)):
            ids.append(str(res[i].order_id.id))
            ids = list(set(ids))

        for j in ids:
            sel = OrderedDish.select().filter(lambda o: o.order_id.id == UUID(j))
            result = [OrderSum.from_orm(i) for i in sel][0]
            to_return.append(result)

    return to_return


@api.get('/employees/{date}', status_code=status.HTTP_200_OK)
async def get_all_user_orders_by_date(date: date):
    with db_session:
        employee_names = Order.select(lambda o: o.user_id.first_name)
        q = employee_names.filter(lambda od: od.order_date == date)

        result = [OrderDetails.from_orm(i) for i in q]
    return result


@api.get('/search/employees/{from_date}/{to_date}/', status_code=status.HTTP_200_OK)
async def get_all_user_order_by_date_range(from_date: from_date, to_date: to_date):
    with db_session:
        order = select(o for o in Order if between(
            o.order_date, from_date, to_date))
        q = order.order_by(lambda o: o.order_date)

        result = [OrderDetails.from_orm(i) for i in q]
    return result


@api.get('/employees/{from_date}/{to_date}/', status_code=status.HTTP_200_OK)
async def get_all_user_order_by_date_arrange(from_date: from_date, to_date: to_date):
    with db_session:
        order = select(o for o in Order if between(
            o.order_date, from_date, to_date))

        result = [OrderDetails.from_orm(i) for i in order]
    return result


@api.get('/search/{date}/', status_code=status.HTTP_200_OK)
async def get_order_by_date(date: date, response: Response):
    with db_session:
        order = Order.select()
        q = order.filter(lambda dm: dm.order_date == date)
        result = [OrderDetails.from_orm(i) for i in q]

        return result


@api.get('/', status_code=status.HTTP_200_OK)
async def get_all_order():
    with db_session:
        order = Order.select()
        result = [OrderDetails.from_orm(i) for i in order]

    return result


@api.get('/{id}/', status_code=status.HTTP_200_OK)
async def get_order(id: str, response: Response):
    try:
        with db_session:
            order = Order[str(id)]
            result = OrderDetails.from_orm(order)

            return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Order date {id} not found"}


@api.put("/{id}", status_code=status.HTTP_200_OK)
async def update_order(id: str, order: OrderSchema, response: Response):
    try:
        with db_session:
            updated_order = Order[id]
            updated_order.set(order_date=order.order_date,
                              user_id=order.user_id)
            commit()

        result = SaveOrder.from_orm(updated_order)
        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Order date {id} not found"}


@api.delete('/{id}/', status_code=status.HTTP_204_NO_CONTENT)
async def remove_order(id: str, response: Response):
    try:
        with db_session:
            order = Order[id]
            order.delete()

        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Order {id} not found"}
