import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Form from '../../../components/Form/Form'

describe('Form Component', () => {
  it('renderiza correctamente con children', () => {
    render(
      <Form>
        <input type="text" placeholder="Test input" />
        <button type="submit">Submit</button>
      </Form>
    )
    
    // Verificar que renderiza un elemento form
    const container = screen.getByPlaceholderText('Test input').closest('form')
    expect(container).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('llama onSubmit cuando se envía el formulario', async () => {
    const handleSubmit = vi.fn((e) => e.preventDefault())
    const user = userEvent.setup()
    
    render(
      <Form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </Form>
    )
    
    await user.click(screen.getByRole('button'))
    
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('permite envío con Enter en input', async () => {
    const handleSubmit = vi.fn((e) => e.preventDefault())
    const user = userEvent.setup()
    
    render(
      <Form onSubmit={handleSubmit}>
        <input type="text" />
        <button type="submit">Submit</button>
      </Form>
    )
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'test{enter}')
    
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })
})