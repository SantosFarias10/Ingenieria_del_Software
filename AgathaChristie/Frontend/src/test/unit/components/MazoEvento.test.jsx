import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MazoEvento from '../../../components/MazoEvento'

vi.mock('../../../components/Card', () => ({
  default: ({ id, flipped, puedeVoltearse }) => (
    <div data-testid="card-mock" data-id={id} data-flipped={String(flipped)} data-puede-voltear={String(puedeVoltearse)}>
      Card Mock
    </div>
  )
}))

describe('MazoEvento', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===== RENDERIZADO BÁSICO =====
  it('renderiza estructura básica cuando está vacío', () => {
    const { container } = render(<MazoEvento cartaEvento={null} />)
    
    expect(container.querySelector('.mazo-evento-wrapper')).toBeInTheDocument()
    expect(screen.getByText('Carta de Evento')).toBeInTheDocument()
    expect(container.querySelector('.evento-vacio')).toBeInTheDocument()
    expect(screen.getByText('Evento')).toBeInTheDocument()
    expect(screen.queryByTestId('card-mock')).not.toBeInTheDocument()
  })

  it('muestra la carta cuando hay cartaEvento con idFrontend', () => {
    const carta = { idFrontend: 15, idBackend: 100 }
    
    render(<MazoEvento cartaEvento={carta} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-id', '15')
  })

  it('muestra la carta con idFrontend prioritario', () => {
    const carta = { idFrontend: 15, id_front: 16, idBackend: 100, id: 101 }
    
    render(<MazoEvento cartaEvento={carta} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-id', '15')
  })

  it('usa id_front si no hay idFrontend', () => {
    const carta = { id_front: 16, idBackend: 100, id: 101 }
    
    render(<MazoEvento cartaEvento={carta} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-id', '16')
  })

  it('usa idBackend si no hay idFrontend ni id_front', () => {
    const carta = { idBackend: 100, id: 101 }
    
    render(<MazoEvento cartaEvento={carta} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-id', '100')
  })

  it('usa id como último recurso', () => {
    const carta = { id: 101 }
    
    render(<MazoEvento cartaEvento={carta} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-id', '101')
  })

  it('muestra la carta con flipped=true', () => {
    const carta = { idFrontend: 15, idBackend: 100 }
    
    render(<MazoEvento cartaEvento={carta} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-flipped', 'true')
  })

  it('muestra la carta con puedeVoltearse=false', () => {
    const carta = { idFrontend: 15, idBackend: 100 }
    
    render(<MazoEvento cartaEvento={carta} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-puede-voltear', 'false')
  })

  it('NO muestra estado vacío cuando hay carta', () => {
    const carta = { idFrontend: 15, idBackend: 100 }
    
    const { container } = render(<MazoEvento cartaEvento={carta} />)
    
    expect(container.querySelector('.evento-vacio')).not.toBeInTheDocument()
  })

  it('muestra carta-evento wrapper cuando hay carta', () => {
    const carta = { idFrontend: 15, idBackend: 100 }
    
    const { container } = render(<MazoEvento cartaEvento={carta} />)
    
    expect(container.querySelector('.carta-evento')).toBeInTheDocument()
  })

  it('maneja cartaEvento undefined como vacío', () => {
    const { container } = render(<MazoEvento cartaEvento={undefined} />)
    
    expect(container.querySelector('.evento-vacio')).toBeInTheDocument()
  })

  // ===== CLASES CSS Y ESTILOS =====
  it('aplica clase "clickeable" cuando NO está disabled', () => {
    const { container } = render(<MazoEvento cartaEvento={null} disabled={false} />)
    
    expect(container.querySelector('.mazo-evento')).toHaveClass('clickeable')
  })

  it('NO aplica clase "clickeable" cuando está disabled', () => {
    const { container } = render(<MazoEvento cartaEvento={null} disabled={true} />)
    
    expect(container.querySelector('.mazo-evento')).not.toHaveClass('clickeable')
  })

  it('disabled=undefined se trata como no disabled', () => {
    const { container } = render(<MazoEvento cartaEvento={null} />)
    
    expect(container.querySelector('.mazo-evento')).toHaveClass('clickeable')
  })

  // ===== ACCESIBILIDAD =====
  it('tiene role="button" cuando NO está disabled', () => {
    const { container } = render(<MazoEvento cartaEvento={null} disabled={false} />)
    
    expect(container.querySelector('.mazo-evento')).toHaveAttribute('role', 'button')
  })

  it('NO tiene role="button" cuando está disabled', () => {
    const { container } = render(<MazoEvento cartaEvento={null} disabled={true} />)
    
    expect(container.querySelector('.mazo-evento')).not.toHaveAttribute('role')
  })

  it('tiene tabIndex cuando NO está disabled', () => {
    const { container } = render(<MazoEvento cartaEvento={null} disabled={false} />)
    
    expect(container.querySelector('.mazo-evento')).toHaveAttribute('tabIndex', '0')
  })

  it('NO tiene tabIndex cuando está disabled', () => {
    const { container } = render(<MazoEvento cartaEvento={null} disabled={true} />)
    
    expect(container.querySelector('.mazo-evento')).not.toHaveAttribute('tabIndex')
  })

  it('tiene aria-label apropiado cuando NO está disabled', () => {
    const { container } = render(<MazoEvento cartaEvento={null} disabled={false} />)
    
    expect(container.querySelector('.mazo-evento')).toHaveAttribute('aria-label', 'Jugar carta de evento')
  })

  it('NO tiene aria-label cuando está disabled', () => {
    const { container } = render(<MazoEvento cartaEvento={null} disabled={true} />)
    
    expect(container.querySelector('.mazo-evento')).not.toHaveAttribute('aria-label')
  })

  // ===== INTERACCIÓN CON ONCLICK =====
  it('llama onClick cuando se hace click y NO está disabled', async () => {
    const user = userEvent.setup()
    const mockOnClick = vi.fn()
    const { container } = render(<MazoEvento cartaEvento={null} onClick={mockOnClick} disabled={false} />)
    
    const mazo = container.querySelector('.mazo-evento')
    await user.click(mazo)
    
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('NO llama onClick cuando se hace click y está disabled', async () => {
    const user = userEvent.setup()
    const mockOnClick = vi.fn()
    const { container } = render(<MazoEvento cartaEvento={null} onClick={mockOnClick} disabled={true} />)
    
    const mazo = container.querySelector('.mazo-evento')
    await user.click(mazo)
    
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('NO llama onClick si no se proporciona función', async () => {
    const user = userEvent.setup()
    const { container } = render(<MazoEvento cartaEvento={null} disabled={false} />)
    
    const mazo = container.querySelector('.mazo-evento')
    // No debería lanzar error
    await user.click(mazo)
    
    expect(container).toBeInTheDocument()
  })

  it('llama onClick múltiples veces si se hace click múltiples veces', async () => {
    const user = userEvent.setup()
    const mockOnClick = vi.fn()
    const { container } = render(<MazoEvento cartaEvento={null} onClick={mockOnClick} disabled={false} />)
    
    const mazo = container.querySelector('.mazo-evento')
    await user.click(mazo)
    await user.click(mazo)
    await user.click(mazo)
    
    expect(mockOnClick).toHaveBeenCalledTimes(3)
  })

  it('puede hacer click tanto vacío como con carta', async () => {
    const user = userEvent.setup()
    const mockOnClick = vi.fn()
    const carta = { idFrontend: 15, idBackend: 100 }
    const { container } = render(<MazoEvento cartaEvento={carta} onClick={mockOnClick} disabled={false} />)
    
    const mazo = container.querySelector('.mazo-evento')
    await user.click(mazo)
    
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  // ===== ACTUALIZACIÓN DE ESTADO =====
  it('actualiza cuando se agrega carta', () => {
    const { rerender, container } = render(<MazoEvento cartaEvento={null} />)
    
    expect(container.querySelector('.evento-vacio')).toBeInTheDocument()
    
    const carta = { idFrontend: 15, idBackend: 100 }
    rerender(<MazoEvento cartaEvento={carta} />)
    
    expect(screen.getByTestId('card-mock')).toBeInTheDocument()
    expect(container.querySelector('.evento-vacio')).not.toBeInTheDocument()
  })

  it('actualiza cuando se quita carta', () => {
    const carta = { idFrontend: 15, idBackend: 100 }
    const { rerender, container } = render(<MazoEvento cartaEvento={carta} />)
    
    expect(screen.getByTestId('card-mock')).toBeInTheDocument()
    
    rerender(<MazoEvento cartaEvento={null} />)
    
    expect(container.querySelector('.evento-vacio')).toBeInTheDocument()
    expect(screen.queryByTestId('card-mock')).not.toBeInTheDocument()
  })

  it('actualiza cuando cambia la carta', () => {
    const carta1 = { idFrontend: 15, idBackend: 100 }
    const { rerender } = render(<MazoEvento cartaEvento={carta1} />)
    
    expect(screen.getByTestId('card-mock')).toHaveAttribute('data-id', '15')
    
    const carta2 = { idFrontend: 16, idBackend: 101 }
    rerender(<MazoEvento cartaEvento={carta2} />)
    
    expect(screen.getByTestId('card-mock')).toHaveAttribute('data-id', '16')
  })

  it('actualiza cuando cambia disabled', () => {
    const mockOnClick = vi.fn()
    const { rerender, container } = render(<MazoEvento cartaEvento={null} onClick={mockOnClick} disabled={true} />)
    
    expect(container.querySelector('.mazo-evento')).not.toHaveClass('clickeable')
    
    rerender(<MazoEvento cartaEvento={null} onClick={mockOnClick} disabled={false} />)
    
    expect(container.querySelector('.mazo-evento')).toHaveClass('clickeable')
  })

  it('actualiza cuando cambia onClick', async () => {
    const user = userEvent.setup()
    const mockOnClick1 = vi.fn()
    const mockOnClick2 = vi.fn()
    const { rerender, container } = render(<MazoEvento cartaEvento={null} onClick={mockOnClick1} disabled={false} />)
    
    const mazo = container.querySelector('.mazo-evento')
    await user.click(mazo)
    
    expect(mockOnClick1).toHaveBeenCalledTimes(1)
    expect(mockOnClick2).not.toHaveBeenCalled()
    
    rerender(<MazoEvento cartaEvento={null} onClick={mockOnClick2} disabled={false} />)
    
    await user.click(mazo)
    
    expect(mockOnClick1).toHaveBeenCalledTimes(1)
    expect(mockOnClick2).toHaveBeenCalledTimes(1)
  })

  // ===== CASOS ESPECIALES DE CARTAS DE EVENTO =====
  it('funciona con carta de evento idFrontend=10 (primer evento)', () => {
    const carta = { idFrontend: 10, idBackend: 100 }
    
    render(<MazoEvento cartaEvento={carta} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-id', '10')
  })

  it('funciona con carta de evento idFrontend=18 (último evento)', () => {
    const carta = { idFrontend: 18, idBackend: 100 }
    
    render(<MazoEvento cartaEvento={carta} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-id', '18')
  })

  it('funciona con carta de evento idFrontend=15 (evento medio)', () => {
    const carta = { idFrontend: 15, idBackend: 100 }
    
    render(<MazoEvento cartaEvento={carta} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-id', '15')
  })

  // ===== INTEGRACIÓN CON OTROS PROPS =====
  it('combina cartaEvento, onClick y disabled correctamente', async () => {
    const user = userEvent.setup()
    const mockOnClick = vi.fn()
    const carta = { idFrontend: 15, idBackend: 100 }
    const { container } = render(<MazoEvento cartaEvento={carta} onClick={mockOnClick} disabled={false} />)
    
    expect(screen.getByTestId('card-mock')).toBeInTheDocument()
    expect(container.querySelector('.mazo-evento')).toHaveClass('clickeable')
    
    const mazo = container.querySelector('.mazo-evento')
    await user.click(mazo)
    
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('renderiza label siempre, sin importar estado', () => {
    const { rerender } = render(<MazoEvento cartaEvento={null} />)
    expect(screen.getByText('Carta de Evento')).toBeInTheDocument()
    
    const carta = { idFrontend: 15, idBackend: 100 }
    rerender(<MazoEvento cartaEvento={carta} />)
    expect(screen.getByText('Carta de Evento')).toBeInTheDocument()
  })
})
