import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PlayerList from '../../../components/PlayerList'

vi.mock('../../service/playerService', () => ({
  getAvatars: vi.fn(() => [
    { value: 'avatar1', src: '/assets/Avatares/avatar1.jpg', alt: 'Avatar 1' },
    { value: 'avatar2', src: '/assets/Avatares/avatar2.jpg', alt: 'Avatar 2' }
  ])
}))

describe('PlayerList Component', () => {
  it('muestra mensaje cuando no hay jugadores', () => {
    render(<PlayerList players={[]} />)
    expect(screen.getByText('No hay jugadores aún.')).toBeInTheDocument()
  })

  it('renderiza lista de jugadores correctamente', () => {
    const players = [
      { id: 1, nombre: 'Juan', avatar: 'avatar1' },
      { id: 2, nombre: 'María', avatar: 'avatar2' }
    ]
    render(<PlayerList players={players} />)
    expect(screen.getByText('Juan')).toBeInTheDocument()
    expect(screen.getByText('María')).toBeInTheDocument()
    expect(screen.getAllByText('Conectado')).toHaveLength(2)
  })

  it('renderiza avatares cuando están disponibles', () => {
    const players = [{ id: 1, nombre: 'Player 1', avatar: 'avatar1' }]
    render(<PlayerList players={players} />)
    const avatar = screen.getByAltText('Avatar 1')
    expect(avatar).toHaveAttribute('src', '/assets/Avatares/avatar1.jpg')
  })

  it('muestra inicial cuando no hay avatar', () => {
    const players = [{ id: 1, nombre: 'TestPlayer' }]
    render(<PlayerList players={players} />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('maneja jugadores sin nombre con fallback', () => {
    const players = [{ id: 1 }]
    render(<PlayerList players={players} />)
    expect(screen.getByText('Jugador')).toBeInTheDocument()
  })

  it('maneja arrays vacíos o null', () => {
    render(<PlayerList players={null} />)
    expect(screen.getByText('No hay jugadores aún.')).toBeInTheDocument()
  })
})
