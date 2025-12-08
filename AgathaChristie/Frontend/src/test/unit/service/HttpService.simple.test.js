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

describe('HttpService - Tests Básicos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAxios.create.mockReturnValue(mockApiInstance)
  })

  it('debería importar HttpService sin errores', async () => {
    // Usar import dinámico en lugar de require para que funcione con el mock
    await expect(import('../../../service/HttpService')).resolves.toBeDefined()
  })

  it('debería tener la función verTodosLosSets', async () => {
    const HttpService = await import('../../../service/HttpService')
    expect(typeof HttpService.verTodosLosSets).toBe('function')
  })

  it('debería tener la función intercambiarSet', async () => {
    const HttpService = await import('../../../service/HttpService')
    expect(typeof HttpService.intercambiarSet).toBe('function')
  })

  it('debería llamar al endpoint correcto para verTodosLosSets', async () => {
    mockApiInstance.get.mockResolvedValue({ data: {} })
    
    const { verTodosLosSets } = await import('../../../service/HttpService')
    await verTodosLosSets(1)
    
    expect(mockApiInstance.get).toHaveBeenCalledWith('/ver-todos-los-sets', {
      params: { partida_id: 1 }
    })
  })

  it('debería llamar al endpoint correcto para intercambiarSet', async () => {
    mockApiInstance.post.mockResolvedValue({ data: {} })
    
    const { intercambiarSet } = await import('../../../service/HttpService')
    await intercambiarSet(1, 2, [40, 41])
    
    expect(mockApiInstance.post).toHaveBeenCalledWith('/intercambiar-set', null, {
      params: {
        jugador_id: 2,
        'cartas_jugadas_id[]': [40, 41]
      }
    })
  })
})