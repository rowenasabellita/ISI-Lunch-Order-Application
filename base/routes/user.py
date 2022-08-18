from fastapi import APIRouter
from fastapi import FastAPI, Response, status, APIRouter
from base.schema.userschema import UserSchema
from base.models.model import db, User
from fastapi.responses import HTMLResponse
from pony.orm import *
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.hash import bcrypt

api = APIRouter(tags=['user'])


@api.get("/root")
def read_root(response: Response):
    try:
        user = ("ISI", "Admin", "admin@innovuze.com", "Admin", "innovuze123")
        with db_session:
            default = User(first_name=user[0], last_name=user[1],
                            email=user[2], hashed_password=bcrypt.hash(user[4]), role=user[3])
            commit()
        result = UserSchema.from_orm(default)
        return {"result":result,"message": "Admin Intialized Successfully"}
    except TransactionIntegrityError:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": "Admin Has Been Intialized Already"}


@api.post('/')
async def create_user(user: UserSchema):
    try:
        with db_session:
            new_user = User(first_name=user.first_name, last_name=user.last_name,
                            email=user.email, hashed_password=bcrypt.hash(user.hashed_password), role=user.role)
            commit()    # save to db

        result = UserSchema.from_orm(new_user)
        return {"message": "User Created Successfully","result":result}
    except TransactionIntegrityError:
        return {"message": "Email Already Taken"}


@api.get('/', status_code=status.HTTP_200_OK)
async def get_all_user():
    with db_session:
        user = User.select()
        result = [UserSchema.from_orm(i) for i in user]
    return result


@api.get('/{id}/', status_code=status.HTTP_200_OK)
async def get_user(id: str, response: Response):
    try:
        with db_session:
            user = User[id]
            result = UserSchema.from_orm(user)

            return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"User {id} not found"}


@api.put("/{id}", status_code=status.HTTP_200_OK)
async def update_user(id: str, user: UserSchema, response: Response):
    try:
        with db_session:
            updated_user = User[id]
            updated_user.set(first_name=user.first_name, last_name=user.last_name,
                             email=user.email, role=user.role, hashed_password=bcrypt.hash(user.hashed_password))
            commit()

        result = UserSchema.from_orm(updated_user)
        return result
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"User {id} not found"}


@api.delete('/{id}/', status_code=status.HTTP_204_NO_CONTENT)
async def remove_user(id: str, response: Response):
    try:
        with db_session:
            user = User[id]
            user.delete()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ObjectNotFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"User {id} not found"}
