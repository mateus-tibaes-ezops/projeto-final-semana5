from copy import deepcopy

from flask import Flask, abort, jsonify, request
from flask_cors import CORS


class ItemStore:
    def __init__(self):
        self.reset()

    def reset(self):
        self._items = []
        self._next_id = 1

    def list(self):
        return deepcopy(self._items)

    def get(self, item_id):
        for item in self._items:
            if item["id"] == item_id:
                return item
        return None

    def create(self, name, description=""):
        item = {
            "id": self._next_id,
            "name": name,
            "description": description,
        }
        self._items.append(item)
        self._next_id += 1
        return deepcopy(item)

    def update(self, item_id, name, description=None):
        item = self.get(item_id)
        if item is None:
            return None

        item["name"] = name
        if description is not None:
            item["description"] = description

        return deepcopy(item)

    def delete(self, item_id):
        for index, item in enumerate(self._items):
            if item["id"] == item_id:
                self._items.pop(index)
                return True
        return False


store = ItemStore()


def _normalize_name(data):
    return (data.get("name") or "").strip()


def _read_payload():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        abort(400, description="JSON invalido ou ausente.")

    name = _normalize_name(data)
    if not name:
        abort(400, description="Campo 'name' obrigatorio.")

    description = (data.get("description") or "").strip()
    return name, description


def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.errorhandler(400)
    @app.errorhandler(404)
    @app.errorhandler(405)
    @app.errorhandler(500)
    def handle_error(error):
        message = getattr(error, "description", "Erro interno do servidor.")
        status_code = getattr(error, "code", 500)
        return jsonify({"message": message, "status": status_code}), status_code

    @app.route("/")
    def home():
        return jsonify({"message": "App rodando com CI/CD!"})

    @app.route("/health")
    def health():
        return jsonify({"status": "ok", "items_count": len(store.list())})

    @app.route("/api/items", methods=["GET"])
    def list_items():
        return jsonify(store.list())

    @app.route("/api/items/<int:item_id>", methods=["GET"])
    def get_item(item_id):
        item = store.get(item_id)
        if item is not None:
            return jsonify(item)

        abort(404, description="Item nao encontrado.")

    @app.route("/api/items", methods=["POST"])
    def create_item():
        name, description = _read_payload()
        item = store.create(name=name, description=description)
        return jsonify(item), 201

    @app.route("/api/items/<int:item_id>", methods=["PUT"])
    def update_item(item_id):
        name, description = _read_payload()
        item = store.update(item_id=item_id, name=name, description=description)
        if item is not None:
            return jsonify(item)

        abort(404, description="Item nao encontrado.")

    @app.route("/api/items/<int:item_id>", methods=["DELETE"])
    def delete_item(item_id):
        if store.delete(item_id):
            return jsonify({"deleted": True})

        abort(404, description="Item nao encontrado.")

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
