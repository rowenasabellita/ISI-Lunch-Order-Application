from datetime import date, datetime
from email.policy import default
from pickle import TRUE
from typing_extensions import Required
from pydantic import EmailStr
from pony.orm import *
from uuid import UUID, uuid4
from base.config import db_conf as dbcfg
from enum import Enum, auto, unique


db = Database()
db.bind(**dbcfg)


class User(db.Entity):
    id = PrimaryKey(UUID, auto=True)
    first_name = Required(str)
    last_name = Required(str)
    email = Required(EmailStr, unique=True)
    hashed_password = Required(str)
    orders = Set('Order')
    role = Required(str, default="Employee")

    def verify_password(self, password: str):
        return hash.bcrypt.verify(password, self.hashed_password)

    def __str__(self):
        self.full_name = self.user.first_name + " " + self.user.last_name
        return self.full_name


class Supplier(db.Entity):
    id = PrimaryKey(UUID, auto=True)
    supplier_name = Required(str, unique=True)
    main_dish_free = Required(bool)
    side_dish_free = Required(bool)
    dish = Set('Dish')


class Dish(db.Entity):
    id = PrimaryKey(UUID, auto=True)
    dish_name = Required(str)
    dish_type = Required(str)
    created_at = Required(datetime, default=datetime.utcnow())
    supplier = Required("Supplier", column="supplier_id")
    dish_price = Set('DishPrice')
    img_url = Required(str, unique=True)
    composite_key(dish_name, supplier)


class DishPrice(db.Entity):
    id = PrimaryKey(UUID, auto=True)
    dish_id = Required("Dish")
    price = Required(float)
    is_active = Required(bool)
    dish_menu = Set('DishMenu')
    date = Required(datetime, default=datetime.utcnow())


class Order(db.Entity):
    id = PrimaryKey(UUID, auto=True)
    order_date = Required(date)
    user_id = Required(User, column="user_id")
    ordered_dish = Set('OrderedDish')
    employee_name = Required(str)
    composite_key(user_id, order_date)


class OrderSummary(db.Entity):
    id = PrimaryKey(UUID, auto=True)
    date = Required(date, unique=True)
    number_of_employees = Required(int)
    price = Required(float)
    total_amount = Required(float)
    supplier = Required(str)


class Menu(db.Entity):
    id = PrimaryKey(UUID, auto=True)
    date = Required(date, unique=True)
    dish_menus = Set('DishMenu')


class DishMenu(db.Entity):
    id = PrimaryKey(UUID, auto=True)
    dish_availability = Required(int)
    dish_price_id = Required("DishPrice")
    menu_id = Required("Menu")
    ordered_dish = Set('OrderedDish')
    composite_key(dish_price_id, menu_id)


class OrderedDish(db.Entity):
    id = PrimaryKey(UUID, auto=True)
    order_id = Required('Order')
    employee_name = Optional(str)
    dish_menu_id = Required('DishMenu')
    dish_name = Optional(str)
    dish_type = Optional(str)
    quantity = Required(int)
    order_price = Required(float)
    remarks = Optional(LongStr)


db.generate_mapping(create_tables=True)
pony.orm.sql_debug(True)
