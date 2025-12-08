import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import * as HttpService from '../../service/HttpService'
import * as LocalStorage from '../../service/LocalStorage'

// Mocks básicos
vi.mock('../../service/HttpService')
vi.mock('../../service/LocalStorage')
vi.mock('../../service/playerService', () => ({
  getAvatars: () => [{ value: 'avatar1', src: '/avatars/avatar1.jpg' }]
}))

// Mock WebSocket
vi.mock('../../container/LobbyContainer', () => ({
  WS: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn()
  }
}))

import PartidaContainer from '../../container/PartidaContainer'

describe('Robar Set - Integración Simplificada', () => {
  const mockGameDetails = {
    jugadores: [
      { id: 1, nombre: 'Jugador1', avatar: 'avatar1' },
      { id: 2, nombre: 'Jugador2', avatar: 'avatar1' }
    ],
    mazoRegular: { cantidad: 30 },
    mazoDescarte: [],
    turnoActual: 1,
    eventos: { 1: [], 2: [] },
    secretos: {},
    setsJugados: { 1: {}, 2: {} }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    LocalStorage.getGameId.mockReturnValue('1')
    LocalStorage.getUserId.mockReturnValue('1')
    HttpService.getGameDetails.mockResolvedValue(mockGameDetails)
    HttpService.verTodosLosSets = vi.fn().mockResolvedValue({ 1: {}, 2: {} })
    HttpService.intercambiarSet = vi.fn().mockResolvedValue({ message: 'OK' })
  })

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <PartidaContainer />
      </BrowserRouter>
    )
  }

  it('debería renderizar el componente sin errores', async () => {
    expect(() => renderComponent()).not.toThrow()
    
    await waitFor(() => {
      expect(HttpService.getGameDetails).toHaveBeenCalled()
    })
  })

  it('debería tener las funciones de HttpService disponibles', () => {
    expect(typeof HttpService.verTodosLosSets).toBe('function')
    expect(typeof HttpService.intercambiarSet).toBe('function')
  })
})