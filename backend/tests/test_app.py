import app as app_module


def setup_function():
    app_module.items.clear()
    app_module.next_id = 1


def test_home():
    client = app_module.app.test_client()
    response = client.get("/")
    assert response.status_code == 200
    assert response.json["message"] == "App rodando com CI/CD!"


def test_health():
    client = app_module.app.test_client()
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json["status"] == "ok"


def test_crud_item_lifecycle():
    client = app_module.app.test_client()

    response = client.post(
        "/api/items",
        json={"name": "Teste", "description": "Descrição"},
    )
    assert response.status_code == 201
    assert response.json["id"] == 1
    assert response.json["name"] == "Teste"

    response = client.get("/api/items")
    assert response.status_code == 200
    assert len(response.json) == 1

    response = client.put("/api/items/1", json={"name": "Teste Atualizado"})
    assert response.status_code == 200
    assert response.json["name"] == "Teste Atualizado"

    response = client.delete("/api/items/1")
    assert response.status_code == 200
    assert response.json["deleted"] is True

    response = client.get("/api/items/1")
    assert response.status_code == 404
