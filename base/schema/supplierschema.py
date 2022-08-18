from typing import Optional
from pydantic import BaseModel
from uuid import UUID


class SaveSupplier(BaseModel):
    supplier_name: str
    main_dish_free: bool
    side_dish_free: bool
    class Config:
        orm_mode = True
class SupplierSchema(SaveSupplier):
    id : Optional[UUID]
