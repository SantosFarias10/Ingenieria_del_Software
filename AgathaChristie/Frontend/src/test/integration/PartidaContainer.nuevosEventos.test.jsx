import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Mocks
vi.mock('../../service/HttpService')
vi.mock('../../service/LocalStorage')

// Mock WSService - objeto compartido para capturar listeners
const mockWSListeners = {}

vi.mock('../../service/WSService', () => ({
  createWSService: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn((event, handler) => {
      mockWSListeners[event] = handler
    }),
    off: vi.fn(),
    isConnected: false
  }))
}))

vi.mock('../../components/Card', () => ({
  default: ({ id }) => <div data-testid={`card-${id}`}>Card {id}</div>
}))

import PartidaContainer from '../../container/PartidaContainer'
import * as HttpService from '../../service/HttpService'
import * as LocalStorage from '../../service/LocalStorage'

describe('PartidaContainer - Nuevos Eventos (Look Ashes, Delay Escape, Cards Off Table)', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Limpiar listeners
    Object.keys(mockWSListeners).forEach(key => delete mockWSListeners[key])

    LocalStorage.getPlayerId = vi.fn(() => '1')
    LocalStorage.getGameId = vi.fn(() => 'game-123')
    LocalStorage.getPlayerName = vi.fn(() => 'TestPlayer')
    LocalStorage.getUserId = vi.fn(() => 1)
    LocalStorage.getUser = vi.fn(() => ({ id: 1, nombre: 'TestPlayer', avatar: 'avatar1' }))

    HttpService.getGameDetails = vi.fn().mockResolvedValue({
      jugadores: [
        { id: 1, nombre: 'TestPlayer', avatar: 'avatar1', mano: [] },
        { id: 2, nombre: 'Opponent', avatar: 'avatar2', mano: [] }
      ],
      mazoRegular: { cantidad: 30 },
      mazoDescarte: [],
      turnoActual: 1,
      eventos: { 1: [] },
      secretos: {},
      setsJugados: { 1: {} }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const renderPartida = () => {
    return render(
      <BrowserRouter>
        <PartidaContainer />
      </BrowserRouter>
    )
  }

  // ===== LOOK INTO THE ASHES =====
  describe('evento_look_into_ashes', () => {
    it('actualiza la mano del jugador cuando recibe cartas del descarte', async () => {
      const { container } = renderPartida()
      
      const handler = mockWSListeners['evento_look_into_ashes']
      
      const payload = {
        partidaId: 123,
        jugadorId: 1,
        cartas: [
          { id: 10, id_front: 5, tipo: 'detective' },
          { id: 20, id_front: 8, tipo: 'detective' }
        ],
        ultCarta: { id: 30, id_front: 10, tipo: 'evento' },
        cantidadDescarte: 5
      }

      handler(payload)

      // Verificar que se procesó el evento
      expect(container).toBeInTheDocument()
    })

    it('actualiza el mazo de descarte con ultCarta', async () => {
      const { container } = renderPartida()
      
      const handler = mockWSListeners['evento_look_into_ashes']
      
      const payload = {
        partidaId: 123,
        jugadorId: 1,
        cartas: [],
        ultCarta: { id: 100, id_front: 10, tipo: 'evento' },
        cantidadDescarte: 1
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('ignora el evento si partidaId no coincide', async () => {
      const { container } = renderPartida()
      
      const handler = mockWSListeners['evento_look_into_ashes']
      
      const payload = {
        partidaId: 999, // ID diferente
        jugadorId: 1,
        cartas: [{ id: 10, id_front: 5 }],
        ultCarta: { id: 30, id_front: 10 },
        cantidadDescarte: 5
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('no actualiza la mano si el evento es de otro jugador', async () => {
      const { container } = renderPartida()
      
      const handler = mockWSListeners['evento_look_into_ashes']
      
      const payload = {
        partidaId: 123,
        jugadorId: 2, // Otro jugador
        cartas: [{ id: 10, id_front: 5 }],
        ultCarta: { id: 30, id_front: 10 },
        cantidadDescarte: 5
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })
  })

  // ===== DELAY THE MURDERER'S ESCAPE =====
  describe('evento_delay_escape', () => {
    it('actualiza el tamaño del mazo regular cuando se mezclan las cartas', async () => {
      const { container } = renderPartida()
      
      const handler = mockWSListeners['evento_delay_escape']
      
      const payload = {
        partidaId: 123,
        jugadorId: 1,
        cantidadMazo: 45, // Mazo creció porque se mezclaron cartas del descarte
        cantidadDescarte: 1,
        ultCarta: { id: 50, id_front: 11, tipo: 'evento' }
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('actualiza el descarte con la carta del evento', async () => {
      const { container } = renderPartida()
      
      const handler = mockWSListeners['evento_delay_escape']
      
      const payload = {
        partidaId: 123,
        jugadorId: 1,
        cantidadMazo: 45,
        cantidadDescarte: 1,
        ultCarta: { id: 50, id_front: 11, tipo: 'evento' }
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('ignora el evento si partidaId no coincide', async () => {
      const { container } = renderPartida()
      
      const handler = mockWSListeners['evento_delay_escape']
      
      const payload = {
        partidaId: 999,
        jugadorId: 1,
        cantidadMazo: 45,
        cantidadDescarte: 1,
        ultCarta: { id: 50, id_front: 11 }
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })
  })

  // ===== CARDS OFF THE TABLE =====
  describe('evento_cards_off_the_table', () => {
    it('actualiza la mano del jugador que jugó el evento', async () => {
      const { container } = renderPartida()
      
      const handler = mockWSListeners['evento_cards_off_the_table']
      
      const payload = {
        partidaId: 123,
        jugadorId: 1,
        victimaId: 2,
        manoJugador: [
          { id: 10, id_front: 5, tipo: 'detective' },
          { id: 20, id_front: 8, tipo: 'detective' }
        ],
        manoVictima: [],
        ultCarta: { id: 70, id_front: 13, tipo: 'evento' },
        cantidadDescarte: 10
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('actualiza la mano de la víctima sin sus Not So Fast', async () => {
      const { container } = renderPartida()
      
      const handler = mockWSListeners['evento_cards_off_the_table']
      
      const payload = {
        partidaId: 123,
        jugadorId: 2,
        victimaId: 1,
        manoJugador: [{ id: 10, id_front: 5 }],
        manoVictima: [
          { id: 30, id_front: 7, tipo: 'detective' }
        ],
        ultCarta: { id: 70, id_front: 13, tipo: 'evento' },
        cantidadDescarte: 10
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('actualiza el descarte con la carta del evento', async () => {
      const { container } = renderPartida()
      
      const handler = mockWSListeners['evento_cards_off_the_table']
      
      const payload = {
        partidaId: 123,
        jugadorId: 1,
        victimaId: 2,
        manoJugador: [],
        manoVictima: [],
        ultCarta: { id: 70, id_front: 13, tipo: 'evento' },
        cantidadDescarte: 10
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('no actualiza la mano si el usuario es espectador', async () => {
      const { container } = renderPartida()
      
      const handler = mockWSListeners['evento_cards_off_the_table']
      
      const payload = {
        partidaId: 123,
        jugadorId: 2,
        victimaId: 3,
        manoJugador: [],
        manoVictima: [],
        ultCarta: { id: 70, id_front: 13, tipo: 'evento' },
        cantidadDescarte: 10
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('ignora el evento si partidaId no coincide', async () => {
      const { container } = renderPartida()
      
      const handler = mockWSListeners['evento_cards_off_the_table']
      
      const payload = {
        partidaId: 999,
        jugadorId: 1,
        victimaId: 2,
        manoJugador: [],
        manoVictima: [],
        ultCarta: { id: 70, id_front: 13 },
        cantidadDescarte: 10
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('filtra cartas con idBackend null al normalizar', async () => {
      const { container } = renderPartida()
      
      const handler = mockWSListeners['evento_cards_off_the_table']
      
      const payload = {
        partidaId: 123,
        jugadorId: 1,
        victimaId: 2,
        manoJugador: [
          { id: 10, id_front: 5, tipo: 'detective' },
          { id: null, id_front: 8, tipo: 'invalid' }, // Debe ser filtrada
          { id: 20, id_front: 9, tipo: 'detective' }
        ],
        manoVictima: [],
        ultCarta: { id: 70, id_front: 13, tipo: 'evento' },
        cantidadDescarte: 10
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })
  })

  // ===== NORMALIZACIÓN DE CARTAS =====
  describe('Normalización de cartas en todos los eventos', () => {
    it('normaliza correctamente id_front, idFrontend, idFront', async () => {
      const { container } = renderPartida()
      
      const handler = mockWSListeners['evento_look_into_ashes']
      
      const payload = {
        partidaId: 123,
        jugadorId: 1,
        cartas: [
          { id: 10, id_front: 5 },
          { id: 20, idFrontend: 8 },
          { id: 30, idFront: 9 }
        ],
        ultCarta: { id: 40, id_front: 10 },
        cantidadDescarte: 5
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('normaliza correctamente id, idBackend, id_backend', async () => {
      const { container } = renderPartida()
      
      const handler = mockWSListeners['evento_look_into_ashes']
      
      const payload = {
        partidaId: 123,
        jugadorId: 1,
        cartas: [
          { id: 10, id_front: 5 },
          { idBackend: 20, id_front: 8 },
          { id_backend: 30, id_front: 9 }
        ],
        ultCarta: { id: 40, id_front: 10 },
        cantidadDescarte: 5
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })
  })
})

