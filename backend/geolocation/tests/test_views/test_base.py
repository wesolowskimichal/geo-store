from django.db import OperationalError
from rest_framework.test import APIClient  # type: ignore

from geolocation.exceptions import IPStackAPIException


class BaseAPITestCase:
    client = APIClient()

    @staticmethod
    def fake_save_raise_operational_error(*args, **kwargs):
        raise OperationalError("Database is down")

    @staticmethod
    def fake_get_geolocation_data_success(ip_or_domain: str):
        """Simulate a successful IPStack response."""
        return {
            "country_name": "Testland",
            "latitude": 12.34,
            "longitude": 56.78,
            "some_extra_field": "value",
        }

    @staticmethod
    def fake_get_geolocation_data_failure(ip_or_domain: str):
        """Simulate a failed IPStack response (e.g. invalid access key)."""
        return {
            "success": False,
            "error": {
                "code": 101,
                "type": "invalid_access_key",
                "info": "Message",
            },
        }

    @staticmethod
    def fake_get_geolocation_data_exception(ip_or_domain: str):
        """Simulate a network or other exception during the service call."""
        raise IPStackAPIException(detail="Network Error")
