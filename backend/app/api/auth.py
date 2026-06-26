from fastapi import APIRouter, HTTPException, status
import httpx
from app.core.config import settings
from app.core.security import get_current_user
from fastapi import Depends

router = APIRouter()


@router.post("/login")
async def login(body: dict):
    email = body.get("email")
    password = body.get("password")
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required",
        )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers={
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Content-Type": "application/json",
            },
            json={"email": email, "password": password},
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    data = resp.json()
    return {
        "access_token": data["access_token"],
        "token_type": "bearer",
        "user": {
            "id": data["user"]["id"],
            "email": data["user"]["email"],
        },
    }


@router.post("/register")
async def register(body: dict):
    email = body.get("email")
    password = body.get("password")
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required",
        )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.SUPABASE_URL}/auth/v1/signup",
            headers={
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Content-Type": "application/json",
            },
            json={"email": email, "password": password},
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed. Email may already be in use.",
        )

    data = resp.json()
    return {
        "message": "Registration successful",
        "user": {
            "id": data["user"]["id"],
            "email": data["user"]["email"],
        },
    }


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user
