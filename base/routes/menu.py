from datetime import date
from urllib import response
from fastapi import FastAPI, Response, status, APIRouter
from fastapi.responses import HTMLResponse
from pony.orm import *
from base.schema.menuschema import MenuSchema
from base.models.model import (
    db,
    Menu,
    Order,
    OrderSummary
)

api = APIRouter(tags=['menu'])


@api.get('/', status_code=status.HTTP_200_OK)
async def get_all_menu():
    with db_session:
        menu = Menu.select()
        result = [MenuSchema.from_orm(i) for i in menu]
    return result


@api.post('/', status_code=status.HTTP_201_CREATED)
async def create_menu(menu: MenuSchema, response: Response):
    try:
        with db_session:
            new_dish = Menu(date=menu.date)
            commit()   # save to db

        result = MenuSchema.from_orm(new_dish)
        return result
    except TransactionIntegrityError:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": f"Date already exist"}

@api.get('/{id}/', status_code=status.HTTP_200_OK)
async def get_menu(id: str, response: Response):
    try:
        with db_session:
            menu = Menu[str(id)]
            result = MenuSchema.from_orm(menu)

            return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Menu {id} not found"}


@api.get('/search/{date}/', status_code=status.HTTP_200_OK)
async def get_menu_by_date(date: date, response: Response):
    try:
        with db_session:
            menu=Menu.select()
            q = menu.filter(lambda m: m.date == date)
            result = [MenuSchema.from_orm(i) for i in q]

        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Menu {date} not found"}


@api.put("/{id}", status_code=status.HTTP_200_OK)
async def update_menu(id: str, menu: MenuSchema, response: Response):
    try:
        with db_session:
            updated_menu = Menu[id]
            updated_menu.set(date=menu.date)
            commit()

        result = MenuSchema.from_orm(updated_menu)
        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Menu {id} not found"}
        

@api.delete('/{date}/', status_code=status.HTTP_204_NO_CONTENT)
async def remove_menu_date(date: date, response: Response):
    try:
        with db_session:
            menu = Menu.select().filter(lambda m: m.date == date)
            menu.delete()
            orders = Order.select().filter(lambda o: o.order_date == date)
            orders.delete()
            order_summary = OrderSummary.select().filter(lambda od: od.date == date)
            order_summary.delete()

        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Menu {date} not found"}
