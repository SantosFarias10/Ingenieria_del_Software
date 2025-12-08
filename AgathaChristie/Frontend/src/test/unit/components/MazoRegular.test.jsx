import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MazoRegular from '../../../components/MazoRegular'

vi.mock('../../../components/Card', () => ({
  default: ({ id }) => (
    <div data-testid="card-mock" data-id={id}>Card Mock</div>
  )
}))

describe('MazoRegular', () => {
  let mockOnRobarCarta

  beforeEach(() => {
    mockOnRobarCarta = vi.fn()
  })

  it('renderiza estructura básica con Card, contador y label', () => {
    const { container } = render(
      <MazoRegular cantidadCartas={10} estaActivo={true} onRobarCarta={mockOnRobarCarta} />
    )
    
    expect(container.querySelector('.mazo-regular')).toBeInTheDocument()
    expect(screen.getByText('Mazo Principal')).toBeInTheDocument()
    expect(screen.getByTestId('card-mock')).toBeInTheDocument()
    expect(screen.getByTestId('card-mock')).toHaveAttribute('data-id', '1')
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('aplica clase "activo" cuando estaActivo=true y hay cartas', () => {
    const { container } = render(
      <MazoRegular cantidadCartas={5} estaActivo={true} onRobarCarta={mockOnRobarCarta} />
    )
    
    expect(container.querySelector('.mazo-regular')).toHaveClass('activo')
    expect(container.querySelector('.mazo-regular')).not.toHaveClass('inactivo')
  })

  it('aplica clase "inactivo" cuando estaActivo=false', () => {
    const { container } = render(
      <MazoRegular cantidadCartas={5} estaActivo={false} onRobarCarta={mockOnRobarCarta} />
    )
    
    expect(container.querySelector('.mazo-regular')).toHaveClass('inactivo')
    expect(container.querySelector('.mazo-regular')).not.toHaveClass('activo')
  })

  it('aplica clase "inactivo" cuando no hay cartas', () => {
    const { container } = render(
      <MazoRegular cantidadCartas={0} estaActivo={true} onRobarCarta={mockOnRobarCarta} />
    )
    
    expect(container.querySelector('.mazo-regular')).toHaveClass('inactivo')
  })

  it('muestra tooltip "Haz clic para robar carta" cuando está activo', () => {
    const { container } = render(
      <MazoRegular cantidadCartas={5} estaActivo={true} onRobarCarta={mockOnRobarCarta} />
    )
    
    expect(container.querySelector('.mazo-regular')).toHaveAttribute('title', 'Haz clic para robar carta')
  })

  it('muestra tooltip "No es tu turno" cuando no está activo', () => {
    const { container } = render(
      <MazoRegular cantidadCartas={5} estaActivo={false} onRobarCarta={mockOnRobarCarta} />
    )
    
    expect(container.querySelector('.mazo-regular')).toHaveAttribute('title', 'No es tu turno')
  })

  it('muestra tooltip "Mazo vacío" cuando no hay cartas', () => {
    const { container } = render(
      <MazoRegular cantidadCartas={0} estaActivo={true} onRobarCarta={mockOnRobarCarta} />
    )
    
    expect(container.querySelector('.mazo-regular')).toHaveAttribute('title', 'Mazo vacío')
  })

  it('llama a onRobarCarta cuando está activo y hay cartas', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MazoRegular cantidadCartas={5} estaActivo={true} onRobarCarta={mockOnRobarCarta} />
    )
    
    const mazo = container.querySelector('.mazo-regular')
    await user.click(mazo)
    expect(mockOnRobarCarta).toHaveBeenCalledTimes(1)
  })

  it('NO llama a onRobarCarta cuando no está activo', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MazoRegular cantidadCartas={5} estaActivo={false} onRobarCarta={mockOnRobarCarta} />
    )
    
    const mazo = container.querySelector('.mazo-regular')
    await user.click(mazo)
    expect(mockOnRobarCarta).not.toHaveBeenCalled()
  })

  it('NO llama a onRobarCarta cuando no hay cartas', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MazoRegular cantidadCartas={0} estaActivo={true} onRobarCarta={mockOnRobarCarta} />
    )
    
    const mazo = container.querySelector('.mazo-regular')
    await user.click(mazo)
    expect(mockOnRobarCarta).not.toHaveBeenCalled()
  })

  it('funciona correctamente con 1 carta', () => {
    const { container } = render(
      <MazoRegular cantidadCartas={1} estaActivo={true} onRobarCarta={mockOnRobarCarta} />
    )
    
    expect(container.querySelector('.mazo-regular')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})