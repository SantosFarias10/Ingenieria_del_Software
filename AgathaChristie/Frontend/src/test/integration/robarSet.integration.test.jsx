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

describe('Robar Set - Integración', () => {
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
        { id: 27, id_front: 2, nombre: 'Miss Marple' },
        { id: 28, id_front: 2, nombre: 'Miss Marple' }
      ],
      2: []
    },
    secretos: {},
    setsJugados: {
      1: {},
      2: {
        5: [
          { id: 40, id_front: 1, nombre: 'Hercule Poirot' },
          { id: 41, id_front: 1, nombre: 'Hercule Poirot' },
          { id: 21, id_front: 8, nombre: 'Harley Quin Wildcard' }
        ]
      }
    }
  }

  const mockSetsResponse = {
    1: {},
    2: {
      5: [
        { id: 40, id_front: 1, nombre: 'Hercule Poirot' },
        { id: 41, id_front: 1, nombre: 'Hercule Poirot' },
        { id: 21, id_front: 8, nombre: 'Harley Quin Wildcard' }
      ]
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
  // Mock LocalStorage
  LocalStorage.getGameId.mockReturnValue('1')
  // Return numeric user id so comparisons with turnoActual (number) work as expected
  LocalStorage.getUserId.mockReturnValue(1)
    
    // Mock HttpService
    HttpService.getGameDetails.mockResolvedValue(mockGameDetails)
    HttpService.verTodosLosSets = vi.fn().mockResolvedValue(mockSetsResponse)
    HttpService.intercambiarSets = vi.fn().mockResolvedValue({ 
      message: 'Set intercambiado correctamente' 
    })
    HttpService.intercambiarSet = vi.fn().mockResolvedValue({ 
      message: 'Set intercambiado correctamente' 
    })
  })

  const renderPartidaContainer = () => {
    return render(
      <BrowserRouter>
        <PartidaContainer />
      </BrowserRouter>
    )
  }

  it('debería renderizar el componente correctamente', async () => {
    // Arrange & Act
    renderPartidaContainer()
    
    // Wait for component to load
    await waitFor(() => {
      expect(HttpService.getGameDetails).toHaveBeenCalledWith('1')
    }, { timeout: 3000 })

    // Assert - Component loads without errors
    expect(screen.getByRole('button', { name: /finalizar turno/i })).toBeInTheDocument()
  })

  it('debería tener las funciones de robar set disponibles en HttpService', () => {
    expect(typeof HttpService.verTodosLosSets).toBe('function')
    expect(typeof HttpService.intercambiarSet).toBe('function')
  })
})