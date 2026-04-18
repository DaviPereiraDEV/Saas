"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";

type AccountRow = {
  id: string;
  username: string;
  hasSession: boolean;
  lastError: string | null;
};

export default function IgLoginAccountsPage() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/private-ig/accounts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao listar");
      setAccounts(data.accounts ?? []);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAdd = async () => {
    setError("");
    if (!username.trim() || !password) {
      setError("Preencha usuário e senha.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/private-ig/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao salvar");
      setUsername("");
      setPassword("");
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remover esta conta do sistema?")) return;
    await fetch(`/api/private-ig/accounts/${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #c9a227, #6b5a1a)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <KeyRound size={24} color="#0a0c10" />
        </div>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            Contas Instagram (login direto)
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Usuário e senha ficam só no servidor, criptografados no banco. Não usamos a Graph API da Meta.
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            backgroundColor: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.9rem",
          }}
        >
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div className="glass-panel" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "1rem", fontWeight: 600 }}>
          Adicionar conta
        </h2>
        <div className="input-group" style={{ marginBottom: "1rem" }}>
          <label className="input-label">Usuário (@opcional)</label>
          <input
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="nomeusuario"
            autoComplete="username"
            disabled={saving}
          />
        </div>
        <div className="input-group" style={{ marginBottom: "1rem" }}>
          <label className="input-label">Senha</label>
          <input
            className="input-field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={saving}
          />
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void handleAdd()}
          disabled={saving}
          style={{ width: "100%" }}
        >
          {saving ? (
            <>
              <Loader2 size={16} className="spin" /> Validando login…
            </>
          ) : (
            <>
              <Plus size={16} /> Salvar conta
            </>
          )}
        </button>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.75rem" }}>
          Ao salvar, o servidor faz login na Instagram, grava a sessão e a senha criptografada (AES). A senha
          nunca volta para o navegador.
        </p>
      </div>

      <h2 style={{ fontSize: "1rem", margin: "1.5rem 0 0.75rem", fontWeight: 600 }}>
        Contas cadastradas
      </h2>
      {loading ? (
        <p style={{ color: "var(--text-secondary)" }}>Carregando…</p>
      ) : accounts.length === 0 ? (
        <div className="glass-panel" style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Nenhuma conta ainda.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {accounts.map((a) => (
            <div
              key={a.id}
              className="glass-panel"
              style={{
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p style={{ fontWeight: 600 }}>@{a.username}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Sessão: {a.hasSession ? "salva" : "—"}
                  {a.lastError ? ` · Último erro: ${a.lastError}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleRemove(a.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
                title="Remover"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 0.9s linear infinite; }
      `}</style>
    </div>
  );
}
