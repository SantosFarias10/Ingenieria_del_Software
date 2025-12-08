import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CrearPartidaContainer from '../../container/CrearPartidaContainer'

// Mock de los servicios
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('../../service/HttpService', () => ({
  createGame: vi.fn()
}))

vi.mock('../../service/LocalStorage', () => ({
  saveGame: vi.fn()
}))

vi.mock('../../container/LobbyContainer', () => ({
  openLobby: vi.fn()
}))

// Importar después de los mocks
import { createGame } from '../../service/HttpService'
import { saveGame } from '../../service/LocalStorage'
import { openLobby } from '../../container/LobbyContainer'

describe('CrearPartidaContainer Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithRouter = (component) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    )
  }

  it('renderiza todos los elementos del formulario correctamente', () => {
    renderWithRouter(<CrearPartidaContainer />)
    
    // Verificar título
    expect(screen.getByRole('heading', { level: 1, name: 'Crear Partida' })).toBeInTheDocument()
    expect(screen.getByText('Configura los detalles de tu nueva partida')).toBeInTheDocument()
    
    // Verificar elementos del formulario
    expect(screen.getByText('Nombre de la Partida')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre de la Partida')).toBeInTheDocument()
    expect(screen.getByText('Número Mínimo de Jugadores')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Mínimo de Jugadores')).toBeInTheDocument()
    expect(screen.getByText('Número Máximo de Jugadores')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Máximo de Jugadores')).toBeInTheDocument()
    
    // Verificar botones
    expect(screen.getByRole('button', { name: 'Crear Partida' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument()
  })

  it('valida que el nombre de la partida sea obligatorio', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CrearPartidaContainer />)
    
    const submitButton = screen.getByRole('button', { name: 'Crear Partida' })
    await user.click(submitButton)
    
    expect(screen.getByText('El nombre de la partida es obligatorio')).toBeInTheDocument()
    expect(createGame).not.toHaveBeenCalled()
  })

  it('valida que el maxLength previene nombres largos en HTML', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CrearPartidaContainer />)
    
    const nameInput = screen.getByPlaceholderText('Nombre de la Partida')
    const longName = 'a'.repeat(60) // 60 caracteres
    
    await user.type(nameInput, longName)
    
    // El input con maxLength="50" debería truncar automáticamente a 50 caracteres
    expect(nameInput.value).toHaveLength(50)
    expect(nameInput.value).toBe('a'.repeat(50))
  })

  it('valida el número mínimo de jugadores', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CrearPartidaContainer />)
    
    const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
    
    await user.clear(minPlayersInput)
    await user.type(minPlayersInput, '1')
    
    expect(screen.getByText('El número mínimo de jugadores debe ser al menos 2')).toBeInTheDocument()
  })

  it('valida el número máximo de jugadores', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CrearPartidaContainer />)
    
    const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
    
    await user.clear(maxPlayersInput)
    await user.type(maxPlayersInput, '7')
    
    expect(screen.getByText('El número máximo de jugadores es 6')).toBeInTheDocument()
  })

  it('valida que el mínimo no sea mayor al máximo', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CrearPartidaContainer />)
    
    const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
    const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
    
    // Primero establecer un máximo bajo
    await user.clear(maxPlayersInput)
    await user.type(maxPlayersInput, '3')
    
    // Luego intentar establecer un mínimo mayor
    await user.clear(minPlayersInput)
    await user.type(minPlayersInput, '5')
    
    // El componente debería auto-corregir el máximo a 5
    expect(maxPlayersInput).toHaveValue(5)
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
  })

  it('crea una partida exitosamente con datos válidos', async () => {
    const user = userEvent.setup()
    createGame.mockResolvedValue({ id: 123, nombre: 'Mi Partida Test' })
    
    renderWithRouter(<CrearPartidaContainer />)
    
    const nameInput = screen.getByPlaceholderText('Nombre de la Partida')
    const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
    const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
    
    await user.type(nameInput, 'Mi Partida Test')
    await user.clear(minPlayersInput)
    await user.type(minPlayersInput, '2')
    await user.clear(maxPlayersInput)
    await user.type(maxPlayersInput, '4')
    
    const submitButton = screen.getByRole('button', { name: 'Crear Partida' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(createGame).toHaveBeenCalledWith({
        gameName: 'Mi Partida Test',
        minPlayers: 2,
        maxPlayers: 4
      })
    })
    
    expect(saveGame).toHaveBeenCalledWith({
      id: 123,
      nombre_partida: 'Mi Partida Test',
      max_jugadores: 4,
      min_jugadores: 2
    })
    
    expect(openLobby).toHaveBeenCalledWith({
      id: 123,
      name: 'Mi Partida Test',
      minPlayers: 2,
      maxPlayers: 4
    })
  })

  it('maneja errores al crear la partida', async () => {
    const user = userEvent.setup()
    createGame.mockRejectedValue(new Error('Error del servidor'))
    
    renderWithRouter(<CrearPartidaContainer />)
    
    const nameInput = screen.getByPlaceholderText('Nombre de la Partida')
    await user.type(nameInput, 'Mi Partida Test')
    
    const submitButton = screen.getByRole('button', { name: 'Crear Partida' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Ocurrió un error al crear la partida. Intenta nuevamente.')).toBeInTheDocument()
    })
  })

  it('navega de vuelta a home cuando se hace clic en Volver', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CrearPartidaContainer />)
    
    const volverButton = screen.getByRole('button', { name: 'Volver' })
    await user.click(volverButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/home')
  })

  it('limpia los espacios en blanco del nombre antes de validar', async () => {
    const user = userEvent.setup()
    createGame.mockResolvedValue({ id: 456, nombre: 'Partida Limpia' })
    
    renderWithRouter(<CrearPartidaContainer />)
    
    const nameInput = screen.getByPlaceholderText('Nombre de la Partida')
    await user.type(nameInput, '  Partida Limpia  ')
    
    const submitButton = screen.getByRole('button', { name: 'Crear Partida' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(createGame).toHaveBeenCalledWith({
        gameName: 'Partida Limpia',
        minPlayers: 2,
        maxPlayers: 6
      })
    })
  })

  it('actualiza correctamente los valores cuando cambia el número de jugadores', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CrearPartidaContainer />)
    
    const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
    const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
    
    // Los valores iniciales deberían ser 2 y 6
    expect(minPlayersInput).toHaveValue(2)
    expect(maxPlayersInput).toHaveValue(6)
    
    await user.clear(minPlayersInput)
    await user.type(minPlayersInput, '3')
    expect(minPlayersInput).toHaveValue(3)
    
    await user.clear(maxPlayersInput)
    await user.type(maxPlayersInput, '5')
    expect(maxPlayersInput).toHaveValue(5)
  })

  it('maneja el error de saveGame pero continúa con la creación de la partida', async () => {
    const user = userEvent.setup()
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    createGame.mockResolvedValue({ id: 789, nombre: 'Test Game' })
    saveGame.mockImplementation(() => {
      throw new Error('LocalStorage is full')
    })

    renderWithRouter(<CrearPartidaContainer />)
    
    const nameInput = screen.getByPlaceholderText('Nombre de la Partida')
    const submitButton = screen.getByRole('button', { name: 'Crear Partida' })
    
    await user.type(nameInput, 'Test Game')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(createGame).toHaveBeenCalled()
      expect(saveGame).toHaveBeenCalled()
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'No se pudo persistir la partida localmente', 
        expect.any(Error)
      )
      // Verifica que openLobby se llama a pesar del error de saveGame
      expect(openLobby).toHaveBeenCalledWith({
        id: 789,
        name: 'Test Game',
        minPlayers: 2,
        maxPlayers: 6
      })
    })
    
    consoleWarnSpy.mockRestore()
  })
})