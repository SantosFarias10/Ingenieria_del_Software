import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createWSService } from '../../../service/WSService'

// Mock de LocalStorage
vi.mock('../../../service/LocalStorage', () => ({
  getGame: vi.fn(),
  getGameId: vi.fn()
}))

import { getGame, getGameId } from '../../../service/LocalStorage'

// Mock más completo de WebSocket con estados reales
let mockWebSocketInstance = null
const createMockWebSocket = (url) => {
  mockWebSocketInstance = {
    url,
    readyState: 0, // CONNECTING por defecto
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
    onopen: null,
    onclose: null,
    onmessage: null,
    onerror: null,
    close: vi.fn(),
    send: vi.fn()
  }
  return mockWebSocketInstance
}

global.WebSocket = vi.fn(createMockWebSocket)
// Agregar constantes estáticas
global.WebSocket.CONNECTING = 0
global.WebSocket.OPEN = 1
global.WebSocket.CLOSING = 2
global.WebSocket.CLOSED = 3

describe('WSService', () => {
  let wsService
  let consoleLogSpy
  let consoleWarnSpy
  let consoleErrorSpy

  beforeEach(() => {
    vi.clearAllMocks()
    mockWebSocketInstance = null
    wsService = createWSService()
    getGameId.mockReturnValue(123)
    getGame.mockReturnValue({ id: 123 })
    
    // Spy en console
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  // ===== CREACIÓN DEL SERVICIO =====
  it('crea una instancia del servicio correctamente', () => {
    expect(wsService).toBeDefined()
    expect(wsService.connect).toBeDefined()
    expect(wsService.on).toBeDefined()
    expect(wsService.off).toBeDefined()
    expect(wsService.disconnect).toBeDefined()
  })

  it('tiene propiedad isConnected', () => {
    expect(typeof wsService.isConnected).toBe('boolean')
  })

  // ===== CONEXIÓN =====
  it('puede llamar a connect con partidaId', () => {
    expect(() => wsService.connect(456)).not.toThrow()
    expect(global.WebSocket).toHaveBeenCalled()
  })

  it('usa partidaId de getGameId cuando no se proporciona', () => {
    getGameId.mockReturnValue(789)
    wsService.connect()
    expect(global.WebSocket).toHaveBeenCalled()
  })

  it('usa partidaId de getGame cuando getGameId retorna null', () => {
    getGameId.mockReturnValue(null)
    getGame.mockReturnValue({ id: 999 })
    wsService.connect()
    expect(global.WebSocket).toHaveBeenCalled()
  })

  it('no se conecta si no hay partidaId disponible', () => {
    getGameId.mockReturnValue(null)
    getGame.mockReturnValue(null)
    
    wsService.connect()
    
    // No debería crear WebSocket sin partidaId
    expect(global.WebSocket).not.toHaveBeenCalled()
    expect(consoleWarnSpy).toHaveBeenCalledWith('WSService.connect: no partidaId available')
  })

  it('no duplica conexión si ya está OPEN para la misma partida', () => {
    // Primera conexión
    wsService.connect(123)
    expect(global.WebSocket).toHaveBeenCalledTimes(1)
    
    // Simular que el WebSocket está OPEN (1)
    mockWebSocketInstance.readyState = 1
    
    // Intentar conectar de nuevo a la misma partida
    wsService.connect(123)
    
    // No debe crear un nuevo WebSocket
    expect(global.WebSocket).toHaveBeenCalledTimes(1)
  })

  it('no duplica conexión si está CONNECTING para la misma partida', () => {
    wsService.connect(123)
    expect(global.WebSocket).toHaveBeenCalledTimes(1)
    
    // Estado CONNECTING (0) ya está por defecto
    mockWebSocketInstance.readyState = 0
    
    wsService.connect(123)
    
    // No debe crear un nuevo WebSocket
    expect(global.WebSocket).toHaveBeenCalledTimes(1)
  })

  it('cierra conexión previa al cambiar de partida', () => {
    wsService.connect(123)
    const firstWs = mockWebSocketInstance
    
    // Simular que está OPEN
    firstWs.readyState = 1
    
    // Conectar a otra partida
    wsService.connect(456)
    
    expect(firstWs.close).toHaveBeenCalledWith(1000, 'switch-partida')
    expect(global.WebSocket).toHaveBeenCalledTimes(2)
  })

  it('maneja error al cerrar conexión previa', () => {
    wsService.connect(123)
    const firstWs = mockWebSocketInstance
    firstWs.readyState = 1
    
    firstWs.close.mockImplementation(() => { throw new Error('Close failed') })
    
    // No debe lanzar error
    expect(() => wsService.connect(456)).not.toThrow()
    expect(global.WebSocket).toHaveBeenCalledTimes(2)
  })

  it('construye URL con VITE_WS_URI del environment', () => {
    // Mock de import.meta.env
    const originalEnv = import.meta.env.VITE_WS_URI
    import.meta.env.VITE_WS_URI = 'ws://custom-host:9000/ws/custom'
    
    wsService.connect(123)
    
    expect(global.WebSocket).toHaveBeenCalledWith('ws://custom-host:9000/ws/custom/123')
    
    // Restaurar
    import.meta.env.VITE_WS_URI = originalEnv
  })

  it('elimina trailing slash de VITE_WS_URI', () => {
    const originalEnv = import.meta.env.VITE_WS_URI
    import.meta.env.VITE_WS_URI = 'ws://custom-host:9000/ws/custom/'
    
    wsService.connect(123)
    
    expect(global.WebSocket).toHaveBeenCalledWith('ws://custom-host:9000/ws/custom/123')
    
    import.meta.env.VITE_WS_URI = originalEnv
  })

  it('usa default host cuando VITE_WS_URI está vacío', () => {
    const originalEnv = import.meta.env.VITE_WS_URI
    import.meta.env.VITE_WS_URI = ''
    
    wsService.connect(123)
    
    expect(global.WebSocket).toHaveBeenCalledWith('ws://127.0.0.1:8000/ws/partida/jugadores/123')
    
    import.meta.env.VITE_WS_URI = originalEnv
  })

  it('maneja error al crear WebSocket', () => {
    const errorListener = vi.fn()
    wsService.on('error', errorListener)
    
    global.WebSocket.mockImplementationOnce(() => {
      throw new Error('WebSocket creation failed')
    })
    
    wsService.connect(123)
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'WSService failed to create WebSocket',
      expect.any(Error)
    )
    expect(errorListener).toHaveBeenCalledWith(expect.any(Error))
  })

  // ===== EVENTOS DE WEBSOCKET =====
  it('emite evento "connected" cuando se abre la conexión', () => {
    const connectedListener = vi.fn()
    wsService.on('connected', connectedListener)
    
    wsService.connect(123)
    
    // Simular apertura de conexión
    mockWebSocketInstance.onopen()
    
    expect(connectedListener).toHaveBeenCalledWith({ partidaId: 123 })
    expect(consoleLogSpy).toHaveBeenCalledWith('WebSocket connected')
    expect(wsService.isConnected).toBe(true)
  })

  it('emite evento "disconnected" cuando se cierra la conexión', () => {
    const disconnectedListener = vi.fn()
    wsService.on('disconnected', disconnectedListener)
    
    wsService.connect(123)
    mockWebSocketInstance.onopen() // Primero conectar
    mockWebSocketInstance.onclose() // Luego desconectar
    
    expect(disconnectedListener).toHaveBeenCalledWith({ partidaId: 123 })
    expect(consoleLogSpy).toHaveBeenCalledWith('WebSocket disconnected')
    expect(wsService.isConnected).toBe(false)
  })

  it('no muestra log de disconnect si nunca se conectó', () => {
    wsService.connect(123)
    
    consoleLogSpy.mockClear()
    
    // Cerrar sin haber abierto primero
    mockWebSocketInstance.onclose()
    
    expect(consoleLogSpy).not.toHaveBeenCalledWith('WebSocket disconnected')
  })

  it('emite evento "error" cuando hay error en WebSocket', () => {
    const errorListener = vi.fn()
    wsService.on('error', errorListener)
    
    wsService.connect(123)
    
    const error = new Error('Connection error')
    mockWebSocketInstance.onerror(error)
    
    expect(errorListener).toHaveBeenCalledWith(error)
    expect(consoleErrorSpy).toHaveBeenCalledWith('WebSocket error:', error)
    expect(wsService.isConnected).toBe(false)
  })

  it('procesa mensaje con array de jugadores', () => {
    const playersListener = vi.fn()
    wsService.on('players_update', playersListener)
    
    wsService.connect(123)
    mockWebSocketInstance.onopen()
    
    const jugadores = [{ id: 1, nombre: 'Jugador 1' }, { id: 2, nombre: 'Jugador 2' }]
    mockWebSocketInstance.onmessage({ data: JSON.stringify(jugadores) })
    
    expect(playersListener).toHaveBeenCalledWith({
      partidaId: 123,
      jugadores
    })
  })

  it('procesa mensaje con type y payload', () => {
    const eventListener = vi.fn()
    wsService.on('game_event', eventListener)
    
    wsService.connect(123)
    
    const message = {
      type: 'game_event',
      payload: { action: 'move', data: 'test' }
    }
    mockWebSocketInstance.onmessage({ data: JSON.stringify(message) })
    
    expect(eventListener).toHaveBeenCalledWith({ action: 'move', data: 'test' })
  })

  it('procesa mensaje genérico sin type ni array', () => {
    const messageListener = vi.fn()
    wsService.on('message', messageListener)
    
    wsService.connect(123)
    
    const data = { foo: 'bar', baz: 123 }
    mockWebSocketInstance.onmessage({ data: JSON.stringify(data) })
    
    expect(messageListener).toHaveBeenCalledWith(data)
  })

  it('maneja error al parsear mensaje JSON', () => {
    const errorListener = vi.fn()
    wsService.on('error', errorListener)
    
    wsService.connect(123)
    
    mockWebSocketInstance.onmessage({ data: 'invalid json {' })
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error parsing WebSocket message:',
      expect.any(Error)
    )
    expect(errorListener).toHaveBeenCalledWith(expect.any(Error))
  })

  // ===== LISTENERS =====
  it('puede registrar listeners con on()', () => {
    const listener = vi.fn()
    expect(() => wsService.on('test_event', listener)).not.toThrow()
  })

  it('puede eliminar listeners con off()', () => {
    const listener = vi.fn()
    wsService.on('test_event', listener)
    expect(() => wsService.off('test_event', listener)).not.toThrow()
  })

  it('off() no falla si el evento no existe', () => {
    expect(() => {
      wsService.off('evento_inexistente', vi.fn())
    }).not.toThrow()
  })

  // ===== DESCONEXIÓN =====
  it('puede llamar a disconnect sin errores', () => {
    wsService.connect(123)
    expect(() => wsService.disconnect()).not.toThrow()
    expect(wsService.isConnected).toBe(false)
  })

  it('disconnect cierra el WebSocket con código 1000', () => {
    wsService.connect(123)
    mockWebSocketInstance.readyState = 1 // OPEN
    
    wsService.disconnect()
    
    expect(mockWebSocketInstance.close).toHaveBeenCalledWith(1000, 'manual-disconnect')
  })

  it('disconnect maneja error al cerrar WebSocket', () => {
    wsService.connect(123)
    mockWebSocketInstance.close.mockImplementation(() => {
      throw new Error('Close error')
    })
    
    expect(() => wsService.disconnect()).not.toThrow()
  })

  it('disconnect funciona sin conexión previa', () => {
    expect(() => wsService.disconnect()).not.toThrow()
  })

  // ===== CASOS LÍMITE =====
  it('maneja múltiples llamadas a connect', () => {
    expect(() => {
      wsService.connect(123)
      wsService.connect(123)
      wsService.connect(123)
    }).not.toThrow()
  })

  it('puede conectar después de desconectar', () => {
    wsService.connect(123)
    wsService.disconnect()
    expect(() => wsService.connect(456)).not.toThrow()
  })

  it('puede registrar múltiples listeners para el mismo evento', () => {
    const listener1 = vi.fn()
    const listener2 = vi.fn()
    
    expect(() => {
      wsService.on('test', listener1)
      wsService.on('test', listener2)
    }).not.toThrow()
  })

  // ===== VALIDACIÓN DE API =====
  it('connect acepta números como partidaId', () => {
    expect(() => wsService.connect(999)).not.toThrow()
  })

  it('on requiere evento y callback', () => {
    const listener = vi.fn()
    expect(() => wsService.on('evento', listener)).not.toThrow()
  })

  it('off requiere evento y callback', () => {
    const listener = vi.fn()
    expect(() => wsService.off('evento', listener)).not.toThrow()
  })
})
