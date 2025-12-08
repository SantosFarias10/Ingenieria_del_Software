import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import PlayerHandArea from '../../../components/PlayerHandArea.jsx';

describe('PlayerHandArea (unit)', () => {
  const mockPlayerCards = [
    { id: 1, tipo: 'sospechoso', valor: 'Coronel', imagen: '/cartas/sospechoso1.jpg' },
    { id: 2, tipo: 'arma', valor: 'Candelabro', imagen: '/cartas/arma1.jpg' },
    { id: 3, tipo: 'habitacion', valor: 'Biblioteca', imagen: '/cartas/habitacion1.jpg' }
  ];

  const mockOnSelectCard = vi.fn();
  const mockPosition = { x: 100, y: 200 };

  it('renderiza el área de la mano del jugador', () => {
    const { container } = render(
      <PlayerHandArea 
        position={mockPosition}
        rotation={0}
        playerCards={mockPlayerCards}
        onSelectCard={mockOnSelectCard}
      />
    );
    
    expect(container.querySelector('.player-hand-area')).toBeInTheDocument();
    expect(container.querySelector('.hand-fan')).toBeInTheDocument();
  });

  it('aplica la rotación correctamente', () => {
    const { container } = render(
      <PlayerHandArea 
        position={mockPosition}
        rotation={90}
        playerCards={mockPlayerCards}
        onSelectCard={mockOnSelectCard}
      />
    );
    
    const handFan = container.querySelector('.hand-fan');
    expect(handFan).toHaveStyle({ transform: 'rotate(90deg)' });
  });

  it('aplica rotación 180 grados', () => {
    const { container } = render(
      <PlayerHandArea 
        position={mockPosition}
        rotation={180}
        playerCards={mockPlayerCards}
        onSelectCard={mockOnSelectCard}
      />
    );
    
    const handFan = container.querySelector('.hand-fan');
    expect(handFan).toHaveStyle({ transform: 'rotate(180deg)' });
  });

  it('aplica la posición correctamente', () => {
    const { container } = render(
      <PlayerHandArea 
        position={{ x: 300, y: 400 }}
        rotation={0}
        playerCards={mockPlayerCards}
        onSelectCard={mockOnSelectCard}
      />
    );
    
    const handArea = container.querySelector('.player-hand-area');
    expect(handArea).toHaveStyle({
      left: '50%',
      top: '50%',
      transform: 'translate(calc(-50% + 300px), calc(-50% + 400px))'
    });
  });

  it('renderiza con cartas vacías', () => {
    const { container } = render(
      <PlayerHandArea 
        position={mockPosition}
        rotation={0}
        playerCards={[]}
        onSelectCard={mockOnSelectCard}
      />
    );
    
    expect(container.querySelector('.player-hand-area')).toBeInTheDocument();
  });

  it('pasa correctamente las props al componente ManoJugador', () => {
    const { container } = render(
      <PlayerHandArea 
        position={mockPosition}
        rotation={270}
        playerCards={mockPlayerCards}
        onSelectCard={mockOnSelectCard}
      />
    );
    
    // Verificar que el componente se renderiza correctamente
    const handFan = container.querySelector('.hand-fan');
    expect(handFan).toBeInTheDocument();
    expect(handFan).toHaveStyle({ transform: 'rotate(270deg)' });
  });
});
