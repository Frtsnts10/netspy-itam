from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, devices, scanner, telemetry
from app.core.config import settings

app = FastAPI(
    title="NetSpy ITAM",
    description="IT Asset Management - Network Monitoring & Hardware Telemetry",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(devices.router, prefix="/api/devices", tags=["Devices"])
app.include_router(scanner.router, prefix="/api/scan", tags=["Scanner"])
app.include_router(telemetry.router, prefix="/api/telemetry", tags=["Telemetry"])


@app.get("/")
async def root():
    return {"message": "NetSpy ITAM API", "docs": "/docs", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
