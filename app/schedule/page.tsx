"use client";

export default function SchedulePage() {
  return (
    <div>
      <h1 className="page-title">Agendamento</h1>
      <p className="page-subtitle">Programe a distribuição dos vídeos entre as contas</p>

      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px' }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <label className="input-label">Selecionar Conta</label>
            <select className="input-field" defaultValue="">
              <option value="" disabled>Escolha uma conta...</option>
              <option value="1">@brucewayne</option>
              <option value="2">@wayneenterprises</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Selecionar Vídeo da Biblioteca</label>
            <select className="input-field" defaultValue="">
              <option value="" disabled>Escolha um vídeo...</option>
              <option value="1">video_edit_1.mp4</option>
              <option value="2">video_edit_2.mp4</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Legenda</label>
            <textarea 
              className="input-field" 
              rows={4} 
              placeholder="Escreva a legenda aqui..."
              style={{ resize: 'vertical' }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Data</label>
              <input type="date" className="input-field" />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Hora</label>
              <input type="time" className="input-field" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Agendar Postagem
          </button>
        </form>
      </div>
    </div>
  );
}
