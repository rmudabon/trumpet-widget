import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


def create_widget(client: APIClient, *, value: str, position: int) -> dict:
    response = client.post(
        reverse("widget-list"),
        {"widget_type": "text", "value": value, "position": position},
        format="json",
    )
    assert response.status_code == status.HTTP_201_CREATED
    return response.json()


def test_fetch_empty_widget_list_returns_empty_list():
    response = APIClient().get(reverse("widget-list"))

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_create_widget_returns_id_and_empty_value():
    response = APIClient().post(
        reverse("widget-list"),
        {"widget_type": "text", "value": "", "position": 1},
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["id"]
    assert response.json()["value"] == ""


def test_create_multiple_widgets_gives_each_an_independent_id_and_value():
    client = APIClient()
    first = create_widget(client, value="First widget", position=1)
    second = create_widget(client, value="Second widget", position=2)

    assert first["id"] != second["id"]
    assert first["value"] == "First widget"
    assert second["value"] == "Second widget"


def test_update_widget_value_persists():
    client = APIClient()
    widget = create_widget(client, value="Before update", position=1)

    response = client.patch(
        reverse("widget-detail", args=[widget["id"]]),
        {"value": "After update"},
        format="json",
    )
    saved_response = client.get(reverse("widget-detail", args=[widget["id"]]))

    assert response.status_code == status.HTTP_200_OK
    assert saved_response.status_code == status.HTTP_200_OK
    assert saved_response.json()["value"] == "After update"


def test_updating_one_widget_leaves_other_widgets_unchanged():
    client = APIClient()
    first = create_widget(client, value="First", position=1)
    second = create_widget(client, value="Second", position=2)

    response = client.patch(
        reverse("widget-detail", args=[first["id"]]),
        {"value": "Updated first"},
        format="json",
    )
    list_response = client.get(reverse("widget-list"))

    assert response.status_code == status.HTTP_200_OK
    assert list_response.status_code == status.HTTP_200_OK
    values_by_id = {widget["id"]: widget["value"] for widget in list_response.json()}
    assert values_by_id == {first["id"]: "Updated first", second["id"]: "Second"}


def test_fetch_saved_widgets_returns_values_in_position_order():
    client = APIClient()
    first_created = create_widget(client, value="Second in order", position=2)
    second_created = create_widget(client, value="First in order", position=1)

    response = client.get(reverse("widget-list"))

    assert response.status_code == status.HTTP_200_OK
    assert [widget["value"] for widget in response.json()] == [
        "First in order",
        "Second in order",
    ]
    assert [widget["id"] for widget in response.json()] == [
        second_created["id"],
        first_created["id"],
    ]


def test_long_text_is_saved_and_retrieved_without_truncation():
    client = APIClient()
    long_text = "A long widget value. " * 100
    widget = create_widget(client, value=long_text, position=1)

    response = client.get(reverse("widget-detail", args=[widget["id"]]))

    assert response.status_code == 200
    assert response.json()["value"] == long_text


def test_updating_nonexistent_widget_returns_not_found():
    response = APIClient().patch(
        reverse("widget-detail", args=[999999]),
        {"value": "There is no widget with this ID"},
        format="json",
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
