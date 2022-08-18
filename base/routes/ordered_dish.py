from fastapi import APIRouter
from fastapi import FastAPI, Response, status, APIRouter, HTTPException
from base.schema.orderschema import (
    OrderedDishes,
    OrderedDishSchema,
    SaveOrderedDish,
    OrderedDishDetails,
)
from base.models.model import OrderedDish, Order
from pony.orm import *
from uuid import UUID
from datetime import date


api = APIRouter(tags=['ordered_dish'])


@api.post('/', status_code=status.HTTP_201_CREATED)
async def create_multiple_order(ordered_dish: OrderedDishes):
    with db_session:
        result = []

        for i in ordered_dish.items:
            new_order = OrderedDish(order_id=ordered_dish.order_id, dish_menu_id=i.dish_menu_id,
                                    quantity=i.quantity, remarks=i.remarks, order_price=i.order_price)
            result.append(str(new_order.id))

        for j in result:
            update_order = OrderedDish[j]
            ordered_d = OrderedDish.select().filter(lambda od: od.id == UUID(j))

            for od in ordered_d:
                update_order.set(employee_name=od.order_id.user_id.first_name + " " + od.order_id.user_id.last_name,
                                 dish_name=od.dish_menu_id.dish_price_id.dish_id.dish_name,
                                 dish_type=od.dish_menu_id.dish_price_id.dish_id.dish_type)

        res = SaveOrderedDish.from_orm(update_order)
    return res


@api.get('/{date}', status_code=status.HTTP_200_OK)
async def get_all_user_orders_by_date(date: date):
    with db_session:
        ordered_dish = OrderedDish.select()
        q = ordered_dish.filter(lambda od: od.order_id.order_date == date)

        if (len(q) > 0):
            result = [OrderedDishDetails.from_orm(i) for i in q]
            return result
        else:
            return []


@api.get('/{date}/total_by_dish_type', status_code=status.HTTP_200_OK)
async def count_user_orders_by_date(date: date, response: Response):
    with db_session:
        side_res = []
        main_res = []
        extra_res = []

        main = OrderedDish.select(lambda m: m.dish_type == 'Main Dish').filter(
            lambda od: od.order_id.order_date == date).count()
        side = OrderedDish.select(lambda m: m.dish_type == 'Side Dish').filter(
            lambda od: od.order_id.order_date == date).count()
        extra = OrderedDish.select(lambda m: m.dish_type == 'Extra').filter(
            lambda od: od.order_id.order_date == date).count()

        main_res.append(main)
        side_res.append(side)
        extra_res.append(extra)

    return [{"main_dish": main_res[0], "side_dish": side_res[0], "extra": extra_res[0]}]


@api.get('/{date}/total_quantity_by_dish_type', status_code=status.HTTP_200_OK)
async def count_quantity_of_dish_orders_by_date(date: date, response: Response):
    try:
        with db_session:
            sup = []
            total_users = []

            select_date = OrderedDish.select().filter(
                lambda od: od.order_id.order_date == date)
            supplier = OrderedDish.select(
                lambda s: s.dish_menu_id.dish_price_id.dish_id.supplier.supplier_name)
            user_orders = Order.select(lambda o: o.user_id).filter(
                lambda od: od.order_date == date).count()
            total_users.append(user_orders)

            for s in supplier:
                if s.order_id.order_date == date:
                    sup.append(
                        s.dish_menu_id.dish_price_id.dish_id.supplier.supplier_name)

            main_qty = 0
            side_qty = 0
            extra_qty = 0

            for i in select_date:
                if i.dish_type == 'Main Dish':
                    main_qty += i.quantity

                if i.dish_type == 'Side Dish':
                    side_qty += i.quantity

                if i.dish_type == 'Extra':
                    extra_qty += i.quantity

        return [{"main_dish": main_qty, "side_dish": side_qty, "extra": extra_qty, "supplier_name": sup[0], "total_user_orders": total_users[0]}]

    except IndexError:
        return [{"main_dish": 0, "side_dish": 0, "extra": 0, "supplier_name": 0, "total_user_orders": 0}]


