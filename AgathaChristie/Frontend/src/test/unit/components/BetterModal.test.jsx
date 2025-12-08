import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import BetterModal from '../../../components/BetterModal'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('../../../service/LocalStorage.js', () => ({
  getUserId: vi.fn(() => 1),
}))

describe('BetterModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderModal = (props = {}) => {
    return render(<MemoryRouter><BetterModal {...props} /></MemoryRouter>)
  }

  it('no renderiza cuando isOpen es false', () => {
    const { container } = renderModal({ isOpen: false })
    expect(container.firstChild).toBeNull()
  })

  it('renderiza el modal con el nombre de la sala', () => {
    renderModal({ isOpen: true, roomName: 'Test Room', players: [] })
    expect(screen.getByText(/Lobby: Test Room/i)).toBeInTheDocument()
  })

  it('muestra la cantidad de jugadores', () => {
    const players = [{ id: 1, nombre: 'Player 1' }, { id: 2, nombre: 'Player 2' }]
    renderModal({ isOpen: true, players, minPlayers: 2, maxPlayers: 6 })
    expect(screen.getByText(/Jugadores conectados: 2\/6/i)).toBeInTheDocument()
  })

  it('deshabilita botón cuando faltan jugadores', () => {
    renderModal({ isOpen: true, players: [{ id: 1 }], minPlayers: 2, creador: 1 })
    expect(screen.getByRole('button', { name: /Esperando/i })).toBeDisabled()
  })

  it('habilita botón cuando hay suficientes jugadores', () => {
    const players = [{ id: 1 }, { id: 2 }]
    renderModal({ isOpen: true, players, minPlayers: 2, creador: 1 })
    expect(screen.getByRole('button', { name: /Iniciar Partida/i })).not.toBeDisabled()
  })

  it('llama a onStart al hacer click en Iniciar', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    renderModal({ isOpen: true, players: [{ id: 1 }, { id: 2 }], minPlayers: 2, creador: 1, onStart })
    await user.click(screen.getByRole('button', { name: /Iniciar Partida/i }))
    expect(onStart).toHaveBeenCalled()
  })

  it('cierra el modal al hacer click en cerrar', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal({ isOpen: true, onClose })
    await user.click(screen.getByRole('button', { name: /Cerrar/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
