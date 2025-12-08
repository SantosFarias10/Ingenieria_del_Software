export const todasLasCartas = [
  // Detective Cards
  {
    id: 1,
    tipo: "Detective",
    nombre: "Hercule Poirot",
    /* 
        Toma como objetivo al secreto a revelar.
        El jugador que juega el set es el que elige que secreto revelar de otro jugador.
        */
    imagen: "/cartas/07-detective_poirot.png",
  },
  {
    id: 2,
    tipo: "Detective",
    nombre: "Miss Marple",
    /* 
        Toma como objetivo al secreto a revelar
        El jugador que juega el set es el que elige que secreto revelar de otro jugador.
        */
    imagen: "/cartas/08-detective_marple.png",
  },
  {
    id: 3,
    tipo: "Detective",
    nombre: "Mr. Satterthwaite",
    /* 
        Toma como objetivo a un jugador,
        El jugador que juega el set elige a un jugador objetivo, el jugador objetivo es el que elige que secreto revelar, 
        */
    imagen: "/cartas/09-detective_satterthwaite.png",
  },
  {
    id: 4,
    tipo: "Detective",
    nombre: "Parker Pyne",
    /* 
        Toma como objetivo al secreto a ocultar
        El jugador que juega el set elige que secreto ocultar de otro jugador.
        */
    imagen: "/cartas/10-detective_pyne.png",
  },
  {
    id: 5,
    tipo: "Detective",
    nombre: "George Brent",
    /* 
        Toma como objetivo a un jugador
        El jugador que juega el set elige a un jugador objetivo, el jugador objetivo es el que elige que secreto revelar 
        */
    imagen: "/cartas/11-detective_brent.png",
  },
  {
    id: 6,
    tipo: "Detective",
    nombre: "Tommy Beresford",
    /* 
        Toma como objetivo a un jugador
        El jugador que juega el set elige a un jugador objetivo, el jugador objetivo es el que elige que secreto revelar 
        */
    imagen: "/cartas/12-detective_tommyberesford.png",
  },
  {
    id: 7,
    tipo: "Detective",
    nombre: "Tuppence Beresford",
    /* 
        Toma como objetivo a un jugador
        El jugador que juega el set elige a un jugador objetivo, el jugador objetivo es el que elige que secreto revelar
        */
    imagen: "/cartas/13-detective_tuppenceberesford.png",
  },
  {
    id: 8,
    tipo: "Detective",
    nombre: "Harley Quin",
    /* Comodin */
    imagen: "/cartas/14-detective_quin.png",
  },
  {
    id: 9,
    tipo: "Detective",
    nombre: "Ariadne Oliver",
    /* Comodin */
    imagen: "/cartas/15-detective_oliver.png",
  },

  // Event Cards
  {
    id: 10,
    tipo: "Event",
    /*
        Toma como objetivo un jugador. 
        Cuando un jugador juega la carta de evento, entonces debe seleccionar a un jugador objetivo para que descarte todos los Not So Fast de su mano. 
        No se puede cancelar
        */
    nombre: "Cards on the Table",
    imagen: "/cartas/17-event_cardsonthetable.png",
  },
  {
    id: 11,
    tipo: "Event",
    /*
        Toma como objetivo un set. 
        Cuando un jugador juega la carta de evento entonces debe seleccionar un set objetivo de otro jugador para robarlo.
        Si se puede cancelarse
        */
    nombre: "Another Victim", // ta bien
    imagen: "/cartas/18-event_anothervictim.png",
  },
  {
    id: 12,
    tipo: "Event",
    /*
        Toma como objetivo una Direccion (Numero), 1 si es derecha y -1 si es izquierda. 
        Cuando un jugador juega la carta de evento, entonces debe elegir una direccion (con un modal) y seleccionar una carta para pasar a la direccion seleccionada, Todos los jugadores deben seleccionar una direccion para pasar a la direccion seleccionada.
        Si se puede cancelar
        */
    nombre: "Dead Card Folly", // ta bien
    imagen: "/cartas/19-event_deadcardfolly.png",
  },
  {
    id: 13,
    tipo: "Event",
    /*
        Toma como objetivo una carta del mazo de descarte.
        Cuando un jugador juega la carta de evento entonces se habre el modal para mirar las ultimas 5 cartas descartadas, el jugador debe seleccionar 1 de esas 5 cartas y se la pone en su mano.
        Si se puede cancela
        */
    nombre: "Look Ashes", // ta bien
    imagen: "/cartas/20-event_lookashes.png",
  },
  {
    id: 14,
    tipo: "Event",
    /*
        Toma como objetivo un jugador.
        Cuando un jugador juega la carta de evento entonces debe seleccionar un jugador objetivo, luego selecciona una carta de su mano para intercambiar, el jugador objetivo tambien debe seleccionar una carta para intercambiar.
        Si se puede cancelar
        */
    nombre: "Card Trade", // ta bien
    imagen: "/cartas/21-event_cardtrade.png",
  },
  {
    id: 15,
    tipo: "Event",
    /*
        Toma como objetivo un secreto que ya esta revelado Y un jugador. 
        Cuando un jugador juega la carta de evento entonces debe seleccionar un un secreto que ya este revelado y un jugador objetivo para asignarle el secreto seleccionado, pero cuando se le asgina el secreto este debe estar oculto.
        Si se puede cancelar
        */
    nombre: "One More", // ta bien
    imagen: "/cartas/22-event_onemore.png",
  },
  {
    id: 16,
    tipo: "Event",
    /*
        Toma como objetivo una cantidad de cartas (de 1 hasta 5).
        Cuando un jugador juega la carta de evento entonces se debe abrir el modal para ver las ultimas 5 cartas descartadas del mazo de descarte, y el jugador debe seleccionar entre 1 y 5 cartas para ponerlas en el mazo regular.
        Si se puede cancelar
        */
    nombre: "Delay Escape", // ta bien
    imagen: "/cartas/23-event_delayescape.png",
  },
  {
    id: 17,
    tipo: "Event",
    /*
        No se toman objetivos.
        Cuando un jugador juega la carta de evento entonces automaticamente se toman las 6 primeras cartas del mazo regular y se las pasa al mazo de descarte.
        Si se puede cancelar
        */
    nombre: "Early Train", // ta bien
    imagen: "/cartas/24-event_earlytrain.png",
  },
  {
    id: 18,
    tipo: "Event",
    /*
        No toma objetivo.
        Cuando un jugador juega la carta de evento entonces se sortea un jugador aleatorio, este jugador aleatorio debe revelar un secreto.
        Si se puede cancelar
        */
    nombre: "Point Suspicions", // ta bien
    imagen: "/cartas/25-event_pointsuspicions.png",
  },

  // Instant Cards
  {
    id: 19,
    tipo: "Instant",
    nombre: "Not So Fast",
    imagen: "/cartas/16-Instant_notsofast.png",
  },

  // Devious Cards
  {
    id: 20,
    tipo: "Devious",
    nombre: "Blackmailed",
    imagen: "/cartas/26-devious_blackmailed.png",
  },
  {
    id: 21,
    tipo: "Devious",
    nombre: "Faux Pas",
    imagen: "/cartas/27-devious_fauxpas.png",
  },

  // Special Cards
  {
    id: 22,
    tipo: "Special",
    nombre: "Murder Escapes",
    imagen: "/cartas/02-murder_escapes.png",
  },
];

