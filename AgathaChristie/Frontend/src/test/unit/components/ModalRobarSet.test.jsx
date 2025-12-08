import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock CSS imports
vi.mock('../../../styles/ModalRobarSet.css', () => ({}))

import ModalRobarSet from '../../../components/ModalRobarSet'

describe('ModalRobarSet Component', () => {
  const mockOnClose = vi.fn()
  const mockOnSelectSet = vi.fn()

  const mockSetsJugados = {
    1: [
      [
        { nombre: 'Hercule Poirot', idFrontend: 1, idBackend: 40 },
        { nombre: 'Hercule Poirot', idFrontend: 1, idBackend: 41 },
        { nombre: 'Harley Quin', idFrontend: 8, idBackend: 21 }
      ],
      [
        { nombre: 'Miss Marple', idFrontend: 2, idBackend: 28 },
        { nombre: 'Miss Marple', idFrontend: 2, idBackend: 29 }
      ]
    ],
    2: [
      [
        { nombre: 'Tommy Beresford', idFrontend: 6, idBackend: 34 },
        { nombre: 'Tuppence Beresford', idFrontend: 7, idBackend: 38 }
      ]
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console.log para evitar spam en tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('debería renderizar el modal cuando isOpen es true', () => {
    render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    expect(screen.getByText('Sets jugados en la mesa')).toBeInTheDocument()
  })

  it('no debería renderizar nada cuando isOpen es false', () => {
    const { container } = render(
      <ModalRobarSet 
        isOpen={false}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('debería mostrar mensaje cuando no hay sets jugados', () => {
    render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={{}}
        onSelectSet={mockOnSelectSet}
      />
    )

    expect(screen.getByText('No hay sets jugados en la mesa.')).toBeInTheDocument()
  })

  it('debería mostrar todos los jugadores con sets', () => {
    render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    expect(screen.getByText('Jugador 1')).toBeInTheDocument()
    expect(screen.getByText('Jugador 2')).toBeInTheDocument()
  })

  it('debería mostrar los sets de cada jugador', () => {
    render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    // Jugador 1 tiene 2 sets
    expect(screen.getByText(/Set 1:.*Hercule Poirot.*Hercule Poirot.*Harley Quin/)).toBeInTheDocument()
    expect(screen.getByText(/Set 2:.*Miss Marple.*Miss Marple/)).toBeInTheDocument()
    
    // Jugador 2 tiene 1 set
    expect(screen.getByText(/Set 1:.*Tommy Beresford.*Tuppence Beresford/)).toBeInTheDocument()
  })

  it('debería mostrar mensaje cuando un jugador no tiene sets', () => {
    const setsConJugadorVacio = {
      1: [],
      2: [
        [{ nombre: 'Miss Marple', idFrontend: 2, idBackend: 28 }]
      ]
    }

    render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={setsConJugadorVacio}
        onSelectSet={mockOnSelectSet}
      />
    )

    expect(screen.getByText('No tiene sets jugados.')).toBeInTheDocument()
  })

  it('debería llamar onClose cuando se hace clic en el overlay', () => {
    const { container } = render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    const overlay = container.querySelector('.modal-robar-set-overlay')
    fireEvent.click(overlay)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('no debería cerrar el modal al hacer clic dentro del panel', () => {
    const { container } = render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    const panel = container.querySelector('.modal-robar-set-panel')
    fireEvent.click(panel)

    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('debería llamar onClose cuando se hace clic en el botón Cerrar', () => {
    render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    const closeButton = screen.getByText('Cerrar')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('debería seleccionar un set al hacer clic en él', () => {
    const { container } = render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    const sets = container.querySelectorAll('.modal-robar-set-item')
    fireEvent.click(sets[0])

    expect(sets[0]).toHaveClass('selected')
  })

  it('debería cambiar la selección al hacer clic en otro set', () => {
    const { container } = render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    const sets = container.querySelectorAll('.modal-robar-set-item')
    
    // Seleccionar primer set
    fireEvent.click(sets[0])
    expect(sets[0]).toHaveClass('selected')

    // Seleccionar segundo set
    fireEvent.click(sets[1])
    expect(sets[1]).toHaveClass('selected')
    expect(sets[0]).not.toHaveClass('selected')
  })

  it('debería deshabilitar el botón Robar cuando no hay selección', () => {
    render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    const robarButton = screen.getByText('Robar Set Seleccionado')
    expect(robarButton).toBeDisabled()
  })

  it('debería habilitar el botón Robar cuando hay un set seleccionado', () => {
    const { container } = render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    const sets = container.querySelectorAll('.modal-robar-set-item')
    fireEvent.click(sets[0])

    const robarButton = screen.getByText('Robar Set Seleccionado')
    expect(robarButton).not.toBeDisabled()
  })

  it('debería llamar onSelectSet con los parámetros correctos al confirmar', () => {
    const { container } = render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    // Seleccionar primer set del jugador 1
    const sets = container.querySelectorAll('.modal-robar-set-item')
    fireEvent.click(sets[0])

    // Confirmar
    const robarButton = screen.getByText('Robar Set Seleccionado')
    fireEvent.click(robarButton)

    expect(mockOnSelectSet).toHaveBeenCalledTimes(1)
    expect(mockOnSelectSet).toHaveBeenCalledWith('1', mockSetsJugados['1'][0])
  })

  it('debería limpiar la selección después de confirmar', () => {
    const { container } = render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    const sets = container.querySelectorAll('.modal-robar-set-item')
    fireEvent.click(sets[0])

    const robarButton = screen.getByText('Robar Set Seleccionado')
    fireEvent.click(robarButton)

    // Después de confirmar, ningún set debería estar seleccionado
    const setsAfter = container.querySelectorAll('.modal-robar-set-item')
    setsAfter.forEach(set => {
      expect(set).not.toHaveClass('selected')
    })
  })

  it('debería manejar cartas sin nombre mostrando idFrontend', () => {
    const setsConCartasSinNombre = {
      1: [
        [
          { idFrontend: 1, idBackend: 40 },
          { idFrontend: 2, idBackend: 41 }
        ]
      ]
    }

    render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={setsConCartasSinNombre}
        onSelectSet={mockOnSelectSet}
      />
    )

    expect(screen.getByText(/idFront:1.*idFront:2/)).toBeInTheDocument()
  })

  it('debería manejar cartas solo con idBackend', () => {
    const setsConSoloIdBackend = {
      1: [
        [
          { idBackend: 40 },
          { idBackend: 41 }
        ]
      ]
    }

    render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={setsConSoloIdBackend}
        onSelectSet={mockOnSelectSet}
      />
    )

    expect(screen.getByText(/idBack:40.*idBack:41/)).toBeInTheDocument()
  })

  it('debería manejar cartas sin propiedades conocidas mostrando JSON', () => {
    const setsConCartasDesconocidas = {
      1: [
        [
          { unknown: 'property' }
        ]
      ]
    }

    render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={setsConCartasDesconocidas}
        onSelectSet={mockOnSelectSet}
      />
    )

    expect(screen.getByText(/unknown/)).toBeInTheDocument()
  })

  it('debería manejar sets que no son arrays', () => {
    const setsInvalidos = {
      1: [
        'not-an-array'
      ]
    }

    render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={setsInvalidos}
        onSelectSet={mockOnSelectSet}
      />
    )

    // Debería mostrar el JSON del set inválido
    expect(screen.getByText(/not-an-array/)).toBeInTheDocument()
  })

  it('debería aplicar estilos de selección correctamente', () => {
    const { container } = render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    const sets = container.querySelectorAll('.modal-robar-set-item')
    fireEvent.click(sets[0])

    // Verificar que el set seleccionado tiene el estilo correcto
    expect(sets[0].style.background).toBe('rgb(208, 234, 255)') // #d0eaff
    expect(sets[0].style.cursor).toBe('pointer')
  })

  it('debería loggear setsJugados para depuración', () => {
    const consoleSpy = vi.spyOn(console, 'log')

    render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    expect(consoleSpy).toHaveBeenCalledWith('[ModalRobarSet] setsJugados:', mockSetsJugados)
  })

  it('no debería llamar onSelectSet si no hay selección al hacer clic en Robar', () => {
    render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    const robarButton = screen.getByText('Robar Set Seleccionado')
    
    // Intentar hacer clic aunque esté deshabilitado (forzar el evento)
    fireEvent.click(robarButton)

    expect(mockOnSelectSet).not.toHaveBeenCalled()
  })

  it('debería permitir seleccionar sets de diferentes jugadores', () => {
    const { container } = render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={mockSetsJugados}
        onSelectSet={mockOnSelectSet}
      />
    )

    const sets = container.querySelectorAll('.modal-robar-set-item')
    
    // Primer set es del jugador 1
    fireEvent.click(sets[0])
    const robarButton = screen.getByText('Robar Set Seleccionado')
    fireEvent.click(robarButton)
    
    expect(mockOnSelectSet).toHaveBeenCalledWith('1', mockSetsJugados['1'][0])
    
    vi.clearAllMocks()
    
    // Último set es del jugador 2
    fireEvent.click(sets[sets.length - 1])
    fireEvent.click(robarButton)
    
    expect(mockOnSelectSet).toHaveBeenCalledWith('2', mockSetsJugados['2'][0])
  })

  it('debería manejar múltiples jugadores con diferentes cantidades de sets', () => {
    const setsVariados = {
      1: [
        [{ nombre: 'Set 1' }]
      ],
      2: [
        [{ nombre: 'Set 1' }],
        [{ nombre: 'Set 2' }],
        [{ nombre: 'Set 3' }]
      ],
      3: []
    }

    render(
      <ModalRobarSet 
        isOpen={true}
        onClose={mockOnClose}
        setsJugados={setsVariados}
        onSelectSet={mockOnSelectSet}
      />
    )

    expect(screen.getByText('Jugador 1')).toBeInTheDocument()
    expect(screen.getByText('Jugador 2')).toBeInTheDocument()
    expect(screen.getByText('Jugador 3')).toBeInTheDocument()
    expect(screen.getByText('No tiene sets jugados.')).toBeInTheDocument()
  })
})
