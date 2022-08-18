from pydantic import EmailStr, BaseModel

class EmailAdminSchema(BaseModel):
    firstname:str
    lastname:str 
    email: EmailStr

class EmailUserSchema(BaseModel):
    firstname:str
    lastname:str 
    email: EmailStr
    password:str
