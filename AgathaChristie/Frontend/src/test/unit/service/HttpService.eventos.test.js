import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock axios
const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  create: vi.fn()
}

vi.mock('axios', () => ({
  default: mockAxios
}))

// Mock the axios instance
const mockApiInstance = {
  get: vi.fn(),
  post: vi.fn()
}

describe('HttpService - Funciones de Eventos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAxios.create.mockReturnValue(mockApiInstance)
  })

  // ===== TRY_JUGAR_EVENTO =====
  describe('try_jugar_evento', () => {
    it('llama al endpoint /try-jugar-carta con los parámetros correctos', async () => {
      mockApiInstance.post.mockResolvedValue({ data: { success: true } })
      
      const { try_jugar_evento } = await import('../../../service/HttpService')
      const result = await try_jugar_evento(123, 1, 50)
      
      expect(mockApiInstance.post).toHaveBeenCalledWith('/try-jugar-carta', null, {
        params: {
          partida_id: 123,
          jugador_id: 1,
          carta_id: 50,
          objetivo_id: 0
        }
      })
      expect(result).toEqual({ success: true })
    })

    it('incluye objetivo_id cuando se proporciona', async () => {
      mockApiInstance.post.mockResolvedValue({ data: { success: true } })
      
      const { try_jugar_evento } = await import('../../../service/HttpService')
      await try_jugar_evento(123, 1, 50, 2)
      
      expect(mockApiInstance.post).toHaveBeenCalledWith('/try-jugar-carta', null, {
        params: {
          partida_id: 123,
          jugador_id: 1,
          carta_id: 50,
          objetivo_id: 2
        }
      })
    })

    it('incluye objetivo2_id cuando se proporciona', async () => {
      mockApiInstance.post.mockResolvedValue({ data: { success: true } })
      
      const { try_jugar_evento } = await import('../../../service/HttpService')
      await try_jugar_evento(123, 1, 50, 2, 3)
      
      expect(mockApiInstance.post).toHaveBeenCalledWith('/try-jugar-carta', null, {
        params: {
          partida_id: 123,
          jugador_id: 1,
          carta_id: 50,
          objetivo_id: 2,
          objetivo2_id: 3
        }
      })
    })

    it('usa 0 como objetivo_id por defecto si es null', async () => {
      mockApiInstance.post.mockResolvedValue({ data: { success: true } })
      
      const { try_jugar_evento } = await import('../../../service/HttpService')
      await try_jugar_evento(123, 1, 50, null)
      
      expect(mockApiInstance.post).toHaveBeenCalledWith('/try-jugar-carta', null, {
        params: {
          partida_id: 123,
          jugador_id: 1,
          carta_id: 50,
          objetivo_id: 0
        }
      })
    })

    it('maneja errores correctamente', async () => {
      const error = new Error('Network error')
      error.response = { data: { message: 'Error en backend' } }
      mockApiInstance.post.mockRejectedValue(error)
      
      const { try_jugar_evento } = await import('../../../service/HttpService')
      
      await expect(try_jugar_evento(123, 1, 50)).rejects.toThrow('Network error')
    })
  })

  // ===== JUGAR_CARTA_DE_EVENTO =====
  describe('jugar_carta_de_evento', () => {
    it('llama al endpoint /jugar-carta-de-evento con los parámetros mínimos', async () => {
      mockApiInstance.post.mockResolvedValue({ data: { success: true } })
      
      const { jugar_carta_de_evento } = await import('../../../service/HttpService')
      const result = await jugar_carta_de_evento(123, 1, 50)
      
      expect(mockApiInstance.post).toHaveBeenCalledWith('/jugar-carta-de-evento', null, {
        params: {
          partida_id: 123,
          jugador_id: 1,
          carta_id: 50
        }
      })
      expect(result).toEqual({ success: true })
    })

    it('incluye objetivo_id cuando se proporciona', async () => {
      mockApiInstance.post.mockResolvedValue({ data: { success: true } })
      
      const { jugar_carta_de_evento } = await import('../../../service/HttpService')
      await jugar_carta_de_evento(123, 1, 50, 2)
      
      expect(mockApiInstance.post).toHaveBeenCalledWith('/jugar-carta-de-evento', null, {
        params: {
          partida_id: 123,
          jugador_id: 1,
          carta_id: 50,
          objetivo_id: 2
        }
      })
    })

    it('incluye objetivo2_id cuando se proporciona', async () => {
      mockApiInstance.post.mockResolvedValue({ data: { success: true } })
      
      const { jugar_carta_de_evento } = await import('../../../service/HttpService')
      await jugar_carta_de_evento(123, 1, 50, 2, 3)
      
      expect(mockApiInstance.post).toHaveBeenCalledWith('/jugar-carta-de-evento', null, {
        params: {
          partida_id: 123,
          jugador_id: 1,
          carta_id: 50,
          objetivo_id: 2,
          objetivo2_id: 3
        }
      })
    })

    it('no incluye objetivo_id si es null', async () => {
      mockApiInstance.post.mockResolvedValue({ data: { success: true } })
      
      const { jugar_carta_de_evento } = await import('../../../service/HttpService')
      await jugar_carta_de_evento(123, 1, 50, null)
      
      expect(mockApiInstance.post).toHaveBeenCalledWith('/jugar-carta-de-evento', null, {
        params: {
          partida_id: 123,
          jugador_id: 1,
          carta_id: 50
        }
      })
    })

    it('no incluye objetivo2_id si es null', async () => {
      mockApiInstance.post.mockResolvedValue({ data: { success: true } })
      
      const { jugar_carta_de_evento } = await import('../../../service/HttpService')
      await jugar_carta_de_evento(123, 1, 50, 2, null)
      
      expect(mockApiInstance.post).toHaveBeenCalledWith('/jugar-carta-de-evento', null, {
        params: {
          partida_id: 123,
          jugador_id: 1,
          carta_id: 50,
          objetivo_id: 2
        }
      })
    })

    it('maneja errores correctamente', async () => {
      const error = new Error('Server error')
      error.response = { data: { message: 'Error procesando evento' } }
      mockApiInstance.post.mockRejectedValue(error)
      
      const { jugar_carta_de_evento } = await import('../../../service/HttpService')
      
      await expect(jugar_carta_de_evento(123, 1, 50)).rejects.toThrow('Server error')
    })
  })
})
