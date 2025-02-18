import os
import logging
from typing import Dict
import requests  # type: ignore
from .exceptions import IPStackAPIException

logger = logging.getLogger(__name__)

IPSTACK_BASE_URL = "http://api.ipstack.com"


def get_geolocation_data(ip_or_domain: str) -> Dict:
    api_key = os.getenv("IPSTACK_API_KEY")
    if not api_key:
        raise ValueError("IPSTACK_API_KEY is not set in the environment variables.")

    url = f"{IPSTACK_BASE_URL}/{ip_or_domain}"
    params = {"access_key": api_key}

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.error("Failed to retrieve geolocation data from ipstack: %s", exc)
        raise IPStackAPIException(detail=str(exc))

    return response.json()
