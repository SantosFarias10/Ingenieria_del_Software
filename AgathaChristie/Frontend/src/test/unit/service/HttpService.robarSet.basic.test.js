import { describe, it, expect, vi } from 'vitest'

describe('HttpService - Robar Set Functions', () => {
  it('debería exportar la función verTodosLosSets', async () => {
    const HttpService = await import('../../../service/HttpService')
    expect(typeof HttpService.verTodosLosSets).toBe('function')
  })

  it('debería exportar la función intercambiarSet', async () => {
    const HttpService = await import('../../../service/HttpService')
    expect(typeof HttpService.intercambiarSet).toBe('function')
  })

  it('debería exportar la función intercambiarSets', async () => {
    const HttpService = await import('../../../service/HttpService')
    expect(typeof HttpService.intercambiarSets).toBe('function')
  })

  it('intercambiarSet debería ser un alias de intercambiarSets', async () => {
    const HttpService = await import('../../../service/HttpService')
    expect(HttpService.intercambiarSet).toBe(HttpService.intercambiarSets)
  })
})