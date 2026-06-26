import configparser
import platform
import socket
import sys
import time
import uuid

import psutil
import requests


def get_mac_address() -> str:
    mac = uuid.getnode()
    return ":".join(f"{(mac >> i) & 0xFF:02x}" for i in range(40, -1, -8)).upper()


def get_local_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "unknown"


def collect_system_info() -> dict:
    ram = psutil.virtual_memory()
    return {
        "mac_address": get_mac_address(),
        "last_known_ip": get_local_ip(),
        "cpu_model": platform.processor() or "Unknown",
        "ram_gb": round(ram.total / (1024 ** 3)),
        "os_version": platform.platform(),
        "hostname": socket.gethostname(),
    }


def send_telemetry(backend_url: str, api_key: str) -> bool:
    info = collect_system_info()
    try:
        resp = requests.post(
            f"{backend_url}/api/telemetry",
            json=info,
            headers={"X-API-Key": api_key},
            timeout=10,
        )
        if resp.status_code == 200:
            print(f"[OK] Telemetry sent successfully for {info['hostname']}")
            return True
        else:
            print(f"[ERROR] Server returned {resp.status_code}: {resp.text}")
            return False
    except requests.ConnectionError:
        print(f"[ERROR] Cannot connect to {backend_url}")
        return False
    except Exception as e:
        print(f"[ERROR] {e}")
        return False


def main():
    config = configparser.ConfigParser()
    config.read("config.ini")

    backend_url = config.get("agent", "backend_url", fallback="http://localhost:8000")
    api_key = config.get("agent", "api_key", fallback="")
    interval = config.getint("agent", "interval_minutes", fallback=30)

    if not api_key or api_key == "change-this-to-a-random-secret":
        print("[WARNING] Please set a valid API key in config.ini")

    daemon_mode = "--daemon" in sys.argv

    print(f"NetSpy Telemetry Agent")
    print(f"  Backend:  {backend_url}")
    print(f"  Interval: {interval} minutes")
    print(f"  Daemon:   {daemon_mode}")
    print()

    if daemon_mode:
        print("Running in daemon mode. Press Ctrl+C to stop.")
        while True:
            send_telemetry(backend_url, api_key)
            time.sleep(interval * 60)
    else:
        send_telemetry(backend_url, api_key)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nAgent stopped.")
