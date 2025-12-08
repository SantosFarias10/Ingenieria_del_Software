//import { startGame } from '../service/HttpService';
import { getUserId } from '../service/LocalStorage';
import '../styles/betterModal.css';
import PlayerList from "./PlayerList";
//import axios from 'axios';

function BetterModal({ isOpen = false, onClose = () => {}, players = [], roomName = "", minPlayers = 3, maxPlayers = 6, onStart = async () => {}, creador }) {
  if (!isOpen) return null;

  // Calcular si se puede iniciar la partida
  const currentPlayerCount = players.length;
  const Playerid = Number(getUserId())
  const isCreator = (Playerid === Number(creador))
  const canStartGame = currentPlayerCount >= minPlayers && isCreator;
  return (
    <div className="bm-overlay" onClick={onClose}>
      <div
        className="bm-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="bm-header">
          <h2 id="bm-title" className="bm-title">Lobby: {roomName}</h2>
          <button type="button" className="bm-close" onClick={onClose} aria-label="Cerrar">×</button>
        </header>

        <div className="bm-content">
          <div className="bm-player-info">
            <p>Jugadores conectados: {currentPlayerCount}/{maxPlayers} (mínimo: {minPlayers})</p>
            {!canStartGame && (
              <p className="bm-waiting-message">
                Faltan {minPlayers - currentPlayerCount} jugador{minPlayers - currentPlayerCount !== 1 ? 'es' : ''} para iniciar la partida
              </p>
            )}
          </div>
          <PlayerList players={players} />
        </div>

        <footer className="bm-footer">
          <button 
            type="button" 
            className={`bm-start ${!canStartGame ? 'bm-start-disabled' : ''}`}
            disabled={!canStartGame}
            onClick={onStart}
          >
            {canStartGame ? 'Iniciar Partida' : `Esperando jugadores (${currentPlayerCount}/${minPlayers})`}
          </button>
        </footer>


      </div>
    </div>
  );
}

export default BetterModal;