from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID
from datetime import date
from base.schema.menuschema import DishMenuDetails
from base.schema.userschema import UserSchema


class SaveOrder(BaseModel):
    id: Optional[UUID]
    order_date: date

    class Config:
        orm_mode = True


class OrderSchema(SaveOrder):
    user_id: str


class OrderDetails(OrderSchema):
    user_id: UserSchema
    employee_name: str


class Items(BaseModel):
    dish_menu_id: str
    quantity: int
    remarks: str
    order_price: float

    class Config:
        orm_mode = True


class SaveOrderedDish(BaseModel):
    id: Optional[UUID]
    remarks: str
    quantity: int
    order_price: float

    class Config:
        orm_mode = True


class OrderedDishes(BaseModel):
    order_id: str
    items: List[Items]

    class Config:
        orm_mode = True


class OrderedDishSchema(SaveOrderedDish):
    order_id: str
    dish_menu_id: str

    class Config:
        orm_mode = True


class OrderedDishDetails(OrderedDishSchema):
    order_id: OrderDetails
    employee_name: str
    dish_menu_id: DishMenuDetails
    dish_name: str
    dish_type: str

    class Config:
        orm_mode = True


class Dishes(BaseModel):
    dish_name: str

    class Config:
        orm_mode = True


class OrderSum(BaseModel):
    order_id: OrderDetails

    class Config:
        orm_mode = True
