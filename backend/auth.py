from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database import db
import bcrypt
import jwt
import os
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/auth", tags=["Authentication"])

JWT_SECRET = os.getenv("JWT_SECRET", "change-this-secret")
JWT_ALGORITHM = "HS256"


class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def create_token(user_id: str):
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)
    }

    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


@router.post("/signup")
def signup(data: SignupRequest):

    existing_user = db.users.find_one({"email": data.email})

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    hashed_password = bcrypt.hashpw(
        data.password.encode("utf-8"),
        bcrypt.gensalt()
    )

    user = {
        "email": data.email,
        "password": hashed_password.decode("utf-8"),
        "created_at": datetime.now(timezone.utc)
    }

    result = db.users.insert_one(user)

    return {
        "message": "Signup successful",
        "user_id": str(result.inserted_id)
    }


@router.post("/login")
def login(data: LoginRequest):

    user = db.users.find_one({"email": data.email})

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    password_valid = bcrypt.checkpw(
        data.password.encode("utf-8"),
        user["password"].encode("utf-8")
    )

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_token(str(user["_id"]))

    return {
        "message": "Login successful",
        "token": token
    }