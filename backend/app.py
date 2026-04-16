from flask import Flask, jsonify, request, abort
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

items = []
next_id = 1


@app.route("/")
def home():
    return jsonify({"message": "App rodando com CI/CD!"})


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/items", methods=["GET"])
def list_items():
    return jsonify(items)


@app.route("/api/items/<int:item_id>", methods=["GET"])
def get_item(item_id):
    for item in items:
        if item["id"] == item_id:
            return jsonify(item)
    abort(404, description="Item não encontrado")


@app.route("/api/items", methods=["POST"])
def create_item():
    global next_id
    data = request.get_json(silent=True)
    if not data or "name" not in data:
        abort(400, description="Campo 'name' obrigatório")

    item = {
        "id": next_id,
        "name": data["name"],
        "description": data.get("description", "")
    }
    items.append(item)
    next_id += 1
    return jsonify(item), 201


@app.route("/api/items/<int:item_id>", methods=["PUT"])
def update_item(item_id):
    data = request.get_json(silent=True)
    if not data or "name" not in data:
        abort(400, description="Campo 'name' obrigatório")

    for item in items:
        if item["id"] == item_id:
            item["name"] = data["name"]
            item["description"] = data.get("description", item["description"])
            return jsonify(item)

    abort(404, description="Item não encontrado")


@app.route("/api/items/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    for index, item in enumerate(items):
        if item["id"] == item_id:
            items.pop(index)
            return jsonify({"deleted": True})
    abort(404, description="Item não encontrado")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
