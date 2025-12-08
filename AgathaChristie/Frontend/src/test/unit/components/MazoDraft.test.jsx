import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MazoDraft from '../../../components/MazoDraft'

vi.mock('../../../components/Card', () => ({
  default: ({ id, flipped, puedeVoltearse, onSelect }) => (
    <div 
      data-testid="card-mock" 
      data-id={id}
      data-flipped={flipped}
      data-puede-voltearse={puedeVoltearse}
      onClick={onSelect}
    >
      Card Mock
    </div>
  )
}))

describe('MazoDraft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mockear console.error para tests de validación
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  // ===== RENDERIZADO BÁSICO =====
  it('renderiza el contenedor con clase mazo-draft', () => {
    const { container } = render(<MazoDraft cartas={[]} />)
    
    expect(container.querySelector('.mazo-draft')).toBeInTheDocument()
  })

  it('no renderiza cartas cuando el array está vacío', () => {
    render(<MazoDraft cartas={[]} />)
    
    expect(screen.queryByTestId('card-mock')).not.toBeInTheDocument()
  })

  // ===== VALIDACIÓN DE IDS =====
  it('no renderiza carta sin ID válido y muestra error en consola', () => {
    const cartas = [
      { nombre: 'Carta sin ID' } // Sin idFrontend, idBackend ni id
    ]
    render(<MazoDraft cartas={cartas} />)
    
    // La carta no debe renderizarse
    expect(screen.queryByTestId('card-mock')).not.toBeInTheDocument()
    
    // Debe mostrar error en consola
    expect(console.error).toHaveBeenCalledWith(
      '[MazoDraft] Carta sin ID válido en posición',
      0,
      ':',
      { nombre: 'Carta sin ID' }
    )
  })

  it('no renderiza carta con ID undefined', () => {
    const cartas = [
      { idFrontend: undefined, idBackend: undefined, id: undefined, nombre: 'Carta 1' }
    ]
    render(<MazoDraft cartas={cartas} />)
    
    expect(screen.queryByTestId('card-mock')).not.toBeInTheDocument()
    expect(console.error).toHaveBeenCalled()
  })

  it('no renderiza carta con ID null', () => {
    const cartas = [
      { idFrontend: null, idBackend: null, id: null, nombre: 'Carta 1' }
    ]
    render(<MazoDraft cartas={cartas} />)
    
    expect(screen.queryByTestId('card-mock')).not.toBeInTheDocument()
    expect(console.error).toHaveBeenCalled()
  })

  it('renderiza carta con ID 0 (ID válido)', () => {
    const cartas = [
      { idBackend: 0, nombre: 'Carta con ID 0' }
    ]
    render(<MazoDraft cartas={cartas} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-id', '0')
  })

  it('filtra cartas sin ID pero renderiza las válidas', () => {
    const cartas = [
      { idBackend: 1, nombre: 'Carta válida 1' },
      { nombre: 'Carta sin ID' },
      { idBackend: 3, nombre: 'Carta válida 2' }
    ]
    render(<MazoDraft cartas={cartas} />)
    
    const cards = screen.getAllByTestId('card-mock')
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveAttribute('data-id', '1')
    expect(cards[1]).toHaveAttribute('data-id', '3')
  })

  // ===== CALLBACK onPick =====
  it('llama a onPick con la posición del índice cuando no hay posición backend', async () => {
    const user = userEvent.setup()
    const mockOnPick = vi.fn()
    const cartas = [
      { idBackend: 1, nombre: 'Carta 1' },
      { idBackend: 2, nombre: 'Carta 2' }
    ]
    render(<MazoDraft cartas={cartas} onPick={mockOnPick} />)
    
    const cards = screen.getAllByTestId('card-mock')
    await user.click(cards[1]) // Click en segunda carta
    
    expect(mockOnPick).toHaveBeenCalledWith(1) // Índice 1
    expect(console.log).toHaveBeenCalledWith(
      '[MazoDraft] Carta seleccionada:',
      expect.objectContaining({
        indiceArray: 1,
        posicionBackend: 1,
        carta: cartas[1]
      })
    )
  })

  it('llama a onPick con posicionBackend cuando existe', async () => {
    const user = userEvent.setup()
    const mockOnPick = vi.fn()
    const cartas = [
      { idBackend: 1, posicion: 5, nombre: 'Carta 1' },
      { idBackend: 2, posicion: 10, nombre: 'Carta 2' }
    ]
    render(<MazoDraft cartas={cartas} onPick={mockOnPick} />)
    
    const cards = screen.getAllByTestId('card-mock')
    await user.click(cards[0]) // Click en primera carta
    
    expect(mockOnPick).toHaveBeenCalledWith(5) // Posición backend
    expect(console.log).toHaveBeenCalledWith(
      '[MazoDraft] Carta seleccionada:',
      expect.objectContaining({
        indiceArray: 0,
        posicionBackend: 5,
        carta: cartas[0]
      })
    )
  })

  it('no lanza error cuando onPick es null', async () => {
    const user = userEvent.setup()
    const cartas = [{ idBackend: 1, nombre: 'Carta 1' }]
    render(<MazoDraft cartas={cartas} onPick={null} />)
    
    const card = screen.getByTestId('card-mock')
    
    // No debe lanzar error al hacer click
    await expect(user.click(card)).resolves.not.toThrow()
  })

  it('no lanza error cuando onPick es undefined', async () => {
    const user = userEvent.setup()
    const cartas = [{ idBackend: 1, nombre: 'Carta 1' }]
    render(<MazoDraft cartas={cartas} onPick={undefined} />)
    
    const card = screen.getByTestId('card-mock')
    
    await expect(user.click(card)).resolves.not.toThrow()
  })

  it('no llama onPick si no es una función', async () => {
    const user = userEvent.setup()
    const cartas = [{ idBackend: 1, nombre: 'Carta 1' }]
    render(<MazoDraft cartas={cartas} onPick="not-a-function" />)
    
    const card = screen.getByTestId('card-mock')
    
    // No debe lanzar error
    await expect(user.click(card)).resolves.not.toThrow()
  })

  it('onPick se llama múltiples veces para diferentes cartas', async () => {
    const user = userEvent.setup()
    const mockOnPick = vi.fn()
    const cartas = [
      { idBackend: 1, posicion: 0, nombre: 'Carta 1' },
      { idBackend: 2, posicion: 1, nombre: 'Carta 2' },
      { idBackend: 3, posicion: 2, nombre: 'Carta 3' }
    ]
    render(<MazoDraft cartas={cartas} onPick={mockOnPick} />)
    
    const cards = screen.getAllByTestId('card-mock')
    
    await user.click(cards[0])
    await user.click(cards[2])
    await user.click(cards[1])
    
    expect(mockOnPick).toHaveBeenCalledTimes(3)
    expect(mockOnPick).toHaveBeenNthCalledWith(1, 0)
    expect(mockOnPick).toHaveBeenNthCalledWith(2, 2)
    expect(mockOnPick).toHaveBeenNthCalledWith(3, 1)
  })

  // ===== RENDERIZADO BÁSICO (continuación) =====
  it('renderiza una carta correctamente', () => {
    const cartas = [{ idBackend: 1, nombre: 'Carta 1' }]
    render(<MazoDraft cartas={cartas} />)
    
    const cards = screen.getAllByTestId('card-mock')
    expect(cards).toHaveLength(1)
    expect(cards[0]).toHaveAttribute('data-id', '1')
  })

  it('renderiza múltiples cartas (3 cartas)', () => {
    const cartas = [
      { idBackend: 1, nombre: 'Carta 1' },
      { idBackend: 2, nombre: 'Carta 2' },
      { idBackend: 3, nombre: 'Carta 3' }
    ]
    render(<MazoDraft cartas={cartas} />)
    
    const cards = screen.getAllByTestId('card-mock')
    expect(cards).toHaveLength(3)
    expect(cards[0]).toHaveAttribute('data-id', '1')
    expect(cards[1]).toHaveAttribute('data-id', '2')
    expect(cards[2]).toHaveAttribute('data-id', '3')
  })

  // ===== PRIORIDAD DE IDS =====
  it('usa idFrontend como prioridad principal', () => {
    const cartas = [
      { idFrontend: 100, idBackend: 1, id: 50, nombre: 'Carta 1' }
    ]
    render(<MazoDraft cartas={cartas} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-id', '100')
  })

  it('usa idBackend cuando no existe idFrontend', () => {
    const cartas = [
      { idBackend: 2, id: 50, nombre: 'Carta 1' }
    ]
    render(<MazoDraft cartas={cartas} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-id', '2')
  })

  it('usa id cuando no existen idFrontend ni idBackend', () => {
    const cartas = [
      { id: 50, nombre: 'Carta 1' }
    ]
    render(<MazoDraft cartas={cartas} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-id', '50')
  })

  // ===== PROPIEDADES DE LAS CARTAS =====
  it('renderiza cartas con flipped=true', () => {
    const cartas = [{ idBackend: 1, nombre: 'Carta 1' }]
    render(<MazoDraft cartas={cartas} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-flipped', 'true')
  })

  it('renderiza cartas con puedeVoltearse=false', () => {
    const cartas = [{ idBackend: 1, nombre: 'Carta 1' }]
    render(<MazoDraft cartas={cartas} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-puede-voltearse', 'false')
  })

  it('todas las cartas en draft tienen flipped=true y puedeVoltearse=false', () => {
    const cartas = [
      { idBackend: 1, nombre: 'Carta 1' },
      { idBackend: 2, nombre: 'Carta 2' },
      { idBackend: 3, nombre: 'Carta 3' }
    ]
    render(<MazoDraft cartas={cartas} />)
    
    const cards = screen.getAllByTestId('card-mock')
    cards.forEach(card => {
      expect(card).toHaveAttribute('data-flipped', 'true')
      expect(card).toHaveAttribute('data-puede-voltearse', 'false')
    })
  })

  // ===== CASOS LÍMITE =====
  it('maneja cartas con diferentes estructuras de ID', () => {
    const cartas = [
      { idFrontend: 100, nombre: 'Carta 1' },
      { idBackend: 2, nombre: 'Carta 2' },
      { id: 3, nombre: 'Carta 3' }
    ]
    render(<MazoDraft cartas={cartas} />)
    
    const cards = screen.getAllByTestId('card-mock')
    expect(cards).toHaveLength(3)
    expect(cards[0]).toHaveAttribute('data-id', '100')
    expect(cards[1]).toHaveAttribute('data-id', '2')
    expect(cards[2]).toHaveAttribute('data-id', '3')
  })

  it('maneja correctamente cuando cartas es undefined', () => {
    const { container } = render(<MazoDraft cartas={undefined} />)
    
    // Con valor por defecto [], debería renderizar el contenedor vacío
    expect(container.querySelector('.mazo-draft')).toBeInTheDocument()
    expect(screen.queryByTestId('card-mock')).not.toBeInTheDocument()
  })

  // ===== ACTUALIZACIÓN DE CARTAS =====
  it('actualiza correctamente cuando cambian las cartas', () => {
    const cartasIniciales = [
      { idBackend: 1, nombre: 'Carta 1' },
      { idBackend: 2, nombre: 'Carta 2' }
    ]
    const { rerender } = render(<MazoDraft cartas={cartasIniciales} />)
    
    expect(screen.getAllByTestId('card-mock')).toHaveLength(2)
    
    const cartasNuevas = [
      { idBackend: 3, nombre: 'Carta 3' },
      { idBackend: 4, nombre: 'Carta 4' },
      { idBackend: 5, nombre: 'Carta 5' }
    ]
    rerender(<MazoDraft cartas={cartasNuevas} />)
    
    const cards = screen.getAllByTestId('card-mock')
    expect(cards).toHaveLength(3)
    expect(cards[0]).toHaveAttribute('data-id', '3')
    expect(cards[1]).toHaveAttribute('data-id', '4')
    expect(cards[2]).toHaveAttribute('data-id', '5')
  })

  it('actualiza correctamente cuando se vacía el draft', () => {
    const cartas = [
      { idBackend: 1, nombre: 'Carta 1' },
      { idBackend: 2, nombre: 'Carta 2' }
    ]
    const { rerender } = render(<MazoDraft cartas={cartas} />)
    
    expect(screen.getAllByTestId('card-mock')).toHaveLength(2)
    
    rerender(<MazoDraft cartas={[]} />)
    
    expect(screen.queryByTestId('card-mock')).not.toBeInTheDocument()
  })
})
