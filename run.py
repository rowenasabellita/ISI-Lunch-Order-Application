from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from base.config import db_conf as dbcfg
from base.routes import (
    dish, 
    order_summary,
    user, 
    supplier, 
    order,
    menu,
    dish_menu,
    dish_price,
    ordered_dish,
    login,
    email,
    websocket
)


api = FastAPI()

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

api.include_router(user.api, prefix="/user")
api.include_router(supplier.api, prefix="/supplier")
api.include_router(dish.api, prefix="/dish")
api.include_router(dish_price.api, prefix="/dish_price")
api.include_router(menu.api, prefix="/menu")
api.include_router(dish_menu.api, prefix="/dish_menu")
api.include_router(order.api, prefix="/order")
api.include_router(ordered_dish.api, prefix="/ordered_dish")
api.include_router(order_summary.api, prefix="/order_summary")
api.include_router(login.api, prefix="/login")
api.include_router(email.api, prefix="/email")
api.include_router(websocket.api, prefix="/websocket")




