"use client";

import { Search, Plus, X, Download, Play, FolderOpen, Trash2, ExternalLink, Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface VideoItem {
  id: number;
  shortCode: string;
  caption: string;
  videoUrl: string;
  thumbnailUrl: string;
  likes: number;
  views: number;
  timestamp: string;
}

interface Model {
  id: number;
  username: string;
  fullName: string;
  profilePicUrl: string;
  totalVideos: number;
  videos: VideoItem[];
}

export default function InspiracoesPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());

  const handleSearch = async () => {
    if (!searchUsername.trim()) return;
    setIsSearching(true);
    setSearchError("");

    try {
      const res = await fetch("/api/instagram/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: searchUsername }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.error || "Erro ao buscar perfil.");
        setIsSearching(false);
        return;
      }

      if (data.videos.length === 0) {
        setSearchError("Nenhum vídeo encontrado para este perfil. Verifique se é um perfil público e possui reels/vídeos.");
        setIsSearching(false);
        return;
      }

      const newModel: Model = {
        id: Date.now(),
        username: data.profile.username,
        fullName: data.profile.fullName,
        profilePicUrl: data.profile.profilePicUrl,
        totalVideos: data.totalVideos,
        videos: data.videos,
      };

      setModels([newModel, ...models]);
      setSearchUsername("");
      setShowSearch(false);
    } catch (err: any) {
      setSearchError("Erro de conexão. Tente novamente.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownload = async (video: VideoItem) => {
    if (!video.videoUrl) {
      alert("URL do vídeo não disponível.");
      return;
    }

    setDownloadingIds((prev) => new Set(prev).add(video.id));

    try {
      // Baixar via proxy para evitar CORS e limpar metadados
      const res = await fetch("/api/instagram/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: video.videoUrl, filename: `${video.shortCode || 'video'}.mp4` }),
      });

      if (!res.ok) {
        throw new Error("Erro no download");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${video.shortCode || 'video_' + video.id}_sem_metadados.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erro ao baixar vídeo. Tente novamente.");
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(video.id);
        return next;
      });
    }
  };

  const handleDownloadAll = async (model: Model) => {
    for (const video of model.videos) {
      await handleDownload(video);
      // Pausa entre downloads para evitar sobrecarga
      await new Promise((r) => setTimeout(r, 500));
    }
  };

  const handleRemoveModel = (id: number) => {
    setModels(models.filter((m) => m.id !== id));
    if (selectedModel?.id === id) setSelectedModel(null);
  };

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex", justifyContent: "center", alignItems: "center",
          }}>
            <Sparkles size={24} color="#fff" />
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>Inspirações</h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>Modelos importados e seus conteúdos</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowSearch(true); setSearchError(""); }} style={{
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          border: "none", borderRadius: "20px", padding: "0.7rem 1.5rem",
        }}>
          <Plus size={18} /> Adicionar Modelo
        </button>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div style={{
          marginTop: "2rem", padding: "1.5rem 2rem",
          borderRadius: "16px", border: "1px solid var(--border-color)",
          backgroundColor: "rgba(255,255,255,0.02)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Search size={16} color="var(--text-secondary)" />
              <span style={{ fontWeight: 500 }}>Adicionar modelo do Instagram</span>
            </div>
            <button onClick={() => setShowSearch(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "0.3rem" }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <input
              type="text"
              className="input-field"
              placeholder="@username"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isSearching && handleSearch()}
              style={{ flex: 1, borderRadius: "12px", padding: "0.9rem 1.2rem" }}
              autoFocus
              disabled={isSearching}
            />
            <button
              className="btn btn-primary"
              onClick={handleSearch}
              disabled={isSearching}
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                border: "none", borderRadius: "12px", padding: "0.9rem 1.5rem",
                opacity: isSearching ? 0.7 : 1, minWidth: "140px",
              }}
            >
              {isSearching ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Buscando...</>
              ) : (
                <><Search size={16} /> Buscar</>
              )}
            </button>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.8rem" }}>
            TODOS os posts, reels, dados do perfil, capas e legendas serão importados.
          </p>

          {/* Error message */}
          {searchError && (
            <div style={{
              marginTop: "1rem", padding: "0.8rem 1rem",
              borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              display: "flex", alignItems: "center", gap: "0.5rem",
              color: "#f87171", fontSize: "0.9rem",
            }}>
              <AlertTriangle size={16} />
              {searchError}
            </div>
          )}

          {/* Loading indicator */}
          {isSearching && (
            <div style={{
              marginTop: "1rem", padding: "1rem",
              textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem",
            }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite", marginBottom: "0.5rem" }} />
              <p>Importando dados do Instagram via Apify... Isso pode levar até 1 minuto.</p>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ marginTop: "2rem" }}>
        {selectedModel ? (
          /* Video Grid for Selected Model */
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setSelectedModel(null)}
                  style={{ padding: "0.5rem 0.8rem", fontSize: "0.85rem" }}
                >
                  ← Voltar
                </button>
                {selectedModel.profilePicUrl ? (
                  <img
                    src={selectedModel.profilePicUrl}
                    alt={selectedModel.username}
                    style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: `hsl(${selectedModel.username.length * 50}, 60%, 40%)`,
                    display: "flex", justifyContent: "center", alignItems: "center",
                    fontWeight: 700, fontSize: "1rem", color: "#fff",
                  }}>
                    {selectedModel.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <span style={{ fontWeight: 600 }}>@{selectedModel.username}</span>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginLeft: "1rem" }}>
                    {selectedModel.videos.length} vídeos
                  </span>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => handleDownloadAll(selectedModel)}
                style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", border: "none", borderRadius: "12px" }}
              >
                <Download size={16} /> Baixar Todos (Sem Metadados)
              </button>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1rem",
            }}>
              {selectedModel.videos.map((video) => {
                const isDownloading = downloadingIds.has(video.id);
                return (
                  <div key={video.id} className="glass-panel" style={{ overflow: "hidden", position: "relative" }}>
                    {/* Video Thumbnail */}
                    <div style={{
                      height: "300px", position: "relative", cursor: "pointer",
                      backgroundColor: "#111",
                    }}>
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.caption?.slice(0, 30) || "Video"}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{
                          width: "100%", height: "100%",
                          display: "flex", justifyContent: "center", alignItems: "center",
                          background: `hsl(${(video.id * 37) % 360}, 25%, 18%)`,
                        }}>
                          <Play size={32} color="rgba(255,255,255,0.3)" />
                        </div>
                      )}

                      {/* Play overlay */}
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                        display: "flex", justifyContent: "center", alignItems: "center",
                        background: "rgba(0,0,0,0.2)", transition: "background 0.2s",
                      }}>
                        <div style={{
                          width: "48px", height: "48px", borderRadius: "50%",
                          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
                          justifyContent: "center", alignItems: "center",
                          backdropFilter: "blur(4px)",
                        }}>
                          <Play size={20} color="#fff" fill="#fff" />
                        </div>
                      </div>

                      {/* Stats */}
                      {video.views > 0 && (
                        <span style={{
                          position: "absolute", bottom: "8px", left: "8px",
                          backgroundColor: "rgba(0,0,0,0.75)", padding: "0.15rem 0.5rem",
                          borderRadius: "4px", fontSize: "0.75rem", fontWeight: 500,
                        }}>
                          ▶ {formatNumber(video.views)}
                        </span>
                      )}
                      {video.likes > 0 && (
                        <span style={{
                          position: "absolute", bottom: "8px", right: "8px",
                          backgroundColor: "rgba(0,0,0,0.75)", padding: "0.15rem 0.5rem",
                          borderRadius: "4px", fontSize: "0.75rem", fontWeight: 500,
                        }}>
                          ♥ {formatNumber(video.likes)}
                        </span>
                      )}
                    </div>

                    {/* Info & Download */}
                    <div style={{ padding: "0.8rem 1rem" }}>
                      <p style={{
                        fontSize: "0.8rem", color: "var(--text-secondary)",
                        overflow: "hidden", textOverflow: "ellipsis",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
                        marginBottom: "0.6rem", lineHeight: 1.4,
                      }}>
                        {video.caption || "(sem legenda)"}
                      </p>
                      <button
                        onClick={() => handleDownload(video)}
                        disabled={isDownloading}
                        style={{
                          width: "100%", padding: "0.55rem",
                          background: isDownloading ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.1)",
                          border: "1px solid rgba(59,130,246,0.3)",
                          borderRadius: "8px", cursor: isDownloading ? "default" : "pointer",
                          color: "#3b82f6", fontSize: "0.8rem", fontWeight: 500,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                          transition: "all 0.2s", fontFamily: "inherit",
                        }}
                        onMouseEnter={(e) => { if (!isDownloading) e.currentTarget.style.backgroundColor = "rgba(59,130,246,0.2)"; }}
                        onMouseLeave={(e) => { if (!isDownloading) e.currentTarget.style.backgroundColor = "rgba(59,130,246,0.1)"; }}
                      >
                        {isDownloading ? (
                          <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Processando...</>
                        ) : (
                          <><Download size={14} /> Download (Sem Metadados)</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : models.length === 0 ? (
          /* Empty State */
          <div style={{
            textAlign: "center", padding: "5rem 2rem",
            borderRadius: "16px", border: "1px solid var(--border-color)",
          }}>
            <FolderOpen size={48} color="var(--text-secondary)" style={{ marginBottom: "1rem", opacity: 0.4 }} />
            <h3 style={{ color: "var(--text-secondary)", fontWeight: 500, marginBottom: "0.5rem" }}>Nenhuma modelo ainda</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", opacity: 0.7 }}>
              Clique em &quot;Adicionar Modelo&quot; para importar conteúdos do Instagram.
            </p>
          </div>
        ) : (
          /* Model Cards List */
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {models.map((model) => (
              <div
                key={model.id}
                className="glass-panel"
                style={{
                  padding: "1.5rem",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  cursor: "pointer", transition: "all 0.2s",
                }}
                onClick={() => setSelectedModel(model)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  {model.profilePicUrl ? (
                    <img
                      src={model.profilePicUrl}
                      alt={model.username}
                      style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: "50px", height: "50px", borderRadius: "50%",
                      background: `hsl(${model.username.length * 50}, 60%, 40%)`,
                      display: "flex", justifyContent: "center", alignItems: "center",
                      fontWeight: 700, fontSize: "1.2rem", color: "#fff",
                    }}>
                      {model.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "1rem" }}>@{model.username}</p>
                    <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.3rem" }}>
                      {model.fullName && model.fullName !== model.username && (
                        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          {model.fullName}
                        </span>
                      )}
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {model.totalVideos} vídeos importados
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <button
                    className="btn btn-outline"
                    onClick={(e) => { e.stopPropagation(); setSelectedModel(model); }}
                    style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", borderRadius: "8px" }}
                  >
                    <ExternalLink size={14} /> Ver Vídeos
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveModel(model.id); }}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--text-secondary)", padding: "0.5rem",
                      borderRadius: "8px", transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.backgroundColor = "transparent"; }}
                    title="Remover modelo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
