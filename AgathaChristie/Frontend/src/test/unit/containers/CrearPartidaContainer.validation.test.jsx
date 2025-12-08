import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CrearPartidaContainer from '../../../container/CrearPartidaContainer'

// Mock de los servicios
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('../../../service/HttpService', () => ({
  createGame: vi.fn()
}))

vi.mock('../../../service/LocalStorage', () => ({
  saveGame: vi.fn()
}))

vi.mock('../../../container/LobbyContainer', () => ({
  openLobby: vi.fn()
}))

describe('CrearPartidaContainer - Validation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithRouter = (component) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    )
  }

  describe('Range Validation Tests (Requirements 1.3, 1.4)', () => {
    it('should show error when maximum players is greater than 6', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, '7')
      
      expect(screen.getByText('El número máximo de jugadores es 6')).toBeInTheDocument()
    })

    it('should show error when minimum players is less than 2', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
      
      await user.clear(minPlayersInput)
      await user.type(minPlayersInput, '1')
      
      expect(screen.getByText('El número mínimo de jugadores debe ser al menos 2')).toBeInTheDocument()
    })

    it('should validate that inputs have correct min and max attributes', async () => {
      renderWithRouter(<CrearPartidaContainer />)
      
      const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      // Both inputs should have proper HTML validation attributes
      expect(minPlayersInput).toHaveAttribute('min', '2')
      expect(minPlayersInput).toHaveAttribute('max', '6')
      expect(minPlayersInput).toHaveAttribute('type', 'number')
      
      expect(maxPlayersInput).toHaveAttribute('min', '2')
      expect(maxPlayersInput).toHaveAttribute('max', '6')
      expect(maxPlayersInput).toHaveAttribute('type', 'number')
    })

    it('should not show error for valid player count values', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      // Test valid values within range
      for (const validValue of ['2', '3', '4', '5', '6']) {
        await user.clear(minPlayersInput)
        await user.type(minPlayersInput, validValue)
        
        await user.clear(maxPlayersInput)
        await user.type(maxPlayersInput, validValue)
        
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
      }
    })

    it('should show error for boundary violations', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      // Test upper boundary violation for max
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, '8')
      expect(screen.getByText('El número máximo de jugadores es 6')).toBeInTheDocument()
      
      // Test lower boundary violation for min
      await user.clear(minPlayersInput)
      await user.type(minPlayersInput, '0')
      expect(screen.getByText('El número mínimo de jugadores debe ser al menos 2')).toBeInTheDocument()
    })
  })

  describe('Auto-correction Tests (Requirements 2.1, 2.2)', () => {
    it('should auto-correct maximum when minimum is set above it', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      // First set max to 4
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, '4')
      
      // Then set min to 5 (which is > max)
      await user.clear(minPlayersInput)
      await user.type(minPlayersInput, '5')
      
      // Max should be auto-corrected to 5
      expect(maxPlayersInput).toHaveValue(5)
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })

    it('should auto-correct minimum when maximum is set below it', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      // First set min to 4
      await user.clear(minPlayersInput)
      await user.type(minPlayersInput, '4')
      
      // Then set max to 3 (which is < min)
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, '3')
      
      // Min should be auto-corrected to 3
      expect(minPlayersInput).toHaveValue(3)
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })

    it('should maintain valid state when setting valid values', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      // Test setting various valid combinations
      const validCombinations = [
        { min: 2, max: 6 },
        { min: 3, max: 5 },
        { min: 2, max: 2 },
        { min: 6, max: 6 }
      ]
      
      for (const { min, max } of validCombinations) {
        await user.clear(minPlayersInput)
        await user.type(minPlayersInput, min.toString())
        
        await user.clear(maxPlayersInput)
        await user.type(maxPlayersInput, max.toString())
        
        // Should not show any error for valid combinations
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
        expect(minPlayersInput).toHaveValue(min)
        expect(maxPlayersInput).toHaveValue(max)
      }
    })

    it('should clear errors when correcting invalid values', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      // First set an invalid value
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, '7')
      expect(screen.getByText('El número máximo de jugadores es 6')).toBeInTheDocument()
      
      // Then correct it to a valid value
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, '4')
      
      // Error should be cleared
      expect(screen.queryByText('El número máximo de jugadores es 6')).not.toBeInTheDocument()
    })

    it('should handle edge case of setting maximum equal to minimum', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      // Set both to same value (3)
      await user.clear(minPlayersInput)
      await user.type(minPlayersInput, '3')
      
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, '3')
      
      // Should be valid since min=max is allowed
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
      expect(minPlayersInput).toHaveValue(3)
      expect(maxPlayersInput).toHaveValue(3)
    })

    it('should handle rapid value changes correctly', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      // Simulate rapid changes
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, '7') // Invalid
      expect(screen.getByText('El número máximo de jugadores es 6')).toBeInTheDocument()
      
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, '3') // Valid
      expect(screen.queryByText('El número máximo de jugadores es 6')).not.toBeInTheDocument()
      
      await user.clear(minPlayersInput)
      await user.type(minPlayersInput, '0') // Invalid
      expect(screen.getByText('El número mínimo de jugadores debe ser al menos 2')).toBeInTheDocument()
      
      await user.clear(minPlayersInput)
      await user.type(minPlayersInput, '2') // Valid
      expect(screen.queryByText('El número mínimo de jugadores debe ser al menos 2')).not.toBeInTheDocument()
    })
  })

  describe('Validation Integration Tests', () => {
    it('should prevent form submission with invalid player counts', async () => {
      const user = userEvent.setup()
      const { createGame } = await import('../../../service/HttpService')
      createGame.mockResolvedValue({ id: 123, nombre: 'Test Game' })
      
      renderWithRouter(<CrearPartidaContainer />)
      
      const nameInput = screen.getByPlaceholderText('Nombre de la Partida')
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      await user.type(nameInput, 'Test Game')
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, '7') // Invalid: greater than 6
      
      const submitButton = screen.getByRole('button', { name: 'Crear Partida' })
      await user.click(submitButton)
      
      // Should show error and not proceed with game creation
      expect(screen.getByText('El número máximo de jugadores es 6')).toBeInTheDocument()
      expect(createGame).not.toHaveBeenCalled()
    })

    it('should prevent form submission with minimum validation errors', async () => {
      const user = userEvent.setup()
      const { createGame } = await import('../../../service/HttpService')
      createGame.mockResolvedValue({ id: 123, nombre: 'Test Game' })
      
      renderWithRouter(<CrearPartidaContainer />)
      
      const nameInput = screen.getByPlaceholderText('Nombre de la Partida')
      const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
      
      await user.type(nameInput, 'Test Game')
      await user.clear(minPlayersInput)
      await user.type(minPlayersInput, '1') // Invalid: less than minimum
      
      const submitButton = screen.getByRole('button', { name: 'Crear Partida' })
      await user.click(submitButton)
      
      // Should show error and not proceed
      expect(screen.getByText('El número mínimo de jugadores debe ser al menos 2')).toBeInTheDocument()
      expect(createGame).not.toHaveBeenCalled()
    })

    it('should allow form submission with valid player counts', async () => {
      const user = userEvent.setup()
      const { createGame } = await import('../../../service/HttpService')
      const { openLobby } = await import('../../../container/LobbyContainer')
      createGame.mockResolvedValue({ id: 123, nombre: 'Test Game' })
      
      renderWithRouter(<CrearPartidaContainer />)
      
      const nameInput = screen.getByPlaceholderText('Nombre de la Partida')
      const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      await user.type(nameInput, 'Test Game')
      await user.clear(minPlayersInput)
      await user.type(minPlayersInput, '3')
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, '4')
      
      // Should not show any error
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
      
      const submitButton = screen.getByRole('button', { name: 'Crear Partida' })
      await user.click(submitButton)
      
      // Should proceed with game creation
      expect(createGame).toHaveBeenCalledWith({
        gameName: 'Test Game',
        minPlayers: 3,
        maxPlayers: 4
      })
      expect(openLobby).toHaveBeenCalled()
    })

    it('should validate all boundary values correctly in form submission', async () => {
      const user = userEvent.setup()
      const { createGame } = await import('../../../service/HttpService')
      createGame.mockResolvedValue({ id: 123, nombre: 'Test Game' })
      
      renderWithRouter(<CrearPartidaContainer />)
      
      const nameInput = screen.getByPlaceholderText('Nombre de la Partida')
      const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      await user.type(nameInput, 'Test Game')
      
      // Test minimum boundary (2)
      await user.clear(minPlayersInput)
      await user.type(minPlayersInput, '2')
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
      
      // Test maximum boundary (6)
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, '6')
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
      
      const submitButton = screen.getByRole('button', { name: 'Crear Partida' })
      await user.click(submitButton)
      
      // Should succeed with boundary value
      expect(createGame).toHaveBeenCalledWith({
        gameName: 'Test Game',
        minPlayers: 2,
        maxPlayers: 6
      })
    })

    it('should clear previous errors when valid values are entered', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      // First, enter an invalid value
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, '7')
      
      // Should show error
      expect(screen.getByText('El número máximo de jugadores es 6')).toBeInTheDocument()
      
      // Then, enter a valid value
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, '4')
      
      // Error should be cleared
      expect(screen.queryByText('El número máximo de jugadores es 6')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty input values gracefully', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      // Clear the input completely
      await user.clear(maxPlayersInput)
      
      // The component should handle empty values gracefully
      // Component uses parseInt() || defaultValue pattern
      expect(maxPlayersInput).toHaveValue(null)
      
      // Should not crash when trying to submit with empty value
      const nameInput = screen.getByPlaceholderText('Nombre de la Partida')
      await user.type(nameInput, 'Test Game')
      
      const submitButton = screen.getByRole('button', { name: 'Crear Partida' })
      await user.click(submitButton)
      
      // Should handle gracefully (component uses default values)
      expect(screen.queryByText(/crash/i)).not.toBeInTheDocument()
    })

    it('should handle non-numeric input values', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      // Input type="number" should prevent most non-numeric input
      expect(minPlayersInput).toHaveAttribute('type', 'number')
      expect(maxPlayersInput).toHaveAttribute('type', 'number')
      
      // Try to enter non-numeric values (some browsers allow this)
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, 'abc')
      
      // Component should handle this gracefully with parseInt() || default
      expect(maxPlayersInput).toBeInTheDocument()
    })

    it('should handle negative values correctly', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const minPlayersInput = screen.getByPlaceholderText('Mínimo de Jugadores')
      
      // Try negative value
      await user.clear(minPlayersInput)
      await user.type(minPlayersInput, '-1')
      
      // Should show validation error
      expect(screen.getByText('El número mínimo de jugadores debe ser al menos 2')).toBeInTheDocument()
    })

    it('should handle very large numbers', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      // Try very large number
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, '999')
      
      // Should show maximum validation error
      expect(screen.getByText('El número máximo de jugadores es 6')).toBeInTheDocument()
    })

    it('should handle decimal values', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      // Try decimal value
      await user.clear(maxPlayersInput)
      await user.type(maxPlayersInput, '3.5')
      
      // parseInt should handle this and convert to 3
      // Should not show error for valid integer part
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })

    it('should maintain consistent state during rapid input changes', async () => {
      const user = userEvent.setup()
      renderWithRouter(<CrearPartidaContainer />)
      
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      
      // Rapid sequence of changes
      const values = ['1', '7', '3', '0', '5', '8', '4']
      
      for (const value of values) {
        await user.clear(maxPlayersInput)
        await user.type(maxPlayersInput, value)
        
        // Component should handle each change without crashing
        expect(maxPlayersInput).toBeInTheDocument()
        
        // Error state should be consistent with validation rules
        const numValue = parseInt(value)
        const shouldHaveError = numValue < 2 || numValue > 6
        
        if (shouldHaveError) {
          const errorElement = screen.queryByText(/el número (mínimo|máximo) de jugadores/i)
          expect(errorElement).toBeInTheDocument()
        }
      }
    })

    it('should handle form submission with various error states', async () => {
      const user = userEvent.setup()
      const { createGame } = await import('../../../service/HttpService')
      
      renderWithRouter(<CrearPartidaContainer />)
      
      const nameInput = screen.getByPlaceholderText('Nombre de la Partida')
      const maxPlayersInput = screen.getByPlaceholderText('Máximo de Jugadores')
      const submitButton = screen.getByRole('button', { name: 'Crear Partida' })
      
      await user.type(nameInput, 'Test Game')
      
      // Test submission with various invalid states
      const invalidValues = ['0', '1', '7', '8', '10']
      
      for (const value of invalidValues) {
        await user.clear(maxPlayersInput)
        await user.type(maxPlayersInput, value)
        
        await user.click(submitButton)
        
        // Should not call createGame for invalid values
        expect(createGame).not.toHaveBeenCalled()
        
        // Should show appropriate error message
        const errorElement = screen.queryByText(/el número (mínimo|máximo) de jugadores/i)
        expect(errorElement).toBeInTheDocument()
        
        vi.clearAllMocks()
      }
    })
  })
})