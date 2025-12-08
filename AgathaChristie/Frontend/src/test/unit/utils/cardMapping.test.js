import { describe, it, expect } from 'vitest'

// Simular la función de mapeo de cartas del PartidaContainer
const mapearCartasParaSet = (setArray, playerHand) => {
  const cartas_jugadas_id = []
  const cartasUsadas = new Set()
  
  for (const idFront of setArray) {
    // Buscar una carta con este id_front que no hayamos usado ya
    const carta = playerHand.find(c => 
      Number(c.idFrontend) === Number(idFront) && 
      !cartasUsadas.has(c.idBackend)
    )
    
    if (!carta) throw new Error(`No se encontró carta disponible con id_front: ${idFront}`)
    
    cartas_jugadas_id.push(carta.idBackend)
    cartasUsadas.add(carta.idBackend)
  }
  
  return cartas_jugadas_id
}

describe('Mapeo de Cartas Frontend ↔ Backend', () => {
  const mockPlayerHand = [
    { idFrontend: 1, idBackend: 41 }, // Hercule Poirot #1
    { idFrontend: 1, idBackend: 42 }, // Hercule Poirot #2
    { idFrontend: 2, idBackend: 27 }, // Miss Marple #1
    { idFrontend: 2, idBackend: 28 }, // Miss Marple #2
    { idFrontend: 8, idBackend: 21 }, // Harley Quin
    { idFrontend: 6, idBackend: 34 }, // Tommy Beresford
    { idFrontend: 7, idBackend: 38 }, // Tuppence Beresford
  ]

  describe('Mapeo exitoso', () => {
    it('debería mapear set de cartas únicas correctamente', () => {
      const setArray = [2, 8] // Miss Marple + Harley Quin
      const result = mapearCartasParaSet(setArray, mockPlayerHand)
      
      expect(result).toEqual([27, 21])
      expect(result).toHaveLength(2)
    })

    it('debería mapear múltiples cartas del mismo detective sin duplicar', () => {
      const setArray = [1, 1, 8] // 2 Hercule Poirot + Harley Quin
      const result = mapearCartasParaSet(setArray, mockPlayerHand)
      
      expect(result).toEqual([41, 42, 21])
      expect(result).toHaveLength(3)
      expect(new Set(result).size).toBe(3) // Sin duplicados
    })

    it('debería mapear hermanos Beresford correctamente', () => {
      const setArray = [6, 7] // Tommy + Tuppence
      const result = mapearCartasParaSet(setArray, mockPlayerHand)
      
      expect(result).toEqual([34, 38])
      expect(result).toHaveLength(2)
    })

    it('debería usar cartas diferentes para el mismo id_front', () => {
      const setArray = [2, 2] // 2 Miss Marple
      const result = mapearCartasParaSet(setArray, mockPlayerHand)
      
      expect(result).toEqual([27, 28])
      expect(result[0]).not.toBe(result[1]) // Diferentes idBackend
    })
  })

  describe('Errores de mapeo', () => {
    it('debería fallar si no encuentra carta con id_front', () => {
      const setArray = [99] // ID que no existe
      
      expect(() => mapearCartasParaSet(setArray, mockPlayerHand))
        .toThrow('No se encontró carta disponible con id_front: 99')
    })

    it('debería fallar si no hay suficientes cartas del mismo tipo', () => {
      const setArray = [1, 1, 1] // 3 Hercule Poirot, pero solo hay 2
      
      expect(() => mapearCartasParaSet(setArray, mockPlayerHand))
        .toThrow('No se encontró carta disponible con id_front: 1')
    })

    it('debería fallar con mano vacía', () => {
      const setArray = [1, 2]
      const emptyHand = []
      
      expect(() => mapearCartasParaSet(setArray, emptyHand))
        .toThrow('No se encontró carta disponible con id_front: 1')
    })
  })

  describe('Casos edge', () => {
    it('debería manejar set vacío', () => {
      const setArray = []
      const result = mapearCartasParaSet(setArray, mockPlayerHand)
      
      expect(result).toEqual([])
    })

    it('debería manejar mano con cartas sin idFrontend', () => {
      const handWithNulls = [
        { idFrontend: null, idBackend: 99 },
        { idFrontend: 1, idBackend: 41 },
      ]
      const setArray = [1]
      
      const result = mapearCartasParaSet(setArray, handWithNulls)
      expect(result).toEqual([41])
    })

    it('debería manejar conversión de tipos en idFrontend', () => {
      const handWithStrings = [
        { idFrontend: "1", idBackend: 41 },
        { idFrontend: "2", idBackend: 27 },
      ]
      const setArray = [1, 2] // Numbers
      
      const result = mapearCartasParaSet(setArray, handWithStrings)
      expect(result).toEqual([41, 27])
    })
  })
})