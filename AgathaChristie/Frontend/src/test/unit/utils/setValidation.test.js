import { describe, it, expect } from 'vitest'

// Extraer la función validarSet para testing
// Esta función simula la lógica de validación del PartidaContainer
const validarSet = (setArray) => {
  if (!setArray || setArray.length === 0) return false

  // Identificar el detective principal (no Harley Quin)
  const detectivePrincipal = setArray.find(id => id !== 8)

  if (!detectivePrincipal) return false // Solo Harley Quin
  if (detectivePrincipal === 9) return false // Adriane Oliver no puede iniciar

  // Verificar que todas las cartas sean del mismo detective o Harley Quin
  // Excepción especial: Tommy (6) y Tuppence (7) Beresford pueden jugarse juntos
  const hermanosBeresfords = [6, 7]
  const esSetBeresford = setArray.every(id => hermanosBeresfords.includes(id) || id === 8)
  
  const esValido = setArray.every(id => id === detectivePrincipal || id === 8) || esSetBeresford
  if (!esValido) return false

  // Verificar cantidad mínima según detective
  const minCartas = [1, 2].includes(detectivePrincipal) ? 3 : 2
  return setArray.length >= minCartas
}

describe('Validación de Sets', () => {
  describe('Sets válidos', () => {
    it('debería aceptar set de Hercule Poirot (3 cartas mínimo)', () => {
      expect(validarSet([1, 1, 1])).toBe(true)
      expect(validarSet([1, 1, 8])).toBe(true) // Con Harley Quin
    })

    it('debería aceptar set de Miss Marple (3 cartas mínimo)', () => {
      expect(validarSet([2, 2, 2])).toBe(true)
      expect(validarSet([2, 2, 8])).toBe(true) // Con Harley Quin
    })

    it('debería aceptar set de otros detectives (2 cartas mínimo)', () => {
      expect(validarSet([3, 3])).toBe(true) // Mr Satterthwaite
      expect(validarSet([4, 4])).toBe(true) // Parker Pyne
      expect(validarSet([5, 5])).toBe(true) // Lady Eileen
      expect(validarSet([3, 8])).toBe(true) // Con Harley Quin
    })

    it('debería aceptar sets de hermanos Beresford', () => {
      expect(validarSet([6, 7])).toBe(true) // Tommy + Tuppence
      expect(validarSet([7, 6])).toBe(true) // Orden diferente
      expect(validarSet([6, 7, 8])).toBe(true) // Con Harley Quin
      expect(validarSet([6, 6, 7])).toBe(true) // Múltiples Tommy + Tuppence
    })
  })

  describe('Sets inválidos', () => {
    it('debería rechazar arrays vacíos o null', () => {
      expect(validarSet([])).toBe(false)
      expect(validarSet(null)).toBe(false)
      expect(validarSet(undefined)).toBe(false)
    })

    it('debería rechazar solo Harley Quin', () => {
      expect(validarSet([8])).toBe(false)
      expect(validarSet([8, 8])).toBe(false)
    })

    it('debería rechazar Adriane Oliver como detective principal', () => {
      expect(validarSet([9, 9])).toBe(false)
      expect(validarSet([9, 8])).toBe(false)
    })

    it('debería rechazar mezcla de detectives diferentes (no hermanos)', () => {
      expect(validarSet([1, 2])).toBe(false) // Hercule + Miss Marple
      expect(validarSet([3, 4])).toBe(false) // Mr Satterthwaite + Parker Pyne
      expect(validarSet([1, 3, 8])).toBe(false) // Hercule + Mr Satterthwaite + Harley
    })

    it('debería rechazar cantidad insuficiente para Hercule Poirot y Miss Marple', () => {
      expect(validarSet([1])).toBe(false) // Solo 1 Hercule
      expect(validarSet([1, 8])).toBe(false) // Solo 1 Hercule + Harley
      expect(validarSet([2])).toBe(false) // Solo 1 Miss Marple
      expect(validarSet([2, 8])).toBe(false) // Solo 1 Miss Marple + Harley
    })

    it('debería rechazar cantidad insuficiente para otros detectives', () => {
      expect(validarSet([3])).toBe(false) // Solo 1 Mr Satterthwaite
      expect(validarSet([4])).toBe(false) // Solo 1 Parker Pyne
    })
  })

  describe('Casos edge', () => {
    it('debería manejar sets grandes válidos', () => {
      expect(validarSet([1, 1, 1, 1, 8])).toBe(true) // 4 Hercule + Harley
      expect(validarSet([3, 3, 3, 8, 8])).toBe(true) // 3 Mr Satterthwaite + 2 Harley
    })

    it('debería manejar múltiples hermanos Beresford', () => {
      expect(validarSet([6, 6, 7, 7])).toBe(true) // 2 Tommy + 2 Tuppence
      expect(validarSet([6, 7, 6, 8])).toBe(true) // Tommy + Tuppence + Tommy + Harley
    })
  })
})