import { UploadCloud, FileVideo } from "lucide-react";

export default function LibraryPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Biblioteca de Mídia</h1>
          <p className="page-subtitle">Gerencie seus vídeos e legendas</p>
        </div>
        <button className="btn btn-primary">
          <UploadCloud size={18} /> Upload
        </button>
      </div>

      <div className="glass-panel" style={{ 
        padding: '3rem', 
        textAlign: 'center', 
        borderStyle: 'dashed', 
        borderWidth: '2px', 
        borderColor: 'var(--border-color)',
        marginBottom: '2rem' 
      }}>
        <UploadCloud size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>Arraste seus vídeos para cá</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>MP4 ou MOV até 50MB</p>
        <button className="btn btn-outline">Selecionar Arquivos</button>
      </div>

      <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Vídeos Recentes</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3, 4].map((video) => (
          <div key={video} className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ height: '120px', backgroundColor: '#1a1a1a', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <FileVideo size={32} color="var(--text-secondary)" />
            </div>
            <div style={{ padding: '1rem' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>video_edit_{video}.mp4</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>10.5 MB</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
