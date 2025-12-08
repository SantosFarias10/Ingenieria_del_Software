import { test, expect } from '@playwright/test'

test.describe('Flujo completo de usuario - Crear Jugador y Partida', () => {

  test.beforeEach(async ({ page }) => {
    // Mock de las llamadas HTTP
    await page.route('**/crear-jugador*', async route => {
      const request = route.request()
      if (request.method() === 'POST') {
        const url = new URL(request.url())
        const nombre = url.searchParams.get('nombre')
        const avatar = url.searchParams.get('avatar')
        const cumple = url.searchParams.get('cumple')
        
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            name: nombre,
            avatar: avatar,
            birthdate: cumple
          })
        })
      }
    })

    await page.route('**/crear-partida*', async route => {
      const request = route.request()
      if (request.method() === 'POST') {
        const url = new URL(request.url())
        const nombre = url.searchParams.get('nombre')
        const creador = url.searchParams.get('creador')
        const maxJugadores = url.searchParams.get('max_jugadores')
        const minJugadores = url.searchParams.get('min_jugadores')
        
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            nombre: nombre,
            creador: creador,
            max_jugadores: maxJugadores,
            min_jugadores: minJugadores
          })
        })
      }
    })

    await page.route('**/listar-partidas*', async route => {
      const request = route.request()
      if (request.method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 1,
              nombre: "Partida de Prueba",
              max_jugadores: 4,
              estado: "esperando"
            }
          ])
        })
      }
    })

    await page.goto('/')
  })

  test('crea un jugador completo y navega a home', async ({ page }) => {
    const testName = 'Juan Pérez'
    const testDate = '1990-05-15'
    
    // Llenar el formulario
    await page.getByPlaceholder('Nombre').fill(testName)
    await page.getByPlaceholder('Fecha de Nacimiento').fill(testDate)
    
    // Seleccionar un avatar (avatar3)
    await page.locator('img[alt="Avatar 3"]').click()
    
    // Enviar el formulario
    await page.getByRole('button', { name: 'Crear' }).click()
    
    // Debería navegar a /home y mostrar las opciones
    await expect(page).toHaveURL('/home')
    await expect(page.getByText('Home')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Crear Partida' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Unirse a Partida' })).toBeVisible()
  })

  test('crea una partida después de crear jugador', async ({ page }) => {
    // Primero crear un jugador
    await page.getByPlaceholder('Nombre').fill('María García')
    await page.getByPlaceholder('Fecha de Nacimiento').fill('1985-03-10')
    await page.locator('img[alt="Avatar 2"]').click()
    await page.getByRole('button', { name: 'Crear' }).click()
    
    // Esperar a estar en home
    await expect(page).toHaveURL('/home')
    
    // Ahora en home, crear una partida
    await page.getByRole('button', { name: 'Crear Partida' }).click()
    
    // Verificar que estamos en crear partida
    await expect(page.getByRole('heading', { level: 1, name: 'Crear Partida' })).toBeVisible()
    
    // Llenar el formulario de partida
    await page.getByPlaceholder('Nombre de la Partida').fill('Mi Partida E2E')
    await page.getByPlaceholder('Mínimo de Jugadores').fill('2')
    await page.getByPlaceholder('Máximo de Jugadores').fill('4')
    
    // Crear la partida
    await page.getByRole('button', { name: 'Crear Partida' }).click()
    
    // Verificar navegación exitosa (debería ir al lobby o quedarse en la misma página)
    // Dependiendo de la implementación, ajustar esta expectativa
    await expect(page.getByText('Mi Partida E2E')).toBeVisible()
  })

  test('navega al listado de partidas', async ({ page }) => {
    // Crear jugador primero
    await page.getByPlaceholder('Nombre').fill('Carlos López')
    await page.getByPlaceholder('Fecha de Nacimiento').fill('1995-07-20')
    await page.locator('img[alt="Avatar 4"]').click()
    await page.getByRole('button', { name: 'Crear' }).click()
    
    // Esperar a estar en home
    await expect(page).toHaveURL('/home')
    
    // Ir al listado de partidas
    await page.getByRole('button', { name: 'Unirse a Partida' }).click()
    
    // Verificar que estamos en el listado
    await expect(page).toHaveURL('/listar-partidas')
    await expect(page.getByText('Partidas Disponibles')).toBeVisible()
  })

  test('valida campos obligatorios en crear jugador', async ({ page }) => {
    // Intentar enviar sin llenar campos
    await page.getByRole('button', { name: 'Crear' }).click()
    
    // Verificar mensaje de error
    await expect(page.getByText('El nombre es obligatorio')).toBeVisible()
    
    // Llenar solo el nombre
    await page.getByPlaceholder('Nombre').fill('Test')
    await page.getByRole('button', { name: 'Crear' }).click()
    
    // Verificar mensaje de error por fecha
    await expect(page.getByText('La fecha de nacimiento es obligatoria')).toBeVisible()
    
    // Llenar fecha pero no avatar
    await page.getByPlaceholder('Fecha de Nacimiento').fill('1990-01-01')
    await page.getByRole('button', { name: 'Crear' }).click()
    
    // Verificar mensaje de error por avatar
    await expect(page.getByText('Selecciona un avatar')).toBeVisible()
  })

  test('valida edad mínima', async ({ page }) => {
    const currentYear = new Date().getFullYear()
    const youngDate = `${currentYear - 10}-01-01` // 10 años
    
    await page.getByPlaceholder('Nombre').fill('Niño Pequeño')
    await page.getByPlaceholder('Fecha de Nacimiento').fill(youngDate)
    await page.locator('img[alt="Avatar 1"]').click()
    await page.getByRole('button', { name: 'Crear' }).click()
    
    // Verificar mensaje de error por edad
    await expect(page.getByText('Debes tener al menos 13 años para crear un jugador')).toBeVisible()
  })

  test('valida campos obligatorios en crear partida', async ({ page }) => {
    // Crear jugador primero
    await page.getByPlaceholder('Nombre').fill('Test User')
    await page.getByPlaceholder('Fecha de Nacimiento').fill('1990-01-01')
    await page.locator('img[alt="Avatar 1"]').click()
    await page.getByRole('button', { name: 'Crear' }).click()
    
    await expect(page).toHaveURL('/home')
    
    // Ir a crear partida
    await page.getByRole('button', { name: 'Crear Partida' }).click()
    
    // Intentar crear sin nombre
    await page.getByRole('button', { name: 'Crear Partida' }).click()
    
    // Verificar que no navega (se queda en la misma página)
    await expect(page).toHaveURL('/crear-partida')
  })

  test('valida navegación con botón Volver', async ({ page }) => {
    // Crear jugador primero
    await page.getByPlaceholder('Nombre').fill('Test User')
    await page.getByPlaceholder('Fecha de Nacimiento').fill('1990-01-01')
    await page.locator('img[alt="Avatar 1"]').click()
    await page.getByRole('button', { name: 'Crear' }).click()
    
    await expect(page).toHaveURL('/home')
    
    // Ir a crear partida y volver
    await page.getByRole('button', { name: 'Crear Partida' }).click()
    await page.getByRole('button', { name: 'Volver' }).click()
    
    // Debería estar de vuelta en home
    await expect(page).toHaveURL('/home')
  })

  test('flujo completo con diferentes avatares', async ({ page }) => {
    // Probar con avatar 5
    await page.getByPlaceholder('Nombre').fill('Avatar Test')
    await page.getByPlaceholder('Fecha de Nacimiento').fill('1987-11-30')
    await page.locator('img[alt="Avatar 5"]').click()
    await page.getByRole('button', { name: 'Crear' }).click()
    
    // Verificar navegación exitosa
    await expect(page).toHaveURL('/home')
  })

  test('verifica persistencia de datos en localStorage', async ({ page }) => {
    const testName = 'LocalStorage Test'
    
    // Crear jugador
    await page.getByPlaceholder('Nombre').fill(testName)
    await page.getByPlaceholder('Fecha de Nacimiento').fill('1992-08-15')
    await page.locator('img[alt="Avatar 3"]').click()
    await page.getByRole('button', { name: 'Crear' }).click()
    
    // Verificar que llegó a home
    await expect(page).toHaveURL('/home')
    
    // Verificar localStorage
    const userData = await page.evaluate(() => {
      return localStorage.getItem('app:currentUser')
    })
    
    expect(userData).toBeTruthy()
    const parsedUser = JSON.parse(userData)
    expect(parsedUser.nombre).toBe(testName)
    expect(parsedUser.avatar).toBe('avatar3')
  })

  test('valida que los inputs tengan límites correctos', async ({ page }) => {
    // Crear jugador con nombre muy largo
    const longName = 'A'.repeat(60) // Más de 50 caracteres
    
    await page.getByPlaceholder('Nombre').fill(longName)
    
    // Verificar que el input limita a 50 caracteres
    const nameValue = await page.getByPlaceholder('Nombre').inputValue()
    expect(nameValue.length).toBeLessThanOrEqual(50)
    
    // Completar el formulario
    await page.getByPlaceholder('Fecha de Nacimiento').fill('1990-01-01')
    await page.locator('img[alt="Avatar 1"]').click()
    await page.getByRole('button', { name: 'Crear' }).click()
    
    await page.getByRole('button', { name: 'Crear Partida' }).click()
    
    const minPlayersInput = page.getByPlaceholder('Mínimo de Jugadores')
    const maxPlayersInput = page.getByPlaceholder('Máximo de Jugadores')
    await expect(minPlayersInput).toHaveAttribute('min', '2')
    await expect(minPlayersInput).toHaveAttribute('max', '6')
    await expect(maxPlayersInput).toHaveAttribute('min', '2')
    await expect(maxPlayersInput).toHaveAttribute('max', '6')
  })
})