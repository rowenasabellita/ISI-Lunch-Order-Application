import os
from fastapi import (
    FastAPI, 
    BackgroundTasks, 
    UploadFile, File, 
    Form, 
    Query,
    Body,
    Depends,APIRouter
)
import smtplib
from starlette.responses import JSONResponse
from starlette.requests import Request
from fastapi_mail import FastMail, MessageSchema,ConnectionConfig
from pydantic import EmailStr, BaseModel
from typing import List
from fastapi_mail.email_utils import DefaultChecker
from base.schema.emailschema import EmailAdminSchema,EmailUserSchema
from dotenv import load_dotenv
load_dotenv('.env')

class Envs:
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_FROM = os.getenv('MAIL_FROM')
    MAIL_PORT = os.getenv('MAIL_PORT')
    MAIL_SERVER = os.getenv('MAIL_SERVER')
    MAIL_FROM_NAME = os.getenv('MAIN_FROM_NAME')

conf = ConnectionConfig(
    MAIL_USERNAME=Envs.MAIL_USERNAME,
    MAIL_PASSWORD=Envs.MAIL_PASSWORD,
    MAIL_FROM=Envs.MAIL_FROM,
    MAIL_PORT=Envs.MAIL_PORT,
    MAIL_SERVER=Envs.MAIL_SERVER,
    MAIL_FROM_NAME=Envs.MAIL_FROM_NAME,
    MAIL_TLS=True,
    MAIL_SSL=False,
    USE_CREDENTIALS=True,
    TEMPLATE_FOLDER='./base/routes/templates'
)

api = APIRouter(tags=['email'])

@api.post("/sendtoadmin")
async def admin_send(email: EmailAdminSchema) -> JSONResponse:
    html= {"title":"WELCOME TO LUNCH ORDER APP","firstname":email.firstname,"lastname": email.lastname,"email": email.email}
    message = MessageSchema(subject="INNOVUZE LUNCH ORDER",
                            recipients=[os.getenv('ADMIN_EMAIL')],
                            template_body=html,
                            subtype="html"
                            )
    fm = FastMail(conf)
    await fm.send_message(message, template_name='toadmin.html')
    return JSONResponse(status_code=200, content={"message": "email has been sent"})

@api.post("/sendtouser")
async def user_send(email: EmailUserSchema) -> JSONResponse:
    html= {"title":"WELCOME TO LUNCH ORDER APP","firstname":email.firstname,"lastname": email.lastname,"email": email.email,"password":email.password}
    message = MessageSchema(subject="INNOVUZE LUNCH ORDER",
                            recipients=[email.email],
                            template_body=html,
                            subtype="html"
                            )
    fm = FastMail(conf)
    await fm.send_message(message, template_name='touser.html')
    return JSONResponse(status_code=200, content={"message": "email has been sent"})

