import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HomeContainer from '../../container/HomeContainer'

// Mock del hook useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('HomeContainer Integration Tests', () => {
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

  it('renderiza el título y botones correctamente', () => {
    renderWithRouter(<HomeContainer />)
    
    // Verificar título principal
    expect(screen.getByText("Agatha Christie's - Death on the Cards")).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    
    // Verificar botones
    expect(screen.getByRole('button', { name: 'Crear Partida' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unirse a Partida' })).toBeInTheDocument()
  })

  it('navega a crear partida cuando se hace clic en el botón', async () => {
    const user = userEvent.setup()
    renderWithRouter(<HomeContainer />)
    
    const crearPartidaButton = screen.getByRole('button', { name: 'Crear Partida' })
    await user.click(crearPartidaButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/crear-partida')
    expect(mockNavigate).toHaveBeenCalledTimes(1)
  })

  it('navega a listar partidas cuando se hace clic en el botón', async () => {
    const user = userEvent.setup()
    renderWithRouter(<HomeContainer />)
    
    const unirsePartidaButton = screen.getByRole('button', { name: 'Unirse a Partida' })
    await user.click(unirsePartidaButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/listar-partidas')
    expect(mockNavigate).toHaveBeenCalledTimes(1)
  })

  it('integra correctamente los componentes Title y Button', () => {
    renderWithRouter(<HomeContainer />)
    
    // Verificar que los componentes renderizados tienen las propiedades correctas
    const titleElement = screen.getByText("Agatha Christie's - Death on the Cards")
    expect(titleElement).toBeInTheDocument()
    
    // Verificar que los botones son clicables
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
    
    buttons.forEach(button => {
      expect(button).toBeEnabled()
    })
  })

  it('aplica las clases CSS correctas', () => {
    const { container } = renderWithRouter(<HomeContainer />)
    
    // Verificar que existe el contenedor con la clase correcta
    const homeContainer = container.querySelector('.home-container')
    expect(homeContainer).toBeInTheDocument()
    
    // Verificar el subtítulo
    const subtitle = container.querySelector('.subtitle-home')
    expect(subtitle).toBeInTheDocument()
    expect(subtitle).toHaveTextContent('Home')
  })
})