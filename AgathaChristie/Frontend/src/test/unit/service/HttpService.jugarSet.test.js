import { describe, it, expect, vi, beforeEach } from 'vitest'

// Prepare a mutable mockApi object that the axios mock will return. This lets us
// reassign mockApi.post in each test run and have the module-level 'api' in
// HttpService point to the same object.
let mockApi = { post: vi.fn() }

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockApi)
  }
}))

// Importar después del mock
const { jugarSet } = await import('../../../service/HttpService')
import axios from 'axios'

describe('HttpService - jugarSet', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Recreate mockApi.post for isolation between tests
    mockApi.post = vi.fn()
  })

  it('debería enviar parámetros correctos al endpoint', async () => {
    // Arrange
    // configurar la respuesta del post usado por el módulo (api.post)
    mockApi.post.mockResolvedValue({
      data: { mensaje: "Set jugado correctamente" }
    })

    const partidaId = 1
    const jugadorId = 2
    const objetivoId = 0
    const carta1 = 10
    const carta2 = 20
    const carta3 = 30

    // Act
    await jugarSet(partidaId, jugadorId, objetivoId, carta1, carta2, carta3)

    // Assert
    expect(mockApi.post).toHaveBeenCalledWith('/jugar-set', null, {
      params: {
        partida_id: partidaId,
        jugador_id: jugadorId,
        objetivo_id: objetivoId,
        carta_1_id: carta1,
        carta_2_id: carta2,
        carta_3_id: carta3
      }
    })
  })

  it('debería manejar arrays de diferentes tamaños', async () => {
    // Arrange
    mockApi.post.mockResolvedValue({
      data: { mensaje: "Set jugado correctamente" }
    })

    // Act - Set de 2 cartas
    await jugarSet(1, 2, 0, 10, 20)
    
    // Assert
    expect(mockApi.post).toHaveBeenCalledWith('/jugar-set', null, {
      params: expect.objectContaining({
        partida_id: 1,
        jugador_id: 2,
        objetivo_id: 0,
        carta_1_id: 10,
        carta_2_id: 20
      })
    })

    // Act - Set de 3 cartas
    await jugarSet(1, 2, 0, 10, 20, 30)
    
    // Assert
    expect(mockApi.post).toHaveBeenCalledWith('/jugar-set', null, {
      params: expect.objectContaining({
        partida_id: 1,
        jugador_id: 2,
        objetivo_id: 0,
        carta_1_id: 10,
        carta_2_id: 20,
        carta_3_id: 30
      })
    })
  })

  it('debería usar objetivo_id 0 por defecto si no se proporciona', async () => {
    // Arrange
    mockApi.post.mockResolvedValue({
      data: { mensaje: "Set jugado correctamente" }
    })

    // Act
    await jugarSet(1, 2, undefined, 10, 20)

    // Assert
    expect(mockApi.post).toHaveBeenCalledWith('/jugar-set', null, {
      params: expect.objectContaining({
        objetivo_id: 0,
        carta_1_id: 10,
        carta_2_id: 20
      })
    })
  })

  it('debería propagar errores del backend', async () => {
    // Arrange
    mockApi.post.mockRejectedValue({
      response: {
        status: 422,
        data: { error: "Set inválido" }
      }
    })

    // Act & Assert
    await expect(jugarSet(1, 2, 0, 10, 20)).rejects.toMatchObject({
      response: {
        status: 422,
        data: { error: "Set inválido" }
      }
    })
  })

  it('debería retornar la respuesta del backend', async () => {
    // Arrange
    const expectedResponse = { mensaje: "Set jugado correctamente", setId: 5 }
    mockApi.post.mockResolvedValue({
      data: expectedResponse
    })

    // Act
    const result = await jugarSet(1, 2, 0, 10, 20)

    // Assert
    expect(result).toEqual(expectedResponse)
  })
})