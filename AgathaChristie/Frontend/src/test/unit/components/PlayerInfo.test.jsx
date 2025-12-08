import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import PlayerInfo from '../../../components/PlayerInfo.jsx';

describe('PlayerInfo (unit)', () => {
  const mockPlayer = {
    id: 1,
    nombre: 'Juan',
    avatar: 'avatar1'
  };

  const mockPosition = { x: 100, y: 200 };

  it('renderiza el nombre del jugador', () => {
    render(
      <PlayerInfo 
        player={mockPlayer}
        isCurrentPlayer={false}
        isPlayerTurn={false}
        avatarSrc="/assets/Avatares/avatar1.jpg"
        position={mockPosition}
      />
    );
    
    expect(screen.getByText('Juan')).toBeInTheDocument();
  });

  it('muestra el avatar del jugador', () => {
    render(
      <PlayerInfo 
        player={mockPlayer}
        isCurrentPlayer={false}
        isPlayerTurn={false}
        avatarSrc="/assets/Avatares/avatar1.jpg"
        position={mockPosition}
      />
    );
    
    const avatar = screen.getByAltText('Juan');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', '/assets/Avatares/avatar1.jpg');
  });

  it('muestra indicador de turno cuando es el jugador actual', () => {
    render(
      <PlayerInfo 
        player={mockPlayer}
        isCurrentPlayer={true}
        isPlayerTurn={true}
        avatarSrc="/assets/Avatares/avatar1.jpg"
        position={mockPosition}
      />
    );
    
    expect(screen.getByText('Tu turno')).toBeInTheDocument();
  });

  it('no muestra indicador de turno cuando no es el jugador actual', () => {
    render(
      <PlayerInfo 
        player={mockPlayer}
        isCurrentPlayer={false}
        isPlayerTurn={false}
        avatarSrc="/assets/Avatares/avatar1.jpg"
        position={mockPosition}
      />
    );
    
    expect(screen.queryByText('Tu turno')).not.toBeInTheDocument();
  });

  it('muestra "Su turno" cuando es el turno de un oponente', () => {
    render(
      <PlayerInfo 
        player={mockPlayer}
        isCurrentPlayer={false}
        isPlayerTurn={true}
        avatarSrc="/assets/Avatares/avatar1.jpg"
        position={mockPosition}
      />
    );
    
    expect(screen.getByText('Su turno')).toBeInTheDocument();
  });

  it('aplica la clase active cuando es el jugador actual', () => {
    const { container } = render(
      <PlayerInfo 
        player={mockPlayer}
        isCurrentPlayer={true}
        isPlayerTurn={true}
        avatarSrc="/assets/Avatares/avatar1.jpg"
        position={mockPosition}
      />
    );
    
    const playerInfo = container.querySelector('.player-info');
    expect(playerInfo).toHaveClass('active');
  });

  it('no aplica la clase active cuando no es el jugador actual', () => {
    const { container } = render(
      <PlayerInfo 
        player={mockPlayer}
        isCurrentPlayer={false}
        isPlayerTurn={false}
        avatarSrc="/assets/Avatares/avatar1.jpg"
        position={mockPosition}
      />
    );
    
    const playerInfo = container.querySelector('.player-info');
    expect(playerInfo).not.toHaveClass('active');
  });

  it('muestra nombre genérico cuando el jugador no tiene nombre', () => {
    const playerWithoutName = { id: 2 };
    render(
      <PlayerInfo 
        player={playerWithoutName}
        isCurrentPlayer={false}
        isPlayerTurn={false}
        avatarSrc="/assets/Avatares/avatar1.jpg"
        position={mockPosition}
      />
    );
    
    expect(screen.getByText('Jugador')).toBeInTheDocument();
  });

  it('aplica las posiciones correctamente con transform', () => {
    const { container } = render(
      <PlayerInfo 
        player={mockPlayer}
        isCurrentPlayer={false}
        isPlayerTurn={false}
        avatarSrc="/assets/Avatares/avatar1.jpg"
        position={{ x: 150, y: 250 }}
      />
    );
    
    const playerInfoArea = container.querySelector('.player-info-area');
    expect(playerInfoArea).toHaveStyle({
      left: '50%',
      top: '49%',
      transform: 'translate(calc(-50% + 150px), calc(-50% + 250px))'
    });
  });
});
