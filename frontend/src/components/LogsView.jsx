import React from 'react';
export default function LogsView({ alerts }) {
  return (
    <div className="w-full h-full flex flex-col p-4 bg-surface-dim overflow-y-auto">
      <h2 className="text-lg font-bold text-primary mb-4 border-b border-primary/30 pb-2">
        SYSTEM AUDIT ^& THREAT LOGS
      </h2>
      <div className="bg-surface-container-low border border-outline-variant overflow-hidden flex flex-col">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-surface-variant text-on-surface-variant border-b border-outline-variant">
            <tr>
              <th className="p-2 font-semibold w-24">TIMESTAMP</th>
              <th className="p-2 font-semibold w-20">LEVEL</th>
              <th className="p-2 font-semibold">EVENT / THREAT</th>
              <th className="p-2 font-semibold w-24">SOURCE</th>
              <th className="p-2 font-semibold w-32">LOCATION</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-outline-variant/30 hover:bg-surface-variant/50">
              <td className="p-2 text-on-surface-variant">{new Date().toLocaleTimeString()}</td>
              <td className="p-2 text-primary font-bold">INFO</td>
              <td className="p-2">SYSTEM INITIALIZED, ENCRYPTION KEYS DERIVED</td>
              <td className="p-2 text-on-surface-variant">SYS_CORE</td>
              <td className="p-2 text-on-surface-variant">--</td>
            </tr>
            {alerts.map((alert) => (
              <tr key={alert.id} className="border-b border-outline-variant/30 hover:bg-surface-variant/50">
                <td className="p-2 text-on-surface-variant">{alert.timestamp}</td>
                <td className={`p-2 font-bold ${alert.severity === 'CRITICAL' ? 'text-error' : 'text-secondary-container'}`}>
                  {alert.severity}
                </td>
                <td className="p-2 font-bold text-white">DETECTION: {alert.threatType} (CONF: {Math.round((alert.confidence||0.9)*100)}%)</td>
                <td className="p-2 text-on-surface-variant">{alert.source || 'EDGE_AI'}</td>
                <td className="p-2 text-on-surface-variant">
                  {alert.coordinates?.lat?.toFixed(4)}, {alert.coordinates?.lng?.toFixed(4)}
                </td>
              </tr>
            ))}
            <tr className="border-b border-outline-variant/30 hover:bg-surface-variant/50">
              <td className="p-2 text-on-surface-variant">00:00:00 AM</td>
              <td className="p-2 text-primary font-bold">INFO</td>
              <td className="p-2">C2 GATEWAY CONNECTION ESTABLISHED</td>
              <td className="p-2 text-on-surface-variant">NET_MGR</td>
              <td className="p-2 text-on-surface-variant">--</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
