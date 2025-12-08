import axios from "axios";
import { getUserId } from "./LocalStorage.js";

// axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Players
// createPlayers es una función asíncrona que crea un jugador, recibe un objeto con las propiedades name, birthdate y avatar
export async function createPlayer({ name, birthdate, avatar }) {
  // Spec: POST /crear-jugador?nombre=&cumple=&avatar=
  try {
    const params = { nombre: name, cumple: birthdate, avatar };
    const response = await api.post("/crear-jugador", null, { params });
    return response.data;
  } catch (err) {
    console.error("Error creando jugador:", err);
    throw err;
  }
}

// fetchPlayersService es una función asíncrona que obtiene la lista de jugadores
export const fetchPlayersService = async () => {
  // Spec: GET /listar-jugadores
  try {
    const resp = await api.get("/listar-jugadores");
    return resp.data;
  } catch (err) {
    console.error("Error listando jugadores:", err);
    throw err;
  }
};

// Games
// createGame es una función asíncrona que crea una partida, recibe un objeto con las propiedades gameName, creador y maxPlayers
export async function createGame({
  gameName,
  creador,
  maxPlayers,
  minPlayers,
} = {}) {
  // Spec: POST /crear-partida?nombre=&creador=
  // The backend wants 'nombre' and 'creador' as query params; we'll also send max_jugadores and min_jugadores
  try {
    const creatorId = creador ?? getUserId();
    const params = {
      nombre: gameName,
      creador: creatorId,
      max_jugadores: maxPlayers,
    };

    // Include min_jugadores if provided
    if (minPlayers !== undefined) {
      params.min_jugadores = minPlayers;
    }

    const response = await api.post("/crear-partida", null, { params });
    return response.data;
  } catch (err) {
    console.error("Error creando partida:", err);
    throw err;
  }
}

// fetchPartidasService es una función asíncrona que obtiene la lista de partidas
export const fetchPartidasService = async () => {
  // Spec: GET /listar-partidas
  try {
    const resp = await api.get("/listar-partidas");
    return resp.data;
  } catch (err) {
    console.error("Error listando partidas:", err);
    throw err;
  }
};

// deleteGame es una función asíncrona que elimina una partida, recibe el ID de la partida a eliminar
export async function deleteGame(partidaId) {
  // Spec: DELETE /eliminar-partida/{partida_id}
  try {
    const resp = await api.delete(`/eliminar-partida/${partidaId}`);
    return resp.data;
  } catch (err) {
    console.error("Error eliminando partida:", err);
    throw err;
  }
}

// startGame es una función asíncrona que inicia una partida, recibe el ID de la partida a iniciar
export async function startGame(partidaId) {
  // Spec: PUT /iniciar-partida/{partida_id}
  try {
    const resp = await api.put(`/iniciar-partida/${partidaId}`);
    return resp.data;
  } catch (err) {
    console.error("Error iniciando partida:", err);
    throw err;
  }
}

// getGameDetails es una función asíncrona que obtiene los detalles de una partida, recibe el ID de la partida
export const getGameDetails = async (partidaId) => {
  // Spec: GET /detalles-partida?partida_id=
  try {
    const resp = await api.get("/detalles-partida", {
      params: { partida_id: partidaId },
    });
    return resp.data;
  } catch (err) {
    console.error("Error obteniendo detalles de partida:", err);
    throw err;
  }
};

// Join / Leave
// handlePlayerJoinGame es una función asíncrona que permite a un jugador unirse a una partida, recibe el ID del jugador y el ID de la partida
export const handlePlayerJoinGame = async (playerId, gameId) => {
  // Spec: PUT /unirse-partida?partida_id=&jugador_id
  try {
    const params = { partida_id: gameId, jugador_id: playerId };
    const resp = await api.put("/unirse-partida", null, { params });
    return resp.data;
  } catch (err) {
    console.error("Error al unirse a la partida:", err);
    throw err;
  }
};

// leaveGame es una función asíncrona que permite a un jugador salir de una partida, recibe el ID del jugador
export const leaveGame = async (playerId) => {
  // Spec: PUT /salir-partida?jugador_id
  try {
    const resp = await api.put("/salir-partida", null, {
      params: { jugador_id: playerId },
    });
    return resp.data;
  } catch (err) {
    console.error("Error al salir de la partida:", err);
    throw err;
  }
};

