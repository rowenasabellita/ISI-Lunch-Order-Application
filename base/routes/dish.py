from urllib.request import Request
from fastapi import FastAPI, Response, UploadFile,File, status, APIRouter,Depends,Form
from base.schema.dishschema import (
    DishSchema,
    DishDetails, 
    SaveDish
)
from base.models.model import (
    db,
    Dish
)
from pony.orm import *
import os
from fastapi.responses import JSONResponse,FileResponse,StreamingResponse
import aiofiles

api = APIRouter(tags=['dish'])

@api.get('/', status_code=status.HTTP_200_OK)
async def get_all_dishes():
    with db_session:
        dish = Dish.select()
        result = [DishDetails.from_orm(i) for i in dish]
    return result


@api.get('/{id}/', status_code=status.HTTP_200_OK)
async def get_dish(id: str, response: Response):
    try:
        with db_session:
            dish = Dish[str(id)]
            result = DishDetails.from_orm(dish)

        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Dish {id} not found"}


@api.put("/{id}", status_code=status.HTTP_200_OK)
async def update_dish(id: str, dish: DishSchema, response: Response):
    try:
        with db_session:
            updated_dish = Dish[id]
            updated_dish.set(dish_name=dish.dish_name, dish_type=dish.dish_type, 
                             supplier=dish.supplier)
            commit()

        result = SaveDish.from_orm(updated_dish)
        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Dish {id} not found"}


@api.delete('/{id}/', status_code=status.HTTP_204_NO_CONTENT)
async def remove_dish(id: str, response: Response):
    try:
        with db_session:
            dish = Dish[id]
            os.remove(dish.img_url.replace("./","frontend/public/",1))
            dish.delete()

        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND


@api.post("/")
async def create_dish(dish_name:str=Form(...),dish_type:str=Form(...),supplier:str=Form(...),file: UploadFile = File(...)):
    try:
        async with aiofiles.open("build/images/"+file.filename, 'wb') as out_file:
            content = await file.read()  
            await out_file.write(content)
            url=str("./images/"+file.filename)
        with db_session:
            new_dish = Dish(dish_name=dish_name, dish_type=dish_type, 
                            supplier=supplier,img_url=url)
            commit()
        result = SaveDish.from_orm(new_dish)
        return result
    except Exception as e:
        return JSONResponse(
        status_code = status.HTTP_400_BAD_REQUEST,
        content = { 'message' : str(e) }
        )