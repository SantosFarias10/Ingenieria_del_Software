import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ModalDescarteConCantidad from '../../../components/ModalDescarteConCantidad'

describe('ModalDescarteConCantidad', () => {
  const mockOnClose = vi.fn()
  const mockOnSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderizado', () => {
    it('no renderiza nada cuando isOpen es false', () => {
      const { container } = render(
        <ModalDescarteConCantidad
          isOpen={false}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('renderiza el modal cuando isOpen es true', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.getByText('Selecciona la Cantidad')).toBeInTheDocument()
    })

    it('renderiza botones del 1 al máximo (5 por defecto)', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument()
      }
    })

    it('renderiza botones del 1 al máximo personalizado', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          maximo={3}
        />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.queryByText('4')).not.toBeInTheDocument()
    })

    it('muestra el máximo en el texto informativo', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          maximo={7}
        />
      )

      expect(screen.getByText(/1-7/)).toBeInTheDocument()
    })

    it('renderiza los botones Confirmar y Cancelar', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.getByText('Confirmar')).toBeInTheDocument()
      expect(screen.getByText('Cancelar')).toBeInTheDocument()
    })

    it('el botón Confirmar está deshabilitado inicialmente', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnConfirmar = screen.getByText('Confirmar')
      expect(btnConfirmar).toBeDisabled()
    })

    it('renderiza el botón de cerrar (×)', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.getByLabelText('Cerrar')).toBeInTheDocument()
    })
  })

  describe('Selección de cantidad', () => {
    it('selecciona un número al hacer click', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btn3 = screen.getByText('3')
      fireEvent.click(btn3)

      expect(btn3).toHaveClass('seleccionado')
    })

    it('muestra la cantidad seleccionada en el texto', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btn2 = screen.getByText('2')
      fireEvent.click(btn2)

      expect(screen.getByText(/Seleccionadas: 2/)).toBeInTheDocument()
    })

    it('cambia la selección al hacer click en otro número', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btn2 = screen.getByText('2')
      const btn4 = screen.getByText('4')

      fireEvent.click(btn2)
      expect(btn2).toHaveClass('seleccionado')

      fireEvent.click(btn4)
      expect(btn4).toHaveClass('seleccionado')
      expect(btn2).not.toHaveClass('seleccionado')
    })

    it('habilita el botón Confirmar después de seleccionar', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btn3 = screen.getByText('3')
      fireEvent.click(btn3)

      const btnConfirmar = screen.getByText('Confirmar')
      expect(btnConfirmar).not.toBeDisabled()
    })
  })

  describe('Interacciones - Confirmar', () => {
    it('llama a onSelect con la cantidad seleccionada al confirmar', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btn3 = screen.getByText('3')
      fireEvent.click(btn3)

      const btnConfirmar = screen.getByText('Confirmar')
      fireEvent.click(btnConfirmar)

      expect(mockOnSelect).toHaveBeenCalledTimes(1)
      expect(mockOnSelect).toHaveBeenCalledWith(3)
    })

    it('llama a onClose después de confirmar', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btn2 = screen.getByText('2')
      fireEvent.click(btn2)

      const btnConfirmar = screen.getByText('Confirmar')
      fireEvent.click(btnConfirmar)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('no llama a onSelect si no hay cantidad seleccionada', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnConfirmar = screen.getByText('Confirmar')
      fireEvent.click(btnConfirmar)

      expect(mockOnSelect).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('resetea la cantidad seleccionada después de confirmar', () => {
      const { rerender } = render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btn3 = screen.getByText('3')
      fireEvent.click(btn3)

      const btnConfirmar = screen.getByText('Confirmar')
      fireEvent.click(btnConfirmar)

      // Reabrir el modal
      rerender(
        <ModalDescarteConCantidad
          isOpen={false}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )
      
      rerender(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnConfirmarNuevo = screen.getByText('Confirmar')
      expect(btnConfirmarNuevo).toBeDisabled()
    })
  })

  describe('Interacciones - Cancelar', () => {
    it('llama a onClose al hacer click en Cancelar', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnCancelar = screen.getByText('Cancelar')
      fireEvent.click(btnCancelar)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
      expect(mockOnSelect).not.toHaveBeenCalled()
    })

    it('llama a onClose al hacer click en el botón de cerrar (×)', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnCerrar = screen.getByLabelText('Cerrar')
      fireEvent.click(btnCerrar)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('llama a onClose al hacer click en el overlay', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const overlay = document.querySelector('.modal-descarte-cantidad-overlay')
      fireEvent.click(overlay)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('no llama a onClose al hacer click en el panel del modal', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const panel = document.querySelector('.modal-descarte-cantidad-panel')
      fireEvent.click(panel)

      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Props y validaciones', () => {
    it('usa valores por defecto: minimo=1, maximo=5', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('respeta el mínimo personalizado', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          minimo={2}
          maximo={4}
        />
      )

      expect(screen.getByText('1')).toBeInTheDocument() // Sigue mostrando desde 1
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('no llama a onSelect si la cantidad es menor al mínimo', () => {
      // Nota: Este test verifica el comportamiento aunque el componente no impide seleccionar
      // valores fuera del rango, solo valida al confirmar
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          minimo={3}
          maximo={5}
        />
      )

      const btn2 = screen.getByText('2')
      fireEvent.click(btn2)

      const btnConfirmar = screen.getByText('Confirmar')
      fireEvent.click(btnConfirmar)

      // No debería llamar a onSelect si está fuera del rango mínimo
      expect(mockOnSelect).not.toHaveBeenCalled()
    })

    it('maneja onSelect null sin errores', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={null}
        />
      )

      const btn3 = screen.getByText('3')
      fireEvent.click(btn3)

      const btnConfirmar = screen.getByText('Confirmar')
      
      expect(() => fireEvent.click(btnConfirmar)).not.toThrow()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Accesibilidad', () => {
    it('tiene el atributo role="dialog"', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('tiene aria-modal="true"', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('tiene aria-labelledby apuntando al título', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-descarte-cantidad-title')
    })

    it('el botón de cerrar tiene aria-label', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnCerrar = screen.getByLabelText('Cerrar')
      expect(btnCerrar).toBeInTheDocument()
    })
  })

  describe('Casos edge', () => {
    it('maneja máximo = 1 correctamente', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          maximo={1}
        />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.queryByText('2')).not.toBeInTheDocument()
    })

    it('maneja máximo grande (10) correctamente', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          maximo={10}
        />
      )

      for (let i = 1; i <= 10; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument()
      }
    })

    it('permite seleccionar el valor máximo', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          maximo={7}
        />
      )

      const btn7 = screen.getByText('7')
      fireEvent.click(btn7)

      const btnConfirmar = screen.getByText('Confirmar')
      fireEvent.click(btnConfirmar)

      expect(mockOnSelect).toHaveBeenCalledWith(7)
    })
  })

  describe('Clases CSS', () => {
    it('aplica las clases CSS correctas', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(document.querySelector('.modal-descarte-cantidad-overlay')).toBeInTheDocument()
      expect(document.querySelector('.modal-descarte-cantidad-panel')).toBeInTheDocument()
      expect(document.querySelector('.modal-descarte-cantidad-header')).toBeInTheDocument()
      expect(document.querySelector('.modal-descarte-cantidad-content')).toBeInTheDocument()
      expect(document.querySelector('.modal-descarte-cantidad-footer')).toBeInTheDocument()
      expect(document.querySelector('.modal-descarte-numeros')).toBeInTheDocument()
    })

    it('aplica clase "seleccionado" al botón seleccionado', () => {
      render(
        <ModalDescarteConCantidad
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btn3 = screen.getByText('3')
      fireEvent.click(btn3)

      expect(btn3).toHaveClass('numero-btn')
      expect(btn3).toHaveClass('seleccionado')
    })
  })
})
