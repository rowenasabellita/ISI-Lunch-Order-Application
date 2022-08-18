from datetime import date
from unittest import result
from uuid import UUID
from fastapi import FastAPI, Response, status, APIRouter
from fastapi.responses import HTMLResponse
from pony.orm import *
from base.models.model import db, DishMenu, DishPrice, Menu
from base.schema.menuschema import (
    DishAvailability,
    DishPriceOnly,
    DisplayDishMenus,
    DishMenuDetails,
    SaveDishMenu,
    DishMenus,
    DishAvailabilityOnly
)
from base.schema.dishprice_schema import DishPriceDetails


api = APIRouter(tags=['dish_menu'])


@api.post('/', status_code=status.HTTP_201_CREATED)
async def create_dish_menu(dish_menu: DishMenus, response: Response):
    try:
        with db_session:
            result = []

            for i in dish_menu.items:
                new_dish = DishMenu(dish_price_id=i.dish_price_id, dish_availability=i.dish_availability, 
                                    menu_id=dish_menu.menu_id)
            commit()   # save to db
        
        result.append(SaveDishMenu.from_orm(new_dish))
        return result
    except TransactionIntegrityError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": f"DishMenu already exist"}


@api.get('/', status_code=status.HTTP_200_OK)
async def get_all_dish_menu():
    with db_session:
        dish_menu = DishMenu.select()
        result = [DishMenuDetails.from_orm(i) for i in dish_menu]
    return result


@api.get('/{date}', status_code=status.HTTP_200_OK)
async def get_all_dish_menu_set_for_the_day(date: date, response: Response):
    try:
        with db_session:
            dish_menu = DishMenu.select()
            q = dish_menu.filter(lambda dm: dm.menu_id.date == date)

            result = [DishMenuDetails.from_orm(i) for i in q]
        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Menu {date} not found"}


@api.get('/dish_price_id/{date}', status_code=status.HTTP_200_OK)
async def get_all_dish_menu_set_for_the_day(date: date, response: Response):
    try:
        with db_session:
            date = DishMenu.select().filter(lambda d: d.menu_id.date == date)

            result = [DishPriceOnly.from_orm(i) for i in date]
        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Menu {date} not found"}


@api.get('/search/{date}/', status_code=status.HTTP_200_OK)
async def get_dish_menu_by_date(date: date, response: Response):
    try:
        with db_session:
            dish_menu = DishMenu.select()
            q = dish_menu.filter(lambda m: m.menu_id.date == date)
            result = [DishMenuDetails.from_orm(i) for i in q]

        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Menu {date} not found"}


@api.get('/{date}/side_dish', status_code=status.HTTP_200_OK)
async def get_all_dish_menus_by_date_side_dish(date: date):
    with db_session:
        dish_menu = DishMenu.select(
            lambda md: md.dish_price_id.dish_id.dish_type == 'Side Dish')
        q = dish_menu.filter(lambda dm: dm.menu_id.date == date)
        result = [DishMenuDetails.from_orm(i) for i in q]
    return result


@api.get('/{date}/main_dish', status_code=status.HTTP_200_OK)
async def get_all_dish_menus_by_date_main_dish(date: date):
    with db_session:
        dish_menu = DishMenu.select(
            lambda md: md.dish_price_id.dish_id.dish_type == 'Main Dish')
        q = dish_menu.filter(lambda dm: dm.menu_id.date == date)
        result = [DishMenuDetails.from_orm(i) for i in q]
    return result


@api.get('/{date}/extra', status_code=status.HTTP_200_OK)
async def get_all_dish_menus_by_date_extra(date: date):
    with db_session:
        dish_menu = DishMenu.select(
            lambda md: md.dish_price_id.dish_id.dish_type == 'Extra')
        q = dish_menu.filter(lambda dm: dm.menu_id.date == date)
        result = [DishMenuDetails.from_orm(i) for i in q]
    return result