// fetchPlayersInGame es una función asíncrona que obtiene la lista de jugadores en una partida, recibe el ID de la partida
export const fetchPlayersInGame = async (partidaId) => {
  // Spec: GET /partida/jugadores?partida_id=
  try {
    const resp = await api.get("/partida/jugadores", {
      params: { partida_id: partidaId },
    });
    return resp.data;
  } catch (err) {
    console.error("Error al obtener los jugadores de la partida:", err);
    throw err;
  }
};

// fetchPlayerData es una función asíncrona que obtiene los datos de un jugador, recibe el ID del jugador
export const fetchPlayerData = async (playerId) => {
  // Spec: GET /obtener-datos-jugador/{jugador_id}
  try {
    const resp = await api.get(`/obtener-datos-jugador/${playerId}`); //que delincuente mauro
    return resp.data;
  } catch (err) {
    console.error("Error al obtener datos del jugador:", err);
    throw err;
  }
};

export const filtrarPartidas = async (filtro_nombre) => {
  // Spec: GET /listar-partidas/{filtro_nombre}
  try {
    const resp = await api.get(`/listar-partidas/${filtro_nombre}`);
    return resp.data;
  } catch (err) {
    console.error("Error filtrando partidas:", err);
    throw err;
  }
};

export const endTurn = async (partidaId) => {
  // Spec: PUT /finalizar-turno?partida_id=
  try {
    const resp = await api.put(`/partida/${partidaId}/terminar-turno`, null, {
      params: { partida_id: partidaId },
    });
    return resp.data;
  } catch (err) {
    console.error("Error al finalizar el turno:", err);
    throw err;
  }
};

export const obtenerCartas = async (playerId) => {
  // Spec: GET /{id_partida}/cartas?partida_id=
  try {
    const resp = await api.get("/partida/cartas", {
      params: { id_jugador: playerId },
    });
    return resp.data;
  } catch (err) {
    console.error("Error al obtener las cartas de la partida:", err);
    throw err;
  }
};

export const obtenerSecretos = async (playerId) => {
  // Spec: GET /partida/secretos?partida_id=
  try {
    const resp = await api.get("/partida/secretos", {
      params: { id_jugador: playerId },
    });
    return resp.data;
  } catch (err) {
    console.error("Error al obtener los secretos de la partida:", err);
    throw err;
  }
};

export const noEjecutarAccion = async (playerId) => {
  // Spec: PUT /no-ejecutar-accion?partida_id=
  try {
    const resp = await api.put("/no-ejecutar-accion", null, {
      params: { id_jugador: playerId },
    });
    return resp.data;
  } catch (err) {
    console.error("Error al no ejecutar la acción:", err);
    throw err;
  }
};

export const descartarCarta = async (partidaId, cartaId) => {
  // Spec: POST /descartar-carta?carta_id=&partida_id=
  try {
    const resp = await api.post("/descartar-carta", null, {
      params: {
        carta_id: cartaId,
        partida_id: partidaId,
      },
    });
    return resp.data;
  } catch (err) {
    console.error("Error al descartar la carta:", err);
    throw err;
  }
};

export const robarCarta = async (playerId, gameId) => {
  // Spec: POST /reponer-del-mazo-regular?partida_id=
  try {
    const resp = await api.post("/robar-carta-del-mazo-regular", null, {
      params: { jugador_id: playerId, partida_id: gameId },
    });
    return resp.data;
  } catch (err) {
    console.error("Error al robar la carta:", err);
    throw err;
  }
};

export const ganador = async (partidaId) => {
  try {
    const resp = await api.get("/ganador", {
      params: { partida_id: partidaId },
    });
    return resp.data;
  } catch (err) {
    console.error("Error al obtener el ganador:", err);
    throw err;
  }
};

export const descarteObligatorio = async (playerId) => {
  // Spec: PUT /descartar-obligatorio?partida_id=
  try {
    const resp = await api.put("/descartar-obligatorio", null, {
      params: { id_jugador: playerId },
    });
    return resp.data;
  } catch (err) {
    console.error("Error al descartar obligatorio:", err);
    throw err;
  }
};

