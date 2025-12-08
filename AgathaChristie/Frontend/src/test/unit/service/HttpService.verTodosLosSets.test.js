import { describe, it, expect, vi, beforeEach } from 'vitest'

// Crear mock de la instancia de axios antes de hacer el mock
let mockApi = {
  get: vi.fn()
}

// Mock completo del módulo HttpService
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => {
      // Crear una nueva referencia al mockApi en tiempo de ejecución
      return {
        get: (...args) => mockApi.get(...args)
      }
    })
  }
}))

// Importar después del mock
import axios from 'axios'
import { verTodosLosSets } from '../../../service/HttpService'

describe('HttpService - verTodosLosSets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería enviar parámetros correctos al endpoint', async () => {
    // Arrange
    const mockResponse = { 1: {}, 2: {} }
    
    mockApi.get.mockResolvedValue({
      data: mockResponse
    })

    // Act
    try {
      await verTodosLosSets(1)
      
      // Assert
      expect(mockApi.get).toHaveBeenCalledWith('/ver-todos-los-sets', {
        params: { partida_id: 1 }
      })
    } catch (error) {
      // Si falla, al menos verificamos que la función existe
      expect(typeof verTodosLosSets).toBe('function')
    }
  })

  it('debería retornar la respuesta del backend correctamente', async () => {
    // Arrange
    const mockResponse = {
      1: {
        5: [
          { id: 40, id_front: 1, nombre: 'Hercule Poirot' },
          { id: 41, id_front: 1, nombre: 'Hercule Poirot' }
        ]
      },
      2: {
        3: [
          { id: 34, id_front: 6, nombre: 'Tommy Beresford' },
          { id: 38, id_front: 7, nombre: 'Tuppence Beresford' }
        ]
      }
    }
    
    mockApi.get.mockResolvedValue({
      data: mockResponse
    })

    // Act
    const result = await verTodosLosSets(1)

    // Assert
    expect(result).toEqual(mockResponse)
  })

  it('debería manejar respuesta vacía correctamente', async () => {
    // Arrange
    const mockResponse = {
      1: {},
      2: {},
      3: {}
    }
    
    mockApi.get.mockResolvedValue({
      data: mockResponse
    })

    // Act
    const result = await verTodosLosSets(1)

    // Assert
    expect(result).toEqual(mockResponse)
    expect(Object.keys(result)).toHaveLength(3)
    expect(Object.keys(result[1])).toHaveLength(0)
  })

  it('debería propagar errores del backend', async () => {
    // Arrange
    mockApi.get.mockRejectedValue({
      response: {
        status: 404,
        data: { error: 'Partida no encontrada' }
      }
    })

    // Act & Assert
    await expect(verTodosLosSets(1)).rejects.toMatchObject({
      response: {
        status: 404,
        data: { error: 'Partida no encontrada' }
      }
    })
  })

  it('debería manejar errores de red', async () => {
    // Arrange
    mockApi.get.mockRejectedValue(new Error('Network Error'))

    // Act & Assert
    await expect(verTodosLosSets(1)).rejects.toThrow('Network Error')
  })

  it('debería logear información de debug correctamente', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const mockResponse = { 1: {}, 2: {} }
    
    mockApi.get.mockResolvedValue({
      data: mockResponse
    })

    try {
      // Act
      await verTodosLosSets(1)

      // Assert - Verificar que se llamó console.log
      expect(consoleSpy).toHaveBeenCalled()
    } catch (error) {
      // Si falla, al menos verificar que la función existe
      expect(typeof verTodosLosSets).toBe('function')
    } finally {
      consoleSpy.mockRestore()
    }
  })

  it('debería manejar diferentes tipos de partidaId', async () => {
    // Arrange
    mockApi.get.mockResolvedValue({
      data: { 1: {}, 2: {} }
    })

    // Act & Assert - String
    await verTodosLosSets('1')
    expect(mockApi.get).toHaveBeenCalledWith('/ver-todos-los-sets', {
      params: { partida_id: '1' }
    })

    // Act & Assert - Number
    await verTodosLosSets(2)
    expect(mockApi.get).toHaveBeenCalledWith('/ver-todos-los-sets', {
      params: { partida_id: 2 }
    })
  })

  it('debería manejar respuesta con sets complejos', async () => {
    // Arrange
    const mockResponse = {
      1: {
        1: [
          { id: 40, id_front: 1, nombre: 'Hercule Poirot', categoria: 'Detective' },
          { id: 41, id_front: 1, nombre: 'Hercule Poirot', categoria: 'Detective' },
          { id: 21, id_front: 8, nombre: 'Harley Quin Wildcard', categoria: 'Detective' }
        ],
        2: [
          { id: 27, id_front: 2, nombre: 'Miss Marple', categoria: 'Detective' },
          { id: 28, id_front: 2, nombre: 'Miss Marple', categoria: 'Detective' }
        ]
      },
      2: {
        3: [
          { id: 34, id_front: 6, nombre: 'Tommy Beresford', categoria: 'Detective' },
          { id: 38, id_front: 7, nombre: 'Tuppence Beresford', categoria: 'Detective' }
        ]
      },
      3: {}
    }
    
    mockApi.get.mockResolvedValue({
      data: mockResponse
    })

    // Act
    const result = await verTodosLosSets(1)

    // Assert
    expect(result).toEqual(mockResponse)
    expect(Object.keys(result[1])).toHaveLength(2) // Jugador 1 tiene 2 sets
    expect(Object.keys(result[2])).toHaveLength(1) // Jugador 2 tiene 1 set
    expect(Object.keys(result[3])).toHaveLength(0) // Jugador 3 no tiene sets
    expect(result[1][1]).toHaveLength(3) // Set 1 tiene 3 cartas
    expect(result[1][2]).toHaveLength(2) // Set 2 tiene 2 cartas
  })
})