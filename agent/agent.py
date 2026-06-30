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


def get_installed_software() -> list:
    software_list = []
    if platform.system() != "Windows":
        return software_list

    import winreg
    
    def enum_keys(key, path):
        try:
            with winreg.OpenKey(key, path, 0, winreg.KEY_READ | winreg.KEY_WOW64_32KEY) as k:
                for i in range(0, winreg.QueryInfoKey(k)[0]):
                    try:
                        yield winreg.EnumKey(k, i)
                    except EnvironmentError:
                        break
            with winreg.OpenKey(key, path, 0, winreg.KEY_READ | winreg.KEY_WOW64_64KEY) as k:
                for i in range(0, winreg.QueryInfoKey(k)[0]):
                    try:
                        yield winreg.EnumKey(k, i)
                    except EnvironmentError:
                        break
        except Exception:
            pass

    paths = [
        r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
        r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall",
    ]

    seen = set()
    for root in (winreg.HKEY_LOCAL_MACHINE, winreg.HKEY_CURRENT_USER):
        for path in paths:
            for subkey in enum_keys(root, path):
                try:
                    with winreg.OpenKey(root, f"{path}\\{subkey}") as k:
                        name = winreg.QueryValueEx(k, "DisplayName")[0]
                        if not name:
                            continue
                        
                        try:
                            version = winreg.QueryValueEx(k, "DisplayVersion")[0]
                        except:
                            version = ""
                            
                        try:
                            publisher = winreg.QueryValueEx(k, "Publisher")[0]
                        except:
                            publisher = ""
                            
                        try:
                            install_date = winreg.QueryValueEx(k, "InstallDate")[0]
                        except:
                            install_date = ""

                        key_tuple = (name, version)
                        if key_tuple not in seen:
                            seen.add(key_tuple)
                            software_list.append({
                                "name": str(name),
                                "version": str(version),
                                "publisher": str(publisher),
                                "install_date": str(install_date)
                            })
                except:
                    continue
                    
    return software_list


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
            
            # Send Software Telemetry
            print("Gathering software inventory...")
            software = get_installed_software()
            if software:
                sw_resp = requests.post(
                    f"{backend_url}/api/software/telemetry",
                    json={"mac_address": info["mac_address"], "software": software},
                    headers={"X-API-Key": api_key},
                    timeout=30,
                )
                if sw_resp.status_code == 200:
                    print(f"[OK] Sent {len(software)} software items")
                else:
                    print(f"[ERROR] Failed to send software: {sw_resp.text}")
                    
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
