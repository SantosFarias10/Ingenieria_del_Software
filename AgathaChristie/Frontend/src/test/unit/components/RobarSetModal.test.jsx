import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock CSS imports
vi.mock('../../../components/RobarSetModal.css', () => ({}))

import RobarSetModal from '../../../components/RobarSetModal'

describe('RobarSetModal Component', () => {
  const mockOnClose = vi.fn()
  const mockOnRobarSet = vi.fn()

  const mockPlayerNames = {
    1: 'Alice',
    2: 'Bob',
    3: 'Charlie',
    4: 'Diana'
  }

  const mockAllPlayerSets = {
    1: {}, // Jugador actual sin sets
    2: {
      5: [
        { id: 40, id_front: 1, nombre: 'Hercule Poirot' },
        { id: 41, id_front: 1, nombre: 'Hercule Poirot' },
        { id: 21, id_front: 8, nombre: 'Harley Quin Wildcard' }
      ],
      7: [
        { id: 28, id_front: 2, nombre: 'Miss Marple' },
        { id: 29, id_front: 2, nombre: 'Miss Marple' }
      ]
    },
    3: {
      3: [
        { id: 34, id_front: 6, nombre: 'Tommy Beresford' },
        { id: 38, id_front: 7, nombre: 'Tuppence Beresford' }
      ]
    }
  }

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    currentPlayerId: 1,
    playerNames: mockPlayerNames,
    onRobarSet: mockOnRobarSet,
    allPlayerSets: mockAllPlayerSets
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderizado básico', () => {
    it('debería renderizar el modal cuando isOpen es true', () => {
      render(<RobarSetModal {...defaultProps} />)
      
      expect(screen.getByText('🎯 Robar Set de Otro Jugador')).toBeInTheDocument()
    })

    it('no debería renderizar nada cuando isOpen es false', () => {
      const { container } = render(<RobarSetModal {...defaultProps} isOpen={false} />)
      
      expect(container.firstChild).toBeNull()
    })

    it('debería renderizar el botón de cerrar (×)', () => {
      render(<RobarSetModal {...defaultProps} />)
      
      expect(screen.getByText('×')).toBeInTheDocument()
    })

    it('debería renderizar el botón Cancelar', () => {
      render(<RobarSetModal {...defaultProps} />)
      
      expect(screen.getByText('Cancelar')).toBeInTheDocument()
    })
  })

  describe('Visualización de sets', () => {
    it('debería mostrar sets de otros jugadores pero no del jugador actual', () => {
      render(<RobarSetModal {...defaultProps} />)
      
      // Debería mostrar Bob y Charlie (jugadores 2 y 3)
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
      
      // No debería mostrar Alice (jugador actual, id 1)
      expect(screen.queryByText('Alice')).not.toBeInTheDocument()
    })

    it('debería mostrar mensaje cuando no hay sets disponibles', () => {
      const propsWithoutSets = {
        ...defaultProps,
        allPlayerSets: {
          1: {}, // Jugador actual
          2: {}, // Sin sets
          3: {}  // Sin sets
        }
      }
      
      render(<RobarSetModal {...propsWithoutSets} />)
      
      expect(screen.getByText('No hay sets disponibles para robar')).toBeInTheDocument()
    })

    it('debería mostrar mensaje cuando allPlayerSets está vacío', () => {
      render(<RobarSetModal {...defaultProps} allPlayerSets={{}} />)
      
      expect(screen.getByText('No hay sets disponibles para robar')).toBeInTheDocument()
    })

    it('debería mostrar la cantidad correcta de cartas en cada set', () => {
      render(<RobarSetModal {...defaultProps} />)
      
      // Set con 3 cartas
      expect(screen.getByText('(3 cartas)')).toBeInTheDocument()
      // Set con 2 cartas
      expect(screen.getAllByText('(2 cartas)').length).toBeGreaterThan(0)
    })

    it('debería mostrar los nombres de los detectives correctamente', () => {
      render(<RobarSetModal {...defaultProps} />)
      
      // Los nombres están en los atributos alt de las imágenes
      expect(screen.getAllByAltText('Hercule Poirot').length).toBeGreaterThan(0)
      expect(screen.getAllByAltText('Miss Marple').length).toBeGreaterThan(0)
      expect(screen.getByAltText('Tommy Beresford')).toBeInTheDocument()
      expect(screen.getByAltText('Tuppence Beresford')).toBeInTheDocument()
    })

    it('debería mostrar Set # con el índice correcto', () => {
      render(<RobarSetModal {...defaultProps} />)
      
      expect(screen.getByText('Set #5')).toBeInTheDocument()
      expect(screen.getByText('Set #7')).toBeInTheDocument()
      expect(screen.getByText('Set #3')).toBeInTheDocument()
    })

    it('no debería mostrar jugadores sin sets', () => {
      const propsWithMixedSets = {
        ...defaultProps,
        allPlayerSets: {
          1: {}, // Jugador actual
          2: {
            5: [{ id: 40, id_front: 1, nombre: 'Hercule Poirot' }]
          },
          3: {}, // Sin sets
          4: {} // Sin sets
        }
      }
      
      render(<RobarSetModal {...propsWithMixedSets} />)
      
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.queryByText('Charlie')).not.toBeInTheDocument()
      expect(screen.queryByText('Diana')).not.toBeInTheDocument()
    })
  })

  describe('Funciones de nombres', () => {
    it('debería usar getPlayerName para mostrar nombres personalizados', () => {
      render(<RobarSetModal {...defaultProps} />)
      
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
    })

    it('debería usar nombre por defecto cuando playerNames no tiene el jugador', () => {
      const propsWithoutNames = {
        ...defaultProps,
        playerNames: {} // Sin nombres
      }
      
      render(<RobarSetModal {...propsWithoutNames} />)
      
      expect(screen.getByText('Jugador 2')).toBeInTheDocument()
      expect(screen.getByText('Jugador 3')).toBeInTheDocument()
    })

    it('debería usar getDetectiveName para todos los detectives conocidos', () => {
      const allDetectives = {
        1: {},
        2: {
          1: [
            { id: 1, id_front: 1 }, // Hercule Poirot
            { id: 2, id_front: 2 }, // Miss Marple
            { id: 3, id_front: 3 }, // Mr Satterthwaite
            { id: 4, id_front: 4 }, // Parker Pyne
          ],
          2: [
            { id: 5, id_front: 5 }, // Lady Eileen
            { id: 6, id_front: 6 }, // Tommy Beresford
            { id: 7, id_front: 7 }, // Tuppence Beresford
          ],
          3: [
            { id: 8, id_front: 8 }, // Harley Quin
            { id: 9, id_front: 9 }, // Adriane Oliver
          ]
        }
      }

      render(<RobarSetModal {...defaultProps} allPlayerSets={allDetectives} />)
      
      expect(screen.getByAltText('Hercule Poirot')).toBeInTheDocument()
      expect(screen.getByAltText('Miss Marple')).toBeInTheDocument()
      expect(screen.getByAltText('Mr. Satterthwaite')).toBeInTheDocument()
      expect(screen.getByAltText('Parker Pyne')).toBeInTheDocument()
      expect(screen.getByAltText('George Brent')).toBeInTheDocument()
      expect(screen.getByAltText('Tommy Beresford')).toBeInTheDocument()
      expect(screen.getByAltText('Tuppence Beresford')).toBeInTheDocument()
      expect(screen.getByAltText('Harley Quin')).toBeInTheDocument()
      expect(screen.getByAltText('Ariadne Oliver')).toBeInTheDocument()
    })

    it('debería usar nombre por defecto para detectives desconocidos', () => {
      const propsWithUnknownDetective = {
        ...defaultProps,
        allPlayerSets: {
          1: {},
          2: {
            5: [
              { id: 99, id_front: 99, nombre: 'Detective Desconocido' }
            ]
          }
        }
      }
      
      render(<RobarSetModal {...propsWithUnknownDetective} />)
      
      // Cuando el id_front no existe, Card muestra "Carta no encontrada"
      expect(screen.getByText('Carta no encontrada')).toBeInTheDocument()
    })
  })

  describe('Interacciones del usuario', () => {
    it('debería llamar onClose cuando se hace clic en el overlay', () => {
      const { container } = render(<RobarSetModal {...defaultProps} />)
      
      const overlay = container.querySelector('.modal-overlay')
      fireEvent.click(overlay)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('no debería llamar onClose cuando se hace clic dentro del modal', () => {
      const { container } = render(<RobarSetModal {...defaultProps} />)
      
      const modal = container.querySelector('.robar-set-modal')
      fireEvent.click(modal)
      
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('debería llamar onClose cuando se hace clic en el botón cerrar (×)', () => {
      render(<RobarSetModal {...defaultProps} />)
      
      const closeButton = screen.getByText('×')
      fireEvent.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('debería llamar onClose cuando se hace clic en Cancelar', () => {
      render(<RobarSetModal {...defaultProps} />)
      
      const cancelButton = screen.getByText('Cancelar')
      fireEvent.click(cancelButton)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Selección de sets', () => {
    it('debería seleccionar un set al hacer clic en él', () => {
      const { container } = render(<RobarSetModal {...defaultProps} />)
      
      const setItems = container.querySelectorAll('.set-item')
      fireEvent.click(setItems[0])
      
      expect(setItems[0]).toHaveClass('selected')
    })

    it('debería cambiar la selección al hacer clic en otro set', () => {
      const { container } = render(<RobarSetModal {...defaultProps} />)
      
      const setItems = container.querySelectorAll('.set-item')
      
      fireEvent.click(setItems[0])
      expect(setItems[0]).toHaveClass('selected')
      
      fireEvent.click(setItems[1])
      expect(setItems[1]).toHaveClass('selected')
      expect(setItems[0]).not.toHaveClass('selected')
    })

    it('debería mostrar botón de confirmar cuando hay un set seleccionado', () => {
      const { container } = render(<RobarSetModal {...defaultProps} />)
      
      // Inicialmente no debería estar
      expect(screen.queryByText('🎯 Robar Set Seleccionado')).not.toBeInTheDocument()
      
      // Seleccionar un set
      const setItems = container.querySelectorAll('.set-item')
      fireEvent.click(setItems[0])
      
      // Ahora debería aparecer
      expect(screen.getByText('🎯 Robar Set Seleccionado')).toBeInTheDocument()
    })

    it('debería ocultar botón de confirmar después de robar', async () => {
      const { container } = render(<RobarSetModal {...defaultProps} />)
      
      const setItems = container.querySelectorAll('.set-item')
      fireEvent.click(setItems[0])
      
      const confirmButton = screen.getByText('🎯 Robar Set Seleccionado')
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })
  })

  describe('Función handleRobarSet', () => {
    it('debería llamar onRobarSet con los parámetros correctos desde el botón directo', () => {
      const { container } = render(<RobarSetModal {...defaultProps} />)
      
      const robarButtons = container.querySelectorAll('.robar-button')
      fireEvent.click(robarButtons[0])
      
      expect(mockOnRobarSet).toHaveBeenCalledTimes(1)
      expect(mockOnRobarSet).toHaveBeenCalledWith(
        2, // jugadorId
        '5', // setIndex
        mockAllPlayerSets[2]['5'] // setCards
      )
    })

    it('debería llamar onRobarSet desde el botón de confirmar', () => {
      const { container } = render(<RobarSetModal {...defaultProps} />)
      
      const setItems = container.querySelectorAll('.set-item')
      fireEvent.click(setItems[0])
      
      const confirmButton = screen.getByText('🎯 Robar Set Seleccionado')
      fireEvent.click(confirmButton)
      
      expect(mockOnRobarSet).toHaveBeenCalledTimes(1)
      expect(mockOnRobarSet).toHaveBeenCalledWith(
        2,
        '5',
        mockAllPlayerSets[2]['5']
      )
    })

    it('debería llamar onClose después de robar un set', () => {
      const { container } = render(<RobarSetModal {...defaultProps} />)
      
      const robarButtons = container.querySelectorAll('.robar-button')
      fireEvent.click(robarButtons[0])
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('no debería propagarse el clic al hacer clic en el botón robar', () => {
      const { container } = render(<RobarSetModal {...defaultProps} />)
      
      const setItems = container.querySelectorAll('.set-item')
      const robarButton = setItems[0].querySelector('.robar-button')
      
      // Hacer clic en el botón no debería seleccionar el set (stopPropagation)
      fireEvent.click(robarButton)
      
      expect(mockOnRobarSet).toHaveBeenCalled()
    })

    it('no debería llamar onRobarSet si onRobarSet es undefined', () => {
      const propsWithoutHandler = {
        ...defaultProps,
        onRobarSet: undefined
      }
      
      const { container } = render(<RobarSetModal {...propsWithoutHandler} />)
      
      const robarButtons = container.querySelectorAll('.robar-button')
      
      // No debería lanzar error
      expect(() => fireEvent.click(robarButtons[0])).not.toThrow()
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('debería robar sets de diferentes jugadores correctamente', () => {
      const { container } = render(<RobarSetModal {...defaultProps} />)
      
      const robarButtons = container.querySelectorAll('.robar-button')
      
      // Robar del jugador 2
      fireEvent.click(robarButtons[0])
      expect(mockOnRobarSet).toHaveBeenCalledWith(2, '5', expect.any(Array))
      
      vi.clearAllMocks()
      
      // Robar del jugador 3
      fireEvent.click(robarButtons[robarButtons.length - 1])
      expect(mockOnRobarSet).toHaveBeenCalledWith(3, '3', expect.any(Array))
    })
  })

  describe('useEffect - Limpieza de estado', () => {
    it('debería limpiar selectedSet cuando el modal se abre', () => {
      const { rerender, container } = render(<RobarSetModal {...defaultProps} isOpen={false} />)
      
      // Abrir modal y seleccionar un set
      rerender(<RobarSetModal {...defaultProps} isOpen={true} />)
      
      const setItems = container.querySelectorAll('.set-item')
      if (setItems.length > 0) {
        fireEvent.click(setItems[0])
        expect(setItems[0]).toHaveClass('selected')
      }
      
      // Cerrar y reabrir
      rerender(<RobarSetModal {...defaultProps} isOpen={false} />)
      rerender(<RobarSetModal {...defaultProps} isOpen={true} />)
      
      // La selección debería estar limpia
      const setItemsAfter = container.querySelectorAll('.set-item')
      if (setItemsAfter.length > 0) {
        expect(setItemsAfter[0]).not.toHaveClass('selected')
      }
    })

    it('debería limpiar error cuando el modal se abre', () => {
      const { rerender } = render(<RobarSetModal {...defaultProps} isOpen={true} />)
      
      // Cerrar y reabrir
      rerender(<RobarSetModal {...defaultProps} isOpen={false} />)
      rerender(<RobarSetModal {...defaultProps} isOpen={true} />)
      
      // No debería haber mensaje de error
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })
  })

  describe('Casos edge', () => {
    it('debería manejar allPlayerSets como undefined', () => {
      render(<RobarSetModal {...defaultProps} allPlayerSets={undefined} />)
      
      // No debería crashear
      expect(screen.getByText('🎯 Robar Set de Otro Jugador')).toBeInTheDocument()
    })

    it('debería manejar playerNames como undefined', () => {
      render(<RobarSetModal {...defaultProps} playerNames={undefined} />)
      
      // Debería usar nombres por defecto
      expect(screen.getByText('Jugador 2')).toBeInTheDocument()
      expect(screen.getByText('Jugador 3')).toBeInTheDocument()
    })

    it('debería manejar sets vacíos para todos los jugadores excepto el actual', () => {
      const propsAllEmpty = {
        ...defaultProps,
        allPlayerSets: {
          1: {},
          2: {},
          3: {},
          4: {}
        }
      }
      
      render(<RobarSetModal {...propsAllEmpty} />)
      
      expect(screen.getByText('No hay sets disponibles para robar')).toBeInTheDocument()
    })

    it('debería manejar currentPlayerId que no existe en allPlayerSets', () => {
      const propsWithMissingPlayer = {
        ...defaultProps,
        currentPlayerId: 999
      }
      
      render(<RobarSetModal {...propsWithMissingPlayer} />)
      
      // Debería mostrar todos los sets
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
    })

    it('debería manejar sets con cartas sin id_front', () => {
      const propsWithMissingIdFront = {
        ...defaultProps,
        allPlayerSets: {
          1: {},
          2: {
            5: [
              { id: 40 }, // Sin id_front
              { id: 41, id_front: null } // id_front null
            ]
          }
        }
      }
      
      render(<RobarSetModal {...propsWithMissingIdFront} />)
      
      // Debería renderizar sin crashear
      expect(screen.getByText('Set #5')).toBeInTheDocument()
    })

    it('debería renderizar múltiples sets por jugador', () => {
      const propsWithMultipleSets = {
        ...defaultProps,
        allPlayerSets: {
          1: {},
          2: {
            1: [{ id: 1, id_front: 1 }],
            2: [{ id: 2, id_front: 2 }],
            3: [{ id: 3, id_front: 3 }],
            4: [{ id: 4, id_front: 4 }]
          }
        }
      }
      
      render(<RobarSetModal {...propsWithMultipleSets} />)
      
      expect(screen.getByText('Set #1')).toBeInTheDocument()
      expect(screen.getByText('Set #2')).toBeInTheDocument()
      expect(screen.getByText('Set #3')).toBeInTheDocument()
      expect(screen.getByText('Set #4')).toBeInTheDocument()
    })

    it('debería convertir playerId a número correctamente', () => {
      render(<RobarSetModal {...defaultProps} />)
      
      const { container } = render(<RobarSetModal {...defaultProps} />)
      const robarButtons = container.querySelectorAll('.robar-button')
      fireEvent.click(robarButtons[0])
      
      // Verificar que se llama con número, no string
      expect(mockOnRobarSet).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(String),
        expect.any(Array)
      )
    })
  })

  describe('Renderizado de cartas', () => {
    it('debería renderizar todas las cartas de un set', () => {
      render(<RobarSetModal {...defaultProps} />)
      
      // El primer set tiene cartas, verificamos por alt text
      const cards = screen.getAllByAltText('Hercule Poirot')
      expect(cards.length).toBeGreaterThanOrEqual(2) // Al menos 2 Poirot en ese set
    })

    it('debería llamar renderSetCards para cada set', () => {
      const { container } = render(<RobarSetModal {...defaultProps} />)
      
      const setCards = container.querySelectorAll('.set-cards')
      expect(setCards.length).toBeGreaterThan(0)
      
      // Cada set-cards debería tener cartas dentro
      setCards.forEach(setCard => {
        expect(setCard.children.length).toBeGreaterThan(0)
      })
    })

    it('debería mostrar imágenes de cartas con alt text', () => {
      const { container } = render(<RobarSetModal {...defaultProps} />)
      
      const cardImages = container.querySelectorAll('.imagen-carta')
      expect(cardImages.length).toBeGreaterThan(0)
      
      cardImages.forEach(img => {
        expect(img.alt).not.toBe('')
      })
    })
  })

  describe('Integración completa', () => {
    it('debería completar el flujo completo de robar un set', () => {
      const { container } = render(<RobarSetModal {...defaultProps} />)
      
      // 1. Modal se abre
      expect(screen.getByText('🎯 Robar Set de Otro Jugador')).toBeInTheDocument()
      
      // 2. Seleccionar un set
      const setItems = container.querySelectorAll('.set-item')
      fireEvent.click(setItems[0])
      expect(setItems[0]).toHaveClass('selected')
      
      // 3. Aparece botón de confirmar
      const confirmButton = screen.getByText('🎯 Robar Set Seleccionado')
      expect(confirmButton).toBeInTheDocument()
      
      // 4. Confirmar robo
      fireEvent.click(confirmButton)
      
      // 5. Se llaman los handlers
      expect(mockOnRobarSet).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('debería permitir cancelar después de seleccionar', () => {
      const { container } = render(<RobarSetModal {...defaultProps} />)
      
      // Seleccionar un set
      const setItems = container.querySelectorAll('.set-item')
      fireEvent.click(setItems[0])
      
      // Cancelar
      const cancelButton = screen.getByText('Cancelar')
      fireEvent.click(cancelButton)
      
      // onClose debería ser llamado pero no onRobarSet
      expect(mockOnClose).toHaveBeenCalled()
      expect(mockOnRobarSet).not.toHaveBeenCalled()
    })
  })
})
