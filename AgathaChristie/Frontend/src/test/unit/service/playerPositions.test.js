import { describe, it, expect } from 'vitest';
import { 
  getPlayerBasePosition, 
  getPlayerPositions, 
  getCardRotation 
} from '../../../service/playerPositions.js';

describe('playerPositions (unit)', () => {
  describe('getPlayerBasePosition', () => {
    it('devuelve la posición correcta para 2 jugadores', () => {
      const player1 = getPlayerBasePosition(0, 2);
      const player2 = getPlayerBasePosition(1, 2);
      
      expect(player1).toEqual({ x: 0, y: 450, align: 'bottom' });
      expect(player2).toEqual({ x: 0, y: -280, align: 'top' });
    });

    it('devuelve la posición correcta para 3 jugadores', () => {
      const player1 = getPlayerBasePosition(0, 3);
      const player2 = getPlayerBasePosition(1, 3);
      const player3 = getPlayerBasePosition(2, 3);
      
      expect(player1).toEqual({ x: 0, y: 450, align: 'bottom' });
      expect(player2).toEqual({ x: 830, y: -100, align: 'right' });
      expect(player3).toEqual({ x: -830, y: -100, align: 'left' });
    });

    it('devuelve la posición correcta para 4 jugadores', () => {
      const player1 = getPlayerBasePosition(0, 4);
      const player2 = getPlayerBasePosition(1, 4);
      const player3 = getPlayerBasePosition(2, 4);
      const player4 = getPlayerBasePosition(3, 4);
      
      expect(player1).toEqual({ x: 0, y: 450, align: 'bottom' });
      expect(player2).toEqual({ x: 830, y: 50, align: 'right' });
      expect(player3).toEqual({ x: 0, y: -280, align: 'top' });
      expect(player4).toEqual({ x: -830, y: 50, align: 'left' });
    });

    it('devuelve la posición correcta para 5 jugadores', () => {
      const player1 = getPlayerBasePosition(0, 5);
      const player5 = getPlayerBasePosition(4, 5);
      
      expect(player1).toEqual({ x: 0, y: 450, align: 'bottom' });
      expect(player5).toEqual({ x: -830, y: 200, align: 'left' });
    });

    it('devuelve la posición correcta para 6 jugadores', () => {
      const player1 = getPlayerBasePosition(0, 6);
      const player4 = getPlayerBasePosition(3, 6);
      const player6 = getPlayerBasePosition(5, 6);
      
      expect(player1).toEqual({ x: 0, y: 450, align: 'bottom' });
      // Actualizado por nuevos offsets del layout (jugadores superiores más pegados al borde)
      expect(player4).toEqual({ x: 0, y: -300, align: 'top' });
      // Ana (izquierda abajo) movida más arriba
      expect(player6).toEqual({ x: -830, y: 140, align: 'left' });
    });

    it('usa el layout de 6 jugadores como fallback para números mayores', () => {
      const player1 = getPlayerBasePosition(0, 8);
      expect(player1).toEqual({ x: 0, y: 450, align: 'bottom' });
    });

    it('devuelve posición por defecto para índice fuera de rango', () => {
      const position = getPlayerBasePosition(10, 6);
      expect(position).toEqual({ x: 0, y: 0, align: 'center' });
    });
  });

  describe('getPlayerPositions', () => {
    it('calcula posiciones correctas para jugador en posición bottom', () => {
      const basePosition = { x: 0, y: 450, align: 'bottom' };
      const result = getPlayerPositions(basePosition);
      
      expect(result.handPosition).toEqual({ x: 0, y: 410 });
      // Avatar acercado a la mano segun configuración actual
      expect(result.infoPosition).toEqual({ x: -210, y: 410 });
    });

    it('calcula posiciones correctas para jugador en posición top', () => {
      const basePosition = { x: 0, y: -300, align: 'top' };
      const result = getPlayerPositions(basePosition);
      
      expect(result.handPosition).toEqual({ x: 0, y: -260 });
      expect(result.infoPosition).toEqual({ x: 0, y: -400 });
    });

    it('calcula posiciones correctas para jugador en posición right', () => {
      const basePosition = { x: 650, y: 50, align: 'right' };
      const result = getPlayerPositions(basePosition);
      
      expect(result.handPosition).toEqual({ x: 610, y: 50 });
      expect(result.infoPosition).toEqual({ x: 750, y: 50 });
    });

    it('calcula posiciones correctas para jugador en posición left', () => {
      const basePosition = { x: -650, y: 50, align: 'left' };
      const result = getPlayerPositions(basePosition);
      
      expect(result.handPosition).toEqual({ x: -610, y: 50 });
      expect(result.infoPosition).toEqual({ x: -750, y: 50 });
    });

    it('no modifica las posiciones para alineación desconocida', () => {
      const basePosition = { x: 100, y: 200, align: 'unknown' };
      const result = getPlayerPositions(basePosition);
      
      expect(result.handPosition).toEqual({ x: 100, y: 200 });
      expect(result.infoPosition).toEqual({ x: 100, y: 200 });
    });
  });

  describe('getCardRotation', () => {
    it('devuelve 0 grados para alineación bottom', () => {
      expect(getCardRotation('bottom')).toBe(0);
    });

    it('devuelve 180 grados para alineación top', () => {
      expect(getCardRotation('top')).toBe(180);
    });

    it('devuelve 270 grados para alineación right', () => {
      expect(getCardRotation('right')).toBe(270);
    });

    it('devuelve 90 grados para alineación left', () => {
      expect(getCardRotation('left')).toBe(90);
    });

    it('devuelve 0 grados para alineación desconocida', () => {
      expect(getCardRotation('unknown')).toBe(0);
    });

    it('devuelve 0 grados para undefined', () => {
      expect(getCardRotation(undefined)).toBe(0);
    });

    it('devuelve 0 grados para null', () => {
      expect(getCardRotation(null)).toBe(0);
    });
  });
});
