import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// Mock object to capture WebSocket listeners - MUST be outside and shared
const mockWSListeners = {}

// Mocks
vi.mock('../../../service/LocalStorage', () => ({ 
  saveGame: vi.fn(), 
  clearGame: vi.fn(), 
  getGameId: vi.fn(() => null), 
  getUserId: vi.fn(() => 123), 
  getGame: vi.fn(() => null) 
}))

vi.mock('../../../service/HttpService', () => ({ 
  fetchPlayersInGame: vi.fn(() => Promise.resolve([])), 
  leaveGame: vi.fn(() => Promise.resolve({ message: 'ok' })),
  getGameDetails: vi.fn(() => Promise.resolve({ estado: true })),
  startGame: vi.fn(() => Promise.resolve({ estado: true }))
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { 
    ...actual, 
    useNavigate: vi.fn(),
    MemoryRouter: actual.MemoryRouter 
  }
})

vi.mock('../../../service/WSService', () => ({
  createWSService: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn((event, handler) => {
      // Use the global mockWSListeners object
      mockWSListeners[event] = handler
    }),
    off: vi.fn(),
    send: vi.fn()
  }))
}))

vi.mock('../../../components/BetterModal', () => ({
  default: ({ isOpen, onClose, players, roomName, minPlayers, maxPlayers, onStart, creador }) => (
    isOpen ? (
      <div role="dialog" data-testid="better-modal">
        <h2>{roomName}</h2>
        <div data-testid="players-count">{players.length} jugadores</div>
        <div data-testid="min-players">{minPlayers}</div>
        <div data-testid="max-players">{maxPlayers}</div>
        <div data-testid="creador">{creador}</div>
        <button onClick={onClose}>Cerrar</button>
        <button onClick={onStart} data-testid="btn-start">Iniciar Partida</button>
      </div>
    ) : null
  )
}))

import LobbyContainer, { openLobby, closeLobby, WS } from '../../../container/LobbyContainer'
import { leaveGame, fetchPlayersInGame, startGame } from '../../../service/HttpService'
import { saveGame, clearGame, getUserId, getGame } from '../../../service/LocalStorage'
import { useNavigate } from 'react-router-dom'

