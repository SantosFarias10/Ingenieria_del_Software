import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MazoRegular from '../../components/MazoRegular'

// Mock del componente Card
vi.mock('../../components/Card', () => ({
  default: ({ id }) => (
    <div data-testid="card-mock" data-id={id}>Card Mock</div>
  )
}))

describe('MazoRegular - Robar Carta', () => {
  let mockOnRobarCarta

  beforeEach(() => {
    mockOnRobarCarta = vi.fn()
  })

  it('renderiza el mazo principal con cartas disponibles', () => {
    const { container } = render(
      <MazoRegular cantidadCartas={30} estaActivo={true} onRobarCarta={mockOnRobarCarta} />
    )
    
    expect(container.querySelector('.mazo-regular')).toBeInTheDocument()
    expect(screen.getByText('Mazo Principal')).toBeInTheDocument()
    expect(screen.getByTestId('card-mock')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('permite robar carta cuando está activo y tiene cartas', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MazoRegular cantidadCartas={30} estaActivo={true} onRobarCarta={mockOnRobarCarta} />
    )
    
    const mazo = container.querySelector('.mazo-regular')
    await user.click(mazo)
    
    expect(mockOnRobarCarta).toHaveBeenCalledTimes(1)
  })

  it('no permite robar carta cuando no está activo', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MazoRegular cantidadCartas={30} estaActivo={false} onRobarCarta={mockOnRobarCarta} />
    )
    
    const mazo = container.querySelector('.mazo-regular')
    await user.click(mazo)
    
    expect(mockOnRobarCarta).not.toHaveBeenCalled()
  })

  it('no permite robar carta cuando el mazo está vacío', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MazoRegular cantidadCartas={0} estaActivo={true} onRobarCarta={mockOnRobarCarta} />
    )
    
    const mazo = container.querySelector('.mazo-regular')
    await user.click(mazo)
    
    expect(mockOnRobarCarta).not.toHaveBeenCalled()
  })

  it('muestra el tooltip correcto cuando está activo', () => {
    const { container } = render(
      <MazoRegular cantidadCartas={30} estaActivo={true} onRobarCarta={mockOnRobarCarta} />
    )
    
    expect(container.querySelector('.mazo-regular')).toHaveAttribute('title', 'Haz clic para robar carta')
  })

  it('muestra el tooltip correcto cuando no está activo', () => {
    const { container } = render(
      <MazoRegular cantidadCartas={30} estaActivo={false} onRobarCarta={mockOnRobarCarta} />
    )
    
    expect(container.querySelector('.mazo-regular')).toHaveAttribute('title', 'No es tu turno')
  })

  it('muestra el tooltip correcto cuando está vacío', () => {
    const { container } = render(
      <MazoRegular cantidadCartas={0} estaActivo={true} onRobarCarta={mockOnRobarCarta} />
    )
    
    expect(container.querySelector('.mazo-regular')).toHaveAttribute('title', 'Mazo vacío')
  })

  it('actualiza el contador correctamente', () => {
    const { rerender } = render(
      <MazoRegular cantidadCartas={30} estaActivo={true} onRobarCarta={mockOnRobarCarta} />
    )
    
    expect(screen.getByText('30')).toBeInTheDocument()
    
    rerender(<MazoRegular cantidadCartas={29} estaActivo={true} onRobarCarta={mockOnRobarCarta} />)
    expect(screen.getByText('29')).toBeInTheDocument()
  })
})
