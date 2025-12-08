import { getGame, getGameId } from './LocalStorage';

const DEFAULT_HOST = 'ws://127.0.0.1:8000';

const createWSService = () => {
  let ws = null;
  let connected = false;
  let partidaId = null;
  const listeners = {};

  const emit = (event, data) => {
    if (listeners[event]) listeners[event].forEach(cb => cb(data));
  };

  const buildBase = () => {
    const env = import.meta.env.VITE_WS_URI;
    if (env && typeof env === 'string' && env.length > 0) return env.replace(/\/$/, '');
    return `${DEFAULT_HOST}/ws/partida/jugadores`;
  };

  // connect se asegura de no abrir multiples conexiones duplicadas
  const connect = (nuevoPartidaId) => {
    // Determinar partida destino
    const idOrigen = nuevoPartidaId ?? getGameId() ?? getGame()?.id ?? partidaId;
    if (!idOrigen) {
      console.warn('WSService.connect: no partidaId available');
      return;
    }
    // Si ya hay una conexion a la misma partida, ignorar
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) && partidaId === idOrigen) {
      return;
    }
    // Si hay una conexion previa abierta a otra partida, cerrarla primero
    if (ws && ws.readyState === WebSocket.OPEN && partidaId !== idOrigen) {
      try { ws.close(1000, 'switch-partida'); } catch { /* noop */ }
    }
    partidaId = idOrigen;
    const base = buildBase();
    const wsUrl = `${base}/${partidaId}`;
    console.log('WSService: connecting to', wsUrl);

    try {
      ws = new WebSocket(wsUrl);
    } catch (err) {
      console.error('WSService failed to create WebSocket', err);
      emit('error', err);
      return;
    }

    ws.onopen = () => {
      connected = true;
      console.log('WebSocket connected');
      emit('connected', { partidaId });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          emit('players_update', { partidaId, jugadores: data });
        } else if (data && data.type) {
          emit(data.type, data.payload);
        } else {
          emit('message', data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        emit('error', error);
      }
    };

    ws.onclose = () => {
      if (connected) {
        console.log('WebSocket disconnected');
      }
      connected = false;
      emit('disconnected', { partidaId });
      ws = null;
    };

    ws.onerror = (error) => {
      connected = false;
      console.error('WebSocket error:', error);
      emit('error', error);
    };
  };

  const on = (event, cb) => {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(cb);
  };

  const off = (event, cb) => {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(x => x !== cb);
  };

  const disconnect = () => {
    if (ws) {
      try { ws.close(1000, 'manual-disconnect'); } catch { /* noop */ }
    }
    connected = false;
  };

  return {
    get isConnected() { return connected; },
    connect,
    on,
    off,
    disconnect
  };
};

export { createWSService };