import { describe, it, expect } from 'vitest';
import { 
  necesitaObjetivo,
  eventoNecesitaObjetivo,
  getTipoObjetivoParaEvento
} from '../../../service/CardService';

describe('Seleccionar Objetivo - Eventos y Detectives', () => {
  
  it('todos los detectives necesitan objetivo', () => {
    for (let i = 1; i <= 9; i++) {
      expect(necesitaObjetivo(i)).toBe(true);
    }
  });

  it('eventos con objetivo: 10, 11, 12, 13, 14, 15, 16 vs sin objetivo: 17, 18', () => {
    [10, 11, 12, 13, 14, 15, 16].forEach(id => expect(necesitaObjetivo(id)).toBe(true));
    [17, 18].forEach(id => expect(necesitaObjetivo(id)).toBe(false));
  });

  it('Evento 14 (Card Trade) SI necesita objetivo - tipo jugador', () => {
    expect(eventoNecesitaObjetivo(14)).toBe(true);
    expect(getTipoObjetivoParaEvento(14).tipos).toContain('jugador');
  });

  it('eventos sin objetivo retornan array vacío de tipos', () => {
    [17, 18].forEach(id => {
      expect(getTipoObjetivoParaEvento(id).tipos).toEqual([]);
    });
  });

  it('consistencia: con objetivo = tipos no vacío, sin objetivo = tipos vacío', () => {
    for (let id = 10; id <= 18; id++) {
      const necesita = eventoNecesitaObjetivo(id);
      const objetivoInfo = getTipoObjetivoParaEvento(id);
      expect(!!objetivoInfo.tipos.length).toBe(necesita);
    }
  });
});
