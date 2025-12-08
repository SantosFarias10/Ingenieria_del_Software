# Frontend

## Instalación

1. Clona el repositorio:
   ```bash
   git clone git@github.com:Wolovers/Frontend.git
   cd Frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```

## Ejecución en Desarrollo
   ```bash
   npm run dev
   ```

## Estructura del Proyecto

```csharp
Frontend/
│── public/
│   └── assets/
│
│── src/
│   ├── components/
|   |
│   ├── container/
│   │
│   ├── pages/
|   |
│   ├── service/ 
│   │
│   ├── styles/
│   │
│   ├── App.jsx         # Configuración principal de la app
│   └── main.jsx        # Punto de entrada de React
│
├── index.html
├── package.json
└── vite.config.js
```

## Directorios

* `public/` = Archivos estáticos públicos (Imágenes, íconos, fuentes, archivos multimedia).
* `components/` = Componentes UI reutilizables y presentacionales.
* `container/` = Componentes que manejan lógica de negocio, estado.
* `pages/` = Componentes que representan páginas completas/rutas de la aplicación.
* `service/` = Módulos para comunicación con APIs externas y servicios.
* `styles/` = Estilo CSS.

## Tegnologias Usadas

* React => Librería para construir interfaces de usuario.
* Vite => Herramienta de desarrollo rápida para React.
* React Router DOM =>Manejo de rutas en la aplicación.
* CSS => Estilos personalizados para cada componente/página.
* HTML

## Testing

### Arquitectura de Tests

El proyecto cuenta con varios tests organizados en tres niveles:

- **Tests Unitarios (Unit)**: Validan componentes y servicios individuales de forma aislada.
- **Tests de Integración (Integration)**: Verifican la interacción entre múltiples componentes y servicios.
- **Tests E2E (End-to-End)**: Simulan flujos completos de usuario en un navegador real.

### Estructura de Tests

```
src/test/
├── setup.js                          # Configuración global de tests
├── unit/                             # Tests unitarios
│   ├── AvatarPicker.test.jsx
│   ├── Button.test.jsx
│   ├── Form.test.jsx
│   ├── LocalStorage.test.js
│   ├── playerService.test.js
│   └── service/
│       └── HttpService.test.js
├── integration/                      # Tests de integración
│   ├── CrearJugadorContainer.test.jsx
│   ├── CrearPartidaContainer.test.jsx
│   ├── CrearPartidaContainer.validation.test.jsx
│   └── HomeContainer.test.jsx
└── e2e/                              # Tests end-to-end
    └── user-flow.spec.js
```

### Instalación de Dependencias de Testing

Las dependencias de testing ya están incluidas en el `package.json`. Para instalarlas:

```bash
npm install
```

**Dependencias principales:**
- `vitest` - Framework de testing rápido compatible con Vite
- `@testing-library/react` - Utilidades para testing de componentes React
- `@testing-library/jest-dom` - Matchers adicionales para assertions DOM
- `@testing-library/user-event` - Simulación de interacciones de usuario
- `@playwright/test` - Framework para tests E2E en navegadores reales
- `jsdom` - Implementación DOM para tests en Node.js

### Comandos para Ejecutar Tests

#### Todos los tests (Unit + Integration)
```bash
npm test
```

#### Tests con coverage
```bash
npm run test:coverage
```

#### Tests en modo watch (desarrollo)
```bash
npm run test:watch
```

#### Tests E2E (Playwright)
```bash
npm run test:e2e
```

#### Ver reporte HTML de tests E2E
```bash
npx playwright show-report
```

### Decisiones de Diseño de Tests

#### 1. **Estrategia de Mocking**
- `HttpService` y `WSService` se mockean en tests unitarios/integración.
- Los tests E2E usan `page.route()` para interceptar llamadas HTTP y devolver datos simulados.
- `LocalStorage` se mockea con implementación en memoria para evitar efectos colaterales.

#### 2. **Validación de Formularios**
- Tests específicos para validación (`CrearPartidaContainer.validation.test.jsx`) con 23 casos.
- Validación de campos: mínimo/máximo de jugadores (2-6), nombres no vacíos, etc.
- Tests verifican mensajes de error y comportamiento de auto-corrección.

#### 3. **Tests de Interacción de Usuario**
- Uso de `@testing-library/user-event` para simular clicks, tipeo y selección.
- Tests E2E verifican navegación entre páginas, creación de partidas y unión a juegos.
- Verificación de estados de UI: botones deshabilitados, mensajes de error, modales.

#### 4. **Cobertura de Código**
- Objetivo: cobertura completa de lógica crítica (servicios, validaciones, containers).
- Componentes presentacionales con tests básicos de renderizado.
- Los reportes de coverage se generan en formato HTML y texto.


### Tips para Desarrollo

1. **Ejecuta tests en modo watch** durante desarrollo:
   ```bash
   npm run test:watch
   ```

2. **Verifica coverage** antes de hacer commits:
   ```bash
   npm run test:coverage
   ```

3. **Debug tests E2E** con modo UI de Playwright:
   ```bash
   npx playwright test --ui
   ```

## Notas sobre HttpService


Resumen de endpoints soportados (firma esperada):

- POST `/crear-jugador?nombre=&cumple=&avatar=` -> crea un jugador y devuelve el objeto jugador.
- GET `/listar-jugadores` -> lista de jugadores.
- POST `/crear-partida?nombre=&creador=` (body: { numero_jugadores }) -> crea partida.
- GET `/listar-partidas` -> lista de partidas.
- DELETE `/eliminar-partida/{partida_id}` -> elimina una partida.
- PUT `/iniciar-partida/{partida_id}` -> inicia la partida.
- PUT `/unirse-partida?partida_id=&jugador_id=` -> unirse a una partida.
- PUT `/salir-partida?jugador_id=` -> salir de una partida.
- GET `/detalles-partida?partida_id=` -> detalles de una partida.
- GET `/partida/jugadores?partida_id=` -> jugadores de una partida.

Los métodos públicos de `HttpService.js` mantienen nombres amigables (por ejemplo `createPlayer`, `createGame`, `fetchPartidasService`, `handlePlayerJoinGame`, etc.) y mapean internamente a las rutas anteriores. Si el backend cambia, actualizar `HttpService.js` centraliza la adaptación.

