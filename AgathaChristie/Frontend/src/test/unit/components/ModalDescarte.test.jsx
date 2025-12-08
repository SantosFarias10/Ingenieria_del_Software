import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ModalDescarte from '../../../components/ModalDescarte'

// Mock del componente Card
vi.mock('../../../components/Card', () => ({
  default: ({ id, flipped, puedeVoltearse }) => (
    <div 
      data-testid="card-mock" 
      data-id={id} 
      data-flipped={String(flipped)} 
      data-puede-voltear={String(puedeVoltearse)}
    >
      Card {id}
    </div>
  )
}))

describe('ModalDescarte Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderModal = (props = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      cartasDescarte: [],
      ...props
    }
    return render(<ModalDescarte {...defaultProps} />)
  }

  // === RENDERIZADO CONDICIONAL ===
  it('no renderiza cuando isOpen es false', () => {
    const { container } = render(
      <ModalDescarte isOpen={false} onClose={vi.fn()} cartasDescarte={[]} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renderiza el modal cuando isOpen es true', () => {
    renderModal({ isOpen: true })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Últimas Cartas Descartadas')).toBeInTheDocument()
  })

  // === CONTENIDO DEL MODAL ===
  it('muestra mensaje cuando no hay cartas descartadas', () => {
    renderModal({ cartasDescarte: [] })
    expect(screen.getByText('No hay cartas descartadas')).toBeInTheDocument()
  })

  it('muestra las últimas 5 cartas cuando hay 5 o menos', () => {
    const cartas = [
      { idFrontend: 'f1', idBackend: 1, id: 1 },
      { idFrontend: 'f2', idBackend: 2, id: 2 },
      { idFrontend: 'f3', idBackend: 3, id: 3 },
      { idFrontend: 'f4', idBackend: 4, id: 4 },
      { idFrontend: 'f5', idBackend: 5, id: 5 }
    ]
    renderModal({ cartasDescarte: cartas })
    
    const cards = screen.getAllByTestId('card-mock')
    expect(cards).toHaveLength(5)
    // Verifica que están en orden inverso (más reciente primero)
    expect(cards[0]).toHaveAttribute('data-id', 'f5')
    expect(cards[1]).toHaveAttribute('data-id', 'f4')
    expect(cards[2]).toHaveAttribute('data-id', 'f3')
    expect(cards[3]).toHaveAttribute('data-id', 'f2')
    expect(cards[4]).toHaveAttribute('data-id', 'f1')
  })

  it('muestra solo las últimas 5 cartas cuando hay más de 5', () => {
    const cartas = [
      { idFrontend: 'f1', idBackend: 1, id: 1 },
      { idFrontend: 'f2', idBackend: 2, id: 2 },
      { idFrontend: 'f3', idBackend: 3, id: 3 },
      { idFrontend: 'f4', idBackend: 4, id: 4 },
      { idFrontend: 'f5', idBackend: 5, id: 5 },
      { idFrontend: 'f6', idBackend: 6, id: 6 },
      { idFrontend: 'f7', idBackend: 7, id: 7 }
    ]
    renderModal({ cartasDescarte: cartas })
    
    const cards = screen.getAllByTestId('card-mock')
    expect(cards).toHaveLength(5)
    // Solo las últimas 5 en orden inverso
    expect(cards[0]).toHaveAttribute('data-id', 'f7')
    expect(cards[1]).toHaveAttribute('data-id', 'f6')
    expect(cards[2]).toHaveAttribute('data-id', 'f5')
    expect(cards[3]).toHaveAttribute('data-id', 'f4')
    expect(cards[4]).toHaveAttribute('data-id', 'f3')
  })

  it('muestra solo 1 carta cuando hay 1 carta', () => {
    const cartas = [{ idFrontend: 'f1', idBackend: 1, id: 1 }]
    renderModal({ cartasDescarte: cartas })
    
    const cards = screen.getAllByTestId('card-mock')
    expect(cards).toHaveLength(1)
    expect(cards[0]).toHaveAttribute('data-id', 'f1')
  })

  // === PRIORIDAD DE IDs ===
  it('usa idFrontend como prioridad', () => {
    const cartas = [
      { idFrontend: 'front1', idBackend: 10, id: 100 }
    ]
    renderModal({ cartasDescarte: cartas })
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-id', 'front1')
  })

  it('usa id_front cuando no hay idFrontend', () => {
    const cartas = [
      { id_front: 20, idBackend: 30, id: 200 }
    ]
    renderModal({ cartasDescarte: cartas })
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-id', '20')
  })

  it('usa id cuando no hay idFrontend ni id_front', () => {
    const cartas = [
      { id: 300 }
    ]
    renderModal({ cartasDescarte: cartas })
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-id', '300')
  })

  // === PROPIEDADES DE LAS CARTAS ===
  it('las cartas están flipped (boca arriba)', () => {
    const cartas = [
      { idFrontend: 'f1', idBackend: 1 }
    ]
    renderModal({ cartasDescarte: cartas })
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-flipped', 'true')
  })

  it('las cartas no pueden voltearse', () => {
    const cartas = [
      { idFrontend: 'f1', idBackend: 1 }
    ]
    renderModal({ cartasDescarte: cartas })
    
    const card = screen.getByTestId('card-mock')
    expect(card).toHaveAttribute('data-puede-voltear', 'false')
  })

  // === ETIQUETAS DE ORDEN ===
  it('muestra "Más reciente" en la primera carta', () => {
    const cartas = [
      { idFrontend: 'f1', idBackend: 1 },
      { idFrontend: 'f2', idBackend: 2 },
      { idFrontend: 'f3', idBackend: 3 }
    ]
    renderModal({ cartasDescarte: cartas })
    
    expect(screen.getByText('Más reciente')).toBeInTheDocument()
  })

  it('muestra "Más antigua" en la última carta cuando hay 3', () => {
    const cartas = [
      { idFrontend: 'f1', idBackend: 1 },
      { idFrontend: 'f2', idBackend: 2 },
      { idFrontend: 'f3', idBackend: 3 }
    ]
    renderModal({ cartasDescarte: cartas })
    
    expect(screen.getByText('Más antigua')).toBeInTheDocument()
  })

  it('no muestra etiquetas cuando hay solo 1 carta', () => {
    const cartas = [{ idFrontend: 'f1', idBackend: 1 }]
    renderModal({ cartasDescarte: cartas })
    
    expect(screen.queryByText('Más reciente')).not.toBeInTheDocument()
    expect(screen.queryByText('Más antigua')).not.toBeInTheDocument()
  })

  // === INTERACCIÓN - CERRAR MODAL ===
  it('llama a onClose al hacer click en el botón X', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { container } = renderModal({ onClose })
    
    const closeButtonX = container.querySelector('.modal-descarte-close')
    await user.click(closeButtonX)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('llama a onClose al hacer click en el botón "Cerrar"', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { container } = renderModal({ onClose })
    
    const closeButton = container.querySelector('.modal-descarte-btn-cerrar')
    await user.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('llama a onClose al hacer click en el overlay', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { container } = renderModal({ onClose })
    
    const overlay = container.querySelector('.modal-descarte-overlay')
    await user.click(overlay)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('NO llama a onClose al hacer click dentro del panel', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { container } = renderModal({ onClose })
    
    const panel = container.querySelector('.modal-descarte-panel')
    await user.click(panel)
    
    expect(onClose).not.toHaveBeenCalled()
  })

  // === ACCESIBILIDAD ===
  it('tiene los atributos ARIA correctos', () => {
    renderModal()
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-descarte-title')
  })

  it('el título tiene el id correcto para aria-labelledby', () => {
    renderModal()
    
    const title = screen.getByText('Últimas Cartas Descartadas')
    expect(title).toHaveAttribute('id', 'modal-descarte-title')
  })

  it('el botón X tiene aria-label', () => {
    const { container } = renderModal()
    
    const closeButtonX = container.querySelector('.modal-descarte-close')
    expect(closeButtonX).toHaveAttribute('aria-label', 'Cerrar')
  })

  // === CASOS EDGE ===
  it('maneja cartasDescarte undefined como array vacío', () => {
    renderModal({ cartasDescarte: undefined })
    
    expect(screen.getByText('No hay cartas descartadas')).toBeInTheDocument()
  })

  it('maneja cartasDescarte null como array vacío', () => {
    renderModal({ cartasDescarte: null })
    
    expect(screen.getByText('No hay cartas descartadas')).toBeInTheDocument()
  })

  it('renderiza correctamente con 2 cartas', () => {
    const cartas = [
      { idFrontend: 'f1', idBackend: 1 },
      { idFrontend: 'f2', idBackend: 2 }
    ]
    renderModal({ cartasDescarte: cartas })
    
    const cards = screen.getAllByTestId('card-mock')
    expect(cards).toHaveLength(2)
    expect(screen.getByText('Más reciente')).toBeInTheDocument()
    expect(screen.getByText('Más antigua')).toBeInTheDocument()
  })

  // === KEYS ÚNICAS PARA CARTAS DUPLICADAS ===
  it('renderiza correctamente múltiples cartas con el mismo idBackend (keys únicas)', () => {
    // Simula descartar 3 cartas "Not So Fast" con el mismo idBackend
    const cartas = [
      { idFrontend: 10, idBackend: 80, tipo: 'evento' },
      { idFrontend: 10, idBackend: 80, tipo: 'evento' },
      { idFrontend: 10, idBackend: 80, tipo: 'evento' }
    ]
    renderModal({ cartasDescarte: cartas })
    
    const cards = screen.getAllByTestId('card-mock')
    expect(cards).toHaveLength(3)
    // Verifica que no hay errores de keys duplicadas
    expect(cards[0]).toBeInTheDocument()
    expect(cards[1]).toBeInTheDocument()
    expect(cards[2]).toBeInTheDocument()
  })
})
