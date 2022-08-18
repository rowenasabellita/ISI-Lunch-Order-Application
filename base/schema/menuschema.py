from datetime import date
from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID, uuid4
from base.schema.dishprice_schema import DishPriceDetails


class MenuSchema(BaseModel):
    id: Optional[UUID]
    date: date

    class Config:
        orm_mode = True

class DishAvailability(BaseModel):
    dish_price_id: str
    dish_availability: int

    class Config:
        orm_mode = True

class SaveDishMenu(BaseModel):
    id: Optional[UUID]
    dish_availability: int

    class Config:
        orm_mode = True

class DishOrderavailability(BaseModel):
    dish_availability: int

    class Config:
        orm_mode = True

class DishMenus(BaseModel):
    items: List[DishAvailability]
    menu_id: Optional[str]

    class Config:
        orm_mode = True

class DisplayDishPriceOnly(SaveDishMenu):
    dish_price_id: str

class DisplayDishMenus(SaveDishMenu):
    dish_price_id: str
    menu_id: str

    class Config:
        orm_mode = True

class DishPriceOnly(DisplayDishPriceOnly):
    dish_price_id: DishPriceDetails

    class Config:
        orm_mode = True

class DishMenuDetails(DisplayDishMenus):
    dish_price_id: DishPriceDetails
    menu_id: MenuSchema

    class Config:
        orm_mode = True
        
class DishAvailabilityOnly(BaseModel):
    dish_availability: int
    
    class Config:
        orm_mode = True