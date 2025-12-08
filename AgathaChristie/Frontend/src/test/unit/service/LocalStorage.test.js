import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  saveUser, 
  getUser, 
  getUserId, 
  clearUser,
  saveGame,
  getGame,
  getGameId,
  clearGame,
  clearAllStorage 
} from '../../../service/LocalStorage'

describe('LocalStorage Service', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('User Storage', () => {
    it('guarda y recupera un usuario correctamente', () => {
      const testUser = { id: 1, nombre: 'Test User', avatar: 'avatar1' }
      
      saveUser(testUser)
      const retrieved = getUser()
      
      expect(retrieved).toEqual(testUser)
    })

    it('obtiene el ID del usuario', () => {
      const testUser = { id: 123, nombre: 'Test User' }
      
      saveUser(testUser)
      const userId = getUserId()
      
      expect(userId).toBe(123)
    })

    it('retorna null cuando no hay usuario guardado', () => {
      const user = getUser()
      const userId = getUserId()
      
      expect(user).toBeNull()
      expect(userId).toBeNull()
    })

    it('lanza error si se intenta guardar usuario sin id', () => {
      const userWithoutId = { nombre: 'No ID User' }
      
      expect(() => saveUser(userWithoutId)).toThrow('saveUser: user must have id')
    })

    it('limpia el usuario del storage', () => {
      const testUser = { id: 1, nombre: 'Test User' }
      
      saveUser(testUser)
      expect(getUser()).toEqual(testUser)
      
      clearUser()
      expect(getUser()).toBeNull()
    })
  })

  describe('Game Storage', () => {
    it('guarda y recupera un juego correctamente', () => {
      const testGame = { id: 1, nombre: 'Test Game', creador: 123 }
      
      saveGame(testGame)
      const retrieved = getGame()
      
      expect(retrieved).toEqual(testGame)
    })

    it('obtiene el ID del juego', () => {
      const testGame = { id: 456, nombre: 'Test Game' }
      
      saveGame(testGame)
      const gameId = getGameId()
      
      expect(gameId).toBe(456)
    })

    it('retorna null cuando no hay juego guardado', () => {
      const game = getGame()
      const gameId = getGameId()
      
      expect(game).toBeNull()
      expect(gameId).toBeNull()
    })

    it('lanza error si se intenta guardar juego sin id', () => {
      const gameWithoutId = { nombre: 'No ID Game' }
      
      expect(() => saveGame(gameWithoutId)).toThrow('saveGame: game must have id')
    })

    it('limpia el juego del storage', () => {
      const testGame = { id: 1, nombre: 'Test Game' }
      
      saveGame(testGame)
      expect(getGame()).toEqual(testGame)
      
      clearGame()
      expect(getGame()).toBeNull()
    })
  })

  describe('Clear All Storage', () => {
    it('limpia tanto usuario como juego', () => {
      const testUser = { id: 1, nombre: 'Test User' }
      const testGame = { id: 1, nombre: 'Test Game' }
      
      saveUser(testUser)
      saveGame(testGame)
      
      expect(getUser()).toEqual(testUser)
      expect(getGame()).toEqual(testGame)
      
      clearAllStorage()
      
      expect(getUser()).toBeNull()
      expect(getGame()).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('maneja JSON corrupto en localStorage', () => {
      // Simular JSON corrupto
      localStorage.setItem('app:currentUser', '{invalid json}')
      
      const user = getUser()
      
      expect(user).toBeNull()
    })

    it('maneja null values en localStorage', () => {
      localStorage.removeItem('app:currentUser')
      
      const user = getUser()
      
      expect(user).toBeNull()
    })

    it('maneja errores cuando localStorage.setItem falla', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const testUser = { id: 1, nombre: 'Test User' }
      
      // Guardar la implementación original
      const originalSetItem = localStorage.setItem
      
      // Simular que localStorage.setItem lanza un error (ej: storage lleno)
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError: localStorage is full')
      })
      
      // saveUser debería manejar el error internamente y retornar el usuario
      const result = saveUser(testUser)
      
      // Verifica que se llamó a setItem
      expect(localStorage.setItem).toHaveBeenCalled()
      
      // Verifica que se logueó el error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'localStorage.setItem failed',
        expect.any(Error)
      )
      
      // saveUser aún debería retornar el usuario aunque falle el guardado
      expect(result).toEqual(testUser)
      
      // Restaurar
      localStorage.setItem = originalSetItem
      consoleErrorSpy.mockRestore()
    })
  })
})