// Sets (Detectives)
export const checkSets = async (partidaId, jugadorId) => {
  try {
    const resp = await api.get("/check-sets", {
      params: { partida_id: partidaId, jugador_id: jugadorId },
    });
    return resp.data;
  } catch (err) {
    console.error("Error en checkSets:", err);
    throw err;
  }
};

export const jugarSet = async (
  partidaId,
  jugadorId,
  objetivo_id = 0,
  carta_1_id,
  carta_2_id,
  carta_3_id,
) => {
  try {
    // Todos los parámetros como query params (el backend los espera en query, no en body)
    const params = {
      partida_id: partidaId,
      jugador_id: jugadorId,
      objetivo_id: objetivo_id || 0, // Asegurar que nunca sea null
      carta_1_id: carta_1_id,
      carta_2_id: carta_2_id,
    };

    // Solo agregar carta_3_id si existe
    if (carta_3_id !== null && carta_3_id !== undefined) {
      params.carta_3_id = carta_3_id;
    }

    console.log("[DEBUG HttpService] jugarSet params:", params);

    const resp = await api.post("/jugar-set", null, { params });
    return resp.data;
  } catch (err) {
    console.error("Error en jugarSet:", err);
    console.error("Error response:", err.response?.data);
    if (err.response?.data?.detail) {
      console.error(
        "Error detail completo:",
        JSON.stringify(err.response.data.detail, null, 2),
      );
    }
    throw err;
  }
};

// FASE 4: Revelar secreto propio (webso=2: Satterthwaite, Brent, Beresfords)
export const revelarSecretoPropio = async (partidaId, jugadorId, secretoId, esSatterthwaiteQuin = false, jugObjetivoId = null) => {
  try {
    const params = {
      partida_id: partidaId,
      jugador_id: jugadorId,
      secreto_id: secretoId,
      debe_robar: esSatterthwaiteQuin
    };

    // Solo agregar jug_obj_id si es Satterthwaite+Quin y tenemos el ID
    if (esSatterthwaiteQuin && jugObjetivoId !== null) {
      params.jug_obj_id = jugObjetivoId;
    }

    const resp = await api.post("/revelar-secreto-propio", null, { params });
    return resp.data;
  } catch (err) {
    console.error("Error en revelarSecretoPropio:", err);
    throw err;
  }
};

export const intercambiarSets = async (
  partidaId,
  jugadorId,
  cartasJugadasId,
) => {
  try {
    console.log("[DEBUG] Llamando endpoint /intercambiar-set con params:", {
      partidaId,
      jugadorId,
      cartasJugadasId,
    });

    // Usar el formato estándar que espera el backend con alias
    const params = {
      jugador_id: jugadorId,
      "cartas_jugadas_id[]": cartasJugadasId, // Formato estándar para arrays
    };

    console.log("[DEBUG] Params enviados:", params);

    const resp = await api.post("/intercambiar-set", null, { params });

    console.log("[DEBUG] Respuesta del endpoint:", resp.data);
    return resp.data;
  } catch (err) {
    console.error("Error en intercambiarSets:", err);
    console.error("Error status:", err.response?.status);
    console.error("Error response completa:", err.response?.data);

    throw err;
  }
};

// Alias para mantener compatibilidad
export const intercambiarSet = intercambiarSets;

export const verTodosLosSets = async (partidaId) => {
  try {
    console.log(
      "[DEBUG] Llamando endpoint /ver-todos-los-sets con partida_id:",
      partidaId,
    );

    const resp = await api.get("/ver-todos-los-sets", {
      params: { partida_id: partidaId },
    });

    console.log(
      "[DEBUG] Respuesta del endpoint ver-todos-los-sets:",
      resp.data,
    );
    return resp.data;
  } catch (err) {
    console.error("Error en verTodosLosSets:", err);
    console.error("Error status:", err.response?.status);
    console.error("Error response completa:", err.response?.data);

    throw err;
  }
};

export const jugar_evento_jugado = async (
  partidaId,
  jugadorId,
  cartaId,
  objetivoId,
  objetivo2Id,
) => {
  try {
    const params = {
      partida_id: partidaId,
      jugador_id: jugadorId,
      carta_id: cartaId,
      objetivo_id: objetivoId,
      objetivo2_id: objetivo2Id,
    };
    const resp = await api.put("/jugar-evento-jugado", null, { params });
    return resp.data;
  } catch (err) {
    console.error("Error en jugar_evento_jugado:", err);
    throw err;
  }
};

