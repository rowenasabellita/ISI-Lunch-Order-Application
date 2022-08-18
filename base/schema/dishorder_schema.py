from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from datetime import date


class OrderSummarySchema(BaseModel):
    id: Optional[UUID]
    date: date
    number_of_employees: int
    price: float
    total_amount: float
    supplier: str

    class Config: 
        orm_mode = True

