from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

APP_PATH = Path(__file__).resolve().parents[1] / "app.py"
SPEC = spec_from_file_location("app_module", APP_PATH)
app_module = module_from_spec(SPEC)
SPEC.loader.exec_module(app_module)


def setup_function():
    app_module.store.reset()


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
    assert response.json["items_count"] == 0


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
    assert response.json["message"] == "Item nao encontrado."


def test_create_item_requires_name():
    client = app_module.app.test_client()

    response = client.post("/api/items", json={"name": "   "})

    assert response.status_code == 400
    assert response.json["message"] == "Campo 'name' obrigatorio."
