from netaddr import EUI, AddrFormatError


def lookup_vendor(mac: str) -> str | None:
    try:
        eui = EUI(mac)
        registration = eui.oui.registration()
        if registration and registration.org:
            return registration.org
    except (AddrFormatError, Exception):
        pass
    return None
