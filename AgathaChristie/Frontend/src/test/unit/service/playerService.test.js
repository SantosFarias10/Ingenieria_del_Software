import { describe, it, expect } from 'vitest'
import { getAvatars } from '../../../service/playerService'

describe('PlayerService', () => {
  describe('getAvatars', () => {
    it('retorna lista de avatares con formato correcto', () => {
      const avatars = getAvatars()
      
      expect(avatars).toBeInstanceOf(Array)
      expect(avatars).toHaveLength(6)
      
      // Verificar que cada avatar tiene la estructura correcta
      avatars.forEach((avatar, index) => {
        expect(avatar).toHaveProperty('value')
        expect(avatar).toHaveProperty('src')
        expect(avatar).toHaveProperty('alt')
        
        expect(typeof avatar.value).toBe('string')
        expect(typeof avatar.src).toBe('string')
        expect(typeof avatar.alt).toBe('string')
        
        expect(avatar.value).toBe(`avatar${index + 1}`)
        expect(avatar.src).toContain('/assets/Avatares/')
        expect(avatar.alt).toBe(`Avatar ${index + 1}`)
      })
    })

    it('retorna avatares con valores únicos', () => {
      const avatars = getAvatars()
      const values = avatars.map(a => a.value)
      const uniqueValues = [...new Set(values)]
      
      expect(uniqueValues).toHaveLength(values.length)
    })

    it('retorna rutas de imagen correctas', () => {
      const avatars = getAvatars()
      
      expect(avatars[0].src).toBe('/assets/Avatares/avatar1.jpg')
      expect(avatars[1].src).toBe('/assets/Avatares/avatar2.jpg')
      expect(avatars[2].src).toBe('/assets/Avatares/avatar3.png')
      expect(avatars[3].src).toBe('/assets/Avatares/avatar4.png')
      expect(avatars[4].src).toBe('/assets/Avatares/avatar5.png')
      expect(avatars[5].src).toBe('/assets/Avatares/avatar6.png')
    })
  })
})