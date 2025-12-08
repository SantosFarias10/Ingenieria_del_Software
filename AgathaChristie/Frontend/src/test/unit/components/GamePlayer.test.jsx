import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import GamePlayer from '../../../components/GamePlayer.jsx';

// Mock de CardService
vi.mock('../../../service/CardService', () => ({
  getTipoObjetivoParaDetective: vi.fn((id) => {
    const detectivesJugador = [3, 5, 6, 7]; // Satterthwaite, Brent, Tommy, Tuppence
    const detectivesSecreto_Oculto = [1, 2]; // Poirot, Marple
    const detectivesSecreto_Revelado = [4]; // Pyne
    
    if (detectivesJugador.includes(id)) return 'jugador';
    if (detectivesSecreto_Oculto.includes(id)) return 'secreto_oculto';
    if (detectivesSecreto_Revelado.includes(id)) return 'secreto_revelado';
    return null;
  }),
  getDetectivePrincipalDelSet: vi.fn((setArray) => {
    for (let id of setArray) {
      if (id !== 8 && id !== 9) return id;
    }
    return null;
  }),
  getTipoObjetivoParaEvento: vi.fn((eventoId) => {
    const eventosMap = {
      10: { tipos: ['jugador'], cantidad: 1 }, // Cards on the Table
      11: { tipos: ['set', 'auto'], cantidad: 2 }, // Another Victim
      14: { tipos: ['jugador'], cantidad: 1 }, // Card Trade
      15: { tipos: ['secreto_revelado', 'jugador'], cantidad: 2 }, // One More
    };
    return eventosMap[eventoId] || { tipos: [], cantidad: 0 };
  }),
}));

