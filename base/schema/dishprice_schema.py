from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel
from uuid import UUID, uuid4
from base.schema.dishschema import DishDetails
from base.schema.supplierschema import SupplierSchema 


class SaveDishPrice(BaseModel):
    id: Optional[UUID]
    price: float
    is_active: bool
    
    class Config:
        orm_mode = True

class DishPriceSchema(SaveDishPrice):
    dish_id: str
    
    class Config:
        orm_mode = True
    
class DishPriceDetails(DishPriceSchema):
    date: Optional[datetime]
    dish_id: DishDetails