export const try_jugar_carta_evento = async (
  partidaId,
  jugadorId,
  cartaId,
  objetivoId = null,
  objetivo2Id = null,
) => {
  try {
    const params = {
      partida_id: partidaId,
      jugador_id: jugadorId,
      carta_id: cartaId,
    };
    if (objetivoId !== undefined && objetivoId !== null)
      params.objetivo_id = objetivoId;
    const resp = await api.get("/try-jugar-carta-evento", null, { params });
    return resp.data;
  } catch (err) {
    console.error("Error en try_jugar_carta_evento:", err);
    throw err;
  }
};

export const try_jugar_set = async (
  partidaId,
  jugadorId,
  objetivo_id = 0,
  carta_1_id,
  carta_2_id,
  carta_3_id,
) => {
  try {
    // Todos los parámetros como query params (el backend los espera en query, no en body)
    const params = {
      partida_id: partidaId,
      jugador_id: jugadorId,
      objetivo_id: objetivo_id || 0, // Asegurar que nunca sea null
      carta_1_id: carta_1_id,
      carta_2_id: carta_2_id,
    };

    // Solo agregar carta_3_id si existe
    if (carta_3_id !== null && carta_3_id !== undefined) {
      params.carta_3_id = carta_3_id;
    }

    console.log("[DEBUG HttpService] try_jugar_set params:", params);

    const resp = await api.post("/try-jugar-set", null, { params });
    return resp.data;
  } catch (err) {
    console.error("Error en try_jugar_set:", err);
    console.error("Error response:", err.response?.data);
    if (err.response?.data?.detail) {
      console.error(
        "Error detail completo:",
        JSON.stringify(err.response.data.detail, null, 2),
      );
    }
    throw err;
  }
};

// Try agregar detective a set (notifica intención antes de ejecutar)
export const try_agregarDetectiveASet = async (
  partidaId,
  jugadorId,
  cartaId,
  setId,
  objetivoId = 0,
) => {
  try {
    const params = {
      partida_id: partidaId,
      jugador_id: jugadorId,
      carta_id: cartaId,
      set_id: setId,
      objetivo_id: objetivoId || 0,
    };

    const resp = await api.post("/try-agregar-detective-a-set", null, {
      params,
    });
    return resp.data;
  } catch (err) {
    console.error("Error en try_agregarDetectiveASet:", err);
    console.error("Error response:", err.response?.data);
    throw err;
  }
};

// Agregar detective a set existente (ejecución final)
export const agregarDetectiveASet = async (
  partidaId,
  jugadorId,
  cartaId,
  setId,
  objetivoId = 0,
) => {
  try {
    const params = {
      partida_id: partidaId,
      jugador_id: jugadorId,
      carta_id: cartaId,
      set_id: setId,
      objetivo_id: objetivoId || 0,
    };

    const resp = await api.post("/agregar-detective-a-set", null, { params });
    return resp.data;
  } catch (err) {
    console.error("Error en agregarDetectiveASet:", err);
    console.error("Error response:", err.response?.data);
    throw err;
  }
};

export const robarCartaDraft = async (playerId, gameId, posicion) => {
  // Spec: POST /robar-carta-del-mazo-draft?jugador_id=&partida_id=&carta_id=
  try {
    const params = {
      jugador_id: playerId,
      partida_id: gameId,
      posicion: posicion,
    };
    const resp = await api.post("/robar-carta-del-mazo-draft", null, {
      params,
    });
    return resp.data;
  } catch (err) {
    console.error("Error al robar carta del mazo draft:", err);
    throw err;
  }
};

export const try_jugar_evento = async (
  partidaId,
  jugadorId,
  cartaId,
  objetivoId = null,
  objetivo2Id = null,
) => {
  try {
    const params = {
      partida_id: partidaId,
      jugador_id: jugadorId,
      carta_id: cartaId,
      objetivo_id: objetivoId !== null ? objetivoId : 0, // Backend requiere objetivo_id siempre
    };
    if (objetivo2Id !== undefined && objetivo2Id !== null)
      params.objetivo2_id = objetivo2Id;

    console.log("[DEBUG HttpService] try_jugar_evento params:", params);

    // PASO 1: Notificar a otros jugadores (5 segundos para NSF)
    const resp = await api.post("/try-jugar-carta", null, { params });
    return resp.data;
  } catch (err) {
    console.error("Error en try_jugar_evento:", err);
    console.error("Error response:", err.response?.data);
    throw err;
  }
};

