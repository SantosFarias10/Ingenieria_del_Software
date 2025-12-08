import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Secret from '../../../components/Secret'
import * as SecretService from '../../../service/SecretService'

// Mock del SecretService
vi.mock('../../../service/SecretService', () => ({
  encontrarSecretoPorId: vi.fn()
}))

describe('Secret Component - Tests Esenciales', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderizado básico', () => {
    it('debe renderizar el dorso por defecto', () => {
      const mockSecreto = {
        id: 2,
        tipo: 'Secret',
        nombre: 'Es solo un Pescado',
        imagen: '/secretos/02-secret_pescado.png'
      }

      SecretService.encontrarSecretoPorId.mockReturnValue(mockSecreto)
      render(<Secret id={2} />)

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', '/secretos/01-secret_atras.png')
      expect(img).toHaveAttribute('alt', 'Carta secreta')

      const secretDiv = img.parentElement
      expect(secretDiv).toHaveClass('secreto')
      expect(secretDiv).not.toHaveClass('volteada')
    })

    it('debe renderizar volteada mostrando su imagen y nombre', () => {
      const mockSecreto = {
        id: 3,
        tipo: 'Secret',
        nombre: 'No sabe usar Git',
        imagen: '/secretos/03-secret_git.png'
      }

      SecretService.encontrarSecretoPorId.mockReturnValue(mockSecreto)
      render(<Secret id={3} flipped={true} />)

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', '/secretos/03-secret_git.png')
      expect(img).toHaveAttribute('alt', 'No sabe usar Git')

      const secretDiv = img.parentElement
      expect(secretDiv).toHaveClass('volteada')
    })

    it('debe registrar un error si el secreto no existe (sin crashear cuando no está volteada)', () => {
      SecretService.encontrarSecretoPorId.mockReturnValue(undefined)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<Secret id={999} />)

      // Renderiza el dorso por defecto y muestra error en consola
      expect(screen.getByRole('img')).toHaveAttribute('src', '/secretos/01-secret_atras.png')
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('Secreto con ID 999')

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Interacción - voltear secreto', () => {
    it('NO debe voltear el secreto al hacer click (los secretos ya no se voltean manualmente)', () => {
      const mockSecreto = {
        id: 4,
        tipo: 'Secret',
        nombre: 'Tiene depresion',
        imagen: '/secretos/04-secret_depresion.png'
      }

      SecretService.encontrarSecretoPorId.mockReturnValue(mockSecreto)
      const { container } = render(<Secret id={4} sePuedeVoltearse={true} />)

      const secretDiv = container.querySelector('.secreto')
      const img = screen.getByRole('img')

      // Inicialmente dorso (porque flipped=false por defecto)
      expect(img).toHaveAttribute('src', '/secretos/01-secret_atras.png')

      // Click NO voltea (handleFlip está bloqueado)
      fireEvent.click(secretDiv)

      // Sigue mostrando el dorso
      expect(img).toHaveAttribute('src', '/secretos/01-secret_atras.png')
    })

    it('debe llamar a onSelect con id y secretData cuando se hace click y sePuedeVoltearse es true', () => {
      const mockSecreto = {
        id: 5,
        tipo: 'Secret',
        nombre: 'Le tiene miedo a la mujer',
        imagen: '/secretos/05-secret_miedoMujer.png'
      }

      SecretService.encontrarSecretoPorId.mockReturnValue(mockSecreto)
      const onSelectMock = vi.fn()

      const { container } = render(<Secret id={5} sePuedeVoltearse={true} onSelect={onSelectMock} canBeSelected={true} />)
      const secretDiv = container.querySelector('.secreto')

      fireEvent.click(secretDiv)

      expect(onSelectMock).toHaveBeenCalledWith(5, mockSecreto)
      expect(onSelectMock).toHaveBeenCalledTimes(1)
    })

    it('NO debe voltear ni llamar a onSelect cuando sePuedeVoltearse es false', () => {
      const mockSecreto = {
        id: 6,
        tipo: 'Secret',
        nombre: 'Le tiene miedo a las mujeres',
        imagen: '/secretos/06-secret_miedoMujeres.png'
      }

      SecretService.encontrarSecretoPorId.mockReturnValue(mockSecreto)
      const onSelectMock = vi.fn()

      const { container } = render(<Secret id={6} sePuedeVoltearse={false} onSelect={onSelectMock} />)
      const secretDiv = container.querySelector('.secreto')
      const img = screen.getByRole('img')

      // Dorso inicial
      expect(img).toHaveAttribute('src', '/secretos/01-secret_atras.png')

      // Click NO debería cambiar nada
      fireEvent.click(secretDiv)

      expect(img).toHaveAttribute('src', '/secretos/01-secret_atras.png')
      expect(onSelectMock).not.toHaveBeenCalled()
    })
  })
})
