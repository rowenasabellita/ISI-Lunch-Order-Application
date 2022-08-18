from typing import Optional
from pydantic import BaseModel, EmailStr
from passlib.hash import bcrypt
from uuid import UUID, uuid4

class UserDetails(BaseModel):
    id: Optional[UUID]
    first_name: str 
    last_name: str
    email: EmailStr
    role: str

    class Config:
        orm_mode = True
        
class UserSchema(UserDetails):
    hashed_password: str

