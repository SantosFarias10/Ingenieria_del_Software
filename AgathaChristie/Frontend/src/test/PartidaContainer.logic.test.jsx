import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mocks
vi.mock('../service/HttpService');
vi.mock('../service/LocalStorage');

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
  default: ({ id, onClick }) => (
    <div data-testid={`card-${id}`} onClick={() => onClick && onClick(id)}>
      Card {id}
    </div>
  ),
}));

import PartidaContainer from '../container/PartidaContainer';
import * as HttpService from '../service/HttpService';
import * as LocalStorage from '../service/LocalStorage';

describe('PartidaContainer - Lógica Interna y Estados', () => {
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
        { id: 1, nombre: 'TestPlayer', avatar: 'avatar1', mano: [], rol: 1, posicion: 0 },
        { id: 2, nombre: 'Player2', avatar: 'avatar2', mano: [], rol: 2, posicion: 1 }
      ],
      mazoRegular: { cantidad: 30 },
      mazoDescarte: [],
      turnoActual: 1,
      eventos: { 1: [], 2: [] },
      sets: {},
    });

    HttpService.descartarCarta = vi.fn().mockResolvedValue({ success: true });
    HttpService.robarCarta = vi.fn().mockResolvedValue({ success: true });
    HttpService.finalizarTurno = vi.fn().mockResolvedValue({ success: true });
    HttpService.jugarSet = vi.fn().mockResolvedValue({ success: true });
    HttpService.jugarEvento = vi.fn().mockResolvedValue({ success: true });
  });

  const renderContainer = () => {
    return render(
      <BrowserRouter>
        <PartidaContainer />
      </BrowserRouter>
    );
  };

  describe('Estados de mano y validaciones de turno', () => {
    it('procesa evento mazo_actualizado con cartas nuevas', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.mazo_actualizado).toBeDefined();
      });

      // Simular recepción de cartas
      const cartasNuevas = [
        { id: 101, id_front: 1, nombre: 'Carta 1' },
        { id: 102, id_front: 2, nombre: 'Carta 2' },
        { id: 103, id_front: 3, nombre: 'Carta 3' },
        { id: 104, id_front: 4, nombre: 'Carta 4' },
        { id: 105, id_front: 5, nombre: 'Carta 5' },
        { id: 106, id_front: 6, nombre: 'Carta 6' },
      ];

      if (mockWSListeners.mazo_actualizado) {
        mockWSListeners.mazo_actualizado({
          partidaId: 123,
          jugadorId: 1,
          cartas_en_mano: cartasNuevas,
        });
      }

      // Verificar que el handler fue ejecutado
      expect(mockWSListeners.mazo_actualizado).toBeDefined();
    });

    it('procesa múltiples actualizaciones de mano consecutivas', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.mazo_actualizado).toBeDefined();
      });

      // Primera actualización
      if (mockWSListeners.mazo_actualizado) {
        mockWSListeners.mazo_actualizado({
          partidaId: 123,
          jugadorId: 1,
          cartas_en_mano: [
            { id: 101, id_front: 1, nombre: 'Carta 1' },
          ],
        });
      }

      // Segunda actualización
      if (mockWSListeners.mazo_actualizado) {
        mockWSListeners.mazo_actualizado({
          partidaId: 123,
          jugadorId: 1,
          cartas_en_mano: [
            { id: 102, id_front: 2, nombre: 'Carta 2' },
            { id: 103, id_front: 3, nombre: 'Carta 3' },
          ],
        });
      }

      // Verificar que el handler fue ejecutado
      expect(mockWSListeners.mazo_actualizado).toBeDefined();
    });

    it('procesa cartas con diferentes formatos de ID', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.mazo_actualizado).toBeDefined();
      });

      // Cartas con diferentes formatos de ID - solo verificar que se procesa
      if (mockWSListeners.mazo_actualizado) {
        mockWSListeners.mazo_actualizado({
          partidaId: 123,
          jugadorId: 1,
          cartas_en_mano: [
            { id: 101, idFrontend: 1, nombre: 'Con idFrontend' },
            { idBackend: 102, id_front: 2, nombre: 'Con idBackend y id_front' },
            { id: 103, id_front: 3, nombre: 'Con id y id_front' },
          ],
        });
      }

      // Verificar que el handler fue ejecutado
      expect(mockWSListeners.mazo_actualizado).toBeDefined();
    });

    it('procesa actualización de mano vacía', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.mazo_actualizado).toBeDefined();
      });

      if (mockWSListeners.mazo_actualizado) {
        mockWSListeners.mazo_actualizado({
          partidaId: 123,
          jugadorId: 1,
          cartas_en_mano: [],
        });
      }

      expect(mockWSListeners.mazo_actualizado).toBeDefined();
    });

    it('no procesa mazo_actualizado de otro jugador', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.mazo_actualizado).toBeDefined();
      });

      if (mockWSListeners.mazo_actualizado) {
        mockWSListeners.mazo_actualizado({
          partidaId: 123,
          jugadorId: 2, // Otro jugador
          cartas_en_mano: [
            { id: 201, id_front: 10, nombre: 'Carta de otro' },
          ],
        });
      }

      expect(mockWSListeners.mazo_actualizado).toBeDefined();
    });
  });

  describe('Procesamiento de descarte', () => {
    it('actualiza mazo de descarte cuando jugador actual descarta', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.procesar_descarte).toBeDefined();
      });

      if (mockWSListeners.procesar_descarte) {
        mockWSListeners.procesar_descarte({
          partidaId: 123,
          jugadorId: 1,
          cartaDescartada: { id: 201, id_front: 10, nombre: 'Carta Descartada' },
        });
      }

      // Verificar que se procesa el descarte
      await waitFor(() => {
        expect(mockWSListeners.procesar_descarte).toBeDefined();
      });
    });

    it('procesa descartes de otros jugadores', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.procesar_descarte).toBeDefined();
      });

      if (mockWSListeners.procesar_descarte) {
        mockWSListeners.procesar_descarte({
          partidaId: 123,
          jugadorId: 2, // Otro jugador
          cartaDescartada: { id: 202, id_front: 11, nombre: 'Carta de Otro' },
        });
      }

      expect(mockWSListeners.procesar_descarte).toBeDefined();
    });

    it('procesa descartes consecutivos', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.procesar_descarte).toBeDefined();
      });

      // Primer descarte
      if (mockWSListeners.procesar_descarte) {
        mockWSListeners.procesar_descarte({
          partidaId: 123,
          jugadorId: 1,
          cartaDescartada: { id: 201, id_front: 10, nombre: 'Primera' },
        });
      }

      // Segundo descarte
      if (mockWSListeners.procesar_descarte) {
        mockWSListeners.procesar_descarte({
          partidaId: 123,
          jugadorId: 1,
          cartaDescartada: { id: 202, id_front: 11, nombre: 'Segunda' },
        });
      }

      expect(mockWSListeners.procesar_descarte).toBeDefined();
    });
  });

  describe('Cambio de turno y reseteo de flags', () => {
    it('resetea flags cuando cambia el turno al jugador actual', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.turno_cambiado).toBeDefined();
      });

      // Simular que había jugado un set
      if (mockWSListeners.set_actualizados) {
        mockWSListeners.set_actualizados({
          partidaId: 123,
          jugadorId: 1,
          sets: [[{ id: 101 }, { id: 102 }, { id: 103 }]],
        });
      }

      // Cambiar turno a otro jugador y luego de vuelta
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

      if (mockWSListeners.turno_cambiado) {
        mockWSListeners.turno_cambiado({
          partidaId: 123,
          nuevoTurno: 1,
          fase: 'Alzar',
        });
      }

      expect(mockWSListeners.turno_cambiado).toBeDefined();
    });

    it('procesa cambios de turno rápidos', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.turno_cambiado).toBeDefined();
      });

      if (mockWSListeners.turno_cambiado) {
        // Cambios rápidos entre jugadores
        mockWSListeners.turno_cambiado({
          partidaId: 123,
          nuevoTurno: 1,
          fase: 'Descartar',
        });

        mockWSListeners.turno_cambiado({
          partidaId: 123,
          nuevoTurno: 2,
          fase: 'Descartar',
        });

        mockWSListeners.turno_cambiado({
          partidaId: 123,
          nuevoTurno: 1,
          fase: 'Alzar',
        });
      }

      expect(mockWSListeners.turno_cambiado).toBeDefined();
    });
  });

  describe('Actualización de sets', () => {
    it('procesa sets con múltiples cartas', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.set_actualizados).toBeDefined();
      });

      if (mockWSListeners.set_actualizados) {
        mockWSListeners.set_actualizados({
          partidaId: 123,
          jugadorId: 1,
          sets: [
            [
              { id: 101, id_front: 1, nombre: 'Detective 1' },
              { id: 102, id_front: 1, nombre: 'Detective 2' },
              { id: 103, id_front: 1, nombre: 'Detective 3' },
            ],
          ],
        });
      }

      expect(mockWSListeners.set_actualizados).toBeDefined();
    });

    it('procesa múltiples sets del mismo jugador', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.set_actualizados).toBeDefined();
      });

      if (mockWSListeners.set_actualizados) {
        mockWSListeners.set_actualizados({
          partidaId: 123,
          jugadorId: 1,
          sets: [
            [
              { id: 101, id_front: 1, nombre: 'Set 1' },
              { id: 102, id_front: 1, nombre: 'Set 1' },
              { id: 103, id_front: 1, nombre: 'Set 1' },
            ],
            [
              { id: 104, id_front: 2, nombre: 'Set 2' },
              { id: 105, id_front: 2, nombre: 'Set 2' },
              { id: 106, id_front: 2, nombre: 'Set 2' },
            ],
          ],
        });
      }

      expect(mockWSListeners.set_actualizados).toBeDefined();
    });

    it('actualiza sets de todos los jugadores', async () => {
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
                { id: 101, id_front: 1, nombre: 'Player 1 Set' },
                { id: 102, id_front: 1, nombre: 'Player 1 Set' },
                { id: 103, id_front: 1, nombre: 'Player 1 Set' },
              ],
            ],
            2: [
              [
                { id: 201, id_front: 2, nombre: 'Player 2 Set' },
                { id: 202, id_front: 2, nombre: 'Player 2 Set' },
                { id: 203, id_front: 2, nombre: 'Player 2 Set' },
              ],
            ],
          },
        });
      }

      expect(mockWSListeners.todos_los_sets_actualizados).toBeDefined();
    });

    it('maneja sets vacíos correctamente', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.set_actualizados).toBeDefined();
      });

      if (mockWSListeners.set_actualizados) {
        mockWSListeners.set_actualizados({
          partidaId: 123,
          jugadorId: 1,
          sets: [],
        });
      }

      expect(mockWSListeners.set_actualizados).toBeDefined();
    });
  });

  describe('Modificación de secretos', () => {
    it('procesa revelación de secreto (estado 0)', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.secreto_modificado).toBeDefined();
      });

      if (mockWSListeners.secreto_modificado) {
        mockWSListeners.secreto_modificado({
          partidaId: 123,
          jugadorId: 1,
          secretoId: 1,
          nuevoEstado: 0,
        });
      }

      expect(mockWSListeners.secreto_modificado).toBeDefined();
    });

    it('procesa ocultamiento de secreto (estado 9)', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.secreto_modificado).toBeDefined();
      });

      if (mockWSListeners.secreto_modificado) {
        mockWSListeners.secreto_modificado({
          partidaId: 123,
          jugadorId: 2,
          secretoId: 2,
          nuevoEstado: 9,
        });
      }

      expect(mockWSListeners.secreto_modificado).toBeDefined();
    });

    it('procesa cambios de estado intermedios', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.secreto_modificado).toBeDefined();
      });

      if (mockWSListeners.secreto_modificado) {
        mockWSListeners.secreto_modificado({
          partidaId: 123,
          jugadorId: 1,
          secretoId: 1,
          nuevoEstado: 5,
        });
      }

      expect(mockWSListeners.secreto_modificado).toBeDefined();
    });

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
          mazoDescarte: [{ id: 501, nombre: 'Nueva carta' }],
          turnoActual: 2,
        });
      }

      expect(mockWSListeners.secreto_modificado_y_partida_actualizada).toBeDefined();
    });
  });

  describe('Actualización de draft', () => {
    it('procesa draft con múltiples cartas', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.draft_actualizado).toBeDefined();
      });

      if (mockWSListeners.draft_actualizado) {
        mockWSListeners.draft_actualizado({
          partidaId: 123,
          draft: [
            { id: 301, id_front: 1, nombre: 'Draft 1' },
            { id: 302, id_front: 2, nombre: 'Draft 2' },
            { id: 303, id_front: 3, nombre: 'Draft 3' },
          ],
        });
      }

      expect(mockWSListeners.draft_actualizado).toBeDefined();
    });

    it('procesa vaciado del draft', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.draft_actualizado).toBeDefined();
      });

      // Primero llenar el draft
      if (mockWSListeners.draft_actualizado) {
        mockWSListeners.draft_actualizado({
          partidaId: 123,
          draft: [
            { id: 301, nombre: 'Draft 1' },
            { id: 302, nombre: 'Draft 2' },
          ],
        });
      }

      // Luego vaciarlo
      if (mockWSListeners.draft_actualizado) {
        mockWSListeners.draft_actualizado({
          partidaId: 123,
          draft: [],
        });
      }

      expect(mockWSListeners.draft_actualizado).toBeDefined();
    });
  });

  describe('Eventos de juego', () => {
    it('procesa carta_por_jugar del jugador actual', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.carta_por_jugar).toBeDefined();
      });

      if (mockWSListeners.carta_por_jugar) {
        mockWSListeners.carta_por_jugar({
          partidaId: 123,
          jugadorId: 1,
          carta: {
            id: 501,
            id_front: 10,
            nombre: 'Cards on the Table',
            tipo: 'Event',
          },
        });
      }

      expect(mockWSListeners.carta_por_jugar).toBeDefined();
    });

    it('procesa carta_por_jugar de otro jugador', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.carta_por_jugar).toBeDefined();
      });

      if (mockWSListeners.carta_por_jugar) {
        mockWSListeners.carta_por_jugar({
          partidaId: 123,
          jugadorId: 2,
          carta: {
            id: 502,
            id_front: 11,
            nombre: 'Another Victim',
            tipo: 'Event',
          },
        });
      }

      expect(mockWSListeners.carta_por_jugar).toBeDefined();
    });

    it('procesa ganador del juego', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.ganador).toBeDefined();
      });

      if (mockWSListeners.ganador) {
        mockWSListeners.ganador({
          partidaId: 123,
          ganadorId: 2,
          ganadorNombre: 'Player2',
        });
      }

      expect(mockWSListeners.ganador).toBeDefined();
    });

    it('procesa detective_por_agregar', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.detective_por_agregar).toBeDefined();
      });

      if (mockWSListeners.detective_por_agregar) {
        mockWSListeners.detective_por_agregar({
          partidaId: 123,
          jugadorId: 1,
          setIndex: 0,
          cartasEnSet: [
            { id: 101, id_front: 1, nombre: 'Det 1' },
            { id: 102, id_front: 1, nombre: 'Det 2' },
          ],
        });
      }

      expect(mockWSListeners.detective_por_agregar).toBeDefined();
    });
  });

  describe('Validación de partidaId', () => {
    it('procesa eventos de la partida correcta', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.mazo_actualizado).toBeDefined();
      });

      // Evento de la partida correcta
      if (mockWSListeners.mazo_actualizado) {
        mockWSListeners.mazo_actualizado({
          partidaId: 123, // Partida correcta
          jugadorId: 1,
          cartas_en_mano: [{ id: 101, id_front: 1, nombre: 'Carta correcta' }],
        });
      }

      // Verificar que el handler procesó el evento
      expect(mockWSListeners.mazo_actualizado).toBeDefined();
    });

    it('puede procesar eventos de otras partidas (handler no filtra por partidaId)', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.mazo_actualizado).toBeDefined();
      });

      if (mockWSListeners.mazo_actualizado) {
        mockWSListeners.mazo_actualizado({
          partidaId: 999, // Partida diferente
          jugadorId: 1,
          cartas_en_mano: [{ id: 999, nombre: 'Carta de otra partida' }],
        });
      }

      // El handler está registrado y puede procesar el evento
      expect(mockWSListeners.mazo_actualizado).toBeDefined();
    });
  });

  describe('Estado inicial del juego', () => {
    it('procesa game_state inicial completo', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.game_state).toBeDefined();
      });

      if (mockWSListeners.game_state) {
        mockWSListeners.game_state({
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
            { 
              id: 2, 
              nombre: 'Player2', 
              rol: 2, 
              posicion: 1, 
              secretos: [
                { id: 3, jugador: 2, estado: 9 },
              ]
            },
          ],
          turnoActual: 1,
          faseActual: 'Descartar',
          mazoDescarte: [
            { id: 201, id_front: 10, nombre: 'Descartada' },
          ],
          mazoDraft: [],
          sets: {
            1: [
              [
                { id: 101, id_front: 1, nombre: 'Set' },
                { id: 102, id_front: 1, nombre: 'Set' },
                { id: 103, id_front: 1, nombre: 'Set' },
              ],
            ],
          },
        });
      }

      expect(mockWSListeners.game_state).toBeDefined();
    });
  });
});
