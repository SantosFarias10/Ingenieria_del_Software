import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

// Mock CSS imports
vi.mock('../../../components/RobarSetModal.css', () => ({}))

import RobarSetModal from '../../../components/RobarSetModal'

describe('RobarSetModal - Tests Básicos', () => {
  const basicProps = {
    isOpen: true,
    onClose: vi.fn(),
    currentPlayerId: 1,
    playerNames: { 1: 'Jugador1', 2: 'Jugador2' },
    onRobarSet: vi.fn(),
    allPlayerSets: {
      1: {},
      2: {
        5: [{ id: 40, id_front: 1, nombre: 'Hercule Poirot' }]
      }
    }
  }

  it('debería renderizar sin errores cuando isOpen es true', () => {
    expect(() => {
      render(<RobarSetModal {...basicProps} />)
    }).not.toThrow()
  })

  it('debería renderizar null cuando isOpen es false', () => {
    const { container } = render(<RobarSetModal {...basicProps} isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('debería manejar props vacías sin errores', () => {
    const emptyProps = {
      isOpen: true,
      onClose: vi.fn(),
      currentPlayerId: 1,
      playerNames: {},
      onRobarSet: vi.fn(),
      allPlayerSets: {}
    }

    expect(() => {
      render(<RobarSetModal {...emptyProps} />)
    }).not.toThrow()
  })
})