export const encontrarCartaPorId = (id) => {
  return todasLasCartas.find((carta) => carta.id === id);
};

/**
 * Determina si una carta necesita seleccionar un objetivo
 * @param {number} idFrontend - ID del frontend de la carta
 * @returns {boolean} true si necesita objetivo, false si no
 */
export const necesitaObjetivo = (idFrontend) => {
  const carta = encontrarCartaPorId(idFrontend);
  // Si no existe la carta => no necesita un objetivo xd
  if (!carta) return false;

  // Los detectives necesitan objetivo cuando se juegan como set
  if (carta.tipo === "Detective") return true;

  // Solo ciertos eventos necesitan objetivo
  if (carta.tipo === "Event") {
    return eventoNecesitaObjetivo(idFrontend);
  }

  return false;
};

/**
 * Determina qué tipo de objetivo necesita un detective
 * @param {number} detectiveId - ID del detective (1-9)
 * @returns {string} 'jugador' | 'secreto_oculto' | 'secreto_revelado' | 'secreto_cualquiera'
 */
export const getTipoObjetivoParaDetective = (detectiveId) => {
  // Detectives que necesitan jugador como objetivo
  const detectivesJugador = [3, 5, 6, 7]; // Satterthwaite, Brent, Tommy, Tuppence
  // Detectives que necesitan secreto oculto (para revelar)
  const detectivesSecreto_Oculto = [1, 2]; // Poirot, Marple
  // Detectives que necesitan secreto revelado (para ocultar)
  const detectivesSecreto_Revelado = [4]; // Pyne
  // Harley Quin es comodín

  if (detectivesJugador.includes(detectiveId)) return "jugador";
  if (detectivesSecreto_Oculto.includes(detectiveId)) return "secreto_oculto";
  if (detectivesSecreto_Revelado.includes(detectiveId))
    return "secreto_revelado";

  return null;
};

