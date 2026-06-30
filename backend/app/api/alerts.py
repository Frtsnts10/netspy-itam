from fastapi import APIRouter, Depends, HTTPException
from typing import List

from app.core.security import get_current_user
from app.core.supabase_client import get_supabase

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_alerts(current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    response = (
        sb.table("alerts")
        .select("*")
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return response.data

@router.post("/{alert_id}/read")
async def mark_alert_read(alert_id: str, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    response = (
        sb.table("alerts")
        .update({"is_read": True})
        .eq("id", alert_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert marked as read"}
