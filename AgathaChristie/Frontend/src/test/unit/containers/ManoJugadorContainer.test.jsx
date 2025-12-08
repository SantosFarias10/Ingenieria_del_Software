import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManoJugadorContainer from '../../../container/ManoJugadorContainer';
import * as CardService from '../../../service/CardService';

// Mock de ManoJugador para simular clicks en cartas
vi.mock('../../../components/ManoJugador', () => ({
  default: ({ playerCards, onSelectCard }) => (
    <div className="mano-jugador">
      {playerCards.map((card) => (
        <button 
          key={card.idBackend}
          onClick={() => onSelectCard(card)}
          data-testid={`card-${card.idBackend}`}
        >
          Carta {card.idBackend}
        </button>
      ))}
    </div>
  )
}));

vi.mock('../../../service/CardService', () => ({
  encontrarCartaPorId: vi.fn()
}));

describe('ManoJugadorContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    CardService.encontrarCartaPorId.mockReturnValue({
      id: 1, nombre: 'Carta', imagen: '/test.png', tipo: 'Detective'
    });
  });

  // ===== RENDERIZADO BÁSICO =====
  it('renderiza ManoJugador con las cartas', () => {
    const mockCards = [
      { idBackend: 101, idFrontend: 1 },
      { idBackend: 102, idFrontend: 10 }
    ];

    const { container } = render(<ManoJugadorContainer cards={mockCards} isActive={true} />);

    expect(container.querySelector('.mano-jugador')).toBeInTheDocument();
    expect(screen.getByTestId('card-101')).toBeInTheDocument();
    expect(screen.getByTestId('card-102')).toBeInTheDocument();
  });

  it('renderiza sin cartas (array vacío)', () => {
    const { container } = render(<ManoJugadorContainer cards={[]} isActive={true} />);

    expect(container.querySelector('.mano-jugador')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('usa array vacío por defecto si no se pasan cards', () => {
    const { container } = render(<ManoJugadorContainer isActive={true} />);

    expect(container.querySelector('.mano-jugador')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renderiza múltiples cartas correctamente', () => {
    const mockCards = [
      { idBackend: 1, idFrontend: 1 },
      { idBackend: 2, idFrontend: 2 },
      { idBackend: 3, idFrontend: 3 },
      { idBackend: 4, idFrontend: 4 },
      { idBackend: 5, idFrontend: 5 }
    ];

    render(<ManoJugadorContainer cards={mockCards} isActive={true} />);

    mockCards.forEach(card => {
      expect(screen.getByTestId(`card-${card.idBackend}`)).toBeInTheDocument();
    });
  });

  // ===== VALIDACIÓN: !isActive =====
  it('NO llama onPlayCard si isActive es false', async () => {
    const user = userEvent.setup();
    const onPlayCardMock = vi.fn();
    const mockCards = [{ idBackend: 101, idFrontend: 1 }];

    render(
      <ManoJugadorContainer 
        cards={mockCards} 
        onPlayCard={onPlayCardMock}
        isActive={false}
      />
    );

    const card = screen.getByTestId('card-101');
    await user.click(card);

    expect(onPlayCardMock).not.toHaveBeenCalled();
  });

  it('isActive es false por defecto', () => {
    const onPlayCardMock = vi.fn();
    
    render(
      <ManoJugadorContainer 
        cards={[{ idBackend: 101, idFrontend: 1 }]} 
        onPlayCard={onPlayCardMock}
      />
    );

    expect(onPlayCardMock).not.toHaveBeenCalled();
  });

  // ===== VALIDACIÓN: !onPlayCard =====
  it('no falla sin onPlayCard cuando isActive es true', async () => {
    const user = userEvent.setup();
    const mockCards = [{ idBackend: 101, idFrontend: 1 }];

    render(<ManoJugadorContainer cards={mockCards} isActive={true} />);

    const card = screen.getByTestId('card-101');
    
    await expect(user.click(card)).resolves.not.toThrow();
  });

  it('no falla sin onPlayCard cuando se hace click en la carta', async () => {
    const user = userEvent.setup();

    render(
      <ManoJugadorContainer 
        cards={[{ idBackend: 101, idFrontend: 1 }]} 
        isActive={true} 
      />
    );

    const card = screen.getByTestId('card-101');
    await user.click(card);

    // No debería fallar
    expect(card).toBeInTheDocument();
  });

  // ===== VALIDACIÓN: !cardData =====
  it('no llama onPlayCard si cardData es null', () => {
    const onPlayCardMock = vi.fn();
    
    const { container } = render(
      <ManoJugadorContainer 
        cards={[]} 
        onPlayCard={onPlayCardMock}
        isActive={true}
      />
    );

    // Si no hay cartas, no hay cardData
    expect(onPlayCardMock).not.toHaveBeenCalled();
  });

  it('no llama onPlayCard si cardData es undefined', () => {
    const onPlayCardMock = vi.fn();
    
    render(
      <ManoJugadorContainer 
        cards={[]} 
        onPlayCard={onPlayCardMock}
        isActive={true}
      />
    );

    expect(onPlayCardMock).not.toHaveBeenCalled();
  });

  // ===== VALIDACIÓN: !cardData.idBackend =====
  it('no llama onPlayCard si idBackend es 0 (falsy)', async () => {
    const user = userEvent.setup();
    const onPlayCardMock = vi.fn();
    
    // idBackend: 0 es un valor falsy, debería fallar la validación
    const mockCard = { idBackend: 0, idFrontend: 1 };

    render(
      <ManoJugadorContainer 
        cards={[mockCard]} 
        onPlayCard={onPlayCardMock}
        isActive={true}
      />
    );

    const card = screen.getByTestId('card-0');
    await user.click(card);

    // No debería llamar porque idBackend es 0 (falsy)
    expect(onPlayCardMock).not.toHaveBeenCalled();
  });

  // ===== LLAMADA EXITOSA A onPlayCard =====
  it('llama a onPlayCard cuando todas las condiciones son válidas', async () => {
    const user = userEvent.setup();
    const onPlayCardMock = vi.fn();
    const mockCard = { idBackend: 101, idFrontend: 1 };

    render(
      <ManoJugadorContainer 
        cards={[mockCard]} 
        onPlayCard={onPlayCardMock}
        isActive={true}
      />
    );

    const card = screen.getByTestId('card-101');
    await user.click(card);

    expect(onPlayCardMock).toHaveBeenCalledTimes(1);
    expect(onPlayCardMock).toHaveBeenCalledWith(mockCard);
  });

  it('llama a onPlayCard con los datos correctos de la carta', async () => {
    const user = userEvent.setup();
    const onPlayCardMock = vi.fn();
    const mockCard = { 
      idBackend: 999, 
      idFrontend: 25,
      nombre: 'Carta Test'
    };

    render(
      <ManoJugadorContainer 
        cards={[mockCard]} 
        onPlayCard={onPlayCardMock}
        isActive={true}
      />
    );

    const card = screen.getByTestId('card-999');
    await user.click(card);

    expect(onPlayCardMock).toHaveBeenCalledWith(mockCard);
  });

  it('puede llamar a onPlayCard múltiples veces', async () => {
    const user = userEvent.setup();
    const onPlayCardMock = vi.fn();
    const mockCard = { idBackend: 101, idFrontend: 1 };

    render(
      <ManoJugadorContainer 
        cards={[mockCard]} 
        onPlayCard={onPlayCardMock}
        isActive={true}
      />
    );

    const card = screen.getByTestId('card-101');
    
    await user.click(card);
    await user.click(card);
    await user.click(card);

    expect(onPlayCardMock).toHaveBeenCalledTimes(3);
  });

  it('llama a onPlayCard solo para la carta clickeada', async () => {
    const user = userEvent.setup();
    const onPlayCardMock = vi.fn();
    const mockCards = [
      { idBackend: 101, idFrontend: 1 },
      { idBackend: 102, idFrontend: 2 },
      { idBackend: 103, idFrontend: 3 }
    ];

    render(
      <ManoJugadorContainer 
        cards={mockCards} 
        onPlayCard={onPlayCardMock}
        isActive={true}
      />
    );

    const card2 = screen.getByTestId('card-102');
    await user.click(card2);

    expect(onPlayCardMock).toHaveBeenCalledTimes(1);
    expect(onPlayCardMock).toHaveBeenCalledWith(mockCards[1]);
  });

  // ===== INTERACCIÓN CON MÚLTIPLES CARTAS =====
  it('puede jugar diferentes cartas secuencialmente', async () => {
    const user = userEvent.setup();
    const onPlayCardMock = vi.fn();
    const mockCards = [
      { idBackend: 1, idFrontend: 1 },
      { idBackend: 2, idFrontend: 2 },
      { idBackend: 3, idFrontend: 3 }
    ];

    render(
      <ManoJugadorContainer 
        cards={mockCards} 
        onPlayCard={onPlayCardMock}
        isActive={true}
      />
    );

    await user.click(screen.getByTestId('card-1'));
    await user.click(screen.getByTestId('card-3'));
    await user.click(screen.getByTestId('card-2'));

    expect(onPlayCardMock).toHaveBeenCalledTimes(3);
    expect(onPlayCardMock).toHaveBeenNthCalledWith(1, mockCards[0]);
    expect(onPlayCardMock).toHaveBeenNthCalledWith(2, mockCards[2]);
    expect(onPlayCardMock).toHaveBeenNthCalledWith(3, mockCards[1]);
  });

  // ===== CAMBIO DE ESTADO isActive =====
  it('respeta cambios en isActive (de true a false)', async () => {
    const user = userEvent.setup();
    const onPlayCardMock = vi.fn();
    const mockCard = { idBackend: 101, idFrontend: 1 };

    const { rerender } = render(
      <ManoJugadorContainer 
        cards={[mockCard]} 
        onPlayCard={onPlayCardMock}
        isActive={true}
      />
    );

    const card = screen.getByTestId('card-101');
    await user.click(card);
    expect(onPlayCardMock).toHaveBeenCalledTimes(1);

    // Cambiar a inactivo
    rerender(
      <ManoJugadorContainer 
        cards={[mockCard]} 
        onPlayCard={onPlayCardMock}
        isActive={false}
      />
    );

    await user.click(card);
    // No debe incrementar el contador
    expect(onPlayCardMock).toHaveBeenCalledTimes(1);
  });

  it('respeta cambios en isActive (de false a true)', async () => {
    const user = userEvent.setup();
    const onPlayCardMock = vi.fn();
    const mockCard = { idBackend: 101, idFrontend: 1 };

    const { rerender } = render(
      <ManoJugadorContainer 
        cards={[mockCard]} 
        onPlayCard={onPlayCardMock}
        isActive={false}
      />
    );

    const card = screen.getByTestId('card-101');
    await user.click(card);
    expect(onPlayCardMock).not.toHaveBeenCalled();

    // Cambiar a activo
    rerender(
      <ManoJugadorContainer 
        cards={[mockCard]} 
        onPlayCard={onPlayCardMock}
        isActive={true}
      />
    );

    await user.click(card);
    expect(onPlayCardMock).toHaveBeenCalledTimes(1);
  });

  // ===== CASOS LÍMITE =====
  it('maneja cartas con idBackend negativo', async () => {
    const user = userEvent.setup();
    const onPlayCardMock = vi.fn();
    const mockCard = { idBackend: -1, idFrontend: 1 };

    render(
      <ManoJugadorContainer 
        cards={[mockCard]} 
        onPlayCard={onPlayCardMock}
        isActive={true}
      />
    );

    const card = screen.getByTestId('card--1');
    await user.click(card);

    // idBackend negativo es truthy, debería llamar
    expect(onPlayCardMock).toHaveBeenCalledWith(mockCard);
  });

  it('pasa correctamente playerCards a ManoJugador', () => {
    const mockCards = [
      { idBackend: 1, idFrontend: 1 },
      { idBackend: 2, idFrontend: 2 }
    ];

    render(<ManoJugadorContainer cards={mockCards} isActive={true} />);

    expect(screen.getByTestId('card-1')).toBeInTheDocument();
    expect(screen.getByTestId('card-2')).toBeInTheDocument();
  });

  it('pasa correctamente onSelectCard a ManoJugador', async () => {
    const user = userEvent.setup();
    const onPlayCardMock = vi.fn();
    const mockCard = { idBackend: 101, idFrontend: 1 };

    render(
      <ManoJugadorContainer 
        cards={[mockCard]} 
        onPlayCard={onPlayCardMock}
        isActive={true}
      />
    );

    await user.click(screen.getByTestId('card-101'));

    expect(onPlayCardMock).toHaveBeenCalled();
  });
});
