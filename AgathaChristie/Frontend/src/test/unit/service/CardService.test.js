import { describe, it, expect } from 'vitest';
import { 
  necesitaObjetivo,
  eventoNecesitaObjetivo,
  getTipoObjetivoParaEvento,
  getTipoObjetivoParaDetective,
  getDetectivePrincipalDelSet,
  tieneSecretoDelTipo,
  puedeJugarseSet,
  puedeJugarseEvento,
  encontrarCartaPorId,
} from '../../../service/CardService';

describe('CardService - Nuevas Funcionalidades', () => {
  
  it('detectives y eventos con objetivo retornan true', () => {
    expect(necesitaObjetivo(1)).toBe(true);
    expect(necesitaObjetivo(10)).toBe(true);
    expect(necesitaObjetivo(14)).toBe(true);
  });

  it('eventos sin objetivo y cartas especiales retornan false', () => {
    expect(necesitaObjetivo(17)).toBe(false);
    expect(necesitaObjetivo(19)).toBe(false);
  });

  it('tipos de objetivo correctos: jugador, set, dirección, secreto', () => {
    expect(getTipoObjetivoParaEvento(10).tipos).toContain('jugador');
    expect(getTipoObjetivoParaEvento(11).tipos).toContain('set');
    expect(getTipoObjetivoParaEvento(12).tipos).toContain('direccion');
    expect(getTipoObjetivoParaEvento(15).tipos).toContain('secreto_revelado');
  });

  it('eventos sin objetivo retornan array vacío', () => {
    expect(getTipoObjetivoParaEvento(17).tipos).toEqual([]);
    expect(getTipoObjetivoParaEvento(18).tipos).toEqual([]);
  });

  it('consistencia: con objetivo = cantidad > 0, sin objetivo = cantidad 0', () => {
    for (let id = 10; id <= 18; id++) {
      const necesita = eventoNecesitaObjetivo(id);
      const objetivoInfo = getTipoObjetivoParaEvento(id);
      if (necesita) {
        expect(objetivoInfo.cantidad).toBeGreaterThan(0);
      } else {
        expect(objetivoInfo.cantidad).toBe(0);
      }
    }
  });
});

describe('CardService - getTipoObjetivoParaDetective', () => {
  it('detectives que requieren jugador como objetivo', () => {
    expect(getTipoObjetivoParaDetective(3)).toBe('jugador'); // Satterthwaite
    expect(getTipoObjetivoParaDetective(5)).toBe('jugador'); // Brent
    expect(getTipoObjetivoParaDetective(6)).toBe('jugador'); // Tommy Beresford
    expect(getTipoObjetivoParaDetective(7)).toBe('jugador'); // Tuppence Beresford
  });

  it('detectives que requieren secreto oculto (para revelar)', () => {
    expect(getTipoObjetivoParaDetective(1)).toBe('secreto_oculto'); // Poirot
    expect(getTipoObjetivoParaDetective(2)).toBe('secreto_oculto'); // Marple
  });

  it('detectives que requieren secreto revelado (para ocultar)', () => {
    expect(getTipoObjetivoParaDetective(4)).toBe('secreto_revelado'); // Pyne
  });

  it('comodines y detectives sin objetivo retornan null', () => {
    expect(getTipoObjetivoParaDetective(8)).toBe(null); // Harley Quin
    expect(getTipoObjetivoParaDetective(9)).toBe(null); // Ariadne Oliver
    expect(getTipoObjetivoParaDetective(99)).toBe(null); // ID inválido
  });
});

describe('CardService - getDetectivePrincipalDelSet', () => {
  it('retorna el primer detective que no sea Harley Quin ni Ariadne Oliver', () => {
    expect(getDetectivePrincipalDelSet([1, 8, 8])).toBe(1);
    expect(getDetectivePrincipalDelSet([8, 2, 8])).toBe(2);
    expect(getDetectivePrincipalDelSet([8, 8, 3])).toBe(3);
  });

  it('retorna el primer detective cuando no hay comodines', () => {
    expect(getDetectivePrincipalDelSet([1, 1, 1])).toBe(1);
    expect(getDetectivePrincipalDelSet([2, 2, 2])).toBe(2);
  });

  it('retorna null si solo hay comodines', () => {
    expect(getDetectivePrincipalDelSet([8, 8, 8])).toBe(null);
    expect(getDetectivePrincipalDelSet([9, 9, 9])).toBe(null);
    expect(getDetectivePrincipalDelSet([8, 9, 8])).toBe(null);
  });

  it('retorna null si el array está vacío', () => {
    expect(getDetectivePrincipalDelSet([])).toBe(null);
  });
});

