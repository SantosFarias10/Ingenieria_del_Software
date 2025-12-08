import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock axios completamente
const mockApi = {
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockApi)
  }
}))

// Mock LocalStorage
vi.mock('../../../service/LocalStorage', () => ({
  getUserId: vi.fn(() => 123)
}))

describe('HttpService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createPlayer', () => {
    it('should create a player with correct parameters', async () => {
      const { createPlayer } = await import('../../../service/HttpService')
      
      const playerData = {
        name: 'Test Player',
        birthdate: '1990-01-01',
        avatar: 'avatar1'
      }
      
      const mockResponse = { data: { id: 1, name: 'Test Player' } }
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await createPlayer(playerData)

      expect(mockApi.post).toHaveBeenCalledWith(
        '/crear-jugador',
        null,
        {
          params: {
            nombre: 'Test Player',
            cumple: '1990-01-01',
            avatar: 'avatar1'
          }
        }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when creating player', async () => {
      const { createPlayer } = await import('../../../service/HttpService')
      
      const playerData = {
        name: 'Test Player',
        birthdate: '1990-01-01',
        avatar: 'avatar1'
      }
      
      const mockError = new Error('Network error')
      mockApi.post.mockRejectedValue(mockError)

      await expect(createPlayer(playerData)).rejects.toThrow('Network error')
    })
  })

  describe('fetchPlayersService', () => {
    it('should fetch players list', async () => {
      const { fetchPlayersService } = await import('../../../service/HttpService')
      
      const mockResponse = { data: [{ id: 1, name: 'Player 1' }] }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await fetchPlayersService()

      expect(mockApi.get).toHaveBeenCalledWith('/listar-jugadores')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when fetching players', async () => {
      const { fetchPlayersService } = await import('../../../service/HttpService')
      
      const mockError = new Error('Fetch error')
      mockApi.get.mockRejectedValue(mockError)

      await expect(fetchPlayersService()).rejects.toThrow('Fetch error')
    })
  })

  describe('createGame', () => {
    it('should create a game with provided creator', async () => {
      const { createGame } = await import('../../../service/HttpService')
      
      const gameData = {
        gameName: 'Test Game',
        creador: 456,
        maxPlayers: 4
      }
      
      const mockResponse = { data: { id: 1, nombre: 'Test Game' } }
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await createGame(gameData)

      expect(mockApi.post).toHaveBeenCalledWith(
        '/crear-partida',
        null,
        {
          params: {
            nombre: 'Test Game',
            creador: 456,
            max_jugadores: 4
          }
        }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should create a game with current user as creator when not provided', async () => {
      const { createGame } = await import('../../../service/HttpService')
      
      const gameData = {
        gameName: 'Test Game',
        maxPlayers: 4
      }
      
      const mockResponse = { data: { id: 1, nombre: 'Test Game' } }
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await createGame(gameData)

      expect(mockApi.post).toHaveBeenCalledWith(
        '/crear-partida',
        null,
        {
          params: {
            nombre: 'Test Game',
            creador: 123, // From mocked getUserId
            max_jugadores: 4
          }
        }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should create a game with minPlayers when provided', async () => {
      const { createGame } = await import('../../../service/HttpService')
      
      const gameData = {
        gameName: 'Test Game',
        creador: 456,
        maxPlayers: 6,
        minPlayers: 3
      }
      
      const mockResponse = { data: { id: 1, nombre: 'Test Game' } }
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await createGame(gameData)

      expect(mockApi.post).toHaveBeenCalledWith(
        '/crear-partida',
        null,
        {
          params: {
            nombre: 'Test Game',
            creador: 456,
            max_jugadores: 6,
            min_jugadores: 3
          }
        }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should create a game without minPlayers when not provided (backward compatibility)', async () => {
      const { createGame } = await import('../../../service/HttpService')
      
      const gameData = {
        gameName: 'Test Game',
        creador: 456,
        maxPlayers: 4
      }
      
      const mockResponse = { data: { id: 1, nombre: 'Test Game' } }
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await createGame(gameData)

      expect(mockApi.post).toHaveBeenCalledWith(
        '/crear-partida',
        null,
        {
          params: {
            nombre: 'Test Game',
            creador: 456,
            max_jugadores: 4
            // min_jugadores should not be included when not provided
          }
        }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when creating game', async () => {
      const { createGame } = await import('../../../service/HttpService')
      
      const gameData = {
        gameName: 'Test Game',
        maxPlayers: 4
      }
      
      const mockError = new Error('Creation error')
      mockApi.post.mockRejectedValue(mockError)

      await expect(createGame(gameData)).rejects.toThrow('Creation error')
    })
  })

  describe('fetchPartidasService', () => {
    it('should fetch games list', async () => {
      const { fetchPartidasService } = await import('../../../service/HttpService')
      
      const mockResponse = { data: [{ id: 1, nombre: 'Game 1' }] }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await fetchPartidasService()

      expect(mockApi.get).toHaveBeenCalledWith('/listar-partidas')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when fetching games', async () => {
      const { fetchPartidasService } = await import('../../../service/HttpService')
      
      const mockError = new Error('Fetch error')
      mockApi.get.mockRejectedValue(mockError)

      await expect(fetchPartidasService()).rejects.toThrow('Fetch error')
    })
  })

  describe('deleteGame', () => {
    it('should delete a game', async () => {
      const { deleteGame } = await import('../../../service/HttpService')
      
      const mockResponse = { data: { success: true } }
      mockApi.delete.mockResolvedValue(mockResponse)

      const result = await deleteGame(123)

      expect(mockApi.delete).toHaveBeenCalledWith('/eliminar-partida/123')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when deleting game', async () => {
      const { deleteGame } = await import('../../../service/HttpService')
      
      const mockError = new Error('Delete error')
      mockApi.delete.mockRejectedValue(mockError)

      await expect(deleteGame(123)).rejects.toThrow('Delete error')
    })
  })

  describe('startGame', () => {
    it('should start a game', async () => {
      const { startGame } = await import('../../../service/HttpService')
      
      const mockResponse = { data: { estado: 'iniciada' } }
      mockApi.put.mockResolvedValue(mockResponse)

      const result = await startGame(123)

      expect(mockApi.put).toHaveBeenCalledWith('/iniciar-partida/123')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when starting game', async () => {
      const { startGame } = await import('../../../service/HttpService')
      
      const mockError = new Error('Start error')
      mockApi.put.mockRejectedValue(mockError)

      await expect(startGame(123)).rejects.toThrow('Start error')
    })
  })

  describe('getGameDetails', () => {
    it('should get game details', async () => {
      const { getGameDetails } = await import('../../../service/HttpService')
      
      const mockResponse = { data: { id: 123, nombre: 'Game Details' } }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await getGameDetails(123)

      expect(mockApi.get).toHaveBeenCalledWith('/detalles-partida', {
        params: { partida_id: 123 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when getting game details', async () => {
      const { getGameDetails } = await import('../../../service/HttpService')
      
      const mockError = new Error('Details error')
      mockApi.get.mockRejectedValue(mockError)

      await expect(getGameDetails(123)).rejects.toThrow('Details error')
    })
  })

  describe('handlePlayerJoinGame', () => {
    it('should allow player to join game', async () => {
      const { handlePlayerJoinGame } = await import('../../../service/HttpService')
      
      const mockResponse = { data: { success: true } }
      mockApi.put.mockResolvedValue(mockResponse)

      const result = await handlePlayerJoinGame(456, 123)

      expect(mockApi.put).toHaveBeenCalledWith('/unirse-partida', null, {
        params: { partida_id: 123, jugador_id: 456 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when joining game', async () => {
      const { handlePlayerJoinGame } = await import('../../../service/HttpService')
      
      const mockError = new Error('Join error')
      mockApi.put.mockRejectedValue(mockError)

      await expect(handlePlayerJoinGame(456, 123)).rejects.toThrow('Join error')
    })
  })

  describe('leaveGame', () => {
    it('should allow player to leave game', async () => {
      const { leaveGame } = await import('../../../service/HttpService')
      
      const mockResponse = { data: { success: true } }
      mockApi.put.mockResolvedValue(mockResponse)

      const result = await leaveGame(456)

      expect(mockApi.put).toHaveBeenCalledWith('/salir-partida', null, {
        params: { jugador_id: 456 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when leaving game', async () => {
      const { leaveGame } = await import('../../../service/HttpService')
      
      const mockError = new Error('Leave error')
      mockApi.put.mockRejectedValue(mockError)

      await expect(leaveGame(456)).rejects.toThrow('Leave error')
    })
  })

  describe('fetchPlayersInGame', () => {
    it('should fetch players in game', async () => {
      const { fetchPlayersInGame } = await import('../../../service/HttpService')
      
      const mockResponse = { data: [{ id: 456, name: 'Player 1' }] }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await fetchPlayersInGame(123)

      expect(mockApi.get).toHaveBeenCalledWith('/partida/jugadores', {
        params: { partida_id: 123 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when fetching players in game', async () => {
      const { fetchPlayersInGame } = await import('../../../service/HttpService')
      
      const mockError = new Error('Fetch players error')
      mockApi.get.mockRejectedValue(mockError)

      await expect(fetchPlayersInGame(123)).rejects.toThrow('Fetch players error')
    })
  })

  describe('fetchPlayerData', () => {
    it('should fetch player data', async () => {
      const { fetchPlayerData } = await import('../../../service/HttpService')
      
      const mockResponse = { data: { id: 456, name: 'Player Data' } }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await fetchPlayerData(456)

      expect(mockApi.get).toHaveBeenCalledWith('/obtener-datos-jugador/456')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when fetching player data', async () => {
      const { fetchPlayerData } = await import('../../../service/HttpService')
      
      const mockError = new Error('Player data error')
      mockApi.get.mockRejectedValue(mockError)

      await expect(fetchPlayerData(456)).rejects.toThrow('Player data error')
    })
  })

  describe('filtrarPartidas', () => {
    it('should filter games by name', async () => {
      const { filtrarPartidas } = await import('../../../service/HttpService')
      
      const mockResponse = { 
        data: [
          { id: 1, nombre: 'Partida Test' },
          { id: 2, nombre: 'Test Game' }
        ] 
      }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await filtrarPartidas('Test')

      expect(mockApi.get).toHaveBeenCalledWith('/listar-partidas/Test')
      expect(result).toEqual(mockResponse.data)
      expect(result).toHaveLength(2)
    })

    it('should handle errors when filtering games', async () => {
      const { filtrarPartidas } = await import('../../../service/HttpService')
      
      const mockError = new Error('Filter error')
      mockApi.get.mockRejectedValue(mockError)

      await expect(filtrarPartidas('Test')).rejects.toThrow('Filter error')
    })

    it('should handle empty filter results', async () => {
      const { filtrarPartidas } = await import('../../../service/HttpService')
      
      const mockResponse = { data: [] }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await filtrarPartidas('NoExiste')

      expect(mockApi.get).toHaveBeenCalledWith('/listar-partidas/NoExiste')
      expect(result).toEqual([])
    })
  })

  describe('endTurn', () => {
    it('should end player turn', async () => {
      const { endTurn } = await import('../../../service/HttpService')
      
      const mockResponse = { data: { success: true, turno_siguiente: 2 } }
      mockApi.put.mockResolvedValue(mockResponse)

      const result = await endTurn(123)

      expect(mockApi.put).toHaveBeenCalledWith('/partida/123/terminar-turno', null, {
        params: { partida_id: 123 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when ending turn', async () => {
      const { endTurn } = await import('../../../service/HttpService')
      
      const mockError = new Error('End turn error')
      mockApi.put.mockRejectedValue(mockError)

      await expect(endTurn(123)).rejects.toThrow('End turn error')
    })
  })

  describe('obtenerCartas', () => {
    it('should get player cards', async () => {
      const { obtenerCartas } = await import('../../../service/HttpService')
      
      const mockResponse = { 
        data: [
          { id: 1, nombre: 'Carta 1' },
          { id: 2, nombre: 'Carta 2' }
        ] 
      }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await obtenerCartas(456)

      expect(mockApi.get).toHaveBeenCalledWith('/partida/cartas', {
        params: { id_jugador: 456 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when getting cards', async () => {
      const { obtenerCartas } = await import('../../../service/HttpService')
      
      const mockError = new Error('Get cards error')
      mockApi.get.mockRejectedValue(mockError)

      await expect(obtenerCartas(456)).rejects.toThrow('Get cards error')
    })
  })

  describe('obtenerSecretos', () => {
    it('should get player secrets', async () => {
      const { obtenerSecretos } = await import('../../../service/HttpService')
      
      const mockResponse = { 
        data: [
          { id: 1, nombre: 'Secreto 1' },
          { id: 2, nombre: 'Secreto 2' }
        ] 
      }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await obtenerSecretos(456)

      expect(mockApi.get).toHaveBeenCalledWith('/partida/secretos', {
        params: { id_jugador: 456 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when getting secrets', async () => {
      const { obtenerSecretos } = await import('../../../service/HttpService')
      
      const mockError = new Error('Get secrets error')
      mockApi.get.mockRejectedValue(mockError)

      await expect(obtenerSecretos(456)).rejects.toThrow('Get secrets error')
    })
  })

  describe('noEjecutarAccion', () => {
    it('should skip action', async () => {
      const { noEjecutarAccion } = await import('../../../service/HttpService')
      
      const mockResponse = { data: { success: true } }
      mockApi.put.mockResolvedValue(mockResponse)

      const result = await noEjecutarAccion(456)

      expect(mockApi.put).toHaveBeenCalledWith('/no-ejecutar-accion', null, {
        params: { id_jugador: 456 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when skipping action', async () => {
      const { noEjecutarAccion } = await import('../../../service/HttpService')
      
      const mockError = new Error('Skip action error')
      mockApi.put.mockRejectedValue(mockError)

      await expect(noEjecutarAccion(456)).rejects.toThrow('Skip action error')
    })
  })

  describe('descartarCarta', () => {
    it('should discard a card', async () => {
      const { descartarCarta } = await import('../../../service/HttpService')
      
      const mockResponse = { data: { success: true, carta_descartada: 101 } }
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await descartarCarta(123, 101)

      expect(mockApi.post).toHaveBeenCalledWith('/descartar-carta', null, {
        params: { carta_id: 101, partida_id: 123 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when discarding card', async () => {
      const { descartarCarta } = await import('../../../service/HttpService')
      
      const mockError = new Error('Discard error')
      mockApi.post.mockRejectedValue(mockError)

      await expect(descartarCarta(123, 101)).rejects.toThrow('Discard error')
    })
  })

  describe('robarCarta', () => {
    it('should draw a card from deck', async () => {
      const { robarCarta } = await import('../../../service/HttpService')
      
      const mockResponse = { 
        data: { 
          id: 102, 
          nombre: 'Carta Robada',
          tipo: 'Detective' 
        } 
      }
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await robarCarta(456, 123)

      expect(mockApi.post).toHaveBeenCalledWith('/robar-carta-del-mazo-regular', null, {
        params: { jugador_id: 456, partida_id: 123 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when drawing card', async () => {
      const { robarCarta } = await import('../../../service/HttpService')
      
      const mockError = new Error('Draw card error')
      mockApi.post.mockRejectedValue(mockError)

      await expect(robarCarta(456, 123)).rejects.toThrow('Draw card error')
    })

    it('should handle empty deck error', async () => {
      const { robarCarta } = await import('../../../service/HttpService')
      
      const mockError = new Error('Mazo vacío')
      mockApi.post.mockRejectedValue(mockError)

      await expect(robarCarta(456, 123)).rejects.toThrow('Mazo vacío')
    })
  })

  describe('ganador', () => {
    it('should get game winner', async () => {
      const { ganador } = await import('../../../service/HttpService')
      
      const mockResponse = { 
        data: { 
          ganador: 1,
          asesino: 456,
          complice: null
        } 
      }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await ganador(123)

      expect(mockApi.get).toHaveBeenCalledWith('/ganador', {
        params: { partida_id: 123 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should get winner with accomplice', async () => {
      const { ganador } = await import('../../../service/HttpService')
      
      const mockResponse = { 
        data: { 
          ganador: 1,
          asesino: 456,
          complice: 789
        } 
      }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await ganador(123)

      expect(result).toEqual(mockResponse.data)
      expect(result.complice).toBe(789)
    })

    it('should handle errors when getting winner', async () => {
      const { ganador } = await import('../../../service/HttpService')
      
      const mockError = new Error('Winner error')
      mockApi.get.mockRejectedValue(mockError)

      await expect(ganador(123)).rejects.toThrow('Winner error')
    })
  })

  describe('descarteObligatorio', () => {
    it('should force discard', async () => {
      const { descarteObligatorio } = await import('../../../service/HttpService')
      
      const mockResponse = { data: { success: true, carta_descartada: 105 } }
      mockApi.put.mockResolvedValue(mockResponse)

      const result = await descarteObligatorio(456)

      expect(mockApi.put).toHaveBeenCalledWith('/descartar-obligatorio', null, {
        params: { id_jugador: 456 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when forcing discard', async () => {
      const { descarteObligatorio } = await import('../../../service/HttpService')
      
      const mockError = new Error('Force discard error')
      mockApi.put.mockRejectedValue(mockError)

      await expect(descarteObligatorio(456)).rejects.toThrow('Force discard error')
    })
  })

  describe('checkSets', () => {
    it('should check available sets for player', async () => {
      const { checkSets } = await import('../../../service/HttpService')
      
      const mockResponse = { 
        data: {
          sets_disponibles: [
            { tipo: 'Detective', cartas: [1, 2, 3, 4] }
          ]
        } 
      }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await checkSets(123, 456)

      expect(mockApi.get).toHaveBeenCalledWith('/check-sets', {
        params: { partida_id: 123, jugador_id: 456 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should return empty sets when no sets available', async () => {
      const { checkSets } = await import('../../../service/HttpService')
      
      const mockResponse = { 
        data: { sets_disponibles: [] } 
      }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await checkSets(123, 456)

      expect(result.sets_disponibles).toEqual([])
    })

    it('should handle errors when checking sets', async () => {
      const { checkSets } = await import('../../../service/HttpService')
      
      const mockError = new Error('Check sets error')
      mockApi.get.mockRejectedValue(mockError)

      await expect(checkSets(123, 456)).rejects.toThrow('Check sets error')
    })
  })

  describe('jugarSet', () => {
    it('should play a set without target', async () => {
      const { jugarSet } = await import('../../../service/HttpService')
      
      const mockResponse = { 
        data: { 
          success: true,
          set_jugado: 'Detective',
          cartas: [1, 2, 3]
        } 
      }
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await jugarSet(123, 456, 0, 1, 2, 3)

      expect(mockApi.post).toHaveBeenCalledWith('/jugar-set', null, {
        params: { 
          partida_id: 123, 
          jugador_id: 456, 
          objetivo_id: 0,
          carta_1_id: 1,
          carta_2_id: 2,
          carta_3_id: 3
        }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should play a set with target', async () => {
      const { jugarSet } = await import('../../../service/HttpService')
      
      const mockResponse = { 
        data: { 
          success: true,
          set_jugado: 'Asesino',
          objetivo: 789
        } 
      }
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await jugarSet(123, 456, 789, 5, 6, 7)

      expect(mockApi.post).toHaveBeenCalledWith('/jugar-set', null, {
        params: { 
          partida_id: 123, 
          jugador_id: 456, 
          objetivo_id: 789,
          carta_1_id: 5,
          carta_2_id: 6,
          carta_3_id: 7
        }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should convert null objetivo_id to 0', async () => {
      const { jugarSet } = await import('../../../service/HttpService')
      
      const mockResponse = { data: { success: true } }
      mockApi.post.mockResolvedValue(mockResponse)

      await jugarSet(123, 456, null, 1, 2, 3)

      expect(mockApi.post).toHaveBeenCalledWith('/jugar-set', null, {
        params: { 
          partida_id: 123, 
          jugador_id: 456, 
          objetivo_id: 0,
          carta_1_id: 1,
          carta_2_id: 2,
          carta_3_id: 3
        }
      })
    })

    it('should convert undefined objetivo_id to 0', async () => {
      const { jugarSet } = await import('../../../service/HttpService')
      
      const mockResponse = { data: { success: true } }
      mockApi.post.mockResolvedValue(mockResponse)

      await jugarSet(123, 456, undefined, 1, 2, 3)

      expect(mockApi.post).toHaveBeenCalledWith('/jugar-set', null, {
        params: { 
          partida_id: 123, 
          jugador_id: 456, 
          objetivo_id: 0,
          carta_1_id: 1,
          carta_2_id: 2,
          carta_3_id: 3
        }
      })
    })

    it('should not include carta_3_id when undefined', async () => {
      const { jugarSet } = await import('../../../service/HttpService')
      
      const mockResponse = { data: { success: true } }
      mockApi.post.mockResolvedValue(mockResponse)

      await jugarSet(123, 456, 0, 1, 2, undefined)

      expect(mockApi.post).toHaveBeenCalledWith('/jugar-set', null, {
        params: { 
          partida_id: 123, 
          jugador_id: 456, 
          objetivo_id: 0,
          carta_1_id: 1,
          carta_2_id: 2
          // carta_3_id should not be included
        }
      })
    })

    it('should not include carta_3_id when null', async () => {
      const { jugarSet } = await import('../../../service/HttpService')
      
      const mockResponse = { data: { success: true } }
      mockApi.post.mockResolvedValue(mockResponse)

      await jugarSet(123, 456, 0, 1, 2, null)

      expect(mockApi.post).toHaveBeenCalledWith('/jugar-set', null, {
        params: { 
          partida_id: 123, 
          jugador_id: 456, 
          objetivo_id: 0,
          carta_1_id: 1,
          carta_2_id: 2
          // carta_3_id should not be included
        }
      })
    })

    it('should handle errors when playing set', async () => {
      const { jugarSet } = await import('../../../service/HttpService')
      
      const mockError = new Error('Play set error')
      mockApi.post.mockRejectedValue(mockError)

      await expect(jugarSet(123, 456, 0, 1, 2, 3)).rejects.toThrow('Play set error')
    })

    it('should handle invalid set error', async () => {
      const { jugarSet } = await import('../../../service/HttpService')
      
      const mockError = new Error('Set inválido')
      mockApi.post.mockRejectedValue(mockError)

      await expect(jugarSet(123, 456, 0, 1, 2)).rejects.toThrow('Set inválido')
    })
  })
})