export default function ActivityLog({ logs }) {
  return (
    <div className="log-section">
      <h2>Journal d'activite</h2>
      <div className="log-container">
        {logs.length === 0 ? (
          <p className="log-empty">Aucune activite pour le moment...</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`log-entry log-${log.type}`}>
              <span className="log-time">{log.time}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
