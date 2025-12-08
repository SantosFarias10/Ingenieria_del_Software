import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ListadoDePartidasContainer from '../../../container/ListadoDePartidasContainer'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => ({ ...await vi.importActual('react-router-dom'), useNavigate: () => mockNavigate }))
vi.mock('../../../service/HttpService', () => ({ fetchPartidasService: vi.fn(), handlePlayerJoinGame: vi.fn(), fetchPlayerData: vi.fn() }))
vi.mock('../../../container/LobbyContainer', () => ({ openLobby: vi.fn() }))
vi.mock('../../../service/LocalStorage', () => ({ getUserId: vi.fn(() => 123) }))

import { fetchPartidasService } from '../../../service/HttpService'

const renderContainer = () => render(<MemoryRouter><ListadoDePartidasContainer /></MemoryRouter>)

describe('ListadoDePartidasContainer', () => {
  it('carga y muestra partidas', async () => {
    fetchPartidasService.mockResolvedValue([{ id: 1, nombre: 'TestGame', creador: 100 }])
    renderContainer()
    await waitFor(() => {
      expect(fetchPartidasService).toHaveBeenCalled()
      expect(screen.getByRole('heading', { name: /TestGame/i })).toBeInTheDocument()
    })
  })

  it('maneja errores', async () => {
    fetchPartidasService.mockRejectedValue(new Error('Network error'))
    renderContainer()
    await waitFor(() => expect(screen.getByText(/No se pudieron cargar las partidas/i)).toBeInTheDocument())
  })

  it('navega a home al volver', async () => {
    fetchPartidasService.mockResolvedValue([])
    renderContainer()
    await waitFor(() => expect(screen.getByText('Volver')).toBeInTheDocument())
    await userEvent.setup().click(screen.getByText('Volver'))
    expect(mockNavigate).toHaveBeenCalledWith('/home')
  })
})