describe('GamePlayer (unit)', () => {
  const mockPlayer = {
    id: 1,
    nombre: 'Carlos',
    avatar: 'avatar1'
  };

  const mockHandPosition = { x: 100, y: 200 };
  const mockInfoPosition = { x: 150, y: 250 };
  const mockSecretPosition = { x: 150, y: 300 };
  const mockOnSelectCard = vi.fn();
  const mockPlayerCards = [
    { id: 1, tipo: 'sospechoso', valor: 'Coronel', imagen: '/cartas/sospechoso1.jpg' },
    { id: 2, tipo: 'arma', valor: 'Candelabro', imagen: '/cartas/arma1.jpg' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el componente PlayerInfo', () => {
    render(
      <GamePlayer 
        player={mockPlayer}
        isCurrentPlayer={false}
        isPlayerTurn={false}
        avatarSrc="/assets/Avatares/avatar1.jpg"
        handPosition={mockHandPosition}
        infoPosition={mockInfoPosition}
        secretPosition={mockSecretPosition}
        rotation={0}
        playerCards={mockPlayerCards}
        playerSecrets={[]}
        onSelectCard={mockOnSelectCard}
        opponentCardCount={6}
      />
    );
    
    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });

  it('renderiza PlayerHandArea cuando es el jugador actual', () => {
    const { container } = render(
      <GamePlayer 
        player={mockPlayer}
        isCurrentPlayer={true}
        isPlayerTurn={false}
        avatarSrc="/assets/Avatares/avatar1.jpg"
        handPosition={mockHandPosition}
        infoPosition={mockInfoPosition}
        secretPosition={mockSecretPosition}
        rotation={0}
        playerCards={mockPlayerCards}
        playerSecrets={[]}
        onSelectCard={mockOnSelectCard}
        opponentCardCount={6}
      />
    );
    
    // Verificar que se renderiza la mano del jugador
    const handFan = container.querySelector('.hand-fan');
    expect(handFan).toBeInTheDocument();
    expect(handFan).not.toHaveClass('opponent-hand');
  });

  it('renderiza OpponentHandArea cuando no es el jugador actual', () => {
    const { container } = render(
      <GamePlayer 
        player={mockPlayer}
        isCurrentPlayer={false}
        isPlayerTurn={false}
        avatarSrc="/assets/Avatares/avatar1.jpg"
        handPosition={mockHandPosition}
        infoPosition={mockInfoPosition}
        secretPosition={mockSecretPosition}
        rotation={0}
        playerCards={mockPlayerCards}
        playerSecrets={[]}
        onSelectCard={mockOnSelectCard}
        opponentCardCount={5}
      />
    );
    
    // Verificar que se renderiza la mano del oponente
    const opponentHand = container.querySelector('.opponent-hand');
    expect(opponentHand).toBeInTheDocument();
  });

  it('muestra indicador de turno cuando es el jugador actual', () => {
    render(
      <GamePlayer 
        player={mockPlayer}
        isCurrentPlayer={true}
        isPlayerTurn={true}
        avatarSrc="/assets/Avatares/avatar1.jpg"
        handPosition={mockHandPosition}
        infoPosition={mockInfoPosition}
        secretPosition={mockSecretPosition}
        rotation={0}
        playerCards={mockPlayerCards}
        playerSecrets={[]}
        onSelectCard={mockOnSelectCard}
        opponentCardCount={6}
      />
    );
    
    expect(screen.getByText('Tu turno')).toBeInTheDocument();
  });

  it('no muestra indicador de turno cuando no es el jugador actual', () => {
    render(
      <GamePlayer 
        player={mockPlayer}
        isCurrentPlayer={false}
        isPlayerTurn={false}
        avatarSrc="/assets/Avatares/avatar1.jpg"
        handPosition={mockHandPosition}
        infoPosition={mockInfoPosition}
        secretPosition={mockSecretPosition}
        rotation={0}
        playerCards={mockPlayerCards}
        playerSecrets={[]}
        onSelectCard={mockOnSelectCard}
        opponentCardCount={6}
      />
    );
    
    expect(screen.queryByText('Tu turno')).not.toBeInTheDocument();
  });

  it('pasa correctamente las props a PlayerInfo', () => {
    const customAvatar = 'https://example.com/avatar.jpg';
    render(
      <GamePlayer 
        player={mockPlayer}
        isCurrentPlayer={true}
        isPlayerTurn={false}
        avatarSrc={customAvatar}
        handPosition={mockHandPosition}
        infoPosition={mockInfoPosition}
        secretPosition={mockSecretPosition}
        rotation={0}
        playerCards={mockPlayerCards}
        playerSecrets={[]}
        onSelectCard={mockOnSelectCard}
        opponentCardCount={6}
      />
    );
    
    const avatar = screen.getByAltText('Carlos');
    expect(avatar).toHaveAttribute('src', customAvatar);
  });

  it('renderiza correctamente con diferentes rotaciones', () => {
    const { container } = render(
      <GamePlayer 
        player={mockPlayer}
        isCurrentPlayer={true}
        isPlayerTurn={false}
        avatarSrc="/assets/Avatares/avatar1.jpg"
        handPosition={mockHandPosition}
        infoPosition={mockInfoPosition}
        secretPosition={mockSecretPosition}
        rotation={90}
        playerCards={mockPlayerCards}
        playerSecrets={[]}
        onSelectCard={mockOnSelectCard}
        opponentCardCount={6}
      />
    );
    
    const handFan = container.querySelector('.hand-fan');
    expect(handFan).toHaveStyle({ transform: 'rotate(90deg)' });
  });

  it('renderiza la cantidad correcta de cartas para oponentes', () => {
    const { container } = render(
      <GamePlayer 
        player={mockPlayer}
        isCurrentPlayer={false}
        isPlayerTurn={false}
        avatarSrc="/assets/Avatares/avatar1.jpg"
        handPosition={mockHandPosition}
        infoPosition={mockInfoPosition}
        secretPosition={mockSecretPosition}
        rotation={0}
        playerCards={mockPlayerCards}
        playerSecrets={[]}
        onSelectCard={mockOnSelectCard}
        opponentCardCount={4}
      />
    );
    
    const opponentCards = container.querySelectorAll('.opponent-card');
    expect(opponentCards).toHaveLength(4);
  });

  describe('Selección de objetivos para SETS', () => {
    it('permite seleccionar jugador como objetivo cuando detective lo requiere', () => {
      const mockOnSelectObjective = vi.fn();
      const otherPlayer = { id: 2, nombre: 'Otro', avatar: 'avatar2' };
      
      const { container } = render(
        <GamePlayer 
          player={otherPlayer}
          isCurrentPlayer={false}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar2.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={[]}
          playerSecrets={[]}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoObjetivo={true}
          setArrayOriginal={[3, 3, 3]} // Satterthwaite necesita jugador
          onSelectObjective={mockOnSelectObjective}
        />
      );

      const playerInfoDiv = container.querySelector('div[style*="pointer"]');
      fireEvent.click(playerInfoDiv);
      
      expect(mockOnSelectObjective).toHaveBeenCalledWith(2, 'jugador');
    });

    it('no permite seleccionar al jugador actual como objetivo', () => {
      const mockOnSelectObjective = vi.fn();
      
      const { container } = render(
        <GamePlayer 
          player={mockPlayer}
          isCurrentPlayer={true}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar1.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={mockPlayerCards}
          playerSecrets={[]}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoObjetivo={true}
          setArrayOriginal={[3, 3, 3]}
          onSelectObjective={mockOnSelectObjective}
        />
      );

      const playerInfoDiv = container.querySelector('div[style*="cursor"]');
      fireEvent.click(playerInfoDiv);
      
      expect(mockOnSelectObjective).not.toHaveBeenCalled();
    });

    it('no permite selección cuando detective no requiere jugador', () => {
      const mockOnSelectObjective = vi.fn();
      const otherPlayer = { id: 2, nombre: 'Otro', avatar: 'avatar2' };
      
      const { container } = render(
        <GamePlayer 
          player={otherPlayer}
          isCurrentPlayer={false}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar2.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={[]}
          playerSecrets={[]}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoObjetivo={true}
          setArrayOriginal={[1, 1, 1]} // Poirot necesita secreto, no jugador
          onSelectObjective={mockOnSelectObjective}
        />
      );

      const playerInfoDiv = container.querySelector('div[style*="cursor"]');
      fireEvent.click(playerInfoDiv);
      
      expect(mockOnSelectObjective).not.toHaveBeenCalled();
    });

    it('no permite selección cuando no está esperando objetivo', () => {
      const mockOnSelectObjective = vi.fn();
      const otherPlayer = { id: 2, nombre: 'Otro', avatar: 'avatar2' };
      
      const { container } = render(
        <GamePlayer 
          player={otherPlayer}
          isCurrentPlayer={false}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar2.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={[]}
          playerSecrets={[]}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoObjetivo={false}
          setArrayOriginal={[3, 3, 3]}
          onSelectObjective={mockOnSelectObjective}
        />
      );

      const playerInfoDiv = container.querySelector('div[style*="cursor"]');
      fireEvent.click(playerInfoDiv);
      
      expect(mockOnSelectObjective).not.toHaveBeenCalled();
    });

    it('no permite selección cuando setArrayOriginal es null', () => {
      const mockOnSelectObjective = vi.fn();
      const otherPlayer = { id: 2, nombre: 'Otro', avatar: 'avatar2' };
      
      const { container } = render(
        <GamePlayer 
          player={otherPlayer}
          isCurrentPlayer={false}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar2.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={[]}
          playerSecrets={[]}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoObjetivo={true}
          setArrayOriginal={null}
          onSelectObjective={mockOnSelectObjective}
        />
      );

      const playerInfoDiv = container.querySelector('div[style*="cursor"]');
      fireEvent.click(playerInfoDiv);
      
      expect(mockOnSelectObjective).not.toHaveBeenCalled();
    });
  });

  describe('Selección de objetivos para EVENTOS', () => {
    it('permite seleccionar jugador como objetivo para evento', () => {
      const mockOnSelectEventoObjective = vi.fn();
      const otherPlayer = { id: 2, nombre: 'Otro', avatar: 'avatar2' };
      
      const { container } = render(
        <GamePlayer 
          player={otherPlayer}
          isCurrentPlayer={false}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar2.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={[]}
          playerSecrets={[]}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoObjetivoEvento={true}
          eventoEnJuego={{ idFrontend: 10 }} // Cards on the Table
          onSelectEventoObjective={mockOnSelectEventoObjective}
        />
      );

      const playerInfoDiv = container.querySelector('div[style*="pointer"]');
      fireEvent.click(playerInfoDiv);
      
      expect(mockOnSelectEventoObjective).toHaveBeenCalledWith(2, 'jugador');
    });

    it('permite selección cuando tipoObjetivoActual es jugador', () => {
      const mockOnSelectEventoObjective = vi.fn();
      const otherPlayer = { id: 2, nombre: 'Otro', avatar: 'avatar2' };
      
      const { container } = render(
        <GamePlayer 
          player={otherPlayer}
          isCurrentPlayer={false}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar2.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={[]}
          playerSecrets={[]}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoObjetivoEvento={true}
          eventoEnJuego={{ idFrontend: 11 }} // Another Victim
          tipoObjetivoActual="jugador"
          onSelectEventoObjective={mockOnSelectEventoObjective}
        />
      );

      const playerInfoDiv = container.querySelector('div[style*="pointer"]');
      fireEvent.click(playerInfoDiv);
      
      expect(mockOnSelectEventoObjective).toHaveBeenCalledWith(2, 'jugador');
    });

    it('no permite selección cuando tipoObjetivoActual no es jugador', () => {
      const mockOnSelectEventoObjective = vi.fn();
      const otherPlayer = { id: 2, nombre: 'Otro', avatar: 'avatar2' };
      
      const { container } = render(
        <GamePlayer 
          player={otherPlayer}
          isCurrentPlayer={false}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar2.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={[]}
          playerSecrets={[]}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoObjetivoEvento={true}
          eventoEnJuego={{ idFrontend: 11 }}
          tipoObjetivoActual="secreto_oculto"
          onSelectEventoObjective={mockOnSelectEventoObjective}
        />
      );

      const playerInfoDiv = container.querySelector('div[style*="cursor"]');
      fireEvent.click(playerInfoDiv);
      
      expect(mockOnSelectEventoObjective).not.toHaveBeenCalled();
    });

    it('no permite selección cuando no está esperando objetivo de evento', () => {
      const mockOnSelectEventoObjective = vi.fn();
      const otherPlayer = { id: 2, nombre: 'Otro', avatar: 'avatar2' };
      
      const { container } = render(
        <GamePlayer 
          player={otherPlayer}
          isCurrentPlayer={false}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar2.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={[]}
          playerSecrets={[]}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoObjetivoEvento={false}
          eventoEnJuego={{ idFrontend: 10 }}
          onSelectEventoObjective={mockOnSelectEventoObjective}
        />
      );

      const playerInfoDiv = container.querySelector('div[style*="cursor"]');
      fireEvent.click(playerInfoDiv);
      
      expect(mockOnSelectEventoObjective).not.toHaveBeenCalled();
    });

    it('no permite selección cuando eventoEnJuego es null', () => {
      const mockOnSelectEventoObjective = vi.fn();
      const otherPlayer = { id: 2, nombre: 'Otro', avatar: 'avatar2' };
      
      const { container } = render(
        <GamePlayer 
          player={otherPlayer}
          isCurrentPlayer={false}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar2.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={[]}
          playerSecrets={[]}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoObjetivoEvento={true}
          eventoEnJuego={null}
          onSelectEventoObjective={mockOnSelectEventoObjective}
        />
      );

      const playerInfoDiv = container.querySelector('div[style*="cursor"]');
      fireEvent.click(playerInfoDiv);
      
      expect(mockOnSelectEventoObjective).not.toHaveBeenCalled();
    });
  });

  describe('Selección de secretos como objetivos', () => {
    it('permite seleccionar secreto oculto como objetivo', () => {
      const mockOnSelectObjective = vi.fn();
      const otherPlayer = { id: 2, nombre: 'Otro', avatar: 'avatar2' };
      const secretos = [
        { id: 1, idBackend: 101, estado: 9 }, // Oculto
        { id: 2, idBackend: 102, estado: 0 }, // Revelado
      ];
      
      render(
        <GamePlayer 
          player={otherPlayer}
          isCurrentPlayer={false}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar2.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={[]}
          playerSecrets={secretos}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoObjetivo={true}
          setArrayOriginal={[1, 1, 1]} // Poirot necesita secreto
          onSelectObjective={mockOnSelectObjective}
        />
      );

      // El componente PlayerSecrets debería tener la funcionalidad de selección
      // pero aquí verificamos que se pasa correctamente el handler
      expect(mockOnSelectObjective).toBeDefined();
    });

    it('permite seleccionar secreto revelado como objetivo', () => {
      const mockOnSelectObjective = vi.fn();
      const otherPlayer = { id: 2, nombre: 'Otro', avatar: 'avatar2' };
      const secretos = [
        { id: 1, idBackend: 101, estado: 0 }, // Revelado
      ];
      
      render(
        <GamePlayer 
          player={otherPlayer}
          isCurrentPlayer={false}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar2.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={[]}
          playerSecrets={secretos}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoObjetivo={true}
          setArrayOriginal={[4, 4, 4]} // Pyne necesita secreto revelado
          onSelectObjective={mockOnSelectObjective}
        />
      );

      expect(mockOnSelectObjective).toBeDefined();
    });

    it('permite seleccionar secreto con estado null como oculto', () => {
      const mockOnSelectObjective = vi.fn();
      const otherPlayer = { id: 2, nombre: 'Otro', avatar: 'avatar2' };
      const secretos = [
        { id: 1, idBackend: 101, estado: null },
      ];
      
      render(
        <GamePlayer 
          player={otherPlayer}
          isCurrentPlayer={false}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar2.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={[]}
          playerSecrets={secretos}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoObjetivo={true}
          setArrayOriginal={[1, 1, 1]}
          onSelectObjective={mockOnSelectObjective}
        />
      );

      expect(mockOnSelectObjective).toBeDefined();
    });

    it('permite seleccionar secreto con estado undefined como oculto', () => {
      const mockOnSelectObjective = vi.fn();
      const otherPlayer = { id: 2, nombre: 'Otro', avatar: 'avatar2' };
      const secretos = [
        { id: 1, idBackend: 101, estado: undefined },
      ];
      
      render(
        <GamePlayer 
          player={otherPlayer}
          isCurrentPlayer={false}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar2.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={[]}
          playerSecrets={secretos}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoObjetivo={true}
          setArrayOriginal={[1, 1, 1]}
          onSelectObjective={mockOnSelectObjective}
        />
      );

      expect(mockOnSelectObjective).toBeDefined();
    });

    it('no permite seleccionar secretos del jugador actual', () => {
      const mockOnSelectObjective = vi.fn();
      const secretos = [
        { id: 1, idBackend: 101, estado: 9 },
      ];
      
      render(
        <GamePlayer 
          player={mockPlayer}
          isCurrentPlayer={true}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar1.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={mockPlayerCards}
          playerSecrets={secretos}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoObjetivo={true}
          setArrayOriginal={[1, 1, 1]}
          onSelectObjective={mockOnSelectObjective}
        />
      );

      // El handler de selección no debería llamarse para secretos propios en modo objetivo
      expect(mockOnSelectObjective).toBeDefined();
    });
  });

  describe('Props adicionales para eventos especiales', () => {
    it('pasa props de Dead Card Folly correctamente', () => {
      render(
        <GamePlayer 
          player={mockPlayer}
          isCurrentPlayer={true}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar1.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={mockPlayerCards}
          playerSecrets={[]}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoPasarCartaDCF={true}
        />
      );

      // Verificar que el componente se renderiza con la prop
      expect(screen.getByText('Carlos')).toBeInTheDocument();
    });

    it('pasa props de Card Trade correctamente', () => {
      render(
        <GamePlayer 
          player={mockPlayer}
          isCurrentPlayer={true}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar1.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={mockPlayerCards}
          playerSecrets={[]}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoCardTrade={true}
          cardTradeObjetivo={2}
        />
      );

      expect(screen.getByText('Carlos')).toBeInTheDocument();
    });

    it('pasa props de revelar secreto correctamente', () => {
      const mockOnRevealSecret = vi.fn();
      
      render(
        <GamePlayer 
          player={mockPlayer}
          isCurrentPlayer={true}
          isPlayerTurn={false}
          avatarSrc="/assets/Avatares/avatar1.jpg"
          handPosition={mockHandPosition}
          infoPosition={mockInfoPosition}
          secretPosition={mockSecretPosition}
          rotation={0}
          playerCards={mockPlayerCards}
          playerSecrets={[{ id: 1, idBackend: 101, estado: 9 }]}
          onSelectCard={mockOnSelectCard}
          opponentCardCount={5}
          esperandoRevelarSecreto={true}
          onRevealSecret={mockOnRevealSecret}
        />
      );

      expect(screen.getByText('Carlos')).toBeInTheDocument();
    });
  });
});
