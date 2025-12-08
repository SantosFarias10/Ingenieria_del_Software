import React from 'react';
import '../styles/playerList.css';
import { getAvatars } from '../service/playerService';

function PlayerList({ players = [] }) {
  // ensure players is an array to avoid runtime errors
  const list = Array.isArray(players) ? players : [];
  if (!list || list.length === 0) {
    return <div className="pl-empty">No hay jugadores aún.</div>;
  }

  const avatars = getAvatars();

  return (
    <ul className="pl-list" role="list">
      {list.map((p, idx) => {
        const displayName = p?.nombre ?? p?.name ?? 'Jugador';
        const avatarValue = p?.avatar;
        const avatarData = avatars.find(a => a.value === avatarValue);
        const key = p?.id ?? `${displayName}-${idx}`;

        return (
          <li className="pl-item" key={key}>
            <div className="pl-avatar">
              {avatarData ? (
                <img
                  src={avatarData.src}
                  alt={avatarData.alt || displayName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                />
              ) : (
                (displayName?.[0] || 'J').toUpperCase()
              )}
            </div>
            <div className="pl-meta">
              <div className="pl-name">{displayName}</div>
              <div className="pl-sub">Conectado</div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default PlayerList;