@api.get('/supplier/{id}/', status_code=status.HTTP_200_OK)
async def get_all_dish_supplier(id: str, response: Response):
    try:
        with db_session:
            uid = UUID(id)
            supplier_menu = DishPrice.select()
            menu = []
            for i in supplier_menu:
                if i.dish_id.supplier.id == uid: 
                    menu.append(i)
            result = [DishPriceDetails.from_orm(i) for i in menu]
        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Dish {id} not found"}


@api.get('/set/supplier/{id}/{date}', status_code=status.HTTP_200_OK)
async def get_all_set_dish_supplier(id: str, date: date,  response: Response):
    try:
        with db_session:
            uid = UUID(id)
            supplier_menu = DishPrice.select()
            menu = []
            dish_menus = DishMenu.select().filter(lambda dm: dm.menu_id.date == date)

            for i in supplier_menu:
                if i.dish_id.supplier.id == uid:
                    menu.append(str(i.id))
            
            for dm in dish_menus:
                if str(dm.dish_price_id.id) in menu:
                    menu.remove(str(dm.dish_price_id.id))
                    
            to_return = []
            for m in menu: 
                dm_id = DishPrice.select().filter(lambda dm: dm.id == UUID(m))
                result = [DishPriceDetails.from_orm(i) for i in dm_id][0]
                to_return.append(result)
            
        return to_return
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Dish {id} not found"}


@api.get('/main_dish/',status_code=status.HTTP_200_OK)
async def get_main_dish_menus():
    with db_session:
        main_dish_menu = DishMenu.select()
        q = main_dish_menu.filter(
            lambda md: md.dish_price_id.dish_id.dish_type == 'Main Dish')
        result = [DishMenuDetails.from_orm(i) for i in q]
    return result


@api.get('/side_dish/', status_code=status.HTTP_200_OK)
async def get_side_dish_menus():
    with db_session:
        main_dish_menu = DishMenu.select()
        q = main_dish_menu.filter(
            lambda md: md.dish_price_id.dish_id.dish_type == 'Side Dish')
        result = [DishMenuDetails.from_orm(i) for i in q]
    return result


@api.get('/{id}/', status_code=status.HTTP_200_OK)
async def get_dish_menu(id: str, response: Response):
    try:
        with db_session:
            dish_menu = DishMenu[str(id)]
            result = DishMenuDetails.from_orm(dish_menu)
        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"DishMenu {id} not found"}
    

@api.get('/{id}/{date}/search/', status_code=status.HTTP_200_OK)
async def get_dish_menu_ids(id: str, date: date):
    with db_session:
        
        res = []
        uid = UUID(id)
        q = DishMenu.select().filter(
            lambda d: d.dish_price_id.id == uid and d.menu_id.date == date)
        for i in q:
            res.append(str(i.id))
        print(res)
        dish_menu = DishMenu[res[0]]
        result = DishMenuDetails.from_orm(dish_menu)
    return result


@api.put("/{id}", status_code=status.HTTP_200_OK)
async def update_menu(id: str, dish_menu: DisplayDishMenus, response: Response):
    try:
        with db_session:
            updated_dish_menu = DishMenu[id]
            updated_dish_menu.set(dish_availability=dish_menu.dish_availability,
                                  dish_price_id=dish_menu.dish_price_id, menu_id=dish_menu.menu_id)
            commit()

        result = SaveDishMenu.from_orm(updated_dish_menu)
        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"DishMenu {id} not found"}


@api.put("/{id}/update/", status_code=status.HTTP_200_OK)
async def update_dish_menu_for_the_day(id: str, dish_menu: DishAvailabilityOnly, response: Response):
    try:
        with db_session:
            updated_dish_menu = DishMenu[id]
            updated_dish_menu.set(dish_availability=dish_menu.dish_availability)
            commit()

        result = SaveDishMenu.from_orm(updated_dish_menu)
        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"DishMenu {id} not found"}
    

@api.delete('/{id}/', status_code=status.HTTP_204_NO_CONTENT)
async def remove_dish_menu(id: str, response: Response):
    try:
        with db_session:
            dish_menu = DishMenu[id]
            dish_menu.delete()

        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"DishMenu {id} not found"}