/**
 * Obtiene el detective principal del set (ignorando Harley Quin)
 * @param {number[]} setArray - Array de IDs de detectives (id_front)
 * @returns {number} ID del detective principal
 */
export const getDetectivePrincipalDelSet = (setArray) => {
  // Buscar el primer detective que no sea Harley Quin (8)
  for (let id of setArray) {
    if (id !== 8 && id !== 9) return id;
  }
  return null;
};

/**
 * Verifica si un jugador tiene secretos de un tipo específico
 * @param {Array} secretos - Array de secretos del jugador
 * @param {string} tipo - 'oculto' | 'revelado'
 * @returns {boolean} True si tiene al menos un secreto del tipo indicado
 */
export const tieneSecretoDelTipo = (secretos, tipo) => {
  if (!Array.isArray(secretos) || secretos.length === 0) return false;

  if (tipo === "oculto") {
    return secretos.some((s) => s.estado === 9 || s.estado === undefined);
  } else if (tipo === "revelado") {
    return secretos.some((s) => s.estado !== 9 && s.estado !== undefined);
  }

  return false;
};

/**
 * Verifica si es posible jugar un set basándose en los objetivos disponibles
 * @param {number} detectiveId - ID del detective principal
 * @param {Object} allSecrets - Objeto con secretos de todos los jugadores {jugadorId: [secretos]}
 * @param {number} currentUserId - ID del jugador actual
 * @returns {Object} {canPlay: boolean, reason: string}
 */
export const puedeJugarseSet = (detectiveId, allSecrets, currentUserId) => {
  const tipoObjetivoEsperado = getTipoObjetivoParaDetective(detectiveId);

  // Si no necesita objetivo, se puede jugar
  if (tipoObjetivoEsperado === null) {
    return { canPlay: true, reason: "" };
  }

  // Obtener los jugadores disponibles (excepto el jugador actual)
  const otrosJugadores = Object.keys(allSecrets).filter(
    (jId) => Number(jId) !== Number(currentUserId),
  );

  if (otrosJugadores.length === 0) {
    return { canPlay: false, reason: "No hay otros jugadores" };
  }

  // Si necesita objetivo de jugador, siempre hay (otros jugadores existen)
  if (tipoObjetivoEsperado === "jugador") {
    return { canPlay: true, reason: "" };
  }

  // Si necesita secreto oculto
  if (tipoObjetivoEsperado === "secreto_oculto") {
    const haySecreto = otrosJugadores.some((jId) =>
      tieneSecretoDelTipo(allSecrets[jId] || [], "oculto"),
    );
    if (!haySecreto) {
      return {
        canPlay: false,
        reason: "No hay secretos ocultos disponibles para revelar",
      };
    }
    return { canPlay: true, reason: "" };
  }

  // Si necesita secreto revelado
  if (tipoObjetivoEsperado === "secreto_revelado") {
    const haySecreto = otrosJugadores.some((jId) =>
      tieneSecretoDelTipo(allSecrets[jId] || [], "revelado"),
    );
    if (!haySecreto) {
      return {
        canPlay: false,
        reason: "No hay secretos revelados disponibles para ocultar",
      };
    }
    return { canPlay: true, reason: "" };
  }

  return { canPlay: true, reason: "" };
};

/**
 * Determina si un evento necesita seleccionar objetivos
 * @param {number} eventId - ID del evento (10-18)
 * @returns {boolean} True si el evento necesita objetivo
 */
export const eventoNecesitaObjetivo = (eventId) => {
  // Eventos que NO necesitan objetivo
  const eventosSinObjetivo = [17, 18]; // Early Train, Point Your Suspicions
  return !eventosSinObjetivo.includes(eventId);
};

/**
 * Obtiene el tipo/tipos de objetivo que necesita un evento
 * @param {number} eventId - ID del evento (10-18)
 * @returns {Object} {tipos: string[], cantidad: number, descripcion: string}
 *   tipos: Array con tipos de objetivo (jugador, secreto_revelado, carta_descarte, cantidad, direccion)
 *   cantidad: Número de objetivos a seleccionar
 *   descripcion: Descripción para el usuario
 */
