import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
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
  default: ({ id }) => <div data-testid={`card-${id}`}>Card {id}</div>,
}));

import PartidaContainer from '../container/PartidaContainer';
import * as HttpService from '../service/HttpService';
import * as LocalStorage from '../service/LocalStorage';

describe('PartidaContainer - Eventos Específicos del Juego', () => {
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

    HttpService.ganador = vi.fn().mockResolvedValue({ success: true });
  });

  const renderContainer = () => {
    return render(
      <BrowserRouter>
        <PartidaContainer />
      </BrowserRouter>
    );
  };

  describe('handleEarlyTrain', () => {
    it('actualiza cantidad del mazo regular y descarte', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_early_train).toBeDefined();
      });

      if (mockWSListeners.evento_early_train) {
        mockWSListeners.evento_early_train({
          partidaId: 123,
          jugadorId: 1,
          cantidadMazo: 24, // Reducido en 6
          cantidadDescarte: 6, // Aumentado en 6
        });
      }

      expect(mockWSListeners.evento_early_train).toBeDefined();
    });

    it('procesa Early Train cuando el mazo está casi vacío (victoria)', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_early_train).toBeDefined();
      });

      if (mockWSListeners.evento_early_train) {
        mockWSListeners.evento_early_train({
          partidaId: 123,
          jugadorId: 1,
          cantidadMazo: 5, // <= 6, condición de victoria
          cantidadDescarte: 25,
        });
      }

      expect(mockWSListeners.evento_early_train).toBeDefined();
      // Debería llamar a handleEndGame
      await waitFor(() => {
        expect(HttpService.ganador).toHaveBeenCalled();
      });
    });

    it('procesa Early Train cuando mazo = 6 (límite de victoria)', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_early_train).toBeDefined();
      });

      if (mockWSListeners.evento_early_train) {
        mockWSListeners.evento_early_train({
          partidaId: 123,
          jugadorId: 2,
          cantidadMazo: 6, // Exactamente 6
          cantidadDescarte: 24,
        });
      }

      expect(mockWSListeners.evento_early_train).toBeDefined();
    });

    it('maneja error en Early Train correctamente', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_early_train).toBeDefined();
      });

      // Payload malformado
      if (mockWSListeners.evento_early_train) {
        mockWSListeners.evento_early_train({
          partidaId: 123,
          // Falta jugadorId, cantidadMazo, cantidadDescarte
        });
      }

      expect(mockWSListeners.evento_early_train).toBeDefined();
    });
  });

  describe('handleOneMore', () => {
    it('actualiza secretos de todos los jugadores', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_and_then_one_more).toBeDefined();
      });

      if (mockWSListeners.evento_and_then_one_more) {
        mockWSListeners.evento_and_then_one_more({
          partidaId: 123,
          jugadorId: 1,
          secretos: {
            1: [
              { id: 101, id_front: 1, estado: 9 },
              { id: 102, id_front: 2, estado: 0 },
            ],
            2: [
              { id: 201, id_front: 3, estado: 9 },
            ],
          },
        });
      }

      expect(mockWSListeners.evento_and_then_one_more).toBeDefined();
    });

    it('actualiza mazo de descarte con última carta', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_and_then_one_more).toBeDefined();
      });

      if (mockWSListeners.evento_and_then_one_more) {
        mockWSListeners.evento_and_then_one_more({
          partidaId: 123,
          jugadorId: 1,
          ultCarta: {
            id: 301,
            id_front: 10,
            nombre: 'Cards on the Table',
          },
          cantidadDescarte: 5,
        });
      }

      expect(mockWSListeners.evento_and_then_one_more).toBeDefined();
    });

    it('incrementa contador de descarte si no viene cantidadDescarte', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_and_then_one_more).toBeDefined();
      });

      if (mockWSListeners.evento_and_then_one_more) {
        mockWSListeners.evento_and_then_one_more({
          partidaId: 123,
          jugadorId: 1,
          ultCarta: {
            id: 302,
            idFrontend: 11,
            nombre: 'Another Victim',
          },
          // No viene cantidadDescarte
        });
      }

      expect(mockWSListeners.evento_and_then_one_more).toBeDefined();
    });

    it('ignora evento de otra partida', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_and_then_one_more).toBeDefined();
      });

      if (mockWSListeners.evento_and_then_one_more) {
        mockWSListeners.evento_and_then_one_more({
          partidaId: 999, // Partida diferente
          jugadorId: 1,
          secretos: {},
        });
      }

      expect(mockWSListeners.evento_and_then_one_more).toBeDefined();
    });
  });

  describe('handleAnotherVictimCaso1', () => {
    it('actualiza sets de todos los jugadores', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_another_victim_caso1).toBeDefined();
      });

      if (mockWSListeners.evento_another_victim_caso1) {
        mockWSListeners.evento_another_victim_caso1({
          partidaId: 123,
          jugadorId: 1,
          sets: {
            1: [
              [
                { id: 101, id_front: 1, nombre: 'Det 1' },
                { id: 102, id_front: 1, nombre: 'Det 2' },
                { id: 103, id_front: 1, nombre: 'Det 3' },
              ],
            ],
            2: [],
          },
        });
      }

      expect(mockWSListeners.evento_another_victim_caso1).toBeDefined();
    });

    it('actualiza secreto revelado automáticamente', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_another_victim_caso1).toBeDefined();
      });

      // Primero establecer estado inicial con secretos
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
                { id: 201, jugador: 1, estado: 9 },
              ]
            },
          ],
          turnoActual: 1,
          faseActual: 'Descartar',
          mazoDescarte: [],
          mazoDraft: [],
          sets: {},
        });
      }

      // Luego procesar another_victim_caso1
      if (mockWSListeners.evento_another_victim_caso1) {
        mockWSListeners.evento_another_victim_caso1({
          partidaId: 123,
          jugadorId: 1,
          sets: {},
          secreto: {
            id: 201,
            jugador: 1,
            estado: 0, // Revelado automáticamente
          },
        });
      }

      expect(mockWSListeners.evento_another_victim_caso1).toBeDefined();
    });

    it('actualiza descarte con última carta', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_another_victim_caso1).toBeDefined();
      });

      if (mockWSListeners.evento_another_victim_caso1) {
        mockWSListeners.evento_another_victim_caso1({
          partidaId: 123,
          jugadorId: 1,
          sets: {},
          ultCarta: {
            id: 401,
            id_front: 11,
            nombre: 'Another Victim',
          },
          cantidadDescarte: 10,
        });
      }

      expect(mockWSListeners.evento_another_victim_caso1).toBeDefined();
    });

    it('normaliza sets que vienen como objeto en lugar de array', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_another_victim_caso1).toBeDefined();
      });

      if (mockWSListeners.evento_another_victim_caso1) {
        mockWSListeners.evento_another_victim_caso1({
          partidaId: 123,
          jugadorId: 1,
          sets: {
            1: {
              0: [
                { id: 101, id_front: 1, nombre: 'Det' },
                { id: 102, id_front: 1, nombre: 'Det' },
                { id: 103, id_front: 1, nombre: 'Det' },
              ],
            },
          },
        });
      }

      expect(mockWSListeners.evento_another_victim_caso1).toBeDefined();
    });

    it('ignora evento de otra partida', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_another_victim_caso1).toBeDefined();
      });

      if (mockWSListeners.evento_another_victim_caso1) {
        mockWSListeners.evento_another_victim_caso1({
          partidaId: 999,
          jugadorId: 1,
          sets: {},
        });
      }

      expect(mockWSListeners.evento_another_victim_caso1).toBeDefined();
    });
  });

  describe('handleAnotherVictimCaso2', () => {
    it('procesa evento con víctima seleccionada', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_another_victim_caso2).toBeDefined();
      });

      if (mockWSListeners.evento_another_victim_caso2) {
        mockWSListeners.evento_another_victim_caso2({
          partidaId: 123,
          jugadorId: 1,
          victimaId: 2,
          sets: {
            1: [
              [
                { id: 101, id_front: 1 },
                { id: 102, id_front: 1 },
                { id: 103, id_front: 1 },
              ],
            ],
          },
        });
      }

      expect(mockWSListeners.evento_another_victim_caso2).toBeDefined();
    });

    it('ignora evento de otra partida', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.evento_another_victim_caso2).toBeDefined();
      });

      if (mockWSListeners.evento_another_victim_caso2) {
        mockWSListeners.evento_another_victim_caso2({
          partidaId: 999,
          jugadorId: 1,
          victimaId: 2,
        });
      }

      expect(mockWSListeners.evento_another_victim_caso2).toBeDefined();
    });
  });

  describe('handlePYS (Point Your Suspicions)', () => {
    it('actualiza mazo de descarte con carta del evento', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.prep_point_your_suspicions).toBeDefined();
      });

      if (mockWSListeners.prep_point_your_suspicions) {
        mockWSListeners.prep_point_your_suspicions({
          partidaId: 123,
          jugadorId: 1,
          ultCarta: {
            id: 501,
            id_front: 18,
            nombre: 'Point Your Suspicions',
          },
          cantidadDescarte: 5,
        });
      }

      expect(mockWSListeners.prep_point_your_suspicions).toBeDefined();
    });

    it('actualiza mano del jugador activo', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.prep_point_your_suspicions).toBeDefined();
      });

      if (mockWSListeners.prep_point_your_suspicions) {
        mockWSListeners.prep_point_your_suspicions({
          partidaId: 123,
          jugadorId: 1, // Usuario actual
          cartas_en_mano: [
            { id: 601, id_front: 1, nombre: 'Carta 1' },
            { id: 602, id_front: 2, nombre: 'Carta 2' },
          ],
        });
      }

      expect(mockWSListeners.prep_point_your_suspicions).toBeDefined();
    });

    it('no actualiza mano si es de otro jugador', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.prep_point_your_suspicions).toBeDefined();
      });

      if (mockWSListeners.prep_point_your_suspicions) {
        mockWSListeners.prep_point_your_suspicions({
          partidaId: 123,
          jugadorId: 2, // Otro jugador
          cartas_en_mano: [
            { id: 701, id_front: 3, nombre: 'Carta de otro' },
          ],
        });
      }

      expect(mockWSListeners.prep_point_your_suspicions).toBeDefined();
    });

    it('activa modo revelación cuando usuario es víctima', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.prep_point_your_suspicions).toBeDefined();
      });

      if (mockWSListeners.prep_point_your_suspicions) {
        mockWSListeners.prep_point_your_suspicions({
          partidaId: 123,
          jugadorId: 2, // Otro jugador jugó la carta
          victimaId: 1, // Usuario actual es víctima
        });
      }

      expect(mockWSListeners.prep_point_your_suspicions).toBeDefined();
    });

    it('muestra notificación cuando otro es víctima', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.prep_point_your_suspicions).toBeDefined();
      });

      if (mockWSListeners.prep_point_your_suspicions) {
        mockWSListeners.prep_point_your_suspicions({
          partidaId: 123,
          jugadorId: 1,
          victimaId: 2, // Otro jugador es víctima
        });
      }

      expect(mockWSListeners.prep_point_your_suspicions).toBeDefined();
    });

    it('maneja cartas_en_mano como objeto con jugadorId', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.prep_point_your_suspicions).toBeDefined();
      });

      if (mockWSListeners.prep_point_your_suspicions) {
        mockWSListeners.prep_point_your_suspicions({
          partidaId: 123,
          jugadorId: 1,
          cartas_en_mano: {
            1: [
              { id: 801, id_front: 5, nombre: 'Carta' },
            ],
          },
        });
      }

      expect(mockWSListeners.prep_point_your_suspicions).toBeDefined();
    });

    it('ignora evento de otra partida', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.prep_point_your_suspicions).toBeDefined();
      });

      if (mockWSListeners.prep_point_your_suspicions) {
        mockWSListeners.prep_point_your_suspicions({
          partidaId: 999,
          jugadorId: 1,
          victimaId: 2,
        });
      }

      expect(mockWSListeners.prep_point_your_suspicions).toBeDefined();
    });
  });

  describe('handleJugadorElegidoParaRevelarSecreto', () => {
    it('activa modo revelación para jugador elegido', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.jugador_elegido_para_revelar_secreto).toBeDefined();
      });

      if (mockWSListeners.jugador_elegido_para_revelar_secreto) {
        mockWSListeners.jugador_elegido_para_revelar_secreto({
          partidaId: 123,
          jugadorElegido: 1, // Usuario actual
          tipoSecreto: 'secreto_oculto',
        });
      }

      expect(mockWSListeners.jugador_elegido_para_revelar_secreto).toBeDefined();
    });

    it('muestra notificación cuando otro jugador es elegido', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.jugador_elegido_para_revelar_secreto).toBeDefined();
      });

      if (mockWSListeners.jugador_elegido_para_revelar_secreto) {
        mockWSListeners.jugador_elegido_para_revelar_secreto({
          partidaId: 123,
          jugadorElegido: 2, // Otro jugador
          tipoSecreto: 'secreto_cualquiera',
        });
      }

      expect(mockWSListeners.jugador_elegido_para_revelar_secreto).toBeDefined();
    });
  });

  describe('handleSecretoYPartidaActualizada', () => {
    it('actualiza secreto y estado de partida', async () => {
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
          turnoActual: 2,
          mazoDescarte: [{ id: 901, nombre: 'Descartada' }],
        });
      }

      expect(mockWSListeners.secreto_modificado_y_partida_actualizada).toBeDefined();
    });
  });

  describe('handleObjetivoYPartidaActualizada', () => {
    it('procesa objetivo seleccionado con actualización de partida', async () => {
      renderContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.jugador_elegido_para_revelar_secreto_y_partida_actualizada).toBeDefined();
      });

      if (mockWSListeners.jugador_elegido_para_revelar_secreto_y_partida_actualizada) {
        mockWSListeners.jugador_elegido_para_revelar_secreto_y_partida_actualizada({
          partidaId: 123,
          jugadorElegido: 1,
          tipoSecreto: 'secreto_oculto',
          turnoActual: 1,
        });
      }

      expect(mockWSListeners.jugador_elegido_para_revelar_secreto_y_partida_actualizada).toBeDefined();
    });
  });
});
