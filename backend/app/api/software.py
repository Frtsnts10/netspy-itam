from fastapi import APIRouter, Depends, HTTPException, Header, status
from typing import List

from app.core.security import get_current_user
from app.core.supabase_client import get_supabase
from app.core.config import settings

router = APIRouter()

async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != settings.TELEMETRY_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )

@router.get("/", response_model=List[dict])
async def get_software(current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    # Fetch all software
    response = (
        sb.table("installed_software")
        .select("*")
        .execute()
    )
    
    # We want to group by name and version for the UI
    grouped = {}
    for sw in response.data:
        key = f"{sw['name']}::{sw['version']}::{sw['publisher']}"
        if key not in grouped:
            grouped[key] = {
                "id": str(sw['id']),
                "name": sw['name'],
                "version": sw['version'],
                "vendor": sw['publisher'],
                "installDate": sw['install_date'],
                "deviceCount": 0
            }
        grouped[key]["deviceCount"] += 1
        
    # Return as list
    return list(grouped.values())

@router.post("/telemetry")
async def receive_software_telemetry(body: dict, _: None = Depends(verify_api_key)):
    mac_address = body.get("mac_address")
    software_list = body.get("software", [])
    
    if not mac_address:
        raise HTTPException(status_code=400, detail="mac_address required")
        
    sb = get_supabase()
    
    # Simple approach: delete existing software for this MAC, then insert new
    sb.table("installed_software").delete().eq("mac_address", mac_address).execute()
    
    if not software_list:
        return {"message": "No software provided"}
        
    records = []
    for sw in software_list:
        records.append({
            "mac_address": mac_address,
            "name": sw.get("name", "Unknown"),
            "version": sw.get("version", ""),
            "publisher": sw.get("publisher", ""),
            "install_date": sw.get("install_date", "")
        })
        
    # Batch insert in chunks of 100
    for i in range(0, len(records), 100):
        sb.table("installed_software").insert(records[i:i+100]).execute()
        
    # Also create an alert that software was updated
    try:
        sb.table("alerts").insert({
            "type": "info",
            "title": "Software Inventory Updated",
            "description": f"Received {len(records)} installed applications from device {mac_address}.",
            "is_read": False
        }).execute()
    except:
        pass
        
    return {"message": f"Saved {len(records)} software entries"}
