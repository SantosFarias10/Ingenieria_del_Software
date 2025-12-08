import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ModalAgregarDetective from '../../../components/ModalAgregarDetective'

// Mock del componente Card
vi.mock('../../../components/Card', () => ({
  default: ({ id, flipped }) => (
    <div data-testid={`card-${id}`} data-flipped={flipped}>
      Card {id}
    </div>
  )
}))

describe('ModalAgregarDetective', () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()

  const mockCartasDisponibles = [
    { idBackend: 1, idFrontend: 5, nombre: 'Hercule Poirot' },
    { idBackend: 2, idFrontend: 5, nombre: 'Hercule Poirot' },
    { idBackend: 3, idFrontend: 8, nombre: 'Harley Quin' }
  ]

  const mockSetInfo = {
    index: 0,
    cartas: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderizado', () => {
    it('no renderiza nada cuando isOpen es false', () => {
      const { container } = render(
        <ModalAgregarDetective
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={mockCartasDisponibles}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('renderiza el modal cuando isOpen es true', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={mockCartasDisponibles}
          setInfo={mockSetInfo}
        />
      )

      expect(screen.getByText('Agregar Detective al Set #1')).toBeInTheDocument()
    })

    it('muestra el índice del set correctamente', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={mockCartasDisponibles}
          setInfo={{ index: 2 }}
        />
      )

      expect(screen.getByText('Agregar Detective al Set #3')).toBeInTheDocument()
    })

    it('muestra "?" cuando no hay setInfo', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={mockCartasDisponibles}
        />
      )

      expect(screen.getByText('Agregar Detective al Set #?')).toBeInTheDocument()
    })

    it('renderiza todas las cartas disponibles', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={mockCartasDisponibles}
          setInfo={mockSetInfo}
        />
      )

      // Hay 2 cartas con idFrontend=5 y 1 carta con idFrontend=8
      const cards5 = screen.getAllByTestId('card-5')
      const cards8 = screen.getAllByTestId('card-8')
      
      expect(cards5).toHaveLength(2)
      expect(cards8).toHaveLength(1)
    })

    it('muestra mensaje cuando no hay cartas disponibles', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={[]}
          setInfo={mockSetInfo}
        />
      )

      expect(screen.getByText('No tienes cartas válidas para agregar a este set.')).toBeInTheDocument()
      expect(screen.getByText(/Solo puedes agregar detectives del mismo tipo/)).toBeInTheDocument()
    })

    it('muestra instrucciones cuando hay cartas disponibles', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={mockCartasDisponibles}
          setInfo={mockSetInfo}
        />
      )

      expect(screen.getByText('Selecciona una carta para agregar al set:')).toBeInTheDocument()
    })

    it('renderiza el botón cancelar', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={mockCartasDisponibles}
          setInfo={mockSetInfo}
        />
      )

      expect(screen.getByText('Cancelar')).toBeInTheDocument()
    })
  })

  describe('Interacciones', () => {
    it('llama a onClose al hacer click en el overlay', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={mockCartasDisponibles}
          setInfo={mockSetInfo}
        />
      )

      const overlay = document.querySelector('.modal-overlay')
      fireEvent.click(overlay)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('no llama a onClose al hacer click en el contenido del modal', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={mockCartasDisponibles}
          setInfo={mockSetInfo}
        />
      )

      const modalContent = document.querySelector('.modal-content')
      fireEvent.click(modalContent)

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('llama a onClose al hacer click en el botón cancelar', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={mockCartasDisponibles}
          setInfo={mockSetInfo}
        />
      )

      const btnCancelar = screen.getByText('Cancelar')
      fireEvent.click(btnCancelar)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('llama a onConfirm y onClose al seleccionar una carta', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={mockCartasDisponibles}
          setInfo={mockSetInfo}
        />
      )

      const primeraCartaDisponible = document.querySelector('.carta-disponible')
      fireEvent.click(primeraCartaDisponible)

      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
      expect(mockOnConfirm).toHaveBeenCalledWith(mockCartasDisponibles[0])
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('pasa la carta correcta a onConfirm cuando se selecciona una carta específica', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={mockCartasDisponibles}
          setInfo={mockSetInfo}
        />
      )

      const cartasDisponibles = document.querySelectorAll('.carta-disponible')
      fireEvent.click(cartasDisponibles[1]) // Segunda carta

      expect(mockOnConfirm).toHaveBeenCalledWith(mockCartasDisponibles[1])
    })
  })

  describe('Props y valores por defecto', () => {
    it('usa array vacío como default para cartasDisponibles', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      )

      expect(screen.getByText('No tienes cartas válidas para agregar a este set.')).toBeInTheDocument()
    })

    it('maneja setInfo null correctamente', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={mockCartasDisponibles}
          setInfo={null}
        />
      )

      expect(screen.getByText('Agregar Detective al Set #?')).toBeInTheDocument()
    })
  })

  describe('Accesibilidad y clases CSS', () => {
    it('aplica las clases CSS correctas', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={mockCartasDisponibles}
          setInfo={mockSetInfo}
        />
      )

      expect(document.querySelector('.modal-overlay')).toBeInTheDocument()
      expect(document.querySelector('.modal-content')).toBeInTheDocument()
      expect(document.querySelector('.modal-agregar-detective')).toBeInTheDocument()
      expect(document.querySelector('.cartas-disponibles')).toBeInTheDocument()
      expect(document.querySelector('.modal-footer')).toBeInTheDocument()
    })

    it('las cartas se renderizan con flipped=true y puedeVoltearse=false', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={mockCartasDisponibles}
          setInfo={mockSetInfo}
        />
      )

      const cards = screen.getAllByTestId(/card-/)
      cards.forEach(card => {
        expect(card).toHaveAttribute('data-flipped', 'true')
      })
    })
  })

  describe('Casos edge', () => {
    it('maneja una sola carta disponible', () => {
      const unaCarta = [mockCartasDisponibles[0]]
      
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={unaCarta}
          setInfo={mockSetInfo}
        />
      )

      const cartasDisponibles = document.querySelectorAll('.carta-disponible')
      expect(cartasDisponibles).toHaveLength(1)
    })

    it('maneja muchas cartas disponibles', () => {
      const muchasCartas = Array.from({ length: 10 }, (_, i) => ({
        idBackend: i + 1,
        idFrontend: 5,
        nombre: `Detective ${i + 1}`
      }))

      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={muchasCartas}
          setInfo={mockSetInfo}
        />
      )

      const cartasDisponibles = document.querySelectorAll('.carta-disponible')
      expect(cartasDisponibles).toHaveLength(10)
    })

    it('usa idBackend como key para las cartas', () => {
      render(
        <ModalAgregarDetective
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          cartasDisponibles={mockCartasDisponibles}
          setInfo={mockSetInfo}
        />
      )

      const cartasDisponibles = document.querySelectorAll('.carta-disponible')
      expect(cartasDisponibles).toHaveLength(mockCartasDisponibles.length)
    })
  })
})
