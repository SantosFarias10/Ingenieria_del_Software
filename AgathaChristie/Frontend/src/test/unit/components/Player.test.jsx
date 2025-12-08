import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Player from '../../../components/Player/Player.jsx'

describe('Player (unit)', () => {
	const name = 'Alice'
	const avatar = 'https://example.com/avatar.png'

	it('renderiza el nombre y la imagen con alt correcto', () => {
		render(<Player name={name} avatar={avatar} />)

		// Muestra el nombre
		expect(screen.getByText(name)).toBeInTheDocument()

		// Imagen con alt y src
		const img = screen.getByRole('img', { name })
		expect(img).toBeInTheDocument()
		expect(img).toHaveAttribute('src', avatar)
		expect(img).toHaveAttribute('alt', name)
	})

	it('aplica className y data attributes en el contenedor', () => {
		const className = 'player-item destacado'
		render(<Player name={name} avatar={avatar} className={className} />)

		const wrapper = screen.getByText(name).closest('div')
		expect(wrapper).toHaveClass('player-item')
		expect(wrapper).toHaveClass('destacado')
		expect(wrapper).toHaveAttribute('data-name', name)
		expect(wrapper).toHaveAttribute('data-avatar', avatar)
	})

	it('dispara onClick cuando se hace click en la imagen', async () => {
		const onClick = vi.fn()
		const user = userEvent.setup()

		render(<Player name={name} avatar={avatar} onClick={onClick} />)
		const img = screen.getByRole('img', { name })

		await user.click(img)
		expect(onClick).toHaveBeenCalledTimes(1)
	})
})

