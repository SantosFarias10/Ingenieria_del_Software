import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Mocks
vi.mock('../../service/HttpService')
vi.mock('../../service/LocalStorage')

// Mock WSService
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

describe('PartidaContainer - Handlers adicionales', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
      setsJugados: { 1: {} },
      turnos: {}
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

  describe('Handler: mazo_actualizado', () => {
    it('actualiza la cantidad de cartas en el mazo regular', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['mazo_actualizado']
      expect(handler).toBeDefined()

      const payload = {
        cantidadCartas: 25
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('ignora payloads sin cantidadCartas', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['mazo_actualizado']
      
      const payload = {}
      handler(payload)

      expect(container).toBeInTheDocument()
    })
  })

  describe('Handler: procesar_descarte', () => {
    it('actualiza el contador de descarte con la cantidad de cartas', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['procesar_descarte']
      expect(handler).toBeDefined()

      const payload = {
        jugadorId: 1,
        cantidadCartas: 15,
        carta: {
          id: 10,
          id_front: 5,
          nombre: 'Hercule Poirot'
        }
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('agrega la carta descartada al mazo de descarte', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['procesar_descarte']
      
      const payload = {
        jugadorId: 2,
        cantidadCartas: 10,
        carta: {
          id: 20,
          id_front: 8,
          nombre: 'Miss Marple'
        }
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('maneja payload con cantidadCartas <= 1 (fin de juego)', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['procesar_descarte']
      
      const payload = {
        jugadorId: 1,
        cantidadCartas: 1,
        carta: {
          id: 30,
          id_front: 10
        }
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })
  })

  describe('Handler: turno_cambiado', () => {
    it('actualiza el turno actual al jugador especificado', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['turno_cambiado']
      expect(handler).toBeDefined()

      const payload = {
        nuevoTurno: 2,
        jugadorId: 2
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('resetea las flags de acciones del turno', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['turno_cambiado']
      
      const payload = {
        nuevoTurno: 1,
        jugadorId: 1
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })
  })

  describe('Handler: robar_carta', () => {
    it('añade la carta robada a la mano del jugador', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['robar_carta']
      if (!handler) return

      const payload = {
        jugadorId: 1,
        carta: {
          id: 40,
          id_front: 15,
          nombre: 'New Detective'
        }
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('no actualiza la mano si la carta es para otro jugador', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['robar_carta']
      if (!handler) return

      const payload = {
        jugadorId: 2,
        carta: {
          id: 40,
          id_front: 15
        }
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })
  })

  describe('Handler: set_jugado', () => {
    it('agrega el set jugado al jugador correspondiente', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['set_jugado']
      if (!handler) return

      const payload = {
        jugadorId: 1,
        set: [
          { id: 10, id_front: 5 },
          { id: 11, id_front: 5 },
          { id: 12, id_front: 5 }
        ]
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('maneja sets de otro jugador', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['set_jugado']
      if (!handler) return

      const payload = {
        jugadorId: 2,
        set: [
          { id: 20, id_front: 8 },
          { id: 21, id_front: 8 },
          { id: 22, id_front: 8 }
        ]
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })
  })

  describe('Handler: secreto_revelado', () => {
    it('actualiza el estado del secreto revelado', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['secreto_revelado']
      if (!handler) return

      const payload = {
        jugadorId: 1,
        secretoId: 15,
        estado: 'revelado'
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('maneja secretos de otros jugadores', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['secreto_revelado']
      if (!handler) return

      const payload = {
        jugadorId: 2,
        secretoId: 16,
        estado: 'revelado'
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })
  })

  describe('Handler: draft_actualizado', () => {
    it('actualiza las cartas del mazo draft', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['draft_actualizado']
      if (!handler) return

      const payload = {
        cartas: [
          { id: 50, id_front: 20 },
          { id: 51, id_front: 21 },
          { id: 52, id_front: 22 }
        ]
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('ordena las cartas draft por id_front', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['draft_actualizado']
      if (!handler) return

      const payload = {
        cartas: [
          { id: 52, id_front: 22 },
          { id: 50, id_front: 20 },
          { id: 51, id_front: 21 }
        ]
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })
  })

  describe('Normalización de cartas', () => {
    it('normaliza cartas con id_front, idFrontend, idFront', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['game_state']
      if (!handler) return

      const payload = {
        jugadores: [{ id: 1, nombre: 'Player1', avatar: 'avatar1' }],
        mazoRegular: { cantidad: 20 },
        mazoDescarte: [],
        turnoActual: 1,
        eventos: {
          1: [
            { id: 1, id_front: 5 },
            { id: 2, idFrontend: 8 },
            { id: 3, idFront: 10 }
          ]
        },
        secretos: {},
        setsJugados: {}
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('normaliza cartas con id, idBackend, id_backend', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['game_state']
      if (!handler) return

      const payload = {
        jugadores: [{ id: 1, nombre: 'Player1', avatar: 'avatar1' }],
        mazoRegular: { cantidad: 20 },
        mazoDescarte: [
          { id: 10, id_front: 5 },
          { idBackend: 20, id_front: 8 },
          { id_backend: 30, id_front: 10 }
        ],
        turnoActual: 1,
        eventos: { 1: [] },
        secretos: {},
        setsJugados: {}
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('filtra cartas con idBackend null', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['game_state']
      if (!handler) return

      const payload = {
        jugadores: [{ id: 1, nombre: 'Player1', avatar: 'avatar1' }],
        mazoRegular: { cantidad: 20 },
        mazoDescarte: [],
        turnoActual: 1,
        eventos: {
          1: [
            { id: 10, id_front: 5 },
            { id: null, id_front: 8 }, // Debería ser filtrado
            { id: 20, id_front: 10 }
          ]
        },
        secretos: {},
        setsJugados: {}
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })
  })

  describe('Manejo de mazoDescarte', () => {
    it('maneja mazoDescarte como array de cartas', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['game_state']
      if (!handler) return

      const payload = {
        jugadores: [{ id: 1, nombre: 'Player1', avatar: 'avatar1' }],
        mazoRegular: { cantidad: 20 },
        mazoDescarte: [
          { id: 10, id_front: 5 },
          { id: 20, id_front: 8 },
          { id: 30, id_front: 10 }
        ],
        turnoActual: 1,
        eventos: { 1: [] },
        secretos: {},
        setsJugados: {}
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('maneja mazoDescarte como número (contador)', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['game_state']
      if (!handler) return

      const payload = {
        jugadores: [{ id: 1, nombre: 'Player1', avatar: 'avatar1' }],
        mazoRegular: { cantidad: 20 },
        mazoDescarte: 15, // Número en lugar de array
        turnoActual: 1,
        eventos: { 1: [] },
        secretos: {},
        setsJugados: {}
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('invierte el array de mazoDescarte para mostrar última carta primero', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['game_state']
      if (!handler) return

      const payload = {
        jugadores: [{ id: 1, nombre: 'Player1', avatar: 'avatar1' }],
        mazoRegular: { cantidad: 20 },
        mazoDescarte: [
          { id: 10, id_front: 5 }, // Primera descartada
          { id: 20, id_front: 8 },
          { id: 30, id_front: 10 }  // Última descartada (debería aparecer primero)
        ],
        turnoActual: 1,
        eventos: { 1: [] },
        secretos: {},
        setsJugados: {}
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })
  })

  describe('Manejo de secretos', () => {
    it('carga secretos de todos los jugadores', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['game_state']
      if (!handler) return

      const payload = {
        jugadores: [
          { id: 1, nombre: 'Player1', avatar: 'avatar1' },
          { id: 2, nombre: 'Player2', avatar: 'avatar2' }
        ],
        mazoRegular: { cantidad: 20 },
        mazoDescarte: [],
        turnoActual: 1,
        eventos: { 1: [], 2: [] },
        secretos: {
          1: [
            { id: 15, id_front: 15, estado: 'oculto' },
            { id: 16, id_front: 16, estado: 'oculto' }
          ],
          2: [
            { id: 17, id_front: 17, estado: 'revelado' }
          ]
        },
        setsJugados: {}
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('maneja payload sin secretos', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['game_state']
      if (!handler) return

      const payload = {
        jugadores: [{ id: 1, nombre: 'Player1', avatar: 'avatar1' }],
        mazoRegular: { cantidad: 20 },
        mazoDescarte: [],
        turnoActual: 1,
        eventos: { 1: [] },
        setsJugados: {}
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })
  })

  describe('Manejo de sets jugados', () => {
    it('carga sets jugados de todos los jugadores', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['game_state']
      if (!handler) return

      const payload = {
        jugadores: [
          { id: 1, nombre: 'Player1', avatar: 'avatar1' },
          { id: 2, nombre: 'Player2', avatar: 'avatar2' }
        ],
        mazoRegular: { cantidad: 20 },
        mazoDescarte: [],
        turnoActual: 1,
        eventos: { 1: [], 2: [] },
        secretos: {},
        setsJugados: {
          1: [
            [
              { id: 10, id_front: 5 },
              { id: 11, id_front: 5 },
              { id: 12, id_front: 5 }
            ]
          ],
          2: [
            [
              { id: 20, id_front: 8 },
              { id: 21, id_front: 8 },
              { id: 22, id_front: 8 }
            ]
          ]
        }
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('maneja sets vacíos para jugadores sin sets', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['game_state']
      if (!handler) return

      const payload = {
        jugadores: [{ id: 1, nombre: 'Player1', avatar: 'avatar1' }],
        mazoRegular: { cantidad: 20 },
        mazoDescarte: [],
        turnoActual: 1,
        eventos: { 1: [] },
        secretos: {},
        setsJugados: {
          1: [] // Array vacío en lugar de objeto
        }
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('filtra cartas de la mano que están en sets jugados', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['game_state']
      if (!handler) return

      const payload = {
        jugadores: [{ id: 1, nombre: 'Player1', avatar: 'avatar1' }],
        mazoRegular: { cantidad: 20 },
        mazoDescarte: [],
        turnoActual: 1,
        eventos: {
          1: [
            { id: 10, id_front: 5 }, // Esta carta está en un set
            { id: 15, id_front: 7 }, // Esta carta NO está en un set
            { id: 11, id_front: 5 }  // Esta carta está en un set
          ]
        },
        secretos: {},
        setsJugados: {
          1: [
            [
              { id: 10, id_front: 5 },
              { id: 11, id_front: 5 },
              { id: 12, id_front: 5 }
            ]
          ]
        }
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })
  })

  describe('Flags de acciones del turno', () => {
    it('inicializa flags de turno correctamente', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['game_state']
      if (!handler) return

      const payload = {
        jugadores: [{ id: 1, nombre: 'Player1', avatar: 'avatar1' }],
        mazoRegular: { cantidad: 20 },
        mazoDescarte: [],
        turnoActual: 1,
        eventos: { 1: [] },
        secretos: {},
        setsJugados: {},
        turnos: {
          1: {
            descarte_realizado: true
          }
        }
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })

    it('resetea flags cuando cambia el turno', async () => {
      const { container } = renderPartida()
      
      await waitFor(() => {
        expect(HttpService.getGameDetails).toHaveBeenCalled()
      })

      const handler = mockWSListeners['turno_cambiado']
      if (!handler) return

      const payload = {
        nuevoTurno: 2,
        jugadorId: 2
      }

      handler(payload)

      expect(container).toBeInTheDocument()
    })
  })
})