export const jugar_carta_de_evento = async (
  partidaId,
  jugadorId,
  cartaId,
  objetivoId = null,
  objetivo2Id = null,
) => {
  try {
    const params = {
      partida_id: partidaId,
      jugador_id: jugadorId,
      carta_id: cartaId,
    };
    if (objetivoId !== undefined && objetivoId !== null)
      params.objetivo_id = objetivoId;
    if (objetivo2Id !== undefined && objetivo2Id !== null)
      params.objetivo2_id = objetivo2Id;
    
    const resp = await api.post("/jugar-carta-de-evento", null, {
      params,
    });
    
    return resp.data;
  } catch (err) {
    console.error("Error en jugar_carta_de_evento:", err);
    throw err;
  }
};

// ===== ENDPOINTS PARA NOT SO FAST! =====

/**
 * Consulta si el jugador tiene cartas Not So Fast en su mano
 * @param {number} partidaId - ID de la partida
 * @param {number} jugadorId - ID del jugador
 * @returns {Promise<boolean>} - true si tiene NSF, false si no
 */
export const tengo_NSF = async (partidaId, jugadorId) => {
  try {
    const params = {
      partida_id: partidaId,
      jugador_id: jugadorId,
    };
    
    console.log("[DEBUG HttpService] tengo_NSF params:", params);
    
    const resp = await api.get("/tengo-NSF", { params });
    
    console.log("[DEBUG HttpService] tengo_NSF response:", resp.data);
    return resp.data;
  } catch (err) {
    console.error("Error en tengo_NSF:", err);
    throw err;
  }
};

/**
 * Usa una carta Not So Fast para cancelar una acción
 * @param {number} partidaId - ID de la partida
 * @param {number} jugadorId - ID del jugador que usa NSF
 * @param {number} cartaId - ID backend de la carta NSF a usar
 * @param {number} objetivoId - ID backend de la carta o set a cancelar
 * @param {boolean} esSet - true si el objetivo es un set, false si es una carta
 * @returns {Promise<void>}
 */
export const usar_NSF = async (partidaId, jugadorId, cartaId, objetivoId, esSet) => {
  try {
    const params = {
      partida_id: partidaId,
      jugador_id: jugadorId,
      carta_id: cartaId,
      objetivo_id: objetivoId,
      es_set: esSet,
    };
    
    console.log("[DEBUG HttpService] usar_NSF params:", params);
    
    const resp = await api.post("/usar-NSF", null, { params });
    
    console.log("[DEBUG HttpService] usar_NSF response:", resp.data);
    return resp.data;
  } catch (err) {
    console.error("Error en usar_NSF:", err);
    throw err;
  }
}; 

export const pasar_carta_ronda = async (partidaId, jugadorId, cartaId, direccion) => {
  try {
    const params = {
      partida_id: partidaId,
      jugador_id: jugadorId,
      carta_id: cartaId,
      direccion: direccion
    };
    const resp = await api.post("/pasar-carta-ronda", null, { params });
    return resp.data;
  } catch (err) {
    console.error("Error en pasar_carta_ronda:", err);
    throw err;
  }
};

export const intercambiarCartas = async (partidaId, jugadorId, objetivoId, cartaId) => {
  // Spec: POST /intercambiar-cartas?partida_id=&jugador_id=&objetivo_id=&carta_id=
  try {
    const params = {
      partida_id: partidaId,
      jugador_id: jugadorId,
      objetivo_id: objetivoId,
      carta_id: cartaId,
    };
    console.log("[DEBUG HttpService] intercambiarCartas params:", params);
    
    const resp = await api.post("/intercambiar-cartas", null, { params });
    return resp.data;
  } catch (err) {
    console.error("Error al intercambiar cartas:", err);
    console.error("Error response:", err.response?.data);
    throw err;
  }
};

