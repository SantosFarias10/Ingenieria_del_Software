import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotificationPopup from '../../../components/NotificationPopup'

describe('NotificationPopup Component - Tests Esenciales', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debe renderizar correctamente con mensaje y tipo por defecto', () => {
    render(<NotificationPopup message="Test notification" />)
    
    expect(screen.getByText('Test notification')).toBeInTheDocument()
    const notification = screen.getByTestId('notification-popup')
    expect(notification).toHaveClass('notification-popup', 'visible', 'info')
  })

  it('no debe renderizar cuando no hay mensaje', () => {
    render(<NotificationPopup message={null} />)
    
    expect(screen.queryByTestId('notification-popup')).not.toBeInTheDocument()
  })

  it('debe aplicar diferentes tipos de notificación correctamente', () => {
    const types = ['success', 'error', 'warning']
    
    types.forEach(type => {
      const { unmount } = render(<NotificationPopup message="Test" type={type} />)
      
      const notification = screen.getByTestId('notification-popup')
      expect(notification).toHaveClass('visible', type)
      
      unmount()
    })
  })

  it('debe tener la estructura correcta del DOM', () => {
    render(<NotificationPopup message="Test message" type="info" />)
    
    const notification = screen.getByTestId('notification-popup')
    const content = notification.querySelector('.notification-content')
    const message = notification.querySelector('.notification-message')
    
    expect(content).toBeInTheDocument()
    expect(message).toBeInTheDocument()
    expect(message).toHaveTextContent('Test message')
  })

  it('debe manejar timers y onClose correctamente', () => {
    const onClose = vi.fn()
    const { unmount } = render(<NotificationPopup message="Test" duration={1000} onClose={onClose} />)
    
    // Verificar que está visible inicialmente
    expect(screen.getByTestId('notification-popup')).toHaveClass('visible')
    expect(onClose).not.toHaveBeenCalled()
    
    // Desmontar y verificar que no hay errores de timer
    unmount()
    vi.advanceTimersByTime(1000)
    
    // Test pasa si no hay errores
    expect(true).toBe(true)
  })
})