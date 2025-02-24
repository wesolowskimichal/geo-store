import requests  # type: ignore
import pytest  # type: ignore

from geolocation.services import get_geolocation_data, IPSTACK_BASE_URL
from geolocation.exceptions import IPStackAPIException


class DummyResponse:
    def __init__(self, json_data, status_code):
        self._json_data = json_data
        self.status_code = status_code

    def json(self):
        return self._json_data

    def raise_for_status(self):
        if self.status_code >= 400:
            raise requests.HTTPError(f"{self.status_code} Error")


@pytest.mark.django_db
def test_get_geolocation_data_no_api_key(monkeypatch):
    """
    Test that ValueError is raised when IPSTACK_API_KEY is not set.
    """
    monkeypatch.delenv("IPSTACK_API_KEY", raising=False)
    with pytest.raises(ValueError, match="IPSTACK_API_KEY is not set"):
        get_geolocation_data("1.1.1.1")


def fake_requests_get_success(url, params):
    """
    Fake requests.get function that returns a successful DummyResponse.
    """
    expected_url = f"{IPSTACK_BASE_URL}/1.1.1.1"
    assert url == expected_url, f"Expected URL {expected_url}, got {url}"
    assert params.get("access_key") == "dummykey"
    return DummyResponse(
        {"country_name": "Testland", "latitude": 12.34, "longitude": 56.78},
        200,
    )


def test_get_geolocation_data_success(monkeypatch):
    """
    Test that get_geolocation_data returns correct JSON data on success.
    """
    monkeypatch.setenv("IPSTACK_API_KEY", "dummykey")
    monkeypatch.setattr(requests, "get", fake_requests_get_success)
    data = get_geolocation_data("1.1.1.1")
    assert data["country_name"] == "Testland"
    assert data["latitude"] == 12.34
    assert data["longitude"] == 56.78


def fake_requests_get_http_error(url, params):
    """
    Fake requests.get function that simulates an HTTP error.
    """
    return DummyResponse({"error": "Not Found"}, 404)


def test_get_geolocation_data_http_error(monkeypatch):
    """
    Test that get_geolocation_data raises an HTTPError when the API returns an error.
    """
    monkeypatch.setenv("IPSTACK_API_KEY", "dummykey")
    monkeypatch.setattr(requests, "get", fake_requests_get_http_error)
    with pytest.raises(IPStackAPIException):
        get_geolocation_data("1.1.1.1")


def fake_requests_get_exception(url, params):
    """
    Fake requests.get function that simulates a network exception.
    """
    raise requests.RequestException("Network error")


def test_get_geolocation_data_request_exception(monkeypatch, caplog):
    """
    Test that get_geolocation_data logs an error and re-raises on a network error.
    """
    monkeypatch.setenv("IPSTACK_API_KEY", "dummykey")
    monkeypatch.setattr(requests, "get", fake_requests_get_exception)
    with pytest.raises(IPStackAPIException):
        get_geolocation_data("1.1.1.1")
    assert "Failed to retrieve geolocation data from ipstack:" in caplog.text