describe('CardService - tieneSecretoDelTipo', () => {
  it('detecta secretos ocultos (estado 9)', () => {
    const secretos = [
      { id: 1, estado: 9 },
      { id: 2, estado: 0 },
    ];
    expect(tieneSecretoDelTipo(secretos, 'oculto')).toBe(true);
  });

  it('detecta secretos ocultos (estado undefined)', () => {
    const secretos = [
      { id: 1, estado: undefined },
      { id: 2, estado: 0 },
    ];
    expect(tieneSecretoDelTipo(secretos, 'oculto')).toBe(true);
  });

  it('detecta secretos revelados (estado diferente de 9)', () => {
    const secretos = [
      { id: 1, estado: 9 },
      { id: 2, estado: 0 },
    ];
    expect(tieneSecretoDelTipo(secretos, 'revelado')).toBe(true);
  });

  it('retorna false si no hay secretos del tipo buscado', () => {
    const secretosOcultos = [
      { id: 1, estado: 9 },
      { id: 2, estado: 9 },
    ];
    expect(tieneSecretoDelTipo(secretosOcultos, 'revelado')).toBe(false);

    const secretosRevelados = [
      { id: 1, estado: 0 },
      { id: 2, estado: 1 },
    ];
    expect(tieneSecretoDelTipo(secretosRevelados, 'oculto')).toBe(false);
  });

  it('retorna false si el array está vacío', () => {
    expect(tieneSecretoDelTipo([], 'oculto')).toBe(false);
    expect(tieneSecretoDelTipo([], 'revelado')).toBe(false);
  });

  it('retorna false si no es un array', () => {
    expect(tieneSecretoDelTipo(null, 'oculto')).toBe(false);
    expect(tieneSecretoDelTipo(undefined, 'oculto')).toBe(false);
  });

  it('retorna false si el tipo no es reconocido', () => {
    const secretos = [{ id: 1, estado: 9 }];
    expect(tieneSecretoDelTipo(secretos, 'invalido')).toBe(false);
  });
});

describe('CardService - puedeJugarseSet', () => {
  const allSecretsWithOcultos = {
    1: [{ id: 1, estado: 9 }],
    2: [{ id: 2, estado: 9 }],
  };

  const allSecretsWithRevelados = {
    1: [{ id: 1, estado: 0 }],
    2: [{ id: 2, estado: 0 }],
  };

  const allSecretsEmpty = {
    1: [],
    2: [],
  };

  it('permite jugar comodines sin restricciones', () => {
    const result = puedeJugarseSet(8, allSecretsEmpty, 1); // Harley Quin
    expect(result.canPlay).toBe(true);
    expect(result.reason).toBe('');
  });

  it('permite jugar detectives que necesitan jugador', () => {
    const result = puedeJugarseSet(3, allSecretsEmpty, 1); // Satterthwaite
    expect(result.canPlay).toBe(true);
    expect(result.reason).toBe('');
  });

  it('permite jugar cuando hay secretos ocultos disponibles', () => {
    const result = puedeJugarseSet(1, allSecretsWithOcultos, 1); // Poirot necesita secreto oculto
    expect(result.canPlay).toBe(true);
    expect(result.reason).toBe('');
  });

  it('no permite jugar si no hay secretos ocultos disponibles', () => {
    const result = puedeJugarseSet(1, allSecretsWithRevelados, 1); // Poirot necesita secreto oculto
    expect(result.canPlay).toBe(false);
    expect(result.reason).toBe('No hay secretos ocultos disponibles para revelar');
  });

  it('permite jugar cuando hay secretos revelados disponibles', () => {
    const result = puedeJugarseSet(4, allSecretsWithRevelados, 1); // Pyne necesita secreto revelado
    expect(result.canPlay).toBe(true);
    expect(result.reason).toBe('');
  });

  it('no permite jugar si no hay secretos revelados disponibles', () => {
    const result = puedeJugarseSet(4, allSecretsWithOcultos, 1); // Pyne necesita secreto revelado
    expect(result.canPlay).toBe(false);
    expect(result.reason).toBe('No hay secretos revelados disponibles para ocultar');
  });

  it('no permite jugar si no hay otros jugadores', () => {
    const soloJugador = { 1: [] };
    const result = puedeJugarseSet(1, soloJugador, 1);
    expect(result.canPlay).toBe(false);
    expect(result.reason).toBe('No hay otros jugadores');
  });

  it('ignora los secretos del jugador actual', () => {
    const allSecrets = {
      1: [{ id: 1, estado: 9 }], // Jugador actual con secreto oculto
      2: [{ id: 2, estado: 0 }], // Otro jugador sin secreto oculto
    };
    const result = puedeJugarseSet(1, allSecrets, 1); // Poirot necesita secreto oculto de OTRO jugador
    expect(result.canPlay).toBe(false);
    expect(result.reason).toBe('No hay secretos ocultos disponibles para revelar');
  });
});

describe('CardService - puedeJugarseEvento', () => {
  const gameStateBasic = {
    allSecrets: {
      1: [{ id: 1, estado: 9 }],
      2: [{ id: 2, estado: 0 }],
    },
    cartasEnDescarte: [{ id: 101 }, { id: 102 }],
    allPlayers: [
      { id: 1, nombre: 'Player1' },
      { id: 2, nombre: 'Player2' },
    ],
    currentUserId: 1,
  };

  it('permite jugar eventos sin objetivo (Early Train, Point Suspicions)', () => {
    expect(puedeJugarseEvento(17, gameStateBasic).canPlay).toBe(true); // Early Train
    expect(puedeJugarseEvento(18, gameStateBasic).canPlay).toBe(true); // Point Suspicions
  });

  it('permite jugar eventos que necesitan jugador si hay otros jugadores', () => {
    expect(puedeJugarseEvento(10, gameStateBasic).canPlay).toBe(true); // Cards on the Table
    expect(puedeJugarseEvento(14, gameStateBasic).canPlay).toBe(true); // Card Trade
  });

  it('no permite jugar eventos que necesitan jugador si no hay otros', () => {
    const soloJugador = { ...gameStateBasic, allPlayers: [{ id: 1 }] };
    expect(puedeJugarseEvento(10, soloJugador).canPlay).toBe(false);
    expect(puedeJugarseEvento(10, soloJugador).reason).toBe('No hay otros jugadores');
    expect(puedeJugarseEvento(14, soloJugador).canPlay).toBe(false);
  });

  it('permite jugar Another Victim si hay otros jugadores', () => {
    const result = puedeJugarseEvento(11, gameStateBasic);
    expect(result.canPlay).toBe(true);
  });

  it('no permite jugar Another Victim si no hay otros jugadores', () => {
    const soloJugador = { ...gameStateBasic, allPlayers: [{ id: 1 }] };
    const result = puedeJugarseEvento(11, soloJugador);
    expect(result.canPlay).toBe(false);
    expect(result.reason).toBe('No hay otros jugadores con sets');
  });

  it('permite jugar Dead Card Folly siempre', () => {
    const result = puedeJugarseEvento(12, gameStateBasic);
    expect(result.canPlay).toBe(true);
  });

  it('permite jugar Look Into The Ashes si hay cartas descartadas', () => {
    const result = puedeJugarseEvento(13, gameStateBasic);
    expect(result.canPlay).toBe(true);
  });

  it('no permite jugar Look Into The Ashes si no hay cartas descartadas', () => {
    const sinDescarte = { ...gameStateBasic, cartasEnDescarte: [] };
    const result = puedeJugarseEvento(13, sinDescarte);
    expect(result.canPlay).toBe(false);
    expect(result.reason).toBe('No hay cartas en el descarte');
  });

  it('permite jugar And Then One More si hay secretos revelados y otros jugadores', () => {
    const result = puedeJugarseEvento(15, gameStateBasic);
    expect(result.canPlay).toBe(true);
  });

  it('no permite jugar And Then One More si no hay secretos revelados', () => {
    const sinRevelados = {
      ...gameStateBasic,
      allSecrets: {
        1: [{ id: 1, estado: 9 }],
        2: [{ id: 2, estado: 9 }],
      },
    };
    const result = puedeJugarseEvento(15, sinRevelados);
    expect(result.canPlay).toBe(false);
    expect(result.reason).toBe('No hay secretos revelados disponibles');
  });

  it('no permite jugar And Then One More si no hay otros jugadores', () => {
    const soloJugador = { ...gameStateBasic, allPlayers: [{ id: 1 }] };
    const result = puedeJugarseEvento(15, soloJugador);
    expect(result.canPlay).toBe(false);
    expect(result.reason).toBe('No hay otros jugadores');
  });

  it('permite jugar Delay Escape si hay cartas descartadas', () => {
    const result = puedeJugarseEvento(16, gameStateBasic);
    expect(result.canPlay).toBe(true);
  });

  it('no permite jugar Delay Escape si no hay cartas descartadas', () => {
    const sinDescarte = { ...gameStateBasic, cartasEnDescarte: [] };
    const result = puedeJugarseEvento(16, sinDescarte);
    expect(result.canPlay).toBe(false);
    expect(result.reason).toBe('No hay cartas en el descarte');
  });

  it('retorna true para eventos no mapeados', () => {
    const result = puedeJugarseEvento(99, gameStateBasic);
    expect(result.canPlay).toBe(true);
  });
});

describe('CardService - encontrarCartaPorId', () => {
  it('encuentra cartas de detective por ID', () => {
    const carta = encontrarCartaPorId(1);
    expect(carta).toBeDefined();
    expect(carta.tipo).toBe('Detective');
    expect(carta.nombre).toBe('Hercule Poirot');
  });

  it('encuentra cartas de evento por ID', () => {
    const carta = encontrarCartaPorId(10);
    expect(carta).toBeDefined();
    expect(carta.tipo).toBe('Event');
    expect(carta.nombre).toBe('Cards on the Table');
  });

  it('encuentra cartas instantáneas por ID', () => {
    const carta = encontrarCartaPorId(19);
    expect(carta).toBeDefined();
    expect(carta.tipo).toBe('Instant');
    expect(carta.nombre).toBe('Not So Fast');
  });

  it('retorna undefined para IDs inexistentes', () => {
    expect(encontrarCartaPorId(999)).toBeUndefined();
    expect(encontrarCartaPorId(-1)).toBeUndefined();
  });
});

describe('CardService - necesitaObjetivo edge cases', () => {
  it('retorna false si la carta no existe', () => {
    expect(necesitaObjetivo(999)).toBe(false);
    expect(necesitaObjetivo(null)).toBe(false);
    expect(necesitaObjetivo(undefined)).toBe(false);
  });

  it('retorna false para cartas Instant', () => {
    expect(necesitaObjetivo(19)).toBe(false); // Not So Fast
  });

  it('retorna false para cartas Devious', () => {
    expect(necesitaObjetivo(20)).toBe(false); // Blackmailed
    expect(necesitaObjetivo(21)).toBe(false); // Faux Pas
  });

  it('retorna false para cartas Special', () => {
    expect(necesitaObjetivo(22)).toBe(false); // Murder Escapes
  });
});

describe('CardService - getTipoObjetivoParaEvento edge cases', () => {
  it('retorna estructura correcta para evento desconocido', () => {
    const resultado = getTipoObjetivoParaEvento(999);
    expect(resultado.tipos).toEqual([]);
    expect(resultado.cantidad).toBe(0);
    expect(resultado.descripcion).toBe('Evento desconocido');
  });

  it('retorna todos los detalles para eventos conocidos', () => {
    const resultado = getTipoObjetivoParaEvento(13); // Look Into The Ashes
    expect(resultado.tipos).toContain('carta_descarte');
    expect(resultado.cantidad).toBe(1);
    expect(resultado.descripcion).toBeDefined();
  });

  it('retorna "auto" para Another Victim', () => {
    const resultado = getTipoObjetivoParaEvento(11);
    expect(resultado.tipos).toContain('auto');
    expect(resultado.cantidad).toBe(2);
  });
});
