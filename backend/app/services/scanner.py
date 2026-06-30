import asyncio
import re
import platform
from datetime import datetime, timezone

import psutil

from app.core.supabase_client import get_supabase
from app.services.oui import lookup_vendor


def detect_local_subnet() -> str:
    """Auto-detect the local /24 subnet from active NICs."""
    for name, addrs in psutil.net_if_addrs().items():
        for addr in addrs:
            if addr.family.name == "AF_INET" and not addr.address.startswith("127."):
                ip = addr.address
                octets = ip.split(".")
                return f"{octets[0]}.{octets[1]}.{octets[2]}"
    return "192.168.1"


async def ping_host(ip: str) -> bool:
    """Ping a single host. Returns True if reachable."""
    param = "-n"
    count = "1"
    timeout = "-w"
    timeout_ms = "1000"

    process = await asyncio.create_subprocess_exec(
        "ping", param, count, timeout, timeout_ms, ip,
        stdout=asyncio.subprocess.DEVNULL,
        stderr=asyncio.subprocess.DEVNULL,
    )
    await process.wait()
    return process.returncode == 0


async def sweep_subnet(subnet: str) -> list[str]:
    """Ping all hosts in a /24 subnet concurrently."""
    tasks = []
    for i in range(1, 255):
        ip = f"{subnet}.{i}"
        tasks.append(ping_host(ip))

    results = await asyncio.gather(*tasks, return_exceptions=True)

    reachable = []
    for i, result in enumerate(results):
        if result is True:
            reachable.append(f"{subnet}.{i + 1}")

    return reachable


def parse_arp_table() -> dict[str, str]:
    """Parse the Windows ARP table. Returns {ip: mac} mapping."""
    import subprocess

    result = subprocess.run(["arp", "-a"], capture_output=True, text=True)
    arp_map = {}

    for line in result.stdout.splitlines():
        match = re.match(
            r"\s*(\d+\.\d+\.\d+\.\d+)\s+([0-9a-fA-F]{2}[-:]"
            r"[0-9a-fA-F]{2}[-:][0-9a-fA-F]{2}[-:]"
            r"[0-9a-fA-F]{2}[-:][0-9a-fA-F]{2}[-:][0-9a-fA-F]{2})\s+dynamic",
            line,
        )
        if match:
            ip = match.group(1)
            mac = match.group(2).replace("-", ":").upper()
            arp_map[ip] = mac

    return arp_map


def generate_default_name(mac: str, vendor: str | None) -> str:
    """Generate a default device name from vendor or MAC."""
    if vendor:
        return vendor
    return f"Device-{mac[-5:].replace(':', '')}"


async def scan_subnet() -> list[dict]:
    """Full subnet scan: ping sweep + ARP parse + upsert to Supabase."""
    subnet = detect_local_subnet()

    await sweep_subnet(subnet)

    arp_map = parse_arp_table()

    sb = get_supabase()
    now = datetime.now(timezone.utc).isoformat()
    discovered = []

    for ip, mac in arp_map.items():
        vendor = lookup_vendor(mac)

        device_data = {
            "mac_address": mac,
            "last_known_ip": ip,
            "vendor": vendor,
            "is_managed": False,
            "last_seen": now,
        }

        existing = (
            sb.table("devices")
            .select("custom_name, is_managed, cpu_model, ram_gb, os_version")
            .eq("mac_address", mac)
            .execute()
        )

        if existing.data:
            old = existing.data[0]
            if old.get("custom_name"):
                device_data["custom_name"] = old["custom_name"]
            if old.get("is_managed"):
                device_data["is_managed"] = True
                device_data["cpu_model"] = old.get("cpu_model")
                device_data["ram_gb"] = old.get("ram_gb")
                device_data["os_version"] = old.get("os_version")
        else:
            # Device not in database, it's a NEW device
            try:
                alert_data = {
                    "type": "critical",
                    "title": "Unknown Device Detected",
                    "description": f"A new unauthorized device (MAC: {mac}) joined the network at {ip}.",
                    "is_read": False,
                }
                sb.table("alerts").insert(alert_data).execute()
            except Exception as e:
                print(f"Failed to create alert: {e}")

        sb.table("devices").upsert(
            device_data,
            on_conflict="mac_address",
        ).execute()

        discovered.append(device_data)

    return discovered
