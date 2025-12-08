import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../../../components/Button/Button'

describe('Button Component', () => {
  it('renderiza correctamente con texto', () => {
    render(<Button>Texto del botón</Button>)
    
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Texto del botón')).toBeInTheDocument()
  })

  it('aplica className correctamente', () => {
    render(<Button className="test-class">Test</Button>)
    
    expect(screen.getByRole('button')).toHaveClass('test-class')
  })

  it('aplica type correctamente', () => {
    render(<Button type="submit">Test</Button>)
    
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('llama onClick cuando se hace clic', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Clickeable</Button>)
    
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('no se rompe sin onClick', async () => {
    const user = userEvent.setup()
    
    render(<Button>Sin onClick</Button>)
    
    // No debería lanzar error
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})