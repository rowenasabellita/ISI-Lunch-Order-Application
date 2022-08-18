from datetime import date
from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID, uuid4
from fastapi import Form, Depends, Query



class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str 

class FormSchema(BaseModel):
    email: str
    password: str
