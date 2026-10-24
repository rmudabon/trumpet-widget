from unittest.mock import patch

import pytest
from django.db import OperationalError
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_health_checks_postgres():
    response = APIClient().get(reverse("health"))

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}


def test_health_hides_database_error_details():
    with patch("api.views.connection.cursor", side_effect=OperationalError("secret credentials")):
        response = APIClient().get(reverse("health"))

    assert response.status_code == 503
    assert response.json() == {"status": "error", "database": "unavailable"}
    assert b"secret credentials" not in response.content


def test_health_rejects_post():
    response = APIClient().post(reverse("health"))

    assert response.status_code == 405
