import socket
import asyncio

def wake_on_lan(mac_address: str):
    """Sends a magic packet to the given MAC address to wake it up."""
    # Clean the MAC address
    mac_clean = mac_address.replace(":", "").replace("-", "")
    if len(mac_clean) != 12:
        raise ValueError("Invalid MAC address")
    
    # Create the magic packet
    data = bytes.fromhex("FF" * 6 + mac_clean * 16)
    
    # Broadcast it to the network
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        sock.sendto(data, ("255.255.255.255", 9))
        
async def scan_ports(ip: str) -> dict:
    """Scans common support ports on the target IP."""
    # Common ports to scan
    ports_to_scan = {
        22: "SSH",
        80: "HTTP",
        443: "HTTPS",
        3389: "RDP",
        5900: "VNC",
        445: "SMB"
    }
    
    results = {}
    
    async def check_port(port: int, name: str):
        try:
            # Try to connect with a short timeout
            reader, writer = await asyncio.wait_for(
                asyncio.open_connection(ip, port),
                timeout=1.0
            )
            writer.close()
            await writer.wait_closed()
            results[port] = {"name": name, "open": True}
        except (asyncio.TimeoutError, ConnectionRefusedError, OSError):
            results[port] = {"name": name, "open": False}
            
    # Run all port checks concurrently
    tasks = [check_port(port, name) for port, name in ports_to_scan.items()]
    await asyncio.gather(*tasks)
    
    return results

def shutdown_device(ip: str):
    """Sends a remote shutdown command to the given IP address."""
    import subprocess
    # Uses Windows shutdown command for remote shutdown
    # Note: Requires appropriate network credentials/permissions
    try:
        result = subprocess.run(
            ["shutdown", "/m", f"\\\\{ip}", "/s", "/t", "0", "/f"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode != 0:
            error_msg = (result.stderr or result.stdout).strip()
            if not error_msg:
                error_msg = f"Failed to execute shutdown command (exit code {result.returncode})"
            raise Exception(error_msg)
    except subprocess.TimeoutExpired:
        raise Exception("Command timed out")
    except Exception as e:
        raise Exception(f"Failed to shutdown: {str(e)}")
