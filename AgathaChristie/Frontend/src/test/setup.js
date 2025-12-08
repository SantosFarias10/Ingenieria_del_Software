import React from 'react'
import { expect, beforeEach, vi } from 'vitest'
import '@testing-library/jest-dom'

// Make React available globally for JSX
globalThis.React = React

// Mock import.meta.env globalmente para todos los tests
vi.stubGlobal('import.meta', {
  env: {
    VITE_API_BASE_URL: 'http://localhost:8000',
    VITE_WS_URI: 'ws://localhost:8000/ws/partida/jugadores'
  }
})

// Mock de localStorage para tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Limpiar localStorage antes de cada test
beforeEach(() => {
  // Configurar localStorage mock
  localStorageMock.getItem.mockImplementation((key) => {
    return localStorageMock[key] || null
  })
  localStorageMock.setItem.mockImplementation((key, value) => {
    localStorageMock[key] = value
  })
  localStorageMock.removeItem.mockImplementation((key) => {
    delete localStorageMock[key]
  })
  localStorageMock.clear.mockImplementation(() => {
    Object.keys(localStorageMock).forEach(key => {
      if (key !== 'getItem' && key !== 'setItem' && key !== 'removeItem' && key !== 'clear') {
        delete localStorageMock[key]
      }
    })
  })

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  })
  
  // Limpiar mocks
  localStorageMock.clear()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
})