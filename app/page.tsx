export default function Dashboard() {
  return (
    <div>
      <h1 className="page-title">Comando</h1>
      <p className="page-subtitle">Visão geral das operações — estilo Wayne, execução precisa</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Contas Ativas</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>3</p>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Vídeos na Biblioteca</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>24</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Agendamentos Pendentes</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>12</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Próximas Postagens</h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Conta</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Vídeo</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Data/Hora</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Stub data */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>@brucewayne</td>
                <td style={{ padding: '1rem' }}>batmobile_reveal.mp4</td>
                <td style={{ padding: '1rem' }}>Hoje, 18:00</td>
                <td style={{ padding: '1rem' }}><span style={{ color: '#eab308' }}>Agendado</span></td>
              </tr>
              <tr>
                <td style={{ padding: '1rem' }}>@wayneenterprises</td>
                <td style={{ padding: '1rem' }}>q3_results.mp4</td>
                <td style={{ padding: '1rem' }}>Amanhã, 09:00</td>
                <td style={{ padding: '1rem' }}><span style={{ color: '#eab308' }}>Agendado</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
