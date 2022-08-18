# Innovuze Lunch Order Management System

REST API for management of the Lunch ordering system at ISI. This is for Innovuze Inc. OJT program March 2022.

## Getting Started

- Python 3.10 or higher
- pipenv Python dependency installed
- `pipenv install`
- `pipenv shell`
- Configure your app environment settings by creating a copy of `.env.example` and name it `.env`
- Create a copy of `base/config.example.py` and name it `base/config.py`

## Running the app

Run the app with `uvicorn run:api --reload`

Confirm all is working by accessing the API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Tech Stack

- FastAPI
- PonyORM
- Uvicorn

