import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

// Mock CSS
vi.mock('../../../components/RobarSetModal.css', () => ({}))

describe('RobarSetModal - Basic Tests', () => {
  it('debería importar el componente sin errores', async () => {
    expect(async () => {
      await import('../../../components/RobarSetModal')
    }).not.toThrow()
  })

  it('debería renderizar sin errores con props mínimas', async () => {
    const RobarSetModal = (await import('../../../components/RobarSetModal')).default
    
    const minimalProps = {
      isOpen: false,
      onClose: vi.fn(),
      currentPlayerId: 1,
      playerNames: {},
      onRobarSet: vi.fn(),
      allPlayerSets: {}
    }

    expect(() => {
      render(<RobarSetModal {...minimalProps} />)
    }).not.toThrow()
  })

  it('debería renderizar null cuando isOpen es false', async () => {
    const RobarSetModal = (await import('../../../components/RobarSetModal')).default
    
    const props = {
      isOpen: false,
      onClose: vi.fn(),
      currentPlayerId: 1,
      playerNames: {},
      onRobarSet: vi.fn(),
      allPlayerSets: {}
    }

    const { container } = render(<RobarSetModal {...props} />)
    expect(container.firstChild).toBeNull()
  })
})