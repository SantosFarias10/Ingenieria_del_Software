import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ListadoDePartidas.css';
import FiltrarPorNombreVisual from './FiltrarPorNombreVisual';
import { openLobby } from '../container/LobbyContainer';
import { handlePlayerJoinGame } from '../service/HttpService';
import { getUserId } from '../service/LocalStorage';
import { fetchPlayerData } from '../service/HttpService';

// Presentational component: fetch creator names client-side to avoid async in render
const ListadoDePartidasPresentacional = ({ partidas, loading, error, fetchPartidas, filterText, onFilterChange }) => {
  const list = Array.isArray(partidas) ? partidas : [];
  const navigator = useNavigate();
  // lightweight cache in a ref + tick to force updates when a name arrives
  const creadoresRef = useRef({});
  const [, setTick] = useState(0);
  // joining state per partida and join errors per partida
  const [joiningById, setJoiningById] = useState({});
  const [joinErrors, setJoinErrors] = useState({});

  const loadCreatorName = async (playerId) => {
    if (!playerId) return 'Desconocido';
    if (creadoresRef.current[playerId]) return creadoresRef.current[playerId];
    try {
      const playerData = await fetchPlayerData(playerId);
      const nombre = playerData && playerData.nombre ? playerData.nombre : 'Desconocido';
      creadoresRef.current = { ...creadoresRef.current, [playerId]: nombre };
      // force a re-render so the newly-loaded name appears
      setTick(t => t + 1);
      return nombre;
    } catch (err) {
      console.error('Error al obtener datos del jugador:', err);
      creadoresRef.current = { ...creadoresRef.current, [playerId]: 'Desconocido' };
      setTick(t => t + 1);
      return 'Desconocido';
    }
  };

  // preload creators for visible partidas when partidas change (fire-and-forget)
  React.useEffect(() => {
    const idsToLoad = list
      .map(p => p.creador)
      .filter(id => id && !creadoresRef.current[id]);
    idsToLoad.forEach(id => {
      loadCreatorName(id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  const handlePlayersJoinGame = async (playerId, gameId) => {
    // wrapper kept for backward compatibility; delegates to service
    return handlePlayerJoinGame(playerId, gameId);
  };

  const onJoinClick = async (partida) => {
    const playerId = getUserId();
    if (!playerId) {
      console.warn('No hay jugador logueado para unirse a la partida');
      return;
    }
    const id = partida.id;
    setJoinErrors(prev => ({ ...prev, [id]: null }));
    setJoiningById(prev => ({ ...prev, [id]: true }));
    try {
      await handlePlayersJoinGame(playerId, id);
      // on success, open lobby and optionally refresh
      openLobby(partida);
      if (typeof fetchPartidas === 'function') fetchPartidas();
    } catch (err) {
      const serverMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'No se pudo unir a la partida';
      setJoinErrors(prev => ({ ...prev, [id]: serverMessage }));
      console.error('Error al unirse:', err);
    } finally {
      setJoiningById(prev => ({ ...prev, [id]: false }));
    }
  };
  return (
    <div className="partidas-container">
      <div className="partidas-header">
        <h1> Partidas Disponibles</h1>

          <FiltrarPorNombreVisual
            filterText={filterText}
            items={list}
            onFilterChange={onFilterChange}
          />
          <button 
            className="btn-refresh" 
            onClick={fetchPartidas}
            disabled={loading}
          >
              Refresh
          </button>

      </div>
      

      {error && (
        <div className="error-message">
            {error}
        </div>
      )}

  {list.length === 0 ? (
        <div className="no-partidas">
          <p>No hay partidas disponibles en este momento</p>
          <button className="btn-crear-partida"
            onClick={()=> navigator('/crear-partida')}>
            Crear Nueva Partida
          </button>
        </div>
      ) : (
        <>
          <div className="partidas-stats">
            <span>{list.length} partida(s) encontrada(s)</span>
          </div>
          <div className="partidas-grid">
            {list.map(partida => {
              // derive current players from backend response
              const current = Array.isArray(partida.jugadores)
                ? partida.jugadores.length
                : (Number(partida.jugadores) || Number(partida.jugadoresActuales) || 0);
              // prefer backend-provided max; fall back to sensible default (6)
              const rawMax = partida.maxPlayers 
                ?? partida.max_jugadores 
                ?? partida.maxJugadores 
                ?? partida.numero_jugadores 
                ?? partida.numeroJugadores
                ?? null;
              const max = Number(rawMax) > 0 ? Number(rawMax) : 6;
              // Get min players for display purposes
              const rawMin = partida.minPlayers
                ?? partida.min_jugadores
                ?? partida.minJugadores
                ?? 2;
              const min = Number(rawMin) > 0 ? Number(rawMin) : 2;
              const estadoText = (partida.estado === true) ? 'iniciada' : 'esperando';
              const isFull = max > 0 ? current >= max : false;

              return (
              <div 
                key={partida.id} 
                className={`partida-card ${isFull ? 'partida-llena' : ''}`}
              >
                <div className="partida-header">
                  <h3 className="partida-nombre">{partida.nombre}</h3>
                  <span className={`partida-estado partida-estado-${estadoText}`}>
                    {estadoText}
                  </span>
                  <div className="partida-actions">
                    <button
                      className='btn-unirse-partida'
                      onClick={() => onJoinClick(partida)}
                      disabled={joiningById[partida.id] || isFull}
                    >
                      { joiningById[partida.id] ? 'Uniendo...' : 'Unirse' }
                    </button>
                    { joinErrors[partida.id] && (
                      <div className="error-message small">{joinErrors[partida.id]}</div>
                    )}
                  </div>
                </div>
                <div className="partida-info">
                  <div className="info-item">
                    <span>Jugadores:</span>
                    <span>
                      {current}/{max}
                    </span>
                  </div>
                  <div className="info-item">
                    <span>Creador:</span>
                    <span>{creadoresRef.current[partida.creador] || 'Cargando...'}</span>
                  </div>
                </div>
              </div>
            ); })}
          </div>
        </>
      )}
    </div>
  );
};

export default ListadoDePartidasPresentacional;
