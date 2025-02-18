from rest_framework.exceptions import APIException  # type: ignore


class GeoDataAPIException(APIException):
    """
    Base exception for GeoData-related errors.
    """

    status_code = 400
    default_detail = "A GeoData error occurred."
    default_code = "geodata_error"


class IPStackAPIException(GeoDataAPIException):
    """
    Exception raised when the IPStack API call fails.
    """

    status_code = 502
    default_detail = "Failed to retrieve geolocation data from the IPStack service."
    default_code = "ipstack_api_error"


class DatabaseUnavailableException(GeoDataAPIException):
    """
    Exception raised when the database is unavailable.
    """

    status_code = 503
    default_detail = "The database is unavailable."
    default_code = "database_unavailable"