describe('LobbyContainer', () => {
  let mockNavigate

  beforeEach(() => {
    vi.clearAllMocks()
    getUserId.mockReturnValue(123)
    
    // Limpiar listeners mock
    Object.keys(mockWSListeners).forEach(key => delete mockWSListeners[key])
    
    // Resetear navigate mock
    mockNavigate = vi.fn()
    useNavigate.mockReturnValue(mockNavigate)
  })

  // ===== RENDERIZADO INICIAL =====
  it('renderiza sin modal abierto inicialmente', () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // ===== ABRIR LOBBY =====
  it('abre el lobby con datos válidos', async () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Partida Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Partida Test')).toBeInTheDocument()
  })

  it('guarda la partida en localStorage al abrir', async () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Partida Test', max_jugadores: 6, min_jugadores: 2 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    expect(saveGame).toHaveBeenCalledWith(expect.objectContaining({
      id: 999,
      nombre_partida: 'Partida Test'
    }))
  })

  it('conecta el WebSocket al abrir el lobby', async () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    expect(WS.connect).toHaveBeenCalledWith(999)
  })

  it('carga jugadores al abrir el lobby', async () => {
    fetchPlayersInGame.mockResolvedValue([
      { id: 1, nombre: 'Jugador 1' },
      { id: 2, nombre: 'Jugador 2' }
    ])
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    expect(fetchPlayersInGame).toHaveBeenCalledWith(999)
    await waitFor(() => {
      expect(screen.getByTestId('players-count')).toHaveTextContent('2 jugadores')
    })
  })

  it('usa valores por defecto para min y max jugadores', async () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test' })
      await new Promise(r => setTimeout(r, 50))
    })
    
    expect(screen.getByTestId('min-players')).toHaveTextContent('2')
    expect(screen.getByTestId('max-players')).toHaveTextContent('6')
  })

  it('openLobby sin datos no crashea', () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    expect(() => openLobby(null)).not.toThrow()
    expect(() => openLobby({})).not.toThrow()
  })

  it('openLobby sin id no abre el modal', async () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ nombre: 'Test' })
      await new Promise(r => setTimeout(r, 50))
    })
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // ===== CERRAR LOBBY =====
  it('cierra el lobby correctamente', async () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 4 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    
    await act(async () => {
      closeLobby()
      await new Promise(r => setTimeout(r, 50))
    })
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('llama a leaveGame al cerrar', async () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 4 })
      await new Promise(r => setTimeout(r, 50))
      closeLobby()
      await new Promise(r => setTimeout(r, 50))
    })
    
    expect(leaveGame).toHaveBeenCalledWith(123)
  })

  it('limpia el localStorage al cerrar', async () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 4 })
      await new Promise(r => setTimeout(r, 50))
      closeLobby()
      await new Promise(r => setTimeout(r, 50))
    })
    
    expect(clearGame).toHaveBeenCalled()
  })

  // ===== MANEJO DE JUGADORES =====
  it('maneja respuesta de jugadores como array', async () => {
    const jugadores = [
      { id: 1, nombre: 'Player 1' },
      { id: 2, nombre: 'Player 2' }
    ]
    fetchPlayersInGame.mockResolvedValue(jugadores)
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('players-count')).toHaveTextContent('2 jugadores')
    })
  })

  it('maneja respuesta de jugadores como objeto con propiedad jugadores', async () => {
    const response = {
      jugadores: [
        { id: 1, nombre: 'Player 1' },
        { id: 2, nombre: 'Player 2' }
      ]
    }
    fetchPlayersInGame.mockResolvedValue(response)
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('players-count')).toHaveTextContent('2 jugadores')
    })
  })

  it('maneja error al cargar jugadores', async () => {
    fetchPlayersInGame.mockRejectedValue(new Error('Network error'))
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    // El componente debe seguir funcionando aunque falle la carga de jugadores
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  // ===== INICIAR PARTIDA =====
  it('llama a startGame al hacer click en Iniciar Partida', async () => {
    const user = userEvent.setup()
    startGame.mockResolvedValue({ estado: true })
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    const btnStart = screen.getByTestId('btn-start')
    await user.click(btnStart)
    
    await waitFor(() => {
      expect(startGame).toHaveBeenCalledWith(999)
    })
  })

  // ===== WEBSOCKET LISTENERS =====
  it('registra listeners de WebSocket al abrir', async () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    // Wait for useEffect to register listeners
    await waitFor(() => {
      expect(WS.on).toHaveBeenCalledWith('player_joined', expect.any(Function))
    })
    
    expect(WS.on).toHaveBeenCalledWith('player_left', expect.any(Function))
    expect(WS.on).toHaveBeenCalledWith('players_update', expect.any(Function))
    expect(WS.on).toHaveBeenCalledWith('game_started', expect.any(Function))
  })

  it('elimina listeners de WebSocket al cerrar', async () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 100))
    })
    
    // Wait for listeners to be registered first
    await waitFor(() => {
      expect(WS.on).toHaveBeenCalledWith('player_joined', expect.any(Function))
    })
    
    await act(async () => {
      closeLobby()
      await new Promise(r => setTimeout(r, 100))
    })
    
    // Wait for cleanup
    await waitFor(() => {
      expect(WS.off).toHaveBeenCalledWith('player_joined', expect.any(Function))
    })
    
    expect(WS.off).toHaveBeenCalledWith('player_left', expect.any(Function))
    expect(WS.off).toHaveBeenCalledWith('players_update', expect.any(Function))
    expect(WS.off).toHaveBeenCalledWith('game_started', expect.any(Function))
  })

  // ===== CASOS LÍMITE =====
  it('maneja múltiples aperturas consecutivas', async () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 111, nombre: 'Partida 1', max_jugadores: 4 })
      await new Promise(r => setTimeout(r, 30))
      openLobby({ id: 222, nombre: 'Partida 2', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 30))
    })
    
    // Debería mostrar la última partida abierta
    expect(screen.getByText('Partida 2')).toBeInTheDocument()
  })

  it('usa datos de localStorage si están disponibles', async () => {
    getGame.mockReturnValue({
      id: 888,
      nombre_partida: 'Saved Game',
      min_jugadores: 3,
      max_jugadores: 5
    })
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'New Game' })
      await new Promise(r => setTimeout(r, 50))
    })
    
    // Debería usar los valores del gameData, no del localStorage para esta partida
    expect(screen.getByText('New Game')).toBeInTheDocument()
  })

  it('maneja error al guardar en localStorage', async () => {
    saveGame.mockImplementation(() => {
      throw new Error('Storage error')
    })
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      expect(() => {
        openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      }).not.toThrow()
      await new Promise(r => setTimeout(r, 50))
    })
    
    // El modal debería abrirse a pesar del error
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('maneja error al conectar WebSocket', async () => {
    WS.connect.mockImplementation(() => {
      throw new Error('WS error')
    })
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      expect(() => {
        openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      }).not.toThrow()
      await new Promise(r => setTimeout(r, 50))
    })
    
    // El modal debería abrirse a pesar del error de WS
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('muestra el nombre del creador si está disponible', async () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6, creador: 456 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    expect(screen.getByTestId('creador')).toHaveTextContent('456')
  })

  // ===== WEBSOCKET HANDLERS - PLAYER_JOINED =====
  it('agrega jugador cuando recibe player_joined', async () => {
    fetchPlayersInGame.mockResolvedValue([
      { id: 1, nombre: 'Player 1' }
    ])
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('players-count')).toHaveTextContent('1 jugadores')
    })
    
    // Simular que un nuevo jugador se une
    await act(async () => {
      if (mockWSListeners.player_joined) {
        mockWSListeners.player_joined({
          partidaId: 999,
          jugador: { id: 2, nombre: 'Player 2' }
        })
      }
      await new Promise(r => setTimeout(r, 50))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('players-count')).toHaveTextContent('2 jugadores')
    })
  })

  it('no agrega jugador duplicado en player_joined', async () => {
    fetchPlayersInGame.mockResolvedValue([
      { id: 1, nombre: 'Player 1' }
    ])
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    // Intentar agregar el mismo jugador dos veces
    await act(async () => {
      if (mockWSListeners.player_joined) {
        mockWSListeners.player_joined({
          partidaId: 999,
          jugador: { id: 1, nombre: 'Player 1' }
        })
      }
      await new Promise(r => setTimeout(r, 50))
    })
    
    // Debe seguir teniendo solo 1 jugador
    expect(screen.getByTestId('players-count')).toHaveTextContent('1 jugadores')
  })

  it('ignora player_joined de otra partida', async () => {
    fetchPlayersInGame.mockResolvedValue([
      { id: 1, nombre: 'Player 1' }
    ])
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    // Evento de otra partida
    await act(async () => {
      if (mockWSListeners.player_joined) {
        mockWSListeners.player_joined({
          partidaId: 888,
          jugador: { id: 2, nombre: 'Player 2' }
        })
      }
      await new Promise(r => setTimeout(r, 50))
    })
    
    // No debe cambiar
    expect(screen.getByTestId('players-count')).toHaveTextContent('1 jugadores')
  })

  // ===== WEBSOCKET HANDLERS - PLAYER_LEFT =====
  it('elimina jugador cuando recibe player_left', async () => {
    fetchPlayersInGame.mockResolvedValue([
      { id: 1, nombre: 'Player 1' },
      { id: 2, nombre: 'Player 2' }
    ])
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('players-count')).toHaveTextContent('2 jugadores')
    })
    
    // Jugador abandona
    await act(async () => {
      if (mockWSListeners.player_left) {
        mockWSListeners.player_left({
          partidaId: 999,
          jugadorId: 2
        })
      }
      await new Promise(r => setTimeout(r, 50))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('players-count')).toHaveTextContent('1 jugadores')
    })
  })

  it('ignora player_left de otra partida', async () => {
    fetchPlayersInGame.mockResolvedValue([
      { id: 1, nombre: 'Player 1' },
      { id: 2, nombre: 'Player 2' }
    ])
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    // Evento de otra partida
    await act(async () => {
      if (mockWSListeners.player_left) {
        mockWSListeners.player_left({
          partidaId: 888,
          jugadorId: 2
        })
      }
      await new Promise(r => setTimeout(r, 50))
    })
    
    // No debe cambiar
    expect(screen.getByTestId('players-count')).toHaveTextContent('2 jugadores')
  })

  // ===== WEBSOCKET HANDLERS - PLAYERS_UPDATE =====
  it('actualiza lista completa con players_update (array directo)', async () => {
    fetchPlayersInGame.mockResolvedValue([])
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    const jugadores = [
      { id: 1, nombre: 'Player 1' },
      { id: 2, nombre: 'Player 2' },
      { id: 3, nombre: 'Player 3' }
    ]
    
    await act(async () => {
      if (mockWSListeners.players_update) {
        mockWSListeners.players_update(jugadores)
      }
      await new Promise(r => setTimeout(r, 50))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('players-count')).toHaveTextContent('3 jugadores')
    })
  })

  it('actualiza lista completa con players_update (objeto con jugadores)', async () => {
    fetchPlayersInGame.mockResolvedValue([])
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    await act(async () => {
      if (mockWSListeners.players_update) {
        mockWSListeners.players_update({
          partidaId: 999,
          jugadores: [
            { id: 1, nombre: 'Player 1' },
            { id: 2, nombre: 'Player 2' }
          ]
        })
      }
      await new Promise(r => setTimeout(r, 50))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('players-count')).toHaveTextContent('2 jugadores')
    })
  })

  it('cierra lobby y navega cuando players_update está vacío (partida eliminada)', async () => {
    fetchPlayersInGame.mockResolvedValue([
      { id: 1, nombre: 'Player 1' }
    ])
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    // Wait for listeners to be registered
    await waitFor(() => {
      expect(mockWSListeners.players_update).toBeDefined()
    })
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    
    // Simular partida eliminada
    await act(async () => {
      if (mockWSListeners.players_update) {
        mockWSListeners.players_update([])
      }
      await new Promise(r => setTimeout(r, 50))
    })
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    
    expect(WS.disconnect).toHaveBeenCalled()
    expect(clearGame).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/listar-partidas')
  })

  it('ignora players_update sin jugadores definidos', async () => {
    fetchPlayersInGame.mockResolvedValue([
      { id: 1, nombre: 'Player 1' }
    ])
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    await act(async () => {
      if (mockWSListeners.players_update) {
        mockWSListeners.players_update({ partidaId: 999 }) // Sin jugadores
      }
      await new Promise(r => setTimeout(r, 50))
    })
    
    // Debe mantener la lista original
    expect(screen.getByTestId('players-count')).toHaveTextContent('1 jugadores')
  })

  // ===== WEBSOCKET HANDLERS - GAME_STARTED =====
  it('navega a /partida cuando recibe game_started', async () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    // Wait for listeners to be registered
    await waitFor(() => {
      expect(mockWSListeners.game_started).toBeDefined()
    })
    
    await act(async () => {
      if (mockWSListeners.game_started) {
        mockWSListeners.game_started({
          partidaId: 999,
          partidaIniciada: true
        })
      }
      await new Promise(r => setTimeout(r, 50))
    })
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/partida')
    })
  })

  it('ignora game_started con partidaIniciada false', async () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    await act(async () => {
      if (mockWSListeners.game_started) {
        mockWSListeners.game_started({
          partidaId: 999,
          partidaIniciada: false
        })
      }
      await new Promise(r => setTimeout(r, 100))
    })
    
    // No debe navegar
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('ignora game_started de otra partida', async () => {
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    await act(async () => {
      if (mockWSListeners.game_started) {
        mockWSListeners.game_started({
          partidaId: 888,
          partidaIniciada: true
        })
      }
      await new Promise(r => setTimeout(r, 50))
    })
    
    // No debe navegar
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  // ===== MANEJO DE ERRORES EN HANDLERS =====
  it('maneja error en closegame al cerrar lobby', async () => {
    leaveGame.mockRejectedValue(new Error('Leave game error'))
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    await act(async () => {
      expect(async () => {
        closeLobby()
        await new Promise(r => setTimeout(r, 50))
      }).not.toThrow()
    })
    
    // Debe limpiar localStorage de todos modos
    expect(clearGame).toHaveBeenCalled()
  })

  it('maneja error en clearGame al cerrar lobby', async () => {
    clearGame.mockImplementation(() => {
      throw new Error('Clear error')
    })
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
      expect(() => closeLobby()).not.toThrow()
      await new Promise(r => setTimeout(r, 50))
    })
    
    // No debe lanzar error
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('maneja startGame que retorna estado !== true', async () => {
    startGame.mockResolvedValue({ estado: false, error: 'No enough players' })
    const user = userEvent.setup()
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    const btnStart = screen.getByTestId('btn-start')
    await user.click(btnStart)
    
    await waitFor(() => {
      expect(startGame).toHaveBeenCalled()
    })
    
    // No debería navegar si estado !== true
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('maneja error en startGame', async () => {
    startGame.mockRejectedValue(new Error('Start game error'))
    const user = userEvent.setup()
    
    render(<MemoryRouter><LobbyContainer /></MemoryRouter>)
    
    await act(async () => {
      openLobby({ id: 999, nombre: 'Test', max_jugadores: 6 })
      await new Promise(r => setTimeout(r, 50))
    })
    
    const btnStart = screen.getByTestId('btn-start')
    
    await act(async () => {
      await user.click(btnStart)
      await new Promise(r => setTimeout(r, 50))
    })
    
    // No debe lanzar error
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
