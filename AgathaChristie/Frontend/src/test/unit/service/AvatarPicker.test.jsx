import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AvatarPicker from '../../../components/AvatarPicker/AvatarPicker'

describe('AvatarPicker Component', () => {
  const mockAvatars = [
    { value: 'avatar1', src: '/assets/avatar1.jpg', alt: 'Avatar 1' },
    { value: 'avatar2', src: '/assets/avatar2.jpg', alt: 'Avatar 2' },
    { value: 'avatar3', src: '/assets/avatar3.jpg', alt: 'Avatar 3' }
  ]

  it('renderiza correctamente sin avatares', () => {
    const { container } = render(<AvatarPicker />)
    
    // Verificar que existe el div contenedor
    const avatarsContainer = container.querySelector('.avatars')
    expect(avatarsContainer).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  it('renderiza todos los avatares proporcionados', () => {
    render(<AvatarPicker avatars={mockAvatars} />)
    
    const radioButtons = screen.getAllByRole('radio')
    const images = screen.getAllByRole('img')
    
    expect(radioButtons).toHaveLength(3)
    expect(images).toHaveLength(3)
    
    // Verificar que cada avatar se renderiza correctamente
    expect(screen.getByDisplayValue('avatar1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('avatar2')).toBeInTheDocument()
    expect(screen.getByDisplayValue('avatar3')).toBeInTheDocument()
    
    expect(screen.getByAltText('Avatar 1')).toBeInTheDocument()
    expect(screen.getByAltText('Avatar 2')).toBeInTheDocument()
    expect(screen.getByAltText('Avatar 3')).toBeInTheDocument()
  })

  it('llama onChange cuando se selecciona un avatar', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    
    render(<AvatarPicker avatars={mockAvatars} onChange={handleChange} />)
    
    const firstRadio = screen.getByDisplayValue('avatar1')
    await user.click(firstRadio)
    
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(firstRadio).toBeChecked()
  })

  it('aplica el name correcto a los radio buttons', () => {
    render(<AvatarPicker avatars={mockAvatars} name="test-avatar" />)
    
    const radioButtons = screen.getAllByRole('radio')
    radioButtons.forEach(radio => {
      expect(radio).toHaveAttribute('name', 'test-avatar')
    })
  })

  it('usa "avatar" como name por defecto', () => {
    render(<AvatarPicker avatars={mockAvatars} />)
    
    const radioButtons = screen.getAllByRole('radio')
    radioButtons.forEach(radio => {
      expect(radio).toHaveAttribute('name', 'avatar')
    })
  })

  it('permite seleccionar solo un avatar a la vez', async () => {
    const user = userEvent.setup()
    
    render(<AvatarPicker avatars={mockAvatars} />)
    
    const firstRadio = screen.getByDisplayValue('avatar1')
    const secondRadio = screen.getByDisplayValue('avatar2')
    
    // Seleccionar el primer avatar
    await user.click(firstRadio)
    expect(firstRadio).toBeChecked()
    expect(secondRadio).not.toBeChecked()
    
    // Seleccionar el segundo avatar (debería deseleccionar el primero)
    await user.click(secondRadio)
    expect(firstRadio).not.toBeChecked()
    expect(secondRadio).toBeChecked()
  })
})