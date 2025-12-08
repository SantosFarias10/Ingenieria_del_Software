import { describe, it, expect } from 'vitest'

// Funciones de utilidad para robar sets (extraídas de PartidaContainer)
const extraerIdsDeCartas = (setCards) => {
  return setCards.map(carta => 
    carta?.id ?? carta?.idBackend ?? carta?.id_backend ?? null
  ).filter(Boolean)
}

const validarSetParaRobo = (setCards) => {
  if (!Array.isArray(setCards) || setCards.length === 0) {
    return { valido: false, error: 'Set vacío o inválido' }
  }

  const ids = extraerIdsDeCartas(setCards)
  
  if (ids.length === 0) {
    return { valido: false, error: 'No se pudieron obtener IDs de las cartas' }
  }

  if (ids.length !== setCards.length) {
    return { valido: false, error: 'Algunas cartas no tienen ID válido' }
  }

  return { valido: true, ids }
}

const convertirSetsParaVisualizacion = (allPlayerSets, playerId) => {
  const playerSets = allPlayerSets[playerId]
  if (!playerSets || typeof playerSets !== 'object') {
    return []
  }
  return Object.values(playerSets)
}

describe('Robar Set - Utilidades', () => {
  describe('extraerIdsDeCartas', () => {
    it('debería extraer IDs de cartas con formato estándar', () => {
      const setCards = [
        { id: 40, nombre: 'Hercule Poirot' },
        { id: 41, nombre: 'Hercule Poirot' },
        { id: 21, nombre: 'Harley Quin' }
      ]

      const result = extraerIdsDeCartas(setCards)

      expect(result).toEqual([40, 41, 21])
    })

    it('debería extraer IDs de cartas con formato idBackend', () => {
      const setCards = [
        { idBackend: 40, nombre: 'Hercule Poirot' },
        { idBackend: 41, nombre: 'Hercule Poirot' }
      ]

      const result = extraerIdsDeCartas(setCards)

      expect(result).toEqual([40, 41])
    })

    it('debería extraer IDs de cartas con formato id_backend', () => {
      const setCards = [
        { id_backend: 34, nombre: 'Tommy Beresford' },
        { id_backend: 38, nombre: 'Tuppence Beresford' }
      ]

      const result = extraerIdsDeCartas(setCards)

      expect(result).toEqual([34, 38])
    })

    it('debería filtrar cartas sin ID válido', () => {
      const setCards = [
        { id: 40, nombre: 'Hercule Poirot' },
        { nombre: 'Sin ID' }, // Sin ID
        { id: null, nombre: 'ID Null' }, // ID null
        { id: 21, nombre: 'Harley Quin' }
      ]

      const result = extraerIdsDeCartas(setCards)

      expect(result).toEqual([40, 21])
    })

    it('debería manejar array vacío', () => {
      const result = extraerIdsDeCartas([])
      expect(result).toEqual([])
    })

    it('debería priorizar id sobre idBackend', () => {
      const setCards = [
        { id: 40, idBackend: 99, nombre: 'Hercule Poirot' }
      ]

      const result = extraerIdsDeCartas(setCards)

      expect(result).toEqual([40]) // Debería usar id, no idBackend
    })
  })

  describe('validarSetParaRobo', () => {
    it('debería validar set correcto', () => {
      const setCards = [
        { id: 40, nombre: 'Hercule Poirot' },
        { id: 41, nombre: 'Hercule Poirot' },
        { id: 21, nombre: 'Harley Quin' }
      ]

      const result = validarSetParaRobo(setCards)

      expect(result.valido).toBe(true)
      expect(result.ids).toEqual([40, 41, 21])
    })

    it('debería rechazar array vacío', () => {
      const result = validarSetParaRobo([])

      expect(result.valido).toBe(false)
      expect(result.error).toBe('Set vacío o inválido')
    })

    it('debería rechazar null o undefined', () => {
      expect(validarSetParaRobo(null).valido).toBe(false)
      expect(validarSetParaRobo(undefined).valido).toBe(false)
    })

    it('debería rechazar set con cartas sin ID', () => {
      const setCards = [
        { nombre: 'Sin ID 1' },
        { nombre: 'Sin ID 2' }
      ]

      const result = validarSetParaRobo(setCards)

      expect(result.valido).toBe(false)
      expect(result.error).toBe('No se pudieron obtener IDs de las cartas')
    })

    it('debería rechazar set con algunas cartas sin ID', () => {
      const setCards = [
        { id: 40, nombre: 'Hercule Poirot' },
        { nombre: 'Sin ID' },
        { id: 21, nombre: 'Harley Quin' }
      ]

      const result = validarSetParaRobo(setCards)

      expect(result.valido).toBe(false)
      expect(result.error).toBe('Algunas cartas no tienen ID válido')
    })
  })

  describe('convertirSetsParaVisualizacion', () => {
    it('debería convertir objeto de sets a array', () => {
      const allPlayerSets = {
        1: {
          5: [{ id: 40 }, { id: 41 }],
          3: [{ id: 34 }, { id: 38 }]
        },
        2: {}
      }

      const result = convertirSetsParaVisualizacion(allPlayerSets, 1)

      expect(result).toHaveLength(2)
      // No verificar orden específico ya que Object.values() no lo garantiza
      expect(result).toEqual(
        expect.arrayContaining([
          [{ id: 40 }, { id: 41 }],
          [{ id: 34 }, { id: 38 }]
        ])
      )
    })

    it('debería retornar array vacío para jugador sin sets', () => {
      const allPlayerSets = {
        1: {},
        2: {}
      }

      const result = convertirSetsParaVisualizacion(allPlayerSets, 1)

      expect(result).toEqual([])
    })

    it('debería retornar array vacío para jugador inexistente', () => {
      const allPlayerSets = {
        1: { 5: [{ id: 40 }] }
      }

      const result = convertirSetsParaVisualizacion(allPlayerSets, 99)

      expect(result).toEqual([])
    })

    it('debería manejar sets null o undefined', () => {
      expect(convertirSetsParaVisualizacion({}, 1)).toEqual([])
      expect(convertirSetsParaVisualizacion({ 1: null }, 1)).toEqual([])
      expect(convertirSetsParaVisualizacion({ 1: undefined }, 1)).toEqual([])
    })

    it('debería manejar sets que no son objetos', () => {
      const allPlayerSets = {
        1: "not an object",
        2: 123,
        3: []
      }

      expect(convertirSetsParaVisualizacion(allPlayerSets, 1)).toEqual([])
      expect(convertirSetsParaVisualizacion(allPlayerSets, 2)).toEqual([])
      expect(convertirSetsParaVisualizacion(allPlayerSets, 3)).toEqual([])
    })
  })

  describe('Casos de integración', () => {
    it('debería manejar flujo completo de validación y conversión', () => {
      const allPlayerSets = {
        1: {},
        2: {
          5: [
            { id: 40, nombre: 'Hercule Poirot' },
            { id: 41, nombre: 'Hercule Poirot' },
            { id: 21, nombre: 'Harley Quin' }
          ]
        }
      }

      // Convertir para visualización
      const setsArray = convertirSetsParaVisualizacion(allPlayerSets, 2)
      expect(setsArray).toHaveLength(1)

      // Validar el primer set
      const validation = validarSetParaRobo(setsArray[0])
      expect(validation.valido).toBe(true)
      expect(validation.ids).toEqual([40, 41, 21])
    })

    it('debería manejar múltiples sets de un jugador', () => {
      const allPlayerSets = {
        2: {
          5: [{ id: 40 }, { id: 41 }],
          3: [{ id: 34 }, { id: 38 }],
          7: [{ id: 27 }]
        }
      }

      const setsArray = convertirSetsParaVisualizacion(allPlayerSets, 2)
      expect(setsArray).toHaveLength(3)

      // Validar todos los sets
      setsArray.forEach(set => {
        const validation = validarSetParaRobo(set)
        expect(validation.valido).toBe(true)
      })
    })
  })
})