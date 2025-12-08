import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from '../../../components/Card';
import * as CardService from '../../../service/CardService';

// Mock del CardService
vi.mock('../../../service/CardService', () => ({
  encontrarCartaPorId: vi.fn()
}));

describe('Card Component - Tests Esenciales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderizado básico', () => {
    it('debe renderizar una carta con dorso por defecto', () => {
      const mockCarta = {
        id: 1,
        tipo: 'Detective',
        nombre: 'Hercule Poirot',
        imagen: '/cartas/07-detective_poirot.png'
      };

      CardService.encontrarCartaPorId.mockReturnValue(mockCarta);
      render(<Card id={1} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/cartas/01-card_back.png');
      expect(img).toHaveAttribute('alt', 'Carta Misteriosa');
    });

    it('debe renderizar una carta volteada mostrando su imagen', () => {
      const mockCarta = {
        id: 1,
        tipo: 'Detective',
        nombre: 'Hercule Poirot',
        imagen: '/cartas/07-detective_poirot.png'
      };

      CardService.encontrarCartaPorId.mockReturnValue(mockCarta);
      render(<Card id={1} flipped={true} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/cartas/07-detective_poirot.png');
      expect(img).toHaveAttribute('alt', 'Hercule Poirot');
    });

    it('debe mostrar error si la carta no existe', () => {
      CardService.encontrarCartaPorId.mockReturnValue(null);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<Card id={999} />);

      expect(screen.getByText('Carta no encontrada')).toBeInTheDocument();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Dorso especial para cartas Secret', () => {
    it('debe usar dorso especial para cartas de tipo Secret', () => {
      const mockCarta = {
        id: 23,
        tipo: 'Secret',
        nombre: 'Secret Murderer',
        imagen: '/cartas/03-secret_murderer.png'
      };

      CardService.encontrarCartaPorId.mockReturnValue(mockCarta);
      render(<Card id={23} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/cartas/05-secret_front.png');
    });

    it('debe usar dorso normal para cartas que no son Secret', () => {
      const mockCarta = {
        id: 10,
        tipo: 'Event',
        nombre: 'Cards on the Table',
        imagen: '/cartas/17-event_cardsonthetable.png'
      };

      CardService.encontrarCartaPorId.mockReturnValue(mockCarta);
      render(<Card id={10} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/cartas/01-card_back.png');
    });
  });

  describe('Interacción - voltear carta', () => {
    it('debe voltear la carta al hacer click en la imagen', () => {
      const mockCarta = {
        id: 1,
        tipo: 'Detective',
        nombre: 'Hercule Poirot',
        imagen: '/cartas/07-detective_poirot.png'
      };

      CardService.encontrarCartaPorId.mockReturnValue(mockCarta);
      const { container } = render(<Card id={1} />);

      const cartaDiv = container.querySelector('.carta');
      const img = screen.getByRole('img');

      // Inicialmente muestra el dorso
      expect(img).toHaveAttribute('src', '/cartas/01-card_back.png');

      // Click para voltear (necesita ser en el div.carta que tiene implícito el onClick)
      fireEvent.click(cartaDiv);

      // Ahora muestra el frente
      expect(img).toHaveAttribute('src', '/cartas/07-detective_poirot.png');
    });

    it('NO debe voltear la carta si puedeVoltearse es false', () => {
      const mockCarta = {
        id: 1,
        tipo: 'Detective',
        nombre: 'Hercule Poirot',
        imagen: '/cartas/07-detective_poirot.png'
      };

      CardService.encontrarCartaPorId.mockReturnValue(mockCarta);
      const { container } = render(<Card id={1} puedeVoltearse={false} />);

      const cartaDiv = container.querySelector('.carta');
      const img = screen.getByRole('img');

      expect(img).toHaveAttribute('src', '/cartas/01-card_back.png');
      fireEvent.click(cartaDiv);
      expect(img).toHaveAttribute('src', '/cartas/01-card_back.png');
    });

    it('debe llamar a onSelect con id y cardData cuando se hace click', () => {
      const mockCarta = {
        id: 1,
        tipo: 'Detective',
        nombre: 'Hercule Poirot',
        imagen: '/cartas/07-detective_poirot.png'
      };

      CardService.encontrarCartaPorId.mockReturnValue(mockCarta);
      const onSelectMock = vi.fn();
      
      const { container } = render(<Card id={1} onSelect={onSelectMock} />);

      const cartaDiv = container.querySelector('.carta');
      fireEvent.click(cartaDiv);

      // onSelect recibe (id, cartaData) - sin el estado flip
      expect(onSelectMock).toHaveBeenCalledWith(1, mockCarta);
      expect(onSelectMock).toHaveBeenCalledTimes(1);
    });

    it('onSelect se llama incluso si puedeVoltearse es false (para seleccionar cartas)', () => {
      const mockCarta = {
        id: 1,
        tipo: 'Detective',
        nombre: 'Hercule Poirot',
        imagen: '/cartas/07-detective_poirot.png'
      };

      CardService.encontrarCartaPorId.mockReturnValue(mockCarta);
      const onSelectMock = vi.fn();
      
      const { container } = render(<Card id={1} onSelect={onSelectMock} puedeVoltearse={false} />);

      const cartaDiv = container.querySelector('.carta');
      fireEvent.click(cartaDiv);

      // onSelect SIEMPRE se llama (para permitir seleccionar cartas en la mano)
      // puedeVoltearse solo controla si la carta se voltea visualmente
      expect(onSelectMock).toHaveBeenCalledWith(1, mockCarta);
    });
  });

  describe('Clases CSS', () => {
    it('debe aplicar clase "volteada" cuando está flipped', () => {
      const mockCarta = {
        id: 1,
        tipo: 'Detective',
        nombre: 'Hercule Poirot',
        imagen: '/cartas/07-detective_poirot.png'
      };

      CardService.encontrarCartaPorId.mockReturnValue(mockCarta);
      render(<Card id={1} flipped={true} />);

      const cartaDiv = screen.getByRole('img').parentElement;
      expect(cartaDiv).toHaveClass('volteada');
    });

    it('NO debe aplicar clase "volteada" cuando NO está flipped', () => {
      const mockCarta = {
        id: 1,
        tipo: 'Detective',
        nombre: 'Hercule Poirot',
        imagen: '/cartas/07-detective_poirot.png'
      };

      CardService.encontrarCartaPorId.mockReturnValue(mockCarta);
      render(<Card id={1} flipped={false} />);

      const cartaDiv = screen.getByRole('img').parentElement;
      expect(cartaDiv).not.toHaveClass('volteada');
      expect(cartaDiv).toHaveClass('carta');
    });
  });
});
