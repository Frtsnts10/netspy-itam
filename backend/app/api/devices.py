from fastapi import APIRouter, HTTPException, Depends, status
from app.core.security import get_current_user
from app.core.supabase_client import get_supabase

router = APIRouter()


@router.get("")
async def list_devices(user: dict = Depends(get_current_user)):
    sb = get_supabase()
    result = sb.table("devices").select("*").order("last_seen", desc=True).execute()
    return result.data


@router.patch("/{mac_address}")
async def update_device(mac_address: str, body: dict, user: dict = Depends(get_current_user)):
    custom_name = body.get("custom_name")
    if custom_name is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="custom_name is required",
        )

    sb = get_supabase()
    result = (
        sb.table("devices")
        .update({"custom_name": custom_name})
        .eq("mac_address", mac_address)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found",
        )

    return result.data[0]
