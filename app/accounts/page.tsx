"use client";

import { Camera, Plus, Wifi, WifiOff, Trash2, ExternalLink, AlertTriangle, Loader2, Info } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Account {
  id: string;
  username: string;
  profilePicUrl?: string;
  followersCount?: number;
  status: "connected" | "disconnected";
  igAccountId?: string;
  pageAccessToken?: string;
}

export default function AccountsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>
          Carregando contas…
        </div>
      }
    >
      <AccountsPageInner />
    </Suspense>
  );
}

function AccountsPageInner() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [setupInfo, setSetupInfo] = useState<any>(null);
  const searchParams = useSearchParams();

  // Carregar contas do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("wayne_ig_accounts");
    if (saved) {
      try { setAccounts(JSON.parse(saved)); } catch {}
    }
  }, []);

  // Salvar contas no localStorage quando mudam
  useEffect(() => {
    localStorage.setItem("wayne_ig_accounts", JSON.stringify(accounts));
  }, [accounts]);

  // Processar retorno do OAuth
  useEffect(() => {
    const success = searchParams.get("success");
    const accountsData = searchParams.get("accounts");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      const msgs: Record<string, string> = {
        auth_denied: "Autorização negada pelo usuário.",
        no_code: "Código de autorização não recebido.",
        token_failed: "Falha ao obter token de acesso.",
        server_error: "Erro interno do servidor.",
      };
      setError(msgs[errorParam] || "Erro desconhecido.");
    }

    if (success === "true" && accountsData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(accountsData));
        const newAccounts: Account[] = parsed.map((a: any) => ({
          id: a.igAccountId,
          username: a.username,
          profilePicUrl: a.profilePicUrl,
          followersCount: a.followersCount,
          status: "connected" as const,
          igAccountId: a.igAccountId,
          pageAccessToken: a.pageAccessToken,
        }));

        setAccounts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const unique = newAccounts.filter((n) => !existingIds.has(n.id));
          return [...prev, ...unique];
        });
      } catch {}

      // Limpar URL
      window.history.replaceState({}, "", "/accounts");
    }
  }, [searchParams]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError("");

    try {
      const res = await fetch("/api/instagram/oauth");
      const data = await res.json();

      if (data.authUrl) {
        // Abrir numa nova aba para o login do Instagram/Facebook
        window.open(data.authUrl, "_blank", "width=600,height=700");
      } else if (data.setup_instructions) {
        // Mostrar instruções de configuração
        setShowSetup(true);
        setSetupInfo(data.setup_instructions);
      } else {
        setError(data.error || "Erro ao iniciar conexão.");
      }
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRemove = (id: string) => {
    setAccounts(accounts.filter((a) => a.id !== id));
  };

  const formatFollowers = (n?: number) => {
    if (!n) return "";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M seguidores`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K seguidores`;
    return `${n} seguidores`;
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "12px",
          background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
          display: "flex", justifyContent: "center", alignItems: "center",
        }}>
          <Camera size={24} color="#fff" />
        </div>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Contas Conectadas</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Conecte sua conta do Instagram para agendar e publicar conteúdos</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          marginTop: "1.5rem", padding: "0.8rem 1rem",
          borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.3)",
          display: "flex", alignItems: "center", gap: "0.5rem",
          color: "#f87171", fontSize: "0.9rem",
        }}>
          <AlertTriangle size={16} />
          {error}
          <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", color: "#f87171", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Connected Accounts Section */}
      <div style={{ marginTop: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <Camera size={16} color="var(--text-secondary)" />
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Instagram ({accounts.length})
          </span>
        </div>

        {accounts.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "4rem 2rem",
            borderRadius: "16px", border: "1px solid var(--border-color)",
          }}>
            <Camera size={48} color="var(--text-secondary)" style={{ marginBottom: "1rem", opacity: 0.4 }} />
            <h3 style={{ color: "var(--text-secondary)", fontWeight: 500, marginBottom: "0.5rem" }}>Nenhuma conta Instagram conectada</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", opacity: 0.7 }}>
              Conecte sua conta profissional do Instagram para começar a agendar publicações.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {accounts.map((account) => (
              <div key={account.id} className="glass-panel" style={{
                padding: "1.2rem 1.5rem",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  {account.profilePicUrl ? (
                    <img
                      src={account.profilePicUrl}
                      alt={account.username}
                      style={{
                        width: "44px", height: "44px", borderRadius: "50%",
                        objectFit: "cover", border: "2px solid rgba(255,255,255,0.1)",
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
                      display: "flex", justifyContent: "center", alignItems: "center",
                      padding: "2px",
                    }}>
                      <div style={{
                        width: "100%", height: "100%", borderRadius: "50%",
                        backgroundColor: "var(--surface-solid)",
                        display: "flex", justifyContent: "center", alignItems: "center",
                        fontSize: "0.9rem", fontWeight: 600,
                      }}>
                        {account.username.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  <div>
                    <p style={{ fontWeight: 600 }}>@{account.username}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.2rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Wifi size={12} color="#22c55e" />
                        <span style={{ fontSize: "0.8rem", color: "#22c55e" }}>Conectada</span>
                      </div>
                      {account.followersCount && (
                        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          {formatFollowers(account.followersCount)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(account.id)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-secondary)", padding: "0.5rem",
                    borderRadius: "8px", transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.backgroundColor = "transparent"; }}
                  title="Remover conta"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connect New Account Section */}
      <div style={{ marginTop: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <Plus size={14} color="var(--text-secondary)" />
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Conectar Nova Conta
          </span>
        </div>

        <div
          onClick={!isConnecting ? handleConnect : undefined}
          style={{
            textAlign: "center", padding: "3rem 2rem",
            borderRadius: "16px", border: "1px dashed var(--border-color)",
            cursor: isConnecting ? "default" : "pointer", transition: "all 0.3s",
            opacity: isConnecting ? 0.7 : 1,
          }}
          onMouseEnter={(e) => { if (!isConnecting) { e.currentTarget.style.borderColor = "var(--border-highlight)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <div style={{
            width: "56px", height: "56px", borderRadius: "12px",
            backgroundColor: "rgba(255,255,255,0.05)", margin: "0 auto 1rem",
            display: "flex", justifyContent: "center", alignItems: "center",
          }}>
            {isConnecting ? (
              <Loader2 size={28} color="var(--text-secondary)" style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <Plus size={28} color="var(--text-secondary)" />
            )}
          </div>
          <h3 style={{ fontWeight: 500, marginBottom: "0.3rem" }}>
            {isConnecting ? "Abrindo login do Instagram..." : "Conectar Instagram"}
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Abrirá uma nova aba para login oficial no Instagram/Facebook
          </p>
        </div>
      </div>

      {/* Setup Instructions Modal */}
      {showSetup && setupInfo && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000,
        }}
          onClick={() => setShowSetup(false)}
        >
          <div
            className="glass-panel"
            style={{ maxWidth: "600px", width: "90%", padding: "2rem", maxHeight: "80vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Info size={20} color="#3b82f6" />
                <h2 style={{ fontSize: "1.2rem" }}>Configuração Necessária</h2>
              </div>
              <button onClick={() => setShowSetup(false)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>

            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              Para conectar contas do Instagram via API oficial, você precisa criar um App no Meta for Developers. Siga os passos:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {Object.entries(setupInfo).map(([key, value], i) => (
                <div key={key} style={{
                  padding: "1rem", borderRadius: "8px",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border-color)",
                }}>
                  <div style={{ display: "flex", gap: "0.8rem" }}>
                    <span style={{
                      width: "24px", height: "24px", borderRadius: "50%",
                      backgroundColor: "rgba(59,130,246,0.2)", color: "#3b82f6",
                      display: "flex", justifyContent: "center", alignItems: "center",
                      fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
                    }}>{i + 1}</span>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
                      {String(value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary"
              onClick={() => window.open("https://developers.facebook.com/", "_blank")}
              style={{ marginTop: "1.5rem", width: "100%", background: "linear-gradient(135deg, #3b82f6, #2563eb)", border: "none" }}
            >
              <ExternalLink size={16} /> Abrir Meta for Developers
            </button>
          </div>
        </div>
      )}

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
