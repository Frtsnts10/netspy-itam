from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.services.support import wake_on_lan, scan_ports

router = APIRouter()

@router.post("/wol/{mac}")
async def trigger_wol(mac: str, user: dict = Depends(get_current_user)):
    try:
        wake_on_lan(mac)
        return {"message": f"Magic packet sent to {mac}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/scan-ports/{ip}")
async def trigger_port_scan(ip: str, user: dict = Depends(get_current_user)):
    try:
        results = await scan_ports(ip)
        return {"ip": ip, "ports": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/shutdown/{ip}")
async def trigger_shutdown(ip: str, user: dict = Depends(get_current_user)):
    try:
        from app.services.support import shutdown_device
        shutdown_device(ip)
        return {"message": f"Shutdown command sent to {ip}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
