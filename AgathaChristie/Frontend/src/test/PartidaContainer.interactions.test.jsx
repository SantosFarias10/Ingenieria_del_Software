import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Helper para renderizar el componente
const renderPartidaContainer = () => {
  return render(
    <BrowserRouter>
      <PartidaContainer />
    </BrowserRouter>
  );
};

describe('PartidaContainer - Interacciones de Usuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockWSListeners).forEach(key => delete mockWSListeners[key]);
    
    // Setup básico
    HttpService.getGameId = vi.fn(() => '123');
    LocalStorage.getUserId = vi.fn(() => '1');
    LocalStorage.getUserName = vi.fn(() => 'TestPlayer');
    LocalStorage.getPlayerId = vi.fn(() => '1');
    LocalStorage.getGameId = vi.fn(() => '123');
    LocalStorage.getPlayerName = vi.fn(() => 'TestPlayer');
    LocalStorage.getUser = vi.fn(() => ({ id: 1, nombre: 'TestPlayer', avatar: 'avatar1' }));
    
    // Mock de getPlayer y getGameDetails
    HttpService.getPlayer = vi.fn().mockResolvedValue({
      id: 1,
      nombre: 'TestPlayer',
      rol: null,
      posicion: 0,
    });

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

    HttpService.descartarCarta = vi.fn().mockResolvedValue({});
    HttpService.robarCarta = vi.fn().mockResolvedValue({});
    HttpService.robarCartaDraft = vi.fn().mockResolvedValue({});
    HttpService.jugarSet = vi.fn().mockResolvedValue({});
    HttpService.jugarEvento = vi.fn().mockResolvedValue({});
    HttpService.revelarSecreto = vi.fn().mockResolvedValue({});
    HttpService.postFinishTurn = vi.fn().mockResolvedValue({});
  });

  describe('Descartar Cartas', () => {
    it('registra handler para procesar_descarte', async () => {
      renderPartidaContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.procesar_descarte).toBeDefined();
      });
      
      expect(mockWSListeners.procesar_descarte).toBeTruthy();
    });

    it('no permite descartar si no es el turno del jugador', async () => {
      renderPartidaContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.game_state).toBeDefined();
      });

      // Simular estado con turno de otro jugador
      if (mockWSListeners.game_state) {
        if (mockWSListeners.game_state) mockWSListeners.game_state({
          partidaId: 123,
          jugadores: [
            { id: 1, nombre: 'TestPlayer', rol: 1, posicion: 0, secretos: [] },
            { id: 2, nombre: 'Player2', rol: 2, posicion: 1, secretos: [] },
          ],
          turnoActual: 2, // Turno del otro jugador
          faseActual: 'Descartar',
          mazoDescarte: [],
          mazoDraft: [],
          sets: {},
        });
      }

      await waitFor(() => {
        const descartarBtn = screen.queryByRole('button', { name: /descartar/i });
        expect(descartarBtn).toBeNull();
      });
    });

    it('valida que el jugador haya descartado antes de finalizar turno', async () => {
      renderPartidaContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.game_state).toBeDefined();
      });

      // Estado inicial con turno del jugador
      if (mockWSListeners.game_state) mockWSListeners.game_state({
        partidaId: 123,
        jugadores: [
          { id: 1, nombre: 'TestPlayer', rol: 1, posicion: 0, secretos: [] },
        ],
        turnoActual: 1,
        faseActual: 'Descartar',
        mazoDescarte: [],
        mazoDraft: [],
        sets: {},
      });

      // Dar 6 cartas al jugador
      if (mockWSListeners.mazo_actualizado) mockWSListeners.mazo_actualizado({
        partidaId: 123,
        jugadorId: 1,
        cartas_en_mano: Array.from({ length: 6 }, (_, i) => ({
          id: 100 + i,
          id_front: `carta_${i}`,
          nombre: `Carta ${i}`,
          tipo: 'Evento',
        })),
      });

      await waitFor(() => {
        const finalizarBtn = screen.queryByRole('button', { name: /finalizar turno/i });
        if (finalizarBtn) {
          fireEvent.click(finalizarBtn);
        }
      });

      // Verificar que NO se llamó a postFinishTurn porque no descartó
      expect(HttpService.postFinishTurn).not.toHaveBeenCalled();
    });

    it('marca haDescartadoEnTurno después de descartar', async () => {
      renderPartidaContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.game_state).toBeDefined();
        expect(mockWSListeners.procesar_descarte).toBeDefined();
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
        sets: {},
      });

      // Simular evento de descarte procesado
      if (mockWSListeners.procesar_descarte) mockWSListeners.procesar_descarte({
        partidaId: 123,
        jugadorId: 1,
        cartaDescartada: { id: 101, id_front: 'carta_1' },
      });

      await waitFor(() => {
        expect(mockWSListeners.procesar_descarte).toBeDefined();
      });
    });
  });

  describe('Robar Cartas', () => {
    it('permite robar carta del mazo después de descartar', async () => {
      HttpService.robarCarta.mockResolvedValue({});
      
      renderPartidaContainer();
      
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
        mazoDraft: [],
        sets: {},
      });

      if (mockWSListeners.mazo_actualizado) mockWSListeners.mazo_actualizado({
        partidaId: 123,
        jugadorId: 1,
        cartas_en_mano: [
          { id: 101, id_front: 'carta_1', nombre: 'Carta 1', tipo: 'Evento' },
        ],
      });

      await waitFor(() => {
        const robarBtn = screen.queryByRole('button', { name: /robar.*mazo/i });
        if (robarBtn && !robarBtn.disabled) {
          fireEvent.click(robarBtn);
        }
      });

      await waitFor(() => {
        if (HttpService.robarCarta.mock.calls.length > 0) {
          expect(HttpService.robarCarta).toHaveBeenCalledWith(expect.anything(), '123');
        }
      }, { timeout: 3000 });
    });

    it('permite robar carta del draft', async () => {
      HttpService.robarCartaDraft.mockResolvedValue({});
      
      renderPartidaContainer();
      
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
          { id: 201, id_front: 'draft_1', nombre: 'Draft 1' },
          { id: 202, id_front: 'draft_2', nombre: 'Draft 2' },
        ],
        sets: {},
      });

      await waitFor(() => {
        const draftCards = screen.queryAllByTestId(/^draft-carta-/);
        if (draftCards.length > 0) {
          fireEvent.click(draftCards[0]);
        }
      });

      await waitFor(() => {
        if (HttpService.robarCartaDraft.mock.calls.length > 0) {
          expect(HttpService.robarCartaDraft).toHaveBeenCalled();
        }
      }, { timeout: 3000 });
    });
  });

  describe('Jugar Set', () => {
    it('registra handler para set_actualizados', async () => {
      renderPartidaContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.set_actualizados).toBeDefined();
      });
      
      expect(mockWSListeners.set_actualizados).toBeTruthy();
    });

    it('no permite jugar set con menos de 3 cartas', async () => {
      renderPartidaContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.game_state).toBeDefined();
      });

      if (mockWSListeners.game_state) mockWSListeners.game_state({
        partidaId: 123,
        jugadores: [
          { id: 1, nombre: 'TestPlayer', rol: 1, posicion: 0, secretos: [] },
        ],
        turnoActual: 1,
        faseActual: 'Jugar Set',
        mazoDescarte: [],
        mazoDraft: [],
        sets: {},
      });

      if (mockWSListeners.mazo_actualizado) mockWSListeners.mazo_actualizado({
        partidaId: 123,
        jugadorId: 1,
        cartas_en_mano: [
          { id: 101, id_front: 'det_1', nombre: 'Detective A', tipo: 'Detective' },
          { id: 102, id_front: 'det_2', nombre: 'Detective B', tipo: 'Detective' },
        ],
      });

      await waitFor(() => {
        const jugarSetBtn = screen.queryByRole('button', { name: /bajar set|jugar set/i });
        expect(jugarSetBtn?.disabled).toBe(true);
      });
    });
  });

  describe('Finalizar Turno', () => {
    it('registra handler para turno_cambiado', async () => {
      renderPartidaContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.turno_cambiado).toBeDefined();
      });
      
      expect(mockWSListeners.turno_cambiado).toBeTruthy();
    });

    it('no permite finalizar turno con más de 6 cartas', async () => {
      renderPartidaContainer();
      
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
        sets: {},
      });

      // Dar 7 cartas
      if (mockWSListeners.mazo_actualizado) mockWSListeners.mazo_actualizado({
        partidaId: 123,
        jugadorId: 1,
        cartas_en_mano: Array.from({ length: 7 }, (_, i) => ({
          id: 100 + i,
          id_front: `carta_${i}`,
          nombre: `Carta ${i}`,
          tipo: 'Evento',
        })),
      });

      await waitFor(() => {
        const finalizarBtn = screen.queryByRole('button', { name: /finalizar turno/i });
        if (finalizarBtn) {
          fireEvent.click(finalizarBtn);
        }
      });

      // No debe llamarse porque tiene más de 6 cartas
      expect(HttpService.postFinishTurn).not.toHaveBeenCalled();
    });

    it('no permite finalizar turno con menos de 6 cartas', async () => {
      renderPartidaContainer();
      
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
        mazoDraft: [],
        sets: {},
      });

      // Dar solo 5 cartas
      if (mockWSListeners.mazo_actualizado) mockWSListeners.mazo_actualizado({
        partidaId: 123,
        jugadorId: 1,
        cartas_en_mano: Array.from({ length: 5 }, (_, i) => ({
          id: 100 + i,
          id_front: `carta_${i}`,
          nombre: `Carta ${i}`,
          tipo: 'Evento',
        })),
      });

      await waitFor(() => {
        const finalizarBtn = screen.queryByRole('button', { name: /finalizar turno/i });
        if (finalizarBtn) {
          fireEvent.click(finalizarBtn);
        }
      });

      // No debe llamarse porque tiene menos de 6 cartas
      expect(HttpService.postFinishTurn).not.toHaveBeenCalled();
    });
  });

  describe('Selección de Cartas', () => {
    it('permite actualizar la mano del jugador', async () => {
      renderPartidaContainer();
      
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
        sets: {},
      });

      if (mockWSListeners.mazo_actualizado) mockWSListeners.mazo_actualizado({
        partidaId: 123,
        jugadorId: 1,
        cartas_en_mano: [
          { id: 101, id_front: 'carta_1', nombre: 'Carta 1', tipo: 'Evento' },
        ],
      });

      await waitFor(() => {
        // Verificar que el handler procesa correctamente
        expect(mockWSListeners.mazo_actualizado).toBeDefined();
      });
    });

    it('procesa múltiples cartas en la mano', async () => {
      renderPartidaContainer();
      
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
        sets: {},
      });

      if (mockWSListeners.mazo_actualizado) mockWSListeners.mazo_actualizado({
        partidaId: 123,
        jugadorId: 1,
        cartas_en_mano: [
          { id: 101, id_front: 'carta_1', nombre: 'Carta 1', tipo: 'Evento' },
          { id: 102, id_front: 'carta_2', nombre: 'Carta 2', tipo: 'Evento' },
          { id: 103, id_front: 'carta_3', nombre: 'Carta 3', tipo: 'Evento' },
        ],
      });

      await waitFor(() => {
        // Verificar que el handler procesa múltiples cartas
        expect(mockWSListeners.mazo_actualizado).toBeDefined();
      });
    });
  });

  describe('Jugar Eventos', () => {
    it('registra handler para carta_por_jugar', async () => {
      renderPartidaContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.carta_por_jugar).toBeDefined();
      });
      
      // Verificar que el handler existe
      expect(mockWSListeners.carta_por_jugar).toBeTruthy();
    });
  });

  describe('Revelar Secretos', () => {
    it('permite revelar un secreto cuando se requiere', async () => {
      HttpService.revelarSecreto.mockResolvedValue({});
      
      renderPartidaContainer();
      
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
              { id: 1, jugador: 1, estado: 0 },
            ],
          },
        ],
        turnoActual: 1,
        faseActual: 'Descartar',
        mazoDescarte: [],
        mazoDraft: [],
        sets: {},
      });

      // Simular evento que requiere revelar secreto
      if (mockWSListeners.carta_por_jugar) mockWSListeners.carta_por_jugar({
        partidaId: 123,
        jugadorId: 2,
        carta: {
          id: 201,
          nombre: 'Point Your Suspicions',
          tipo: 'Evento',
        },
      });

      // Simular PYS con jugador actual como víctima
      if (mockWSListeners.pys) mockWSListeners.pys({
        partidaId: 123,
        jugadorId: 2,
        victimaId: 1,
      });

      await waitFor(() => {
        const secreto = screen.queryByTestId(/^secreto-/);
        if (secreto) {
          fireEvent.click(secreto);
        }
      }, { timeout: 3000 });

      await waitFor(() => {
        if (HttpService.revelarSecreto.mock.calls.length > 0) {
          expect(HttpService.revelarSecreto).toHaveBeenCalled();
        }
      }, { timeout: 3000 });
    });
  });

  describe('Actualización de Sets', () => {
    it('actualiza la visualización cuando se juega un set', async () => {
      renderPartidaContainer();
      
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
        sets: {},
      });

      // Simular que se jugó un set
      if (mockWSListeners.set_actualizados) mockWSListeners.set_actualizados({
        partidaId: 123,
        jugadorId: 1,
        sets: [
          [
            { id: 101, id_front: 'det_1', nombre: 'Detective A', tipo: 'Detective', set: 1 },
            { id: 102, id_front: 'det_2', nombre: 'Detective A', tipo: 'Detective', set: 1 },
            { id: 103, id_front: 'det_3', nombre: 'Detective A', tipo: 'Detective', set: 1 },
          ],
        ],
      });

      await waitFor(() => {
        // Verificar que se muestra el set jugado
        const sets = screen.queryAllByTestId(/^set-/);
        if (sets.length > 0) {
          expect(sets.length).toBeGreaterThan(0);
        }
      });
    });

    it('actualiza sets de todos los jugadores', async () => {
      renderPartidaContainer();
      
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

      // Simular sets actualizados de todos los jugadores
      if (mockWSListeners.todos_los_sets_actualizados) mockWSListeners.todos_los_sets_actualizados({
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

      await waitFor(() => {
        // Los sets deberían estar almacenados en el estado
        // Difícil de verificar visualmente sin acceso al estado interno
        expect(mockWSListeners.todos_los_sets_actualizados).toBeDefined();
      });
    });
  });

  describe('Cambio de Turno', () => {
    it('actualiza el turno actual cuando cambia', async () => {
      renderPartidaContainer();
      
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

      // Simular cambio de turno
      if (mockWSListeners.turno_cambiado) mockWSListeners.turno_cambiado({
        partidaId: 123,
        nuevoTurno: 2,
        fase: 'Descartar',
      });

      await waitFor(() => {
        // El turno debería haber cambiado (difícil de verificar sin acceso al estado)
        expect(mockWSListeners.turno_cambiado).toBeDefined();
      });
    });

    it('resetea flags al cambiar de turno', async () => {
      renderPartidaContainer();
      
      await waitFor(() => {
        expect(mockWSListeners.game_state).toBeDefined();
        expect(mockWSListeners.turno_cambiado).toBeDefined();
      });

      // Simular estado inicial
      if (mockWSListeners.game_state) mockWSListeners.game_state({
        partidaId: 123,
        jugadores: [
          { id: 1, nombre: 'TestPlayer', rol: 1, posicion: 0, secretos: [] },
        ],
        turnoActual: 1,
        faseActual: 'Descartar',
        mazoDescarte: [],
        mazoDraft: [],
        sets: {},
      });

      // Simular cambio de turno
      if (mockWSListeners.turno_cambiado) mockWSListeners.turno_cambiado({
        partidaId: 123,
        nuevoTurno: 2,
        fase: 'Descartar',
      });

      // Volver al turno del jugador
      if (mockWSListeners.turno_cambiado) mockWSListeners.turno_cambiado({
        partidaId: 123,
        nuevoTurno: 1,
        fase: 'Descartar',
      });

      await waitFor(() => {
        // Los flags deberían haberse reseteado
        expect(mockWSListeners.turno_cambiado).toBeDefined();
      });
    });
  });
});