@api.get('/{date}/summary_free', status_code=status.HTTP_200_OK)
async def summary_report_for_free_orders(date: date):
    try:
        with db_session:
            main = []
            side = []
            extra = []
            total_number_of_employees = []

            select_date = OrderedDish.select().filter(
                lambda od: od.order_id.order_date == date)
            count_number_of_employees = Order.select(lambda o: o.user_id).filter(
                lambda od: od.order_date == date).count()
            total_number_of_employees.append(count_number_of_employees)

            for i in select_date:
                amount = 0
                total_price = main + side
                amount = total_number_of_employees[0] * total_price
                main_free = i.dish_menu_id.dish_price_id.dish_id.supplier.main_dish_free
                side_free = i.dish_menu_id.dish_price_id.dish_id.supplier.side_dish_free
                dish_type = i.dish_menu_id.dish_price_id.dish_id.dish_type
                price = i.dish_menu_id.dish_price_id.price
                supplier = i.dish_menu_id.dish_price_id.dish_id.supplier.id

                if main_free == True and side_free == True:
                    if dish_type == 'Main Dish':
                        main.append(price)
                    if i.dish_menu_id.dish_price_id.dish_id.dish_name == 'Rice':
                        side.append(price)

                elif main_free == True and side_free == False:
                    if dish_type == 'Main Dish':
                        main.append(price)
                        amount = total_number_of_employees[0] * main[0]
                        return [{"date": date, "number_of_employees": total_number_of_employees[0], "price": main[0], "amount": amount, "supplier":supplier}]

                elif main_free == False and side_free == True:
                    if dish_type == 'Side Dish':
                        side.append(price)
                        amount = total_number_of_employees[0] * side[0]
                        return [{"date": date, "number_of_employees": total_number_of_employees[0], "price": side[0], "amount": amount, "supplier":supplier}]
                else:
                    if dish_type == 'Main Dish':
                        main.append(price)
                    if dish_type == 'Side Dish':
                        side.append(price)
                    if i.dish_menu_id.dish_price_id.dish_id.dish_name == 'Rice':
                        extra.append(price)
                        total_price = main[0] + side[0] + extra[0]
                        amount = total_number_of_employees[0] * total_price
                        return [{"date": date, "number_of_employees": total_number_of_employees[0], "price": total_price, "amount": amount, "supplier":supplier}]

            amount = 0
            total_price = main[0] + side[0]
            amount = total_number_of_employees[0] * total_price

            return [{"date": date, "number_of_employees": total_number_of_employees[0], "price": total_price, "amount": amount, "supplier":supplier}]
    except IndexError:
        return []


@api.get('/', status_code=status.HTTP_200_OK)
async def get_all_order():
    with db_session:
        ordered_dish = OrderedDish.select()
        result = [OrderedDishDetails.from_orm(i) for i in ordered_dish]

    return result


@api.get('/', status_code=status.HTTP_200_OK)
async def get_all_ordered_dish():
    with db_session:
        ordered_dish = OrderedDish.select()
        q = ordered_dish.filter(lambda o: o.dish_menu_id.dish_id.dish_name)
        result = [OrderedDishDetails.from_orm(i) for i in ordered_dish]

    return result


@api.get('/{id}/', status_code=status.HTTP_200_OK)
async def get_order(id: str, response: Response):
    try:
        with db_session:
            ordered_dish = OrderedDish[str(id)]
            result = OrderedDishDetails.from_orm(ordered_dish)

            return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Order{id} not found"}


@api.get('/{id}/{date}/user_order/', status_code=status.HTTP_200_OK)
async def get_user_order_by_date(id: str, date: date, response: Response):
    try:
        with db_session:
            uid = UUID(id)
            orders =[]
            ordered_dish = OrderedDish.select().filter(lambda o: o.order_id.order_date == date)
            
            for i in ordered_dish:
                if i.order_id.user_id.id == uid:
                    orders.append(str(i.id))
            
            to_return = []
            for o in orders:
                od_id = OrderedDish.select().filter(lambda od: od.id == UUID(o))
                result = [OrderedDishDetails.from_orm(i) for i in od_id]
                to_return.append(result)
            
        return to_return
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Order{id} not found"}


@api.put("/{id}", status_code=status.HTTP_200_OK)
async def update_order(id: str, ordered_dish: OrderedDishSchema, response: Response):
    try:
        with db_session:
            updated_order = OrderedDish[id]
            updated_order.set(order_id=ordered_dish.order_id, dish_menu_id=ordered_dish.dish_menu_id, quantity=ordered_dish.quantity,
                              remarks=ordered_dish.remarks, order_price=ordered_dish.order_price)
            commit()

        result = SaveOrderedDish.from_orm(updated_order)
        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Order{id} not found"}


@api.delete('/{id}/', status_code=status.HTTP_204_NO_CONTENT)
async def remove_order(id: str, response: Response):
    try:
        with db_session:
            ordered_dish = OrderedDish[id]
            ordered_dish.delete()

        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Ordere{id} not found"}
