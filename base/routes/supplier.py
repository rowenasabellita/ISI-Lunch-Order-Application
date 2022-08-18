from fastapi import (
    FastAPI, Response, 
    status, APIRouter
)
from base.schema.supplierschema import SupplierSchema, SaveSupplier
from base.schema.dishschema import DishSchema
from base.models.model import db, Supplier, Dish
from fastapi.responses import HTMLResponse
from pony.orm import *


api = APIRouter(tags=['supplier'])

@api.post('/', status_code=status.HTTP_201_CREATED)
async def create_supplier(supplier: SupplierSchema, response: Response):
    try:
        with db_session:
            new_supplier = Supplier(supplier_name=supplier.supplier_name,main_dish_free=supplier.main_dish_free,side_dish_free=supplier.side_dish_free)
            commit()    # save to db

        result = SupplierSchema.from_orm(new_supplier)
        return result
    except TransactionIntegrityError:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": f"Supplier already exist"}


@api.get('/supplier_names', status_code=status.HTTP_200_OK)
async def get_supplier_names():
    with db_session:
        supplier = Supplier.select(lambda s: s.supplier_name)
        res = [SaveSupplier.from_orm(i) for i in supplier]
    return res

@api.get('/', status_code=status.HTTP_200_OK)
async def get_all_supplier():
    with db_session:
        supplier = Supplier.select()
        result = [SupplierSchema.from_orm(i) for i in supplier]
    return result


@api.get('/{id}/', status_code=status.HTTP_200_OK)
async def get_supplier(id: str, response: Response):
    try:
        with db_session:
            supplier = Supplier[id]
            result = SupplierSchema.from_orm(supplier)

            return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Supplier {id} not found"}


@api.put("/{id}", status_code=status.HTTP_200_OK)
async def update_supplier(id: str, supplier: SupplierSchema, response: Response):
    try:
        with db_session:
            updated_supplier = Supplier[id]
            updated_supplier.set(supplier_name=supplier.supplier_name,main_dish_free=supplier.main_dish_free,side_dish_free=supplier.side_dish_free)
            commit()

        result = SupplierSchema.from_orm(updated_supplier)
        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Supplier {id} not found"}


@api.delete('/{id}/', status_code=status.HTTP_204_NO_CONTENT)
async def remove_supplier(id: str, response: Response):
    try:
        with db_session:
            supplier = Supplier[id]
            supplier.delete()

        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Supplier {id} not found"}