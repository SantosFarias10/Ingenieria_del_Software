import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CrearJugadorContainer from '../../container/CrearJugadorContainer'

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
  createPlayer: vi.fn()
}))

vi.mock('../../service/LocalStorage', () => ({
  saveUser: vi.fn()
}))

vi.mock('../../service/playerService', () => ({
  getAvatars: vi.fn()
}))

// Importar después de los mocks
import { createPlayer } from '../../service/HttpService'
import { saveUser } from '../../service/LocalStorage'
import { getAvatars } from '../../service/playerService'

describe('CrearJugadorContainer Integration Tests', () => {
  const mockAvatars = [
    { value: 'avatar1', src: '/assets/Avatares/avatar1.jpg', alt: 'Avatar 1' },
    { value: 'avatar2', src: '/assets/Avatares/avatar2.jpg', alt: 'Avatar 2' },
    { value: 'avatar3', src: '/assets/Avatares/avatar3.png', alt: 'Avatar 3' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    getAvatars.mockReturnValue(mockAvatars)
  })

  const renderWithRouter = (component) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    )
  }

  it('renderiza todos los elementos del formulario correctamente', () => {
    renderWithRouter(<CrearJugadorContainer />)
    
    // Verificar título
    expect(screen.getByText("Agatha Christie's - Death on the Cards")).toBeInTheDocument()
    expect(screen.getByText('Crear Jugador')).toBeInTheDocument()
    
    // Verificar elementos del formulario
    expect(screen.getByText('Ingresar Nombre del Jugador')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('Ingrese su Fecha de Nacimiento')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Fecha de Nacimiento')).toBeInTheDocument()
    expect(screen.getByText('Seleccione un Avatar')).toBeInTheDocument()
    
    // Verificar avatares
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons).toHaveLength(3)
    
    // Verificar botón crear
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument()
  })

  it('valida que el nombre sea obligatorio', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CrearJugadorContainer />)
    
    const submitButton = screen.getByRole('button', { name: 'Crear' })
    await user.click(submitButton)
    
    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(createPlayer).not.toHaveBeenCalled()
  })

  it('valida que la fecha de nacimiento sea obligatoria', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CrearJugadorContainer />)
    
    const nameInput = screen.getByPlaceholderText('Nombre')
    await user.type(nameInput, 'Juan Perez')
    
    const submitButton = screen.getByRole('button', { name: 'Crear' })
    await user.click(submitButton)
    
    expect(screen.getByText('La fecha de nacimiento es obligatoria')).toBeInTheDocument()
    expect(createPlayer).not.toHaveBeenCalled()
  })

  it('valida que el usuario tenga al menos 13 años', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CrearJugadorContainer />)
    
    const nameInput = screen.getByPlaceholderText('Nombre')
    const dateInput = screen.getByPlaceholderText('Fecha de Nacimiento')
    
    // Fecha que hace al usuario menor de 13 años
    const recentDate = new Date()
    recentDate.setFullYear(recentDate.getFullYear() - 10)
    const dateString = recentDate.toISOString().split('T')[0]
    
    await user.type(nameInput, 'Juan Niño')
    await user.type(dateInput, dateString)
    
    const submitButton = screen.getByRole('button', { name: 'Crear' })
    await user.click(submitButton)
    
    expect(screen.getByText('Debes tener al menos 13 años para crear un jugador')).toBeInTheDocument()
    expect(createPlayer).not.toHaveBeenCalled()
  })

  it('valida que se seleccione un avatar', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CrearJugadorContainer />)
    
    const nameInput = screen.getByPlaceholderText('Nombre')
    const dateInput = screen.getByPlaceholderText('Fecha de Nacimiento')
    
    // Fecha válida (25 años)
    const validDate = new Date()
    validDate.setFullYear(validDate.getFullYear() - 25)
    const dateString = validDate.toISOString().split('T')[0]
    
    await user.type(nameInput, 'Juan Adulto')
    await user.type(dateInput, dateString)
    
    const submitButton = screen.getByRole('button', { name: 'Crear' })
    await user.click(submitButton)
    
    expect(screen.getByText('Selecciona un avatar')).toBeInTheDocument()
    expect(createPlayer).not.toHaveBeenCalled()
  })

  it('crea un jugador exitosamente con datos válidos', async () => {
    const user = userEvent.setup()
    createPlayer.mockResolvedValue({ id: 123, name: 'Juan Valido', avatar: 'avatar1' })
    
    renderWithRouter(<CrearJugadorContainer />)
    
    const nameInput = screen.getByPlaceholderText('Nombre')
    const dateInput = screen.getByPlaceholderText('Fecha de Nacimiento')
    
    // Fecha válida (25 años)
    const validDate = new Date()
    validDate.setFullYear(validDate.getFullYear() - 25)
    const dateString = validDate.toISOString().split('T')[0]
    
    await user.type(nameInput, 'Juan Valido')
    await user.type(dateInput, dateString)
    
    // Seleccionar avatar
    const firstAvatar = screen.getByDisplayValue('avatar1')
    await user.click(firstAvatar)
    
    const submitButton = screen.getByRole('button', { name: 'Crear' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(createPlayer).toHaveBeenCalledWith({
        name: 'Juan Valido',
        birthdate: dateString,
        avatar: 'avatar1'
      })
    })
    
    expect(saveUser).toHaveBeenCalledWith({
      id: 123,
      nombre: 'Juan Valido',
      avatar: 'avatar1'
    })
    
    expect(mockNavigate).toHaveBeenCalledWith('/home')
  })

  it('maneja errores al crear el jugador', async () => {
    const user = userEvent.setup()
    createPlayer.mockRejectedValue(new Error('Error del servidor'))
    
    renderWithRouter(<CrearJugadorContainer />)
    
    const nameInput = screen.getByPlaceholderText('Nombre')
    const dateInput = screen.getByPlaceholderText('Fecha de Nacimiento')
    
    const validDate = new Date()
    validDate.setFullYear(validDate.getFullYear() - 25)
    const dateString = validDate.toISOString().split('T')[0]
    
    await user.type(nameInput, 'Juan Error')
    await user.type(dateInput, dateString)
    
    const firstAvatar = screen.getByDisplayValue('avatar1')
    await user.click(firstAvatar)
    
    const submitButton = screen.getByRole('button', { name: 'Crear' })
    
    // El componente debería mostrar mensaje de error del servidor
    // y no debería navegar
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(createPlayer).toHaveBeenCalled()
    })
    
    // Debería mostrar error y no navegar
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
    
    // No debería navegar si hubo error
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('actualiza el estado cuando se cambia el nombre', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CrearJugadorContainer />)
    
    const nameInput = screen.getByPlaceholderText('Nombre')
    
    await user.type(nameInput, 'Mi Nombre')
    
    expect(nameInput).toHaveValue('Mi Nombre')
  })

  it('actualiza el estado cuando se cambia la fecha', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CrearJugadorContainer />)
    
    const dateInput = screen.getByPlaceholderText('Fecha de Nacimiento')
    const testDate = '1990-05-15'
    
    await user.type(dateInput, testDate)
    
    expect(dateInput).toHaveValue(testDate)
  })

  it('permite seleccionar diferentes avatares', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CrearJugadorContainer />)
    
    const avatar1 = screen.getByDisplayValue('avatar1')
    const avatar2 = screen.getByDisplayValue('avatar2')
    
    // Seleccionar primer avatar
    await user.click(avatar1)
    expect(avatar1).toBeChecked()
    expect(avatar2).not.toBeChecked()
    
    // Cambiar al segundo avatar
    await user.click(avatar2)
    expect(avatar1).not.toBeChecked()
    expect(avatar2).toBeChecked()
  })

  it('valida fechas muy antiguas', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CrearJugadorContainer />)
    
    const nameInput = screen.getByPlaceholderText('Nombre')
    const dateInput = screen.getByPlaceholderText('Fecha de Nacimiento')
    
    await user.type(nameInput, 'Juan Antiguo')
    await user.type(dateInput, '1899-01-01')
    
    const submitButton = screen.getByRole('button', { name: 'Crear' })
    await user.click(submitButton)
    
    expect(screen.getByText('La fecha de nacimiento no puede ser anterior a 1900')).toBeInTheDocument()
    expect(createPlayer).not.toHaveBeenCalled()
  })
})