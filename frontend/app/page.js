"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const response = await fetch("/api/items");
    if (response.ok) {
      setItems(await response.json());
    }
  }

  async function saveItem(event) {
    event.preventDefault();
    const payload = { name, description };

    const response = await fetch(editingId ? `/api/items/${editingId}` : "/api/items", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      await fetchItems();
      setName("");
      setDescription("");
      setEditingId(null);
    }
  }

  async function editItem(item) {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
  }

  async function deleteItem(id) {
    const response = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (response.ok) {
      await fetchItems();
    }
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Aplicação Week5 CI/CD</h1>
      <p>CRUD simples conectado ao backend via /api/items.</p>

      <form onSubmit={saveItem} style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Nome:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ marginLeft: "0.5rem", width: "300px" }}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Descrição:
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ marginLeft: "0.5rem", width: "300px" }}
            />
          </label>
        </div>
        <button type="submit">{editingId ? "Atualizar" : "Criar"}</button>
        {editingId && (
          <button
            type="button"
            style={{ marginLeft: "0.5rem" }}
            onClick={() => {
              setEditingId(null);
              setName("");
              setDescription("");
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      <section>
        <h2>Itens</h2>
        {items.length === 0 ? (
          <p>Nenhum item encontrado.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>ID</th>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>Nome</th>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>Descrição</th>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{item.id}</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{item.name}</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{item.description}</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>
                    <button onClick={() => editItem(item)} style={{ marginRight: "0.5rem" }}>
                      Editar
                    </button>
                    <button onClick={() => deleteItem(item.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
