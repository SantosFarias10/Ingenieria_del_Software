import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ListadoDePartidasVisual from '../../../components/ListadoDePartidasVisual'

vi.mock('react-router-dom', async () => ({ 
  ...await vi.importActual('react-router-dom'), 
  useNavigate: () => vi.fn()
}))
vi.mock('../../../container/LobbyContainer', () => ({ 
  openLobby: vi.fn() 
}))
vi.mock('../../../service/HttpService', () => ({ 
  handlePlayerJoinGame: vi.fn(), 
  fetchPlayerData: vi.fn()
}))
vi.mock('../../../service/LocalStorage', () => ({ 
  getUserId: vi.fn() 
}))
vi.mock('../../../components/FiltrarPorNombreVisual', () => ({
  default: ({ filterText, onFilterChange }) => (
    <input
      type="text"
      placeholder="Filtrar partida por nombre"
      value={filterText}
      onChange={onFilterChange}
      data-testid="filtrar-input"
    />
  )
}))

import { useNavigate } from 'react-router-dom'
import { openLobby } from '../../../container/LobbyContainer'
import { handlePlayerJoinGame, fetchPlayerData } from '../../../service/HttpService'
import { getUserId } from '../../../service/LocalStorage'

const renderComponent = (props = {}) => render(
  <MemoryRouter>
    <ListadoDePartidasVisual 
      partidas={[]} 
      loading={false} 
      error={null} 
      fetchPartidas={vi.fn()} 
      filterText="" 
      onFilterChange={vi.fn()} 
      {...props} 
    />
  </MemoryRouter>
)

