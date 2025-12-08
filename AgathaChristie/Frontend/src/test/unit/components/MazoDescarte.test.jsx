import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MazoDescarte from '../../../components/MazoDescarte'

vi.mock('../../../components/Card', () => ({
  default: ({ id, flipped, puedeVoltearse }) => (
    <div data-testid="card-mock" data-id={id} data-flipped={String(flipped)} data-puede-voltear={String(puedeVoltearse)}>
      Card Mock
    </div>
  )
}))

describe('MazoDescarte', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===== RENDERIZADO BÁSICO =====
  it('renderiza estructura básica cuando está vacío', () => {
    const { container } = render(<MazoDescarte cartasDescarte={[]} />)
    
    expect(container.querySelector('.mazo-descarte-wrapper')).toBeInTheDocument()
    expect(screen.getByText('Mazo de Descarte')).toBeInTheDocument()
    expect(container.querySelector('.descarte-vacio')).toBeInTheDocument()
    expect(screen.getByText('Descarte Vacío')).toBeInTheDocument()
    expect(screen.queryByTestId('card-mock')).not.toBeInTheDocument()
  })

  it('muestra la carta del tope con idFrontend', () => {
    const cartas = [
      { idFrontend: 'f1', idBackend: 10 },
      { idFrontend: 'f2', idBackend: 25 },
      { idFrontend: 'f3', idBackend: 42 }
    ]
    
    render(<MazoDescarte cartasDescarte={cartas} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-id', 'f3')
  })

  it('muestra la carta con flipped=true', () => {
    const cartas = [{ idFrontend: 'f1', idBackend: 10 }]
    
    render(<MazoDescarte cartasDescarte={cartas} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-flipped', 'true')
  })

  it('muestra la carta con puedeVoltearse=false', () => {
    const cartas = [{ idFrontend: 'f1', idBackend: 10 }]
    
    render(<MazoDescarte cartasDescarte={cartas} />)
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-puede-voltear', 'false')
  })

  it('muestra el contador con la cantidad correcta', () => {
    const cartas = [
      { idFrontend: 'f1', idBackend: 10 },
      { idFrontend: 'f2', idBackend: 25 },
      { idFrontend: 'f3', idBackend: 42 }
    ]
    
    const { container } = render(<MazoDescarte cartasDescarte={cartas} />)
    
    expect(container.querySelector('.contador-descarte')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('NO muestra estado vacío cuando hay cartas', () => {
    const cartas = [{ idFrontend: 'f1', idBackend: 10 }]
    
    const { container } = render(<MazoDescarte cartasDescarte={cartas} />)
    
    expect(container.querySelector('.descarte-vacio')).not.toBeInTheDocument()
  })

  it('funciona con 1 carta', () => {
    const cartas = [{ idFrontend: 'f1', idBackend: 10 }]
    
    render(<MazoDescarte cartasDescarte={cartas} />)
    
    expect(screen.getByTestId('card-mock')).toHaveAttribute('data-id', 'f1')
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('funciona con muchas cartas (50)', () => {
    const muchosCartas = Array.from({ length: 50 }, (_, i) => ({
      idFrontend: `f${i}`,
      idBackend: i + 100
    }))
    
    render(<MazoDescarte cartasDescarte={muchosCartas} />)
    
    expect(screen.getByTestId('card-mock')).toHaveAttribute('data-id', 'f49')
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('funciona con carta sin idBackend', () => {
    const cartaSinBackend = [{ idFrontend: 'solo-front' }]
    
    render(<MazoDescarte cartasDescarte={cartaSinBackend} />)
    
    expect(screen.getByTestId('card-mock')).toBeInTheDocument()
  })

  it('maneja array undefined como vacío', () => {
    const { container } = render(<MazoDescarte cartasDescarte={undefined} />)
    
    expect(container.querySelector('.descarte-vacio')).toBeInTheDocument()
  })

  // ===== ACTUALIZACIÓN DE ESTADO =====
  it('actualiza cuando se agregan cartas', () => {
    const { rerender, container } = render(<MazoDescarte cartasDescarte={[]} />)
    
    expect(container.querySelector('.descarte-vacio')).toBeInTheDocument()
    
    const cartas = [{ idFrontend: 'f1', idBackend: 10 }]
    rerender(<MazoDescarte cartasDescarte={cartas} />)
    
    expect(screen.getByTestId('card-mock')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('actualiza el contador cuando cambia la cantidad', () => {
    const cartas1 = [{ idFrontend: 'f1', idBackend: 10 }]
    const { rerender } = render(<MazoDescarte cartasDescarte={cartas1} />)
    
    expect(screen.getByText('1')).toBeInTheDocument()
    
    const cartas2 = [
      { idFrontend: 'f1', idBackend: 10 },
      { idFrontend: 'f2', idBackend: 20 }
    ]
    rerender(<MazoDescarte cartasDescarte={cartas2} />)
    
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('actualiza la carta mostrada cuando cambia el tope', () => {
    const cartas1 = [{ idFrontend: 'f1', idBackend: 10 }]
    const { rerender } = render(<MazoDescarte cartasDescarte={cartas1} />)
    
    expect(screen.getByTestId('card-mock')).toHaveAttribute('data-id', 'f1')
    
    const cartas2 = [
      { idFrontend: 'f1', idBackend: 10 },
      { idFrontend: 'f2', idBackend: 20 }
    ]
    rerender(<MazoDescarte cartasDescarte={cartas2} />)
    
    expect(screen.getByTestId('card-mock')).toHaveAttribute('data-id', 'f2')
  })
})
