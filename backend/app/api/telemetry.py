from fastapi import APIRouter, Depends, HTTPException, status, Header
from app.core.supabase_client import get_supabase
from app.core.config import settings
from datetime import datetime, timezone

router = APIRouter()


async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != settings.TELEMETRY_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )


@router.post("")
async def receive_telemetry(body: dict, _: None = Depends(verify_api_key)):
    mac_address = body.get("mac_address")
    if not mac_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="mac_address is required",
        )

    device_data = {
        "mac_address": mac_address.upper(),
        "last_known_ip": body.get("last_known_ip", "unknown"),
        "is_managed": True,
        "cpu_model": body.get("cpu_model"),
        "ram_gb": body.get("ram_gb"),
        "os_version": body.get("os_version"),
        "hostname": body.get("hostname"),
        "last_seen": datetime.now(timezone.utc).isoformat(),
    }

    sb = get_supabase()
    result = sb.table("devices").upsert(
        device_data,
        on_conflict="mac_address",
    ).execute()

    return {"message": "Telemetry received", "device": result.data[0] if result.data else device_data}