export const getTipoObjetivoParaEvento = (eventId) => {
  const eventosMap = {
    10: {
      tipos: ["jugador"],
      cantidad: 1,
      descripcion: "Selecciona un jugador para descartar sus NSF",
    },
    11: {
      tipos: ["set", "auto"], // "auto" indica que objetivo2 se determina dinámicamente según el detective del set
      cantidad: 2, // Necesita 2 objetivos: set + (secreto o jugador según detective)
      descripcion: "Selecciona un set para robarlo",
    },
    12: {
      tipos: ["direccion"],
      cantidad: 1,
      descripcion: "Elige dirección (izquierda o derecha)",
    },
    13: {
      tipos: ["carta_descarte"],
      cantidad: 1,
      descripcion: "Selecciona una carta descartada",
    },
    14: {
      tipos: ["jugador"],
      cantidad: 1,
      descripcion: "Selecciona un jugador para intercambiar cartas",
    },
    15: {
      tipos: ["secreto_revelado", "jugador"],
      cantidad: 2,
      descripcion: "Selecciona un secreto revelado y un jugador objetivo",
    },
    16: {
      tipos: ["cantidad"],
      cantidad: 1,
      descripcion: "Selecciona cartas descartadas (1 a 5)",
    },
    17: {
      tipos: [],
      cantidad: 0,
      descripcion: "Sin objetivos",
    },
    18: {
      tipos: [],
      cantidad: 0,
      descripcion: "Sin objetivos",
    },
  };

  return (
    eventosMap[eventId] || {
      tipos: [],
      cantidad: 0,
      descripcion: "Evento desconocido",
    }
  );
};

/**
 * Verifica si es posible jugar un evento basándose en los objetivos disponibles
 * @param {number} eventId - ID del evento
 * @param {Object} gameState - Estado del juego {allSecrets, cartasEnDescarte, allPlayers, currentUserId}
 * @returns {Object} {canPlay: boolean, reason: string}
 */
export const puedeJugarseEvento = (eventId, gameState) => {
  const {
    allSecrets = {},
    cartasEnDescarte = [],
    allPlayers = [],
    currentUserId,
  } = gameState;

  const objetivos = getTipoObjetivoParaEvento(eventId);

  // Sin objetivos = siempre se puede jugar
  if (objetivos.cantidad === 0) {
    return { canPlay: true, reason: "" };
  }

  const otrosJugadores = allPlayers.filter((j) => j.id !== currentUserId);

  switch (eventId) {
    case 10: // Cards Off The Table - Seleccionar jugador
    case 14: // Card Trade - Seleccionar jugador
      if (otrosJugadores.length === 0) {
        return { canPlay: false, reason: "No hay otros jugadores" };
      }
      return { canPlay: true, reason: "" };

    case 11: // Another Victim - Seleccionar set
      // Necesitaría verificar que otros jugadores tengan sets
      // Por ahora asumimos que hay sets disponibles
      if (otrosJugadores.length === 0) {
        return { canPlay: false, reason: "No hay otros jugadores con sets" };
      }
      return { canPlay: true, reason: "" };

    case 12: // Dead Card Folly - Seleccionar dirección
      // Siempre se puede jugar
      return { canPlay: true, reason: "" };

    case 13: // Look Into The Ashes - Seleccionar carta descartada
      if (cartasEnDescarte.length === 0) {
        return { canPlay: false, reason: "No hay cartas en el descarte" };
      }
      return { canPlay: true, reason: "" };

    case 15: // And Then There Was One More - Secreto revelado + jugador
      if (otrosJugadores.length === 0) {
        return { canPlay: false, reason: "No hay otros jugadores" };
      }
      const haySecretoRevelado = Object.values(allSecrets).some((secrets) =>
        tieneSecretoDelTipo(secrets || [], "revelado"),
      );
      if (!haySecretoRevelado) {
        return {
          canPlay: false,
          reason: "No hay secretos revelados disponibles",
        };
      }
      return { canPlay: true, reason: "" };

    case 16: // Delay The Murderer's Escape - Cantidad de cartas
      if (cartasEnDescarte.length === 0) {
        return { canPlay: false, reason: "No hay cartas en el descarte" };
      }
      return { canPlay: true, reason: "" };

    default:
      return { canPlay: true, reason: "" };
  }
};
