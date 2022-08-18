from datetime import date
from unittest import result
from uuid import UUID
from fastapi import FastAPI, Response, status, APIRouter
from fastapi.responses import HTMLResponse
from pony.orm import *
from base.models.model import db, DishMenu, DishPrice
from base.schema.dishprice_schema import (
    SaveDishPrice,
    DishPriceSchema,
    DishPriceDetails
)

api = APIRouter(tags=['dish_price'])


@api.get('/', status_code=status.HTTP_200_OK)
async def get_all_dish_prices():
    with db_session:
        dish_price = DishPrice.select()
        result = [DishPriceDetails.from_orm(i) for i in dish_price]
    return result


@api.post('/', status_code=status.HTTP_201_CREATED)
async def create_dish_price(dish_price: DishPriceSchema):
        with db_session:
            new_dish_price = DishPrice(price=dish_price.price, is_active=dish_price.is_active, 
                                       dish_id=dish_price.dish_id)
            commit()   # save to db

        result = SaveDishPrice.from_orm(new_dish_price)
        return result


@api.get('/{id}/', status_code=status.HTTP_200_OK)
async def get_dish_price(id: str, response: Response):
    try:
        with db_session:
            dish_price = DishPrice[str(id)]
            result = DishPriceDetails.from_orm(dish_price)

        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"DishPrice {id} not found"}


@api.put("/{id}", status_code=status.HTTP_200_OK)
async def update_dish_price(id: str, dish_price: DishPriceSchema, response: Response):
    try:
        with db_session:
            updated_dish = DishPrice[id]
            updated_dish.set(price=dish_price.price, is_active=dish_price.is_active, 
                             dish_id=dish_price.dish_id)
            commit()

        result = SaveDishPrice.from_orm(updated_dish)
        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"DishPrice {id} not found"}

@api.delete('/{id}/', status_code=status.HTTP_204_NO_CONTENT)
async def remove_dish_price(id: str, response: Response):
    try:
        with db_session:
            dish_price = DishPrice[id]
            dish_price.delete()

        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"DishPrice {id} not found"}