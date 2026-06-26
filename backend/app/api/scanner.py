from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.services.scanner import scan_subnet

router = APIRouter()


@router.post("")
async def trigger_scan(user: dict = Depends(get_current_user)):
    results = await scan_subnet()
    return {
        "message": f"Scan complete. Found {len(results)} device(s).",
        "devices": results,
    }
