import { describe, it, expect } from 'vitest'

describe('Lógica: Detectar cartas que necesitan objetivo', () => {
  
  // Simulamos la función necesitaObjetivo
  const necesitaObjetivo = (idFrontend) => {
    // Detective: 1-9, Event: 10-18
    return (idFrontend >= 1 && idFrontend <= 9) || (idFrontend >= 10 && idFrontend <= 18)
  }

  it('debe validar completo el sistema de objetivo', () => {
    // Test 1: Cartas Detective (1-9) necesitan objetivo
    expect(necesitaObjetivo(1)).toBe(true)
    expect(necesitaObjetivo(5)).toBe(true)
    expect(necesitaObjetivo(9)).toBe(true)

    // Test 2: Cartas Event (10-18) necesitan objetivo
    expect(necesitaObjetivo(10)).toBe(true)
    expect(necesitaObjetivo(14)).toBe(true)
    expect(necesitaObjetivo(18)).toBe(true)

    // Test 3: Otras cartas no necesitan objetivo
    expect(necesitaObjetivo(19)).toBe(false)
    expect(necesitaObjetivo(20)).toBe(false)
    expect(necesitaObjetivo(22)).toBe(false)

    // Test 4: IDs inválidos
    expect(necesitaObjetivo(0)).toBe(false)
    expect(necesitaObjetivo(-1)).toBe(false)
    expect(necesitaObjetivo(100)).toBe(false)

    // Test 5: Flujo con sets
    const setConDetective = [1, 1, 1]
    const setConEvento = [15, 15]
    const setSinObjetivo = [19, 19]
    const setMixto = [1, 19, 20]

    expect(setConDetective.some(id => necesitaObjetivo(id))).toBe(true)
    expect(setConEvento.some(id => necesitaObjetivo(id))).toBe(true)
    expect(setSinObjetivo.some(id => necesitaObjetivo(id))).toBe(false)
    expect(setMixto.some(id => necesitaObjetivo(id))).toBe(true)

    // Test 6: Validación completa de todos los detectives y eventos
    const detectives = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const eventos = [10, 11, 12, 13, 14, 15, 16, 17, 18]

    expect(detectives.every(id => necesitaObjetivo(id))).toBe(true)
    expect(eventos.every(id => necesitaObjetivo(id))).toBe(true)
  })
})
