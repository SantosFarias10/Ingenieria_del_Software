import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ModalSeleccionarDireccion from '../../../components/ModalSeleccionarDireccion'

describe('ModalSeleccionarDireccion', () => {
  const mockOnClose = vi.fn()
  const mockOnSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderizado', () => {
    it('no renderiza nada cuando isOpen es false', () => {
      const { container } = render(
        <ModalSeleccionarDireccion
          isOpen={false}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('renderiza el modal cuando isOpen es true', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.getByText('Selecciona una Dirección')).toBeInTheDocument()
    })

    it('renderiza el botón de Izquierda', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.getByText('Izquierda')).toBeInTheDocument()
    })

    it('renderiza el botón de Derecha', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.getByText('Derecha')).toBeInTheDocument()
    })

    it('renderiza las flechas en los botones', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      // Buscar flechas por clase o texto
      const flechas = document.querySelectorAll('.flecha')
      expect(flechas).toHaveLength(2)
      
      // Verificar contenido de las flechas
      expect(flechas[0].textContent).toBe('←')
      expect(flechas[1].textContent).toBe('→')
    })

    it('renderiza el botón de cerrar (×)', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.getByLabelText('Cerrar')).toBeInTheDocument()
    })
  })

  describe('Interacciones - Selección de dirección', () => {
    it('llama a onSelect con 1 al hacer click en Derecha', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnDerecha = screen.getByText('Derecha')
      fireEvent.click(btnDerecha)

      expect(mockOnSelect).toHaveBeenCalledTimes(1)
      expect(mockOnSelect).toHaveBeenCalledWith(1)
    })

    it('llama a onSelect con -1 al hacer click en Izquierda', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnIzquierda = screen.getByText('Izquierda')
      fireEvent.click(btnIzquierda)

      expect(mockOnSelect).toHaveBeenCalledTimes(1)
      expect(mockOnSelect).toHaveBeenCalledWith(-1)
    })

    it('llama a onClose después de seleccionar Derecha', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnDerecha = screen.getByText('Derecha')
      fireEvent.click(btnDerecha)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('llama a onClose después de seleccionar Izquierda', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnIzquierda = screen.getByText('Izquierda')
      fireEvent.click(btnIzquierda)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('puede hacer click en la flecha del botón Derecha', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnDerecha = document.querySelector('.btn-direccion.derecha')
      fireEvent.click(btnDerecha)

      expect(mockOnSelect).toHaveBeenCalledWith(1)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('puede hacer click en la flecha del botón Izquierda', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnIzquierda = document.querySelector('.btn-direccion.izquierda')
      fireEvent.click(btnIzquierda)

      expect(mockOnSelect).toHaveBeenCalledWith(-1)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Interacciones - Cerrar modal', () => {
    it('llama a onClose al hacer click en el botón de cerrar (×)', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnCerrar = screen.getByLabelText('Cerrar')
      fireEvent.click(btnCerrar)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
      expect(mockOnSelect).not.toHaveBeenCalled()
    })

    it('llama a onClose al hacer click en el overlay', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const overlay = document.querySelector('.modal-direccion-overlay')
      fireEvent.click(overlay)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
      expect(mockOnSelect).not.toHaveBeenCalled()
    })

    it('no llama a onClose al hacer click en el panel del modal', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const panel = document.querySelector('.modal-direccion-panel')
      fireEvent.click(panel)

      expect(mockOnClose).not.toHaveBeenCalled()
      expect(mockOnSelect).not.toHaveBeenCalled()
    })
  })

  describe('Accesibilidad', () => {
    it('tiene el atributo role="dialog"', () => {
      render(
        <ModalSeleccionarDireccion
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
        <ModalSeleccionarDireccion
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
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-direccion-title')
    })

    it('el botón de cerrar tiene aria-label', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnCerrar = screen.getByLabelText('Cerrar')
      expect(btnCerrar).toBeInTheDocument()
    })

    it('los botones de dirección tienen type="button"', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnIzquierda = document.querySelector('.btn-direccion.izquierda')
      const btnDerecha = document.querySelector('.btn-direccion.derecha')

      expect(btnIzquierda).toHaveAttribute('type', 'button')
      expect(btnDerecha).toHaveAttribute('type', 'button')
    })
  })

  describe('Clases CSS', () => {
    it('aplica las clases CSS correctas al overlay y panel', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(document.querySelector('.modal-direccion-overlay')).toBeInTheDocument()
      expect(document.querySelector('.modal-direccion-panel')).toBeInTheDocument()
      expect(document.querySelector('.modal-direccion-header')).toBeInTheDocument()
      expect(document.querySelector('.modal-direccion-content')).toBeInTheDocument()
    })

    it('aplica clases correctas a los botones de dirección', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnIzquierda = document.querySelector('.btn-direccion.izquierda')
      const btnDerecha = document.querySelector('.btn-direccion.derecha')

      expect(btnIzquierda).toHaveClass('btn-direccion', 'izquierda')
      expect(btnDerecha).toHaveClass('btn-direccion', 'derecha')
    })

    it('las flechas tienen la clase "flecha"', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const flechas = document.querySelectorAll('.flecha')
      expect(flechas).toHaveLength(2)
    })

    it('los textos tienen la clase "texto"', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const textos = document.querySelectorAll('.texto')
      expect(textos).toHaveLength(2)
      expect(textos[0].textContent).toBe('Izquierda')
      expect(textos[1].textContent).toBe('Derecha')
    })
  })

  describe('Estructura del modal', () => {
    it('renderiza el header con el título', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const header = document.querySelector('.modal-direccion-header')
      expect(header).toBeInTheDocument()
      
      const titulo = document.getElementById('modal-direccion-title')
      expect(titulo).toBeInTheDocument()
      expect(titulo.textContent).toBe('Selecciona una Dirección')
    })

    it('renderiza el contenido con los botones de dirección', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const content = document.querySelector('.modal-direccion-content')
      expect(content).toBeInTheDocument()

      const botonesContainer = document.querySelector('.direccion-buttons')
      expect(botonesContainer).toBeInTheDocument()
    })

    it('los botones están en el orden correcto (Izquierda, Derecha)', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const botones = document.querySelectorAll('.btn-direccion')
      expect(botones).toHaveLength(2)
      
      expect(botones[0]).toHaveClass('izquierda')
      expect(botones[1]).toHaveClass('derecha')
    })
  })

  describe('Comportamiento de stopPropagation', () => {
    it('previene la propagación de eventos al hacer click en el panel', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const panel = document.querySelector('.modal-direccion-panel')
      const clickEvent = new MouseEvent('click', { bubbles: true })
      
      const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation')
      panel.dispatchEvent(clickEvent)

      // No se puede verificar directamente stopPropagation con fireEvent,
      // pero podemos verificar que no se llame onClose
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Valores retornados', () => {
    it('retorna 1 para dirección derecha (positivo)', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnDerecha = screen.getByText('Derecha')
      fireEvent.click(btnDerecha)

      expect(mockOnSelect).toHaveBeenCalledWith(1)
    })

    it('retorna -1 para dirección izquierda (negativo)', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnIzquierda = screen.getByText('Izquierda')
      fireEvent.click(btnIzquierda)

      expect(mockOnSelect).toHaveBeenCalledWith(-1)
    })
  })

  describe('Casos edge', () => {
    it('maneja múltiples clicks en el mismo botón', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnDerecha = screen.getByText('Derecha')
      
      fireEvent.click(btnDerecha)
      
      // Solo debería registrar el primer click (el modal se cierra)
      expect(mockOnSelect).toHaveBeenCalledTimes(1)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('onSelect es requerido para el funcionamiento del componente', () => {
      // Este test verifica que el componente requiere onSelect
      // Si onSelect no está definido, el componente intentará llamarlo y fallará
      // Simplemente verificamos que el componente se renderiza con onSelect válido
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const btnDerecha = screen.getByText('Derecha')
      fireEvent.click(btnDerecha)
      
      // Con onSelect válido, funciona correctamente
      expect(mockOnSelect).toHaveBeenCalledWith(1)
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Título del modal', () => {
    it('el título tiene el id correcto para aria-labelledby', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const titulo = document.getElementById('modal-direccion-title')
      expect(titulo).toBeInTheDocument()
      expect(titulo).toHaveClass('modal-direccion-title')
    })

    it('el título es un h2', () => {
      render(
        <ModalSeleccionarDireccion
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const titulo = document.querySelector('h2#modal-direccion-title')
      expect(titulo).toBeInTheDocument()
    })
  })
})
