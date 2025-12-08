import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import OpponentHandArea from '../../../components/OpponentHandArea.jsx';

describe('OpponentHandArea (unit)', () => {
  const mockPosition = { x: 100, y: 200 };

  it('renderiza el área de mano del oponente', () => {
    const { container } = render(
      <OpponentHandArea 
        position={mockPosition}
        rotation={0}
        cardCount={6}
      />
    );
    
    expect(container.querySelector('.player-hand-area')).toBeInTheDocument();
    expect(container.querySelector('.hand-fan')).toBeInTheDocument();
    expect(container.querySelector('.opponent-hand')).toBeInTheDocument();
  });

  it('renderiza la cantidad correcta de cartas', () => {
    const { container } = render(
      <OpponentHandArea 
        position={mockPosition}
        rotation={0}
        cardCount={5}
      />
    );
    
    const cards = container.querySelectorAll('.opponent-card');
    expect(cards).toHaveLength(5);
  });

  it('renderiza 6 cartas por defecto si no se especifica cardCount', () => {
    const { container } = render(
      <OpponentHandArea 
        position={mockPosition}
        rotation={0}
      />
    );
    
    const cards = container.querySelectorAll('.opponent-card');
    expect(cards).toHaveLength(6);
  });

  it('aplica la rotación correctamente', () => {
    const { container } = render(
      <OpponentHandArea 
        position={mockPosition}
        rotation={90}
        cardCount={4}
      />
    );
    
    const handFan = container.querySelector('.hand-fan');
    expect(handFan).toHaveStyle({ transform: 'rotate(90deg)' });
  });

  it('aplica la posición correctamente', () => {
    const { container } = render(
      <OpponentHandArea 
        position={{ x: 250, y: 350 }}
        rotation={180}
        cardCount={3}
      />
    );
    
    const handArea = container.querySelector('.player-hand-area');
    expect(handArea).toHaveStyle({
      left: '50%',
      top: '50%',
      transform: 'translate(calc(-50% + 250px), calc(-50% + 350px))'
    });
  });

  it('renderiza el contenedor de cartas del oponente', () => {
    const { container } = render(
      <OpponentHandArea 
        position={mockPosition}
        rotation={0}
        cardCount={4}
      />
    );
    
    expect(container.querySelector('.opponent-cards')).toBeInTheDocument();
  });

  it('cada carta tiene el índice correcto en el atributo style', () => {
    const { container } = render(
      <OpponentHandArea 
        position={mockPosition}
        rotation={0}
        cardCount={3}
      />
    );
    
    const cards = container.querySelectorAll('.opponent-card');
    cards.forEach((card, index) => {
      expect(card).toHaveStyle({ '--card-index': index.toString() });
    });
  });

  it('renderiza sin cartas cuando cardCount es 0', () => {
    const { container } = render(
      <OpponentHandArea 
        position={mockPosition}
        rotation={0}
        cardCount={0}
      />
    );
    
    const cards = container.querySelectorAll('.opponent-card');
    expect(cards).toHaveLength(0);
  });
});