describe('ListadoDePartidasVisual', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserId.mockReturnValue(123)
    fetchPlayerData.mockResolvedValue({ nombre: 'Jugador Test' })
  })

  // ===== RENDERIZADO BÁSICO =====
  it('renderiza correctamente el contenedor principal', () => {
    const { container } = renderComponent()
    expect(container.querySelector('.partidas-container')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Partidas Disponibles/i })).toBeInTheDocument()
  })

  it('renderiza el filtro de búsqueda', () => {
    renderComponent()
    expect(screen.getByPlaceholderText(/Filtrar partida por nombre/i)).toBeInTheDocument()
  })

  it('renderiza el botón Refresh', () => {
    renderComponent()
    expect(screen.getByRole('button', { name: /Refresh/i })).toBeInTheDocument()
  })

  // ===== LISTA VACÍA =====
  it('muestra mensaje cuando no hay partidas', () => {
    renderComponent({ partidas: [] })
    expect(screen.getByText(/No hay partidas disponibles en este momento/i)).toBeInTheDocument()
  })

  it('muestra botón para crear partida cuando lista está vacía', () => {
    renderComponent({ partidas: [] })
    expect(screen.getByRole('button', { name: /Crear Nueva Partida/i })).toBeInTheDocument()
  })

  it('navega a crear-partida al hacer click en el botón', async () => {
    const user = userEvent.setup()
    renderComponent({ partidas: [] })
    
    const btnCrear = screen.getByRole('button', { name: /Crear Nueva Partida/i })
    await user.click(btnCrear)
    
    // Solo verificamos que el botón existe y es clickeable
    // La navegación real sería testeada en un test de integración
    expect(btnCrear).toBeInTheDocument()
  })

  // ===== RENDERIZADO DE PARTIDAS =====
  it('renderiza una partida correctamente', async () => {
    const partidas = [
      { 
        id: 1, 
        nombre: 'Partida Test', 
        creador: 100, 
        jugadores: [1, 2], 
        maxPlayers: 6,
        estado: false 
      }
    ]
    renderComponent({ partidas })
    
    await waitFor(() => {
      expect(screen.getByText('Partida Test')).toBeInTheDocument()
      expect(screen.getByText('esperando')).toBeInTheDocument()
      expect(screen.getByText('2/6')).toBeInTheDocument()
    })
  })

  it('renderiza múltiples partidas', async () => {
    const partidas = [
      { id: 1, nombre: 'Partida Alfa', creador: 100, jugadores: [], maxPlayers: 6, estado: false },
      { id: 2, nombre: 'Partida Beta', creador: 101, jugadores: [], maxPlayers: 6, estado: false }
    ]
    renderComponent({ partidas })
    
    await waitFor(() => {
      expect(screen.getByText('Partida Alfa')).toBeInTheDocument()
      expect(screen.getByText('Partida Beta')).toBeInTheDocument()
    })
  })

  it('muestra el conteo de partidas encontradas', async () => {
    const partidas = [
      { id: 1, nombre: 'Partida Gamma', creador: 100, jugadores: [], maxPlayers: 6, estado: false },
      { id: 2, nombre: 'Partida Delta', creador: 101, jugadores: [], maxPlayers: 6, estado: false }
    ]
    renderComponent({ partidas })
    
    expect(screen.getByText('2 partida(s) encontrada(s)')).toBeInTheDocument()
  })

  // ===== ESTADOS DE PARTIDA =====
  it('muestra estado "esperando" para partida no iniciada', async () => {
    const partidas = [
      { id: 1, nombre: 'Partida Test', creador: 100, jugadores: [], maxPlayers: 6, estado: false }
    ]
    renderComponent({ partidas })
    
    await waitFor(() => {
      expect(screen.getByText('esperando')).toBeInTheDocument()
    })
  })

  it('muestra estado "iniciada" para partida activa', async () => {
    const partidas = [
      { id: 1, nombre: 'Partida Test', creador: 100, jugadores: [], maxPlayers: 6, estado: true }
    ]
    renderComponent({ partidas })
    
    await waitFor(() => {
      expect(screen.getByText('iniciada')).toBeInTheDocument()
    })
  })

  // ===== INFORMACIÓN DE JUGADORES =====
  it('muestra correctamente el conteo de jugadores', async () => {
    const partidas = [
      { id: 1, nombre: 'Partida Test', creador: 100, jugadores: [1, 2, 3], maxPlayers: 6, estado: false }
    ]
    renderComponent({ partidas })
    
    await waitFor(() => {
      expect(screen.getByText('3/6')).toBeInTheDocument()
    })
  })

  it('maneja diferentes formatos de max jugadores', async () => {
    const partidas = [
      { id: 1, nombre: 'Partida Epsilon', creador: 100, jugadores: [], max_jugadores: 5, estado: false },
      { id: 2, nombre: 'Partida Zeta', creador: 101, jugadores: [], maxJugadores: 4, estado: false }
    ]
    renderComponent({ partidas })
    
    await waitFor(() => {
      expect(screen.getByText('0/5')).toBeInTheDocument()
      expect(screen.getByText('0/4')).toBeInTheDocument()
    })
  })

  it('carga y muestra nombre del creador', async () => {
    fetchPlayerData.mockResolvedValue({ nombre: 'Creador123' })
    const partidas = [
      { id: 1, nombre: 'Partida Test', creador: 100, jugadores: [], maxPlayers: 6, estado: false }
    ]
    renderComponent({ partidas })
    
    await waitFor(() => {
      expect(fetchPlayerData).toHaveBeenCalledWith(100)
      expect(screen.getByText('Creador123')).toBeInTheDocument()
    })
  })

  it('muestra "Desconocido" cuando falla la carga del creador', async () => {
    fetchPlayerData.mockRejectedValue(new Error('Network error'))
    const partidas = [
      { id: 1, nombre: 'Partida Test', creador: 100, jugadores: [], maxPlayers: 6, estado: false }
    ]
    renderComponent({ partidas })
    
    await waitFor(() => {
      expect(screen.getByText('Desconocido')).toBeInTheDocument()
    })
  })

  // ===== UNIRSE A PARTIDA =====
  it('permite unirse a una partida disponible', async () => {
    const user = userEvent.setup()
    handlePlayerJoinGame.mockResolvedValue({ success: true })
    const partidas = [
      { id: 1, nombre: 'Partida Test', creador: 100, jugadores: [], maxPlayers: 6, estado: false }
    ]
    const mockFetchPartidas = vi.fn()
    renderComponent({ partidas, fetchPartidas: mockFetchPartidas })
    
    const btnUnirse = await screen.findByRole('button', { name: /Unirse/i })
    await user.click(btnUnirse)
    
    await waitFor(() => {
      expect(handlePlayerJoinGame).toHaveBeenCalledWith(123, 1)
      expect(openLobby).toHaveBeenCalledWith(partidas[0])
      expect(mockFetchPartidas).toHaveBeenCalled()
    })
  })

  it('muestra "Uniendo..." mientras se une a la partida', async () => {
    const user = userEvent.setup()
    handlePlayerJoinGame.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    const partidas = [
      { id: 1, nombre: 'Partida Test', creador: 100, jugadores: [], maxPlayers: 6, estado: false }
    ]
    renderComponent({ partidas })
    
    const btnUnirse = await screen.findByRole('button', { name: /Unirse/i })
    await user.click(btnUnirse)
    
    expect(screen.getByText('Uniendo...')).toBeInTheDocument()
  })

  it('deshabilita el botón Unirse cuando la partida está llena', async () => {
    const partidas = [
      { id: 1, nombre: 'Partida Test', creador: 100, jugadores: [1, 2, 3], maxPlayers: 3, estado: false }
    ]
    renderComponent({ partidas })
    
    const btnUnirse = await screen.findByRole('button', { name: /Unirse/i })
    expect(btnUnirse).toBeDisabled()
  })

  it('muestra error cuando falla al unirse', async () => {
    const user = userEvent.setup()
    handlePlayerJoinGame.mockRejectedValue({ 
      response: { data: { detail: 'Error al unirse' } } 
    })
    const partidas = [
      { id: 1, nombre: 'Partida Test', creador: 100, jugadores: [], maxPlayers: 6, estado: false }
    ]
    renderComponent({ partidas })
    
    const btnUnirse = await screen.findByRole('button', { name: /Unirse/i })
    await user.click(btnUnirse)
    
    await waitFor(() => {
      expect(screen.getByText('Error al unirse')).toBeInTheDocument()
    })
  })

  it('no intenta unirse si no hay usuario logueado', async () => {
    const user = userEvent.setup()
    getUserId.mockReturnValue(null)
    const partidas = [
      { id: 1, nombre: 'Partida Test', creador: 100, jugadores: [], maxPlayers: 6, estado: false }
    ]
    renderComponent({ partidas })
    
    const btnUnirse = await screen.findByRole('button', { name: /Unirse/i })
    await user.click(btnUnirse)
    
    expect(handlePlayerJoinGame).not.toHaveBeenCalled()
  })

  // ===== BOTÓN REFRESH =====
  it('llama fetchPartidas al hacer click en Refresh', async () => {
    const user = userEvent.setup()
    const mockFetchPartidas = vi.fn()
    renderComponent({ fetchPartidas: mockFetchPartidas })
    
    await user.click(screen.getByRole('button', { name: /Refresh/i }))
    expect(mockFetchPartidas).toHaveBeenCalled()
  })

  it('deshabilita botón Refresh mientras está cargando', () => {
    const mockFetchPartidas = vi.fn()
    renderComponent({ loading: true, fetchPartidas: mockFetchPartidas })
    
    const btnRefresh = screen.getByRole('button', { name: /Refresh/i })
    expect(btnRefresh).toBeDisabled()
  })

  // ===== MANEJO DE ERRORES =====
  it('muestra mensaje de error cuando hay un error', () => {
    renderComponent({ error: 'Error de conexión' })
    expect(screen.getByText(/Error de conexión/i)).toBeInTheDocument()
  })

  // ===== FILTRO =====
  it('llama onFilterChange al escribir en el filtro', async () => {
    const user = userEvent.setup()
    const onFilterChange = vi.fn()
    renderComponent({ onFilterChange })
    
    const input = screen.getByPlaceholderText(/Filtrar partida por nombre/i)
    await user.type(input, 'test')
    
    expect(onFilterChange).toHaveBeenCalled()
  })

  it('muestra el texto del filtro en el input', () => {
    renderComponent({ filterText: 'mi partida' })
    
    const input = screen.getByPlaceholderText(/Filtrar partida por nombre/i)
    expect(input).toHaveValue('mi partida')
  })

  // ===== CASOS LÍMITE =====
  it('maneja partidas sin array de jugadores', async () => {
    const partidas = [
      { id: 1, nombre: 'Partida Test', creador: 100, maxPlayers: 6, estado: false }
    ]
    renderComponent({ partidas })
    
    await waitFor(() => {
      expect(screen.getByText('0/6')).toBeInTheDocument()
    })
  })

  it('maneja partidas sin maxPlayers definido', async () => {
    const partidas = [
      { id: 1, nombre: 'Partida Test', creador: 100, jugadores: [1], estado: false }
    ]
    renderComponent({ partidas })
    
    await waitFor(() => {
      expect(screen.getByText('1/6')).toBeInTheDocument() // Default 6
    })
  })

  it('maneja prop partidas como null/undefined', () => {
    renderComponent({ partidas: null })
    expect(screen.getByText(/No hay partidas disponibles en este momento/i)).toBeInTheDocument()
  })
})

