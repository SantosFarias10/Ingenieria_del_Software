import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ManoJugador from '../../../components/ManoJugador';
import * as CardService from '../../../service/CardService';

vi.mock('../../../service/CardService', () => ({
  encontrarCartaPorId: vi.fn()
}));

describe('ManoJugador Component - Tests Esenciales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    CardService.encontrarCartaPorId.mockReturnValue({ 
      id: 1, nombre: 'Carta', imagen: '/carta.png', tipo: 'Detective' 
    });
  });

  it('muestra mensaje cuando no hay cartas', () => {
    render(<ManoJugador playerCards={[]} />);
    expect(screen.getByText('No tienes cartas')).toBeInTheDocument();
  });

  it('renderiza las cartas y muestra contador correcto', () => {
    const mockCartas = [
      { idBackend: 101, idFrontend: 1 },
      { idBackend: 102, idFrontend: 10 }
    ];

    CardService.encontrarCartaPorId
      .mockReturnValueOnce({ id: 1, nombre: 'Carta 1', imagen: '/carta1.png', tipo: 'Detective' })
      .mockReturnValueOnce({ id: 10, nombre: 'Carta 2', imagen: '/carta2.png', tipo: 'Event' });

    render(<ManoJugador playerCards={mockCartas} />);

    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByText('2 cartas')).toBeInTheDocument();
  });

  it('muestra singular con una carta', () => {
    render(<ManoJugador playerCards={[{ idBackend: 101, idFrontend: 1 }]} />);
    expect(screen.getByText('1 carta')).toBeInTheDocument();
  });

  it('renderiza estructura CSS correctamente', () => {
    const { container } = render(<ManoJugador playerCards={[{ idBackend: 101, idFrontend: 1 }]} />);
    
    expect(container.querySelector('.mano-jugador')).toBeInTheDocument();
    expect(container.querySelector('.cartas-container')).toBeInTheDocument();
  });

  it('no falla sin onSelectCard', () => {
    const { container } = render(<ManoJugador playerCards={[{ idBackend: 101, idFrontend: 1 }]} />);
    
    expect(() => fireEvent.click(container.querySelector('.carta'))).not.toThrow();
  });
});
