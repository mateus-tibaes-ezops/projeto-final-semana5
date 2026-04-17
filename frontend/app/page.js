"use client";

import { useEffect, useState } from "react";

const apiBase = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "";
const apiItemsUrl = `${apiBase}/api/items`;

export default function Home() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(apiItemsUrl);
      if (!response.ok) {
        throw new Error(`Falha ao buscar itens: ${response.status}`);
      }
      setItems(await response.json());
    } catch (err) {
      setError(err.message || "Erro ao carregar itens.");
    } finally {
      setLoading(false);
    }
  }

  async function saveItem(event) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("O campo Nome é obrigatório.");
      return;
    }

    const payload = { name: name.trim(), description: description.trim() };
    const url = editingId ? `${apiItemsUrl}/${editingId}` : apiItemsUrl;
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Falha ao salvar item.");
      }

      await fetchItems();
      setName("");
      setDescription("");
      setEditingId(null);
    } catch (err) {
      setError(err.message || "Erro ao salvar item.");
    }
  }

  async function editItem(item) {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
    setError("");
  }

  async function deleteItem(id) {
    setError("");
    try {
      const response = await fetch(`${apiItemsUrl}/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Falha ao excluir item.");
      }
      await fetchItems();
    } catch (err) {
      setError(err.message || "Erro ao excluir item.");
    }
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>CRUD do Ezopscloud</h1>
      <p style={{ marginBottom: "1.5rem" }}>
        Ferramenta simples para adicionar, editar e apagar itens usando o backend Flask pelo mesmo domínio.
      </p>

      <section style={{ marginBottom: "2rem", padding: "1.5rem", border: "1px solid #ddd", borderRadius: "8px", background: "#fafafa" }}>
        <h2 style={{ marginTop: 0 }}>{editingId ? "Editar item" : "Adicionar item"}</h2>

        {error && (
          <div style={{ marginBottom: "1rem", color: "#b00020", fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={saveItem}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #ccc", borderRadius: "6px" }}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #ccc", borderRadius: "6px" }}
            />
          </div>

          <button type="submit" style={{ padding: "0.75rem 1.5rem", borderRadius: "6px", background: "#0070f3", color: "white", border: "none", cursor: "pointer" }}>
            {editingId ? "Atualizar" : "Adicionar"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName("");
                setDescription("");
                setError("");
              }}
              style={{ marginLeft: "1rem", padding: "0.75rem 1.25rem", borderRadius: "6px", background: "#999", color: "white", border: "none", cursor: "pointer" }}
            >
              Cancelar
            </button>
          )}
        </form>
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Itens cadastrados</h2>
          <button
            type="button"
            onClick={fetchItems}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              background: loading ? "#555" : "#333",
              color: "white",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Atualizando..." : "Atualizar lista"}
          </button>
        </div>

        {loading ? (
          <p>Carregando itens...</p>
        ) : items.length === 0 ? (
          <p>Nenhum item encontrado.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "2px solid #ddd", padding: "0.75rem", textAlign: "left" }}>ID</th>
                <th style={{ borderBottom: "2px solid #ddd", padding: "0.75rem", textAlign: "left" }}>Nome</th>
                <th style={{ borderBottom: "2px solid #ddd", padding: "0.75rem", textAlign: "left" }}>Descrição</th>
                <th style={{ borderBottom: "2px solid #ddd", padding: "0.75rem", textAlign: "left" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #eee" }}>{item.id}</td>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #eee" }}>{item.name}</td>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #eee" }}>{item.description}</td>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #eee" }}>
                    <button
                      onClick={() => editItem(item)}
                      style={{ marginRight: "0.5rem", padding: "0.5rem 0.85rem", borderRadius: "6px", border: "1px solid #0070f3", background: "white", color: "#0070f3", cursor: "pointer" }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      style={{ padding: "0.5rem 0.85rem", borderRadius: "6px", border: "1px solid #d00", background: "#d00", color: "white", cursor: "pointer" }}
                    >
                      Excluir
                    </button>
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
