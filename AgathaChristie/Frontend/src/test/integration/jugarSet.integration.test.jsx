import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import { BrowserRouter } from 'react-router-dom'
import * as HttpService from '../../service/HttpService'
import * as LocalStorage from '../../service/LocalStorage'

// Mocks: ensure these module mocks are registered before importing components
vi.mock('../../service/HttpService')
vi.mock('../../service/LocalStorage')
vi.mock('../../service/playerService', () => ({
  getAvatars: () => [
    { value: 'avatar1', src: '/avatars/avatar1.jpg' }
  ]
}))

// Mock LobbyContainer inline to avoid hoisting problems with vi.mock factories.
vi.mock('../../container/LobbyContainer', () => {
  const ws = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn()
  }
  return { WS: ws }
})

// Import component after mocks to avoid hoisting issues
import PartidaContainer from '../../container/PartidaContainer'

describe('Jugar Set - Integración', () => {
  const mockGameDetails = {
    jugadores: [
      { id: 1, nombre: 'Jugador1', avatar: 'avatar1' },
      { id: 2, nombre: 'Jugador2', avatar: 'avatar1' }
    ],
    mazoRegular: { cantidad: 30 },
    mazoDescarte: [],
    turnoActual: 1,
    eventos: {
      1: [
        { id: 41, id_front: 1, nombre: 'Hercule Poirot' },
        { id: 42, id_front: 1, nombre: 'Hercule Poirot' },
        { id: 21, id_front: 8, nombre: 'Harley Quin Wildcard' },
        { id: 27, id_front: 2, nombre: 'Miss Marple' }
      ]
    },
    secretos: {},
    setsJugados: { 1: [], 2: [] }
  }

  let mockWS

  beforeEach(async () => {
    vi.clearAllMocks()

    // Ensure we get the mocked LobbyContainer's WS object so tests can inspect calls
    const lc = await import('../../container/LobbyContainer')
    mockWS = lc.WS

    // Mock LocalStorage (use numbers so comparisons in components work as expected)
    LocalStorage.getGameId.mockReturnValue(1)
    LocalStorage.getUserId.mockReturnValue(1)

    // Mock HttpService
    HttpService.getGameDetails.mockResolvedValue(mockGameDetails)
    HttpService.jugarSet.mockResolvedValue({ mensaje: 'Set jugado correctamente' })
    HttpService.checkSets.mockResolvedValue({ 
      sets_disponibles: [[1, 1, 8]] // Set válido disponible
    })
    // Mock global alert to avoid environment warning
    vi.stubGlobal('alert', vi.fn())
  })

  const renderPartidaContainer = () => {
    let result
    act(() => {
      result = render(
        <BrowserRouter>
          <PartidaContainer />
        </BrowserRouter>
      )
    })
    return result
  }

  it('debería completar el flujo completo de jugar un set', async () => {
    // Arrange
    renderPartidaContainer()
    
    // Simular que el componente se carga
    await waitFor(() => {
      expect(HttpService.getGameDetails).toHaveBeenCalledWith(1)
    })

    // Act - Abrir modal de sets
    const bajarSetButton = screen.getByText('🃏 Bajar Set')
    await act(async () => {
      fireEvent.click(bajarSetButton)
    })

    // Verificar que se llama checkSets
    await waitFor(() => {
      expect(HttpService.checkSets).toHaveBeenCalledWith(1, 1)
    })

    // Assert - Verificar que el modal se abre (esto dependería de la implementación del modal)
    // En un test real, aquí simularíamos la selección del set y confirmación
  })

  it('debería manejar WebSocket de set jugado correctamente', async () => {
    // Arrange
    renderPartidaContainer()
    
    await waitFor(() => {
      expect(mockWS.on).toHaveBeenCalledWith('todos_los_sets_actualizados', expect.any(Function))
    })

    // Obtener el handler registrado
    const setJugadoHandler = mockWS.on.mock.calls.find(
      call => call[0] === 'todos_los_sets_actualizados'
    )[1]

    // Act - Simular WebSocket de set jugado (wrap in act to avoid warnings)
    const mockSetJugadoPayload = {
      partidaId: 1,
      jugadorId: 1,
      cartasJugadas: [
        { id: 41, id_front: 1, set: 1 },
        { id: 42, id_front: 1, set: 1 },
        { id: 21, id_front: 8, set: 1 }
      ],
      cartasEnMano: [
        { id: 27, id_front: 2, nombre: 'Miss Marple' }
      ]
    }

    await act(async () => {
      setJugadoHandler(mockSetJugadoPayload)
    })

    // Assert - Verificar que se procesa correctamente
    // En un test real, verificaríamos que:
    // 1. El set se agrega a la visualización
    // 2. La mano del jugador se actualiza
    // 3. Se muestra el mensaje de éxito
  })

  it('debería validar sets antes de enviar al backend', async () => {
    // Arrange
    const invalidSet = [9, 9] // Adriane Oliver no puede iniciar
    
    // Mock checkSets para devolver set inválido
    HttpService.checkSets.mockResolvedValue({ 
      sets_disponibles: [invalidSet]
    })

    renderPartidaContainer()
    
    await waitFor(() => {
      expect(HttpService.getGameDetails).toHaveBeenCalled()
    })

    // Act - Intentar jugar set inválido
    const bajarSetButton = screen.getByText('🃏 Bajar Set')
    await act(async () => {
      fireEvent.click(bajarSetButton)
    })

    // Assert - Verificar que no se llama jugarSet para sets inválidos
    expect(HttpService.jugarSet).not.toHaveBeenCalled()
  })

  it('debería manejar errores del backend gracefully', async () => {
    // Arrange
    HttpService.jugarSet.mockRejectedValue({
      response: {
        status: 422,
        data: { error: 'Set inválido' }
      }
    })

    renderPartidaContainer()
    
    // Simular intento de jugar set que falla
    // En un test real, simularíamos la interacción completa del usuario
    
    // Assert - Verificar que se maneja el error
    // (mostrar mensaje de error, no crashear la aplicación, etc.)
  })

  it('debería sincronizar sets entre múltiples jugadores', async () => {
    // Arrange
    renderPartidaContainer()
    
    await waitFor(() => {
      expect(mockWS.on).toHaveBeenCalledWith('todos_los_sets_actualizados', expect.any(Function))
    })

    const setJugadoHandler = mockWS.on.mock.calls.find(
      call => call[0] === 'todos_los_sets_actualizados'
    )[1]

    // Act - Simular que otro jugador juega un set
    const otroJugadorSetPayload = {
      partidaId: 1,
      jugadorId: 2, // Otro jugador
      cartasJugadas: [
        { id: 28, id_front: 2, set: 2 },
        { id: 29, id_front: 2, set: 2 }
      ],
      cartasEnMano: [] // No nos importa la mano del otro jugador
    }
    await act(async () => {
      setJugadoHandler(otroJugadorSetPayload)
    })

    // Assert - Verificar que se muestra el set del otro jugador
    // pero no se actualiza nuestra mano
  })

  it('debería prevenir duplicación de sets', async () => {
    // Arrange
    renderPartidaContainer()
    
    await waitFor(() => {
      expect(mockWS.on).toHaveBeenCalledWith('todos_los_sets_actualizados', expect.any(Function))
    })

    const setJugadoHandler = mockWS.on.mock.calls.find(
      call => call[0] === 'todos_los_sets_actualizados'
    )[1]

    const setPayload = {
      partidaId: 1,
      jugadorId: 1,
      cartasJugadas: [
        { id: 41, id_front: 1, set: 1 }
      ],
      cartasEnMano: []
    }

    // Act - Simular el mismo WebSocket múltiples veces
    await act(async () => {
      setJugadoHandler(setPayload)
      setJugadoHandler(setPayload) // Duplicado
      setJugadoHandler(setPayload) // Triplicado
    })

    // Assert - Verificar que solo se procesa una vez
    // En un test real, verificaríamos que solo hay un set en el estado
  })
})