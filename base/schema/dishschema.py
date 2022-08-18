from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel
from uuid import UUID, uuid4
from base.schema.supplierschema import SupplierSchema 


class SaveDish(BaseModel):
    id: Optional[UUID]
    dish_name: str 
    dish_type: str
    img_url:str
    class Config:
        orm_mode = True

class DishSchema(SaveDish):
    supplier: str
    
    class Config:
        orm_mode = True
    
class DishDetails(DishSchema):
    created_at: Optional[datetime]
    supplier: SupplierSchema

    

    


    
        

