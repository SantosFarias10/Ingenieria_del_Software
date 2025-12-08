import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PlayerSets from '../../../components/PlayerSets'

describe('PlayerSets Component', () => {
  const mockPosition = { x: 100, y: 50 }
  
  const mockSets = [
    [
      { id: 41, id_front: 1, nombre: 'Hercule Poirot' },
      { id: 42, id_front: 1, nombre: 'Hercule Poirot' },
      { id: 21, id_front: 8, nombre: 'Harley Quin Wildcard' }
    ],
    [
      { id: 27, id_front: 2, nombre: 'Miss Marple' },
      { id: 28, id_front: 2, nombre: 'Miss Marple' }
    ]
  ]

  it('debería renderizar sets correctamente', () => {
    render(
      <PlayerSets
        sets={mockSets}
        position={mockPosition}
        rotation={0}
        isCurrentPlayer={true}
      />
    )

    // Verificar que se renderizan los labels de sets
    expect(screen.getByText('Set #1')).toBeInTheDocument()
    expect(screen.getByText('Set #2')).toBeInTheDocument()
  })

  it('debería aplicar posición correctamente', () => {
    const { container } = render(
      <PlayerSets
        sets={mockSets}
        position={mockPosition}
        rotation={0}
        isCurrentPlayer={true}
      />
    )

    const setsArea = container.querySelector('.player-sets-area')
    expect(setsArea).toHaveStyle({
      transform: 'translate(calc(-50% + 100px), calc(-50% + 50px))'
    })
  })

  it('debería aplicar rotación correctamente', () => {
    const { container } = render(
      <PlayerSets
        sets={mockSets}
        position={mockPosition}
        rotation={90}
        isCurrentPlayer={true}
      />
    )

    const setsContainer = container.querySelector('.sets-container')
    expect(setsContainer).toHaveStyle({
      transform: 'rotate(90deg)'
    })
  })

  it('no debería renderizar nada si no hay position', () => {
    const { container } = render(
      <PlayerSets
        sets={mockSets}
        position={null}
        rotation={0}
        isCurrentPlayer={true}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('no debería renderizar nada si no hay sets', () => {
    const { container } = render(
      <PlayerSets
        sets={[]}
        position={mockPosition}
        rotation={0}
        isCurrentPlayer={true}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('debería manejar sets con diferentes cantidades de cartas', () => {
    const setsVariados = [
      [
        { id: 41, id_front: 1, nombre: 'Hercule Poirot' },
        { id: 42, id_front: 1, nombre: 'Hercule Poirot' },
        { id: 21, id_front: 8, nombre: 'Harley Quin Wildcard' }
      ],
      [
        { id: 34, id_front: 6, nombre: 'Tommy Beresford' },
        { id: 38, id_front: 7, nombre: 'Tuppence Beresford' }
      ]
    ]

    render(
      <PlayerSets
        sets={setsVariados}
        position={mockPosition}
        rotation={0}
        isCurrentPlayer={true}
      />
    )

    // Verificar que ambos sets se renderizan
    expect(screen.getByText('Set #1')).toBeInTheDocument()
    expect(screen.getByText('Set #2')).toBeInTheDocument()
  })

  it('debería manejar cartas con diferentes formatos de ID', () => {
    const setsConDiferentesIds = [
      [
        { id: 41, idBackend: 41, idFrontend: 1 }, // Formato nuevo
        { id_front: 1, nombre: 'Hercule Poirot' }, // Formato backend
        { idFront: 8, nombre: 'Harley Quin' } // Formato alternativo
      ]
    ]

    render(
      <PlayerSets
        sets={setsConDiferentesIds}
        position={mockPosition}
        rotation={0}
        isCurrentPlayer={true}
      />
    )

    expect(screen.getByText('Set #1')).toBeInTheDocument()
  })

  it('debería usar key único para cada carta evitando warnings', () => {
    const setsConIds = [
      [
        { id: 41, id_front: 1 },
        { id: 42, id_front: 1 },
        { idBackend: 21, idFrontend: 8 } // Sin id
      ]
    ]

    // No debería generar warnings de React sobre keys duplicadas
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    render(
      <PlayerSets
        sets={setsConIds}
        position={mockPosition}
        rotation={0}
        isCurrentPlayer={true}
      />
    )

    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Warning: Each child in a list should have a unique "key" prop')
    )
    
    consoleSpy.mockRestore()
  })
})