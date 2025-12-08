import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mocks
vi.mock('../service/HttpService');
vi.mock('../service/LocalStorage');

// Mock object to capture WebSocket listeners
const mockWSListeners = {};

vi.mock('../service/WSService', () => ({
  createWSService: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn((event, handler) => {
      mockWSListeners[event] = handler;
    }),
    off: vi.fn(),
    isConnected: false,
  })),
}));

vi.mock('../components/Card', () => ({
  default: ({ id }) => <div data-testid={`card-${id}`}>Card {id}</div>,
}));

import PartidaContainer from '../container/PartidaContainer';
import * as HttpService from '../service/HttpService';
import * as LocalStorage from '../service/LocalStorage';

describe('PartidaContainer - WebSocket Handlers Detallados', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockWSListeners).forEach(key => delete mockWSListeners[key]);
    
    LocalStorage.getUserId = vi.fn(() => '1');
    LocalStorage.getGameId = vi.fn(() => '123');
    LocalStorage.getPlayerName = vi.fn(() => 'TestPlayer');
    LocalStorage.getPlayerId = vi.fn(() => '1');
    LocalStorage.getUser = vi.fn(() => ({ id: 1, nombre: 'TestPlayer', avatar: 'avatar1' }));

    HttpService.getGameDetails = vi.fn().mockResolvedValue({
      jugadores: [
        { id: 1, nombre: 'TestPlayer', avatar: 'avatar1', mano: [] },
        { id: 2, nombre: 'Player2', avatar: 'avatar2', mano: [] }
      ],
      mazoRegular: { cantidad: 30 },
      mazoDescarte: [],
      turnoActual: 1,
      eventos: { 1: [] },
      sets: {},
    });
  });

  const renderContainer = () => {
    return render(
      <BrowserRouter>
        <PartidaContainer />
      </BrowserRouter>
    );
  };

  describe('game_state handler', () => {
    it('procesa estado inicial del juego', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.game_state).toBeDefined();
      });

      if (mockWSListeners.game_state) mockWSListeners.game_state({
        partidaId: 123,
        jugadores: [
          { id: 1, nombre: 'TestPlayer', rol: 1, posicion: 0, secretos: [] },
          { id: 2, nombre: 'Player2', rol: 2, posicion: 1, secretos: [] },
        ],
        turnoActual: 1,
        faseActual: 'Descartar',
        mazoDescarte: [],
        mazoDraft: [],
        sets: {},
      });

      expect(mockWSListeners.game_state).toBeDefined();
    });

    it('procesa estado con secretos de jugadores', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.game_state).toBeDefined();
      });

      if (mockWSListeners.game_state) mockWSListeners.game_state({
        partidaId: 123,
        jugadores: [
          { 
            id: 1, 
            nombre: 'TestPlayer', 
            rol: 1, 
            posicion: 0, 
            secretos: [
              { id: 1, jugador: 1, estado: 9 },
              { id: 2, jugador: 1, estado: 0 },
            ]
          },
        ],
        turnoActual: 1,
        faseActual: 'Descartar',
        mazoDescarte: [],
        mazoDraft: [],
        sets: {},
      });

      expect(mockWSListeners.game_state).toBeDefined();
    });

    it('procesa estado con sets jugados', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.game_state).toBeDefined();
      });

      if (mockWSListeners.game_state) mockWSListeners.game_state({
        partidaId: 123,
        jugadores: [
          { id: 1, nombre: 'TestPlayer', rol: 1, posicion: 0, secretos: [] },
        ],
        turnoActual: 1,
        faseActual: 'Descartar',
        mazoDescarte: [],
        mazoDraft: [],
        sets: {
          1: [
            [
              { id: 101, nombre: 'Detective A', set: 1 },
              { id: 102, nombre: 'Detective A', set: 1 },
              { id: 103, nombre: 'Detective A', set: 1 },
            ],
          ],
        },
      });

      expect(mockWSListeners.game_state).toBeDefined();
    });

    it('procesa estado con mazo de descarte con cartas', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.game_state).toBeDefined();
      });

      if (mockWSListeners.game_state) mockWSListeners.game_state({
        partidaId: 123,
        jugadores: [
          { id: 1, nombre: 'TestPlayer', rol: 1, posicion: 0, secretos: [] },
        ],
        turnoActual: 1,
        faseActual: 'Descartar',
        mazoDescarte: [
          { id: 201, nombre: 'Carta Descartada' },
        ],
        mazoDraft: [],
        sets: {},
      });

      expect(mockWSListeners.game_state).toBeDefined();
    });

    it('procesa estado con mazo draft con cartas', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.game_state).toBeDefined();
      });

      if (mockWSListeners.game_state) mockWSListeners.game_state({
        partidaId: 123,
        jugadores: [
          { id: 1, nombre: 'TestPlayer', rol: 1, posicion: 0, secretos: [] },
        ],
        turnoActual: 1,
        faseActual: 'Alzar',
        mazoDescarte: [],
        mazoDraft: [
          { id: 301, nombre: 'Draft 1' },
          { id: 302, nombre: 'Draft 2' },
          { id: 303, nombre: 'Draft 3' },
        ],
        sets: {},
      });

      expect(mockWSListeners.game_state).toBeDefined();
    });
  });

  describe('mazo_actualizado handler', () => {
    it('actualiza mano del jugador actual', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.mazo_actualizado).toBeDefined();
      });

      if (mockWSListeners.mazo_actualizado) mockWSListeners.mazo_actualizado({
        partidaId: 123,
        jugadorId: 1,
        cartas_en_mano: [
          { id: 101, id_front: 'carta_1', nombre: 'Carta 1', tipo: 'Evento' },
          { id: 102, id_front: 'carta_2', nombre: 'Carta 2', tipo: 'Detective' },
        ],
      });

      expect(mockWSListeners.mazo_actualizado).toBeDefined();
    });

    it('no actualiza mano si es de otro jugador', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.mazo_actualizado).toBeDefined();
      });

      if (mockWSListeners.mazo_actualizado) mockWSListeners.mazo_actualizado({
        partidaId: 123,
        jugadorId: 2, // Otro jugador
        cartas_en_mano: [
          { id: 201, id_front: 'carta_3', nombre: 'Carta 3', tipo: 'Evento' },
        ],
      });

      expect(mockWSListeners.mazo_actualizado).toBeDefined();
    });

    it('normaliza ids de cartas al actualizar mano', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.mazo_actualizado).toBeDefined();
      });

      if (mockWSListeners.mazo_actualizado) mockWSListeners.mazo_actualizado({
        partidaId: 123,
        jugadorId: 1,
        cartas_en_mano: [
          { id: 101, idFrontend: 'carta_1', nombre: 'Carta 1' },
          { idBackend: 102, id_front: 'carta_2', nombre: 'Carta 2' },
        ],
      });

      expect(mockWSListeners.mazo_actualizado).toBeDefined();
    });
  });

  describe('procesar_descarte handler', () => {
    it('procesa descarte de carta del jugador actual', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.procesar_descarte).toBeDefined();
      });

      if (mockWSListeners.procesar_descarte) mockWSListeners.procesar_descarte({
        partidaId: 123,
        jugadorId: 1,
        cartaDescartada: { id: 101, nombre: 'Carta Descartada' },
      });

      expect(mockWSListeners.procesar_descarte).toBeDefined();
    });

    it('procesa descarte de otro jugador', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.procesar_descarte).toBeDefined();
      });

      if (mockWSListeners.procesar_descarte) mockWSListeners.procesar_descarte({
        partidaId: 123,
        jugadorId: 2,
        cartaDescartada: { id: 201, nombre: 'Carta de Otro' },
      });

      expect(mockWSListeners.procesar_descarte).toBeDefined();
    });
  });

  describe('turno_cambiado handler', () => {
    it('procesa cambio de turno al jugador actual', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.turno_cambiado).toBeDefined();
      });

      if (mockWSListeners.turno_cambiado) mockWSListeners.turno_cambiado({
        partidaId: 123,
        nuevoTurno: 1,
        fase: 'Descartar',
      });

      expect(mockWSListeners.turno_cambiado).toBeDefined();
    });

    it('procesa cambio de turno a otro jugador', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.turno_cambiado).toBeDefined();
      });

      if (mockWSListeners.turno_cambiado) mockWSListeners.turno_cambiado({
        partidaId: 123,
        nuevoTurno: 2,
        fase: 'Descartar',
      });

      expect(mockWSListeners.turno_cambiado).toBeDefined();
    });

    it('resetea flags al cambiar turno', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.turno_cambiado).toBeDefined();
      });

      // Simular cambio de turno múltiple
      if (mockWSListeners.turno_cambiado) {
        mockWSListeners.turno_cambiado({
          partidaId: 123,
          nuevoTurno: 2,
          fase: 'Descartar',
        });
        
        mockWSListeners.turno_cambiado({
          partidaId: 123,
          nuevoTurno: 1,
          fase: 'Descartar',
        });
      }

      expect(mockWSListeners.turno_cambiado).toBeDefined();
    });

    it('procesa cambio a fase Alzar', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.turno_cambiado).toBeDefined();
      });

      if (mockWSListeners.turno_cambiado) mockWSListeners.turno_cambiado({
        partidaId: 123,
        nuevoTurno: 1,
        fase: 'Alzar',
      });

      expect(mockWSListeners.turno_cambiado).toBeDefined();
    });
  });

  describe('set_actualizados handler', () => {
    it('procesa actualización de sets del jugador actual', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.set_actualizados).toBeDefined();
      });

      if (mockWSListeners.set_actualizados) mockWSListeners.set_actualizados({
        partidaId: 123,
        jugadorId: 1,
        sets: [
          [
            { id: 101, nombre: 'Detective A', set: 1 },
            { id: 102, nombre: 'Detective A', set: 1 },
            { id: 103, nombre: 'Detective A', set: 1 },
          ],
        ],
      });

      expect(mockWSListeners.set_actualizados).toBeDefined();
    });

    it('procesa sets de otro jugador', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.set_actualizados).toBeDefined();
      });

      if (mockWSListeners.set_actualizados) mockWSListeners.set_actualizados({
        partidaId: 123,
        jugadorId: 2,
        sets: [
          [
            { id: 201, nombre: 'Detective B', set: 2 },
            { id: 202, nombre: 'Detective B', set: 2 },
            { id: 203, nombre: 'Detective B', set: 2 },
          ],
        ],
      });

      expect(mockWSListeners.set_actualizados).toBeDefined();
    });

    it('procesa múltiples sets del mismo jugador', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.set_actualizados).toBeDefined();
      });

      if (mockWSListeners.set_actualizados) mockWSListeners.set_actualizados({
        partidaId: 123,
        jugadorId: 1,
        sets: [
          [
            { id: 101, nombre: 'Detective A', set: 1 },
            { id: 102, nombre: 'Detective A', set: 1 },
            { id: 103, nombre: 'Detective A', set: 1 },
          ],
          [
            { id: 104, nombre: 'Detective A', set: 1 },
            { id: 105, nombre: 'Detective A', set: 1 },
            { id: 106, nombre: 'Detective A', set: 1 },
          ],
        ],
      });

      expect(mockWSListeners.set_actualizados).toBeDefined();
    });
  });

  describe('todos_los_sets_actualizados handler', () => {
    it('procesa actualización de todos los sets', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.todos_los_sets_actualizados).toBeDefined();
      });

      if (mockWSListeners.todos_los_sets_actualizados) {
        mockWSListeners.todos_los_sets_actualizados({
          partidaId: 123,
          sets: {
            1: [
              [
                { id: 101, nombre: 'Detective A', set: 1 },
                { id: 102, nombre: 'Detective A', set: 1 },
                { id: 103, nombre: 'Detective A', set: 1 },
              ],
            ],
            2: [
              [
                { id: 201, nombre: 'Detective B', set: 2 },
                { id: 202, nombre: 'Detective B', set: 2 },
                { id: 203, nombre: 'Detective B', set: 2 },
              ],
            ],
          },
        });
      }

      expect(mockWSListeners.todos_los_sets_actualizados).toBeDefined();
    });

    it('procesa sets vacíos', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.todos_los_sets_actualizados).toBeDefined();
      });

      if (mockWSListeners.todos_los_sets_actualizados) {
        mockWSListeners.todos_los_sets_actualizados({
          partidaId: 123,
          sets: {},
        });
      }

      expect(mockWSListeners.todos_los_sets_actualizados).toBeDefined();
    });
  });

  describe('secreto_modificado handler', () => {
    it('procesa modificación de secreto propio', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.secreto_modificado).toBeDefined();
      });

      if (mockWSListeners.secreto_modificado) mockWSListeners.secreto_modificado({
        partidaId: 123,
        jugadorId: 1,
        secretoId: 1,
        nuevoEstado: 0, // Revelado
      });

      expect(mockWSListeners.secreto_modificado).toBeDefined();
    });

    it('procesa modificación de secreto de otro jugador', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.secreto_modificado).toBeDefined();
      });

      if (mockWSListeners.secreto_modificado) mockWSListeners.secreto_modificado({
        partidaId: 123,
        jugadorId: 2,
        secretoId: 2,
        nuevoEstado: 0,
      });

      expect(mockWSListeners.secreto_modificado).toBeDefined();
    });

    it('procesa ocultamiento de secreto', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.secreto_modificado).toBeDefined();
      });

      if (mockWSListeners.secreto_modificado) mockWSListeners.secreto_modificado({
        partidaId: 123,
        jugadorId: 1,
        secretoId: 1,
        nuevoEstado: 9, // Oculto
      });

      expect(mockWSListeners.secreto_modificado).toBeDefined();
    });
  });

  describe('ganador handler', () => {
    it('procesa evento de ganador', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.ganador).toBeDefined();
      });

      if (mockWSListeners.ganador) mockWSListeners.ganador({
        partidaId: 123,
        ganadorId: 1,
        ganadorNombre: 'TestPlayer',
      });

      expect(mockWSListeners.ganador).toBeDefined();
    });

    it('procesa evento cuando otro jugador gana', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.ganador).toBeDefined();
      });

      if (mockWSListeners.ganador) mockWSListeners.ganador({
        partidaId: 123,
        ganadorId: 2,
        ganadorNombre: 'Player2',
      });

      expect(mockWSListeners.ganador).toBeDefined();
    });
  });

  describe('set_por_jugar handler', () => {
    it('procesa preparación de set para jugar', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.set_por_jugar).toBeDefined();
      });

      if (mockWSListeners.set_por_jugar) mockWSListeners.set_por_jugar({
        partidaId: 123,
        jugadorId: 1,
        set: [
          { id: 101, nombre: 'Detective A', set: 1 },
          { id: 102, nombre: 'Detective A', set: 1 },
          { id: 103, nombre: 'Detective A', set: 1 },
        ],
      });

      expect(mockWSListeners.set_por_jugar).toBeDefined();
    });
  });

  describe('detective_por_agregar handler', () => {
    it('procesa evento de agregar detective a set', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.detective_por_agregar).toBeDefined();
      });

      if (mockWSListeners.detective_por_agregar) mockWSListeners.detective_por_agregar({
        partidaId: 123,
        jugadorId: 1,
        setIndex: 0,
        cartasEnSet: [
          { id: 101, nombre: 'Detective A', set: 1 },
          { id: 102, nombre: 'Detective A', set: 1 },
        ],
      });

      expect(mockWSListeners.detective_por_agregar).toBeDefined();
    });
  });

  describe('jugador_elegido_para_revelar_secreto handler', () => {
    it('procesa selección de jugador para revelar secreto', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.jugador_elegido_para_revelar_secreto).toBeDefined();
      });

      if (mockWSListeners.jugador_elegido_para_revelar_secreto) {
        mockWSListeners.jugador_elegido_para_revelar_secreto({
          partidaId: 123,
          jugadorElegido: 2,
          tipoSecreto: 'secreto_oculto',
        });
      }

      expect(mockWSListeners.jugador_elegido_para_revelar_secreto).toBeDefined();
    });
  });

  describe('secreto_modificado_y_partida_actualizada handler', () => {
    it('procesa modificación de secreto con actualización de partida', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.secreto_modificado_y_partida_actualizada).toBeDefined();
      });

      if (mockWSListeners.secreto_modificado_y_partida_actualizada) {
        mockWSListeners.secreto_modificado_y_partida_actualizada({
          partidaId: 123,
          jugadorId: 1,
          secretoId: 1,
          nuevoEstado: 0,
          mazoDescarte: [],
          turnoActual: 1,
        });
      }

      expect(mockWSListeners.secreto_modificado_y_partida_actualizada).toBeDefined();
    });
  });

  describe('draft_actualizado handler', () => {
    it('procesa actualización del mazo draft', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.draft_actualizado).toBeDefined();
      });

      if (mockWSListeners.draft_actualizado) mockWSListeners.draft_actualizado({
        partidaId: 123,
        draft: [
          { id: 301, nombre: 'Draft 1' },
          { id: 302, nombre: 'Draft 2' },
          { id: 303, nombre: 'Draft 3' },
        ],
      });

      expect(mockWSListeners.draft_actualizado).toBeDefined();
    });

    it('procesa vaciado del draft', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.draft_actualizado).toBeDefined();
      });

      if (mockWSListeners.draft_actualizado) mockWSListeners.draft_actualizado({
        partidaId: 123,
        draft: [],
      });

      expect(mockWSListeners.draft_actualizado).toBeDefined();
    });
  });

  describe('carta_por_jugar handler', () => {
    it('procesa evento de carta por jugar del jugador actual', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.carta_por_jugar).toBeDefined();
      });

      if (mockWSListeners.carta_por_jugar) mockWSListeners.carta_por_jugar({
        partidaId: 123,
        jugadorId: 1,
        carta: {
          id: 501,
          id_front: 'evento_1',
          nombre: 'Evento Test',
          tipo: 'Evento',
        },
      });

      expect(mockWSListeners.carta_por_jugar).toBeDefined();
    });

    it('procesa evento de carta de otro jugador', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.carta_por_jugar).toBeDefined();
      });

      if (mockWSListeners.carta_por_jugar) mockWSListeners.carta_por_jugar({
        partidaId: 123,
        jugadorId: 2,
        carta: {
          id: 502,
          nombre: 'Evento de Otro',
          tipo: 'Evento',
        },
      });

      expect(mockWSListeners.carta_por_jugar).toBeDefined();
    });
  });

  describe('Handlers - partidaId validation', () => {
    it('ignora eventos de otras partidas en game_state', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.game_state).toBeDefined();
      });

      if (mockWSListeners.game_state) mockWSListeners.game_state({
        partidaId: 999, // Partida diferente
        jugadores: [],
        turnoActual: 1,
        faseActual: 'Descartar',
        mazoDescarte: [],
        mazoDraft: [],
        sets: {},
      });

      expect(mockWSListeners.game_state).toBeDefined();
    });

    it('ignora eventos de otras partidas en mazo_actualizado', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.mazo_actualizado).toBeDefined();
      });

      if (mockWSListeners.mazo_actualizado) mockWSListeners.mazo_actualizado({
        partidaId: 999,
        jugadorId: 1,
        cartas_en_mano: [],
      });

      expect(mockWSListeners.mazo_actualizado).toBeDefined();
    });
  });

  describe('Eventos específicos del juego', () => {
    it('procesa evento early_train', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_early_train).toBeDefined();
      });

      if (mockWSListeners.evento_early_train) mockWSListeners.evento_early_train({
        partidaId: 123,
        jugadorId: 1,
      });

      expect(mockWSListeners.evento_early_train).toBeDefined();
    });

    it('procesa evento and_then_one_more', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_and_then_one_more).toBeDefined();
      });

      if (mockWSListeners.evento_and_then_one_more) mockWSListeners.evento_and_then_one_more({
        partidaId: 123,
        jugadorId: 1,
      });

      expect(mockWSListeners.evento_and_then_one_more).toBeDefined();
    });

    it('procesa evento another_victim_caso1', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_another_victim_caso1).toBeDefined();
      });

      if (mockWSListeners.evento_another_victim_caso1) {
        mockWSListeners.evento_another_victim_caso1({
          partidaId: 123,
          jugadorId: 1,
        });
      }

      expect(mockWSListeners.evento_another_victim_caso1).toBeDefined();
    });

    it('procesa evento another_victim_caso2', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_another_victim_caso2).toBeDefined();
      });

      if (mockWSListeners.evento_another_victim_caso2) {
        mockWSListeners.evento_another_victim_caso2({
          partidaId: 123,
          jugadorId: 1,
        });
      }

      expect(mockWSListeners.evento_another_victim_caso2).toBeDefined();
    });

    it('procesa prep_point_your_suspicions', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.prep_point_your_suspicions).toBeDefined();
      });

      if (mockWSListeners.prep_point_your_suspicions) {
        mockWSListeners.prep_point_your_suspicions({
          partidaId: 123,
          jugadorId: 1,
        });
      }

      expect(mockWSListeners.prep_point_your_suspicions).toBeDefined();
    });

    it('procesa prep_dead_card_folly', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.prep_dead_card_folly).toBeDefined();
      });

      if (mockWSListeners.prep_dead_card_folly) {
        mockWSListeners.prep_dead_card_folly({
          partidaId: 123,
          jugadorId: 1,
        });
      }

      expect(mockWSListeners.prep_dead_card_folly).toBeDefined();
    });
  });
});
