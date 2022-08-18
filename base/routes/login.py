
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status, APIRouter
from fastapi.encoders import jsonable_encoder
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, HTTPBasic
from jose import JWTError, jwt
from passlib.context import CryptContext
from pony.orm import *
from base.schema.userschema import UserSchema, UserDetails
from base.schema.loginschema import Token, TokenData, FormSchema
from base.models.model import db as model_db
from base.models import model
import secrets
import os
from dotenv import load_dotenv
load_dotenv('.env')

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v7/login/token")
api = APIRouter(tags=['login'])
security = HTTPBasic()


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db, fetch_email: str):
    with db_session:
        query = model.User.get(email=fetch_email)
        user = query.to_dict()
    if not user:
        raise HTTPException(status_code=404, detail="User doesn't exist")
    return UserSchema(**user)


def authenticate_user(fake_db, email: str, password: str):
    user = get_user(fake_db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user(model_db, token_data.email)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: UserDetails = Depends(get_current_user)):
    if current_user.role == 'user':
        raise HTTPException(status_code=400, detail="USER PRIVELEGES")
    return current_user


@api.post("/token")
async def login_for_access_token(form: OAuth2PasswordRequestForm = Depends()):
    try:
        user = authenticate_user(model_db, form.username, form.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires
                                           )
        return {"access_token": access_token, "token_type": "bearer"}
    except:
        return {"message": "Wrong Login Credentials"}


@api.get("/users/me/", response_model=UserDetails)
async def read_users_me(current_user: UserDetails = Depends(get_current_active_user)):
    return current_user


@api.post("/user")
async def user_login(loginitem: FormSchema):
    try:
        data = jsonable_encoder(loginitem)
        with db_session:
            query = model.User.get(email=data['email'])
            query2 = query.to_dict()
            userid = UserSchema(**query2).id
            role = UserSchema(**query2).role
            firstname = UserSchema(**query2).first_name
            lastname = UserSchema(**query2).last_name
            email_db = UserSchema(**query2).email
            password_db = UserSchema(**query2).hashed_password
            password_db2 = verify_password(data['password'], password_db)
            if data['email'] == email_db:
                if password_db2 == True:
                    encoded_jwt = jwt.encode(
                        data, SECRET_KEY, algorithm=ALGORITHM)
                    return {"userid": userid, "token": encoded_jwt, "role": role, "firstname": firstname, "lastname": lastname}
                else:
                    return {"message": "Wrong Password"}
            else:
                return {"message": "Login Failed"}
    except AttributeError:
        return{"message": "User doesnt Exists"}


@api.post("/admin")
def get_current_useradmin(credentials: FormSchema):
    user = authenticate_user(model_db, credentials.email, credentials.password)
    correct_admin = secrets.compare_digest(user.role, "Admin")
    if not (correct_admin):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="YOURE NOT ADMIN",
            headers={"WWW-Authenticate": "Basic"},
        )
    return {"message": credentials.email}
