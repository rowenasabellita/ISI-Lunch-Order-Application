from typing import List,Union
from base.models.model import db, DishMenu
from fastapi import FastAPI, WebSocket, WebSocketDisconnect,APIRouter,Cookie,Depends,Query,status
from pony.orm import *
from base.schema.menuschema import DishOrderavailability
from fastapi.encoders import jsonable_encoder
from uuid import UUID

api = APIRouter(tags=['websocket'])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


@api.websocket("/avail/")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            id= await websocket.receive_text()
            data = await websocket.receive_text()
            listid=(id.split(","))
            listdata=(data.split(","))
            with db_session:
                for i,o in zip(listid,listdata):
                    numorders=int(o)
                    avail=DishMenu.select(lambda d: d.dish_availability)
                    filtered=avail.filter(lambda dm: dm.id == UUID(i))
                    result=[DishOrderavailability.from_orm(e) for e in filtered]
                    finalavail=result[0].dish_availability
                    update=finalavail-numorders
                    updated_dish_menu = DishMenu[i]
                    updated_dish_menu.set(dish_availability=update)
                    commit()
    except WebSocketDisconnect:
        manager.disconnect(websocket)