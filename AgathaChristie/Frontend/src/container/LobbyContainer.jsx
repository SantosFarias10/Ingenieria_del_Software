import React, { useEffect, useState, useCallback } from 'react';
import BetterModal from '../components/BetterModal';
import { saveGame, clearGame, getGameId, getUserId, getGame } from '../service/LocalStorage';
import { fetchPlayersInGame, getGameDetails, startGame } from '../service/HttpService';
import { createWSService} from '../service/WSService';
import { leaveGame } from '../service/HttpService';
import { useLocation, useNavigate } from 'react-router-dom';

// Instancia compartida del servicio WebSocket (no conectar automáticamente)
export const WS = createWSService();

//const gameData = getGameId();

// Variable para guardar la instancia del LobbyContainer (solo una referencia)
let lobbyContainerInstance = null;

// Funciones simples que otros componentes pueden usar
export function openLobby(gameData) {
  if (!gameData || !gameData.id) {
    console.warn('openLobby called without valid gameData', gameData);
    return;
  }
  if (lobbyContainerInstance) {
    lobbyContainerInstance.openLobby(gameData);
  }
}

export function closeLobby() {
  if (lobbyContainerInstance) {
    lobbyContainerInstance.closeLobby();
  }
}

// Componente LobbyContainer con estados normales
export default function LobbyContainer() {
  // Estados simples con useState (como era antes)
  const [isModalOpen, setIsModalOpen] = useState(false);
  // currentGame guarda toda la info de la partida
  const [currentGame, setCurrentGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();


  // No conectar automáticamente al cargar el componente; la conexión se hace al abrir el lobby

  const closegame = async (playerId) => {
    try {
      const response = await leaveGame(playerId);
      console.log('Jugador salió de la partida:', response);
    } catch (error) {
      console.log('Error al salir de la partida:', error);
    }
  };

  const fetchPlayers = useCallback(async (gameId) => {
    if (!gameId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetchPlayersInGame(gameId);
      // normalize response: backend may return array or an object { jugadores: [...] }
      if (Array.isArray(response)) {
        setPlayers(response);
      } else if (response && Array.isArray(response.jugadores)) {
        setPlayers(response.jugadores);
      } else {
        // fallback: empty array
        setPlayers([]);
      }
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('No se pudieron cargar los jugadores');
    } finally {
      setLoading(false);
    }
  }, []);

  // Funciones simples para manejar el modal
  const openLobbyLocal = useCallback((gameData) => {
    if (!gameData || !gameData.id) {
      console.warn('openLobbyLocal called without valid gameData', gameData);
      return;
    }

    // Obtener información del localStorage si existe
    const savedGame = getGame();

    // Usar datos del gameData o del localStorage, con valores por defecto
    const minPlayers = gameData.minPlayers ?? gameData.min_jugadores ?? savedGame?.min_jugadores ?? 2;
    const maxPlayers = gameData.maxPlayers ?? gameData.max_jugadores ?? savedGame?.max_jugadores ?? 6;

    // Crear objeto completo de la partida con toda la información
    const completeGameData = {
      ...gameData,
      minPlayers,
      maxPlayers
    };

    setCurrentGame(completeGameData);

    try {
      saveGame({
        id: gameData.id,
        nombre_partida: gameData.nombre || gameData.name || '',
        numero_jugadores: maxPlayers,
        max_jugadores: maxPlayers,
        min_jugadores: minPlayers
      });
    } catch (err) {
      console.warn('No se pudo guardar la partida en localStorage', err);
    }

    setIsModalOpen(true);
    // Cargar jugadores para la partida abierta
    fetchPlayers(gameData.id);
    // Conectar el WebSocket para esta partida
    try {
      WS.connect(gameData.id);
    } catch (err) {
      console.warn('WS connect failed', err);
    }
  }, [fetchPlayers]);

  const closeLobbyLocal = useCallback(async () => {
    setIsModalOpen(false);
    setCurrentGame(null);
    const playerId = getUserId();

    try {
      await closegame(playerId);
    } catch (error) {
      console.warn("Error al notificar la salida de partida", error)
    } finally {
      try { clearGame(); } catch { /* silent */ }
    }
  }, []);

  // Cerrar el modal automáticamente al entrar a la vista de partida, lo hizo el copiloto, pero funciona xd
  useEffect(() => {
    if (location.pathname === '/partida') {
      setIsModalOpen(false);
    }
  }, [location.pathname]);

  // Manejar cuando la partida es iniciada
  const handleGameStart = async () => {
    try {
      const objetoPartida = await startGame(currentGame.id);
      const state = objetoPartida?.estado;
      const started = state === true;
      if (started) {
        console.log('Partida iniciada', objetoPartida);
      } else {
        console.warn('La partida no pudo ser iniciada:', objetoPartida);
      }
    } catch (err) {
      console.warn('Error checking game started status:', err);
    }
  };

  // WebSocket manejo de eventos
  useEffect(() => {
    // Manejar cuando un jugador se une a la partida
    const handlePlayerJoined = (data) => {
      if (data.partidaId === currentGame?.id) {
        // Actualizar la lista de jugadores agregando el nuevo jugador
        setPlayers(prevPlayers => {
          // Evitar duplicados
          const playerExists = prevPlayers.some(p => p.id === data.jugador.id);
          if (!playerExists) {
            return [...prevPlayers, data.jugador];
          }
          return prevPlayers;
        });
      }
    };

    // Manejar cuando un jugador abandona la partida
    const handlePlayerLeft = (data) => {
      if (data.partidaId === currentGame?.id) {
        // Remover el jugador de la lista
        setPlayers(prevPlayers =>
          prevPlayers.filter(p => p.id !== data.jugadorId)
        );
      }
    };

    // Manejar actualización completa de la lista de jugadores
    const handlePlayersUpdate = (data) => {
      console.log('players_update recibido:', data);

      // Soportar tanto array directo como { partidaId, jugadores }
      const arrayJugadores = Array.isArray(data) ? data : data?.jugadores;
      console.log(arrayJugadores)
      if (!arrayJugadores) return;

      // Si la lista está vacía, la partida fue eliminada por el creador
      if (arrayJugadores.length === 0) {
        console.log('Partida eliminada - Lista de jugadores vacía');
        setIsModalOpen(false);
        setCurrentGame(null);
        clearGame();
        WS.disconnect();
        navigate('/listar-partidas');
        return;
      }

      setPlayers(arrayJugadores)
    };

    // Manejar cuando la partida es iniciada
    const handleGameStarted = async (data) => {
      if (data?.partidaId && data.partidaId !== currentGame?.id) return;
      try {
        const state = data?.partidaIniciada === true
        if (state) {
          console.log('Redirige jugadores', data);
          navigate('/partida');
        } else {
          console.warn('La partida no pudo ser iniciada:', data);
        }
      } catch (err) {
        console.warn('Error checking game started status:', err);
      }
    };

    // Registramos los listeners
    WS.on('player_joined', handlePlayerJoined);
    WS.on('player_left', handlePlayerLeft);
    WS.on('players_update', handlePlayersUpdate);
    WS.on('game_started', handleGameStarted);   // se pasa el evento cuando la partida comienza por websocket

    // removemos los listeners al desmontar o cambiar de partida
    return () => {
      WS.off('player_joined', handlePlayerJoined);
      WS.off('player_left', handlePlayerLeft);
      WS.off('players_update', handlePlayersUpdate);
      WS.off('game_started', handleGameStarted);  // limpiamos el listener del evento game_started
    };
  }, [currentGame?.id, navigate]);

  // Cargar jugadores cuando cambia la partida actual (openLobbyLocal invoca fetchPlayers también)
  useEffect(() => {
    if (currentGame?.id) {
      fetchPlayers(currentGame.id);
    }
  }, [currentGame, fetchPlayers]);

  // Cuando se monta el componente, guardamos la referencia
  useEffect(() => {
    lobbyContainerInstance = {
      openLobby: openLobbyLocal,
      closeLobby: closeLobbyLocal
    };

    // Limpiar la referencia cuando se desmonta
    return () => {
      lobbyContainerInstance = null;
    };
  }, [openLobbyLocal, closeLobbyLocal]);

  return (
    <>
      {/* Solo renderizar el modal, sin botones ni interfaz visible */}
      <BetterModal
        isOpen={isModalOpen}
        onClose={closeLobbyLocal}
        players={players}
        roomName={currentGame?.nombre || currentGame?.name || 'Partida'}
        minPlayers={currentGame?.minPlayers || 3}
        maxPlayers={currentGame?.maxPlayers || 6}
        onStart={handleGameStart}
        creador={currentGame?.creador}
      />
    </>
  );
}
