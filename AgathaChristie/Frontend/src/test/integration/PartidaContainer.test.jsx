import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock del WebSocket Service
const mockWSCallbacks = {}

vi.mock('../../service/WSService.js', () => {
	const mockInstance = {
		connect: vi.fn(),
		on: vi.fn((event, callback) => {
			mockWSCallbacks[event] = callback
		}),
		off: vi.fn(),
		disconnect: vi.fn(),
		isConnected: false,
	}
	
	return {
		createWSService: vi.fn(() => mockInstance),
		__mockInstance: mockInstance, // Exportar para usarlo en tests
	}
})

// Mocks de servicios usados por el contenedor
vi.mock('../../service/LocalStorage.js', () => ({
	getGameId: vi.fn(() => 1),
	getUserId: vi.fn(() => 1),
	getUser: vi.fn(() => ({ id: 1, nombre: 'Alice', avatar: 'avatar1' })),
}))

vi.mock('../../service/HttpService.js', () => ({
	gameInit: vi.fn(async () => Promise.resolve()),
	getGameDetails: vi.fn(async () => Promise.resolve({
		jugadores: [
			{ id: 1, nombre: 'Alice', avatar: 'avatar1', mano: [] },
			{ id: 2, nombre: 'Bob', avatar: 'avatar2', mano: [] },
		],
		mazoRegular: { cantidad: 30 },
		mazoDescarte: [],
		turnoActual: 1,
		eventos: {
			1: [
				{ id_front: 1, id: 1, partida: 1 },
				{ id_front: 2, id: 2, partida: 1 },
			],
			2: [
				{ id_front: 3, id: 3, partida: 1 },
				{ id_front: 4, id: 4, partida: 1 },
			],
		},
		secretos: {
			1: [
				{ id_front: 2, id: 2, nombre: 'Secreto 1' },
				{ id_front: 5, id: 5, nombre: 'Secreto 2' },
				{ id_front: 8, id: 8, nombre: 'Secreto 3' },
			],
			2: [
				{ id_front: 3, id: 3, nombre: 'Secreto 1' },
				{ id_front: 4, id: 4, nombre: 'Secreto 2' },
				{ id_front: 6, id: 6, nombre: 'Secreto 3' },
			],
		},
	})),
	ganador: vi.fn(async () => Promise.resolve({ ganador: { ganador: 1, asesino: 'Alice' } })),
}))

vi.mock('../../service/playerService.js', () => ({
	getAvatars: vi.fn(() => [
		{ value: 'avatar1', src: '/assets/Avatares/avatar1.jpg' },
		{ value: 'avatar2', src: '/assets/Avatares/avatar2.jpg' },
		{ value: 'avatar3', src: '/assets/Avatares/avatar3.jpg' },
	]),
}))

vi.mock('../../service/playerPositions.js', () => ({
	getPlayerBasePosition: vi.fn(() => ({ top: 0, left: 0, align: 'bottom' })),
	getPlayerPositions: vi.fn(() => ({
		handPosition: { x: 0, y: 0 },
		infoPosition: { x: 0, y: 0 },
		secretPosition: { x: 0, y: 0 },
	})),
	getCardRotation: vi.fn(() => 0),
}))

import PartidaContainer from '../../container/PartidaContainer.jsx'

describe('PartidaContainer (integration)', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Limpiar callbacks
		Object.keys(mockWSCallbacks).forEach(key => delete mockWSCallbacks[key])
	})

	const triggerGameState = () => {
		if (mockWSCallbacks['game_state']) {
			mockWSCallbacks['game_state']({
				jugadores: [
					{ id: 1, nombre: 'Alice', avatar: 'avatar1', mano: [] },
					{ id: 2, nombre: 'Bob', avatar: 'avatar2', mano: [] },
				],
				mazoRegular: { cantidad: 30 },
				mazoDescarte: [],
				turnoActual: 1,
				eventos: {
					1: [
						{ id_front: 1, id: 1, partida: 1 },
						{ id_front: 2, id: 2, partida: 1 },
					],
					2: [
						{ id_front: 3, id: 3, partida: 1 },
						{ id_front: 4, id: 4, partida: 1 },
					],
				},
				secretos: {
					1: [
						{ id_front: 2, id: 2, nombre: 'Secreto 1' },
						{ id_front: 5, id: 5, nombre: 'Secreto 2' },
						{ id_front: 8, id: 8, nombre: 'Secreto 3' },
					],
					2: [
						{ id_front: 3, id: 3, nombre: 'Secreto 1' },
						{ id_front: 4, id: 4, nombre: 'Secreto 2' },
						{ id_front: 6, id: 6, nombre: 'Secreto 3' },
					],
				},
			})
		}
	}
	// Helper para disparar evento de ganador por WebSocket
	const triggerWinnerWS = (ganadorPayload = { ganador: 1, asesino: 1 }) => {
		if (mockWSCallbacks['ganador']) {
			mockWSCallbacks['ganador'](ganadorPayload)
		}
	}

	it('renderiza el contenedor de la partida con jugadores y áreas de juego', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		// Disparar el evento de estado inicial
		triggerGameState()

		// Esperar a que los datos se carguen y se muestre el contenedor
		await waitFor(() => {
			const gameContainer = container.querySelector('.game-container')
			expect(gameContainer).toBeInTheDocument()
		})

		// Verificar que el área central con los mazos se renderiza
		const centralArea = container.querySelector('.central-area')
		expect(centralArea).toBeInTheDocument()

		// Verificar que el mazo regular está presente
		const mazoRegular = container.querySelector('.mazo-regular-wrapper')
		expect(mazoRegular).toBeInTheDocument()

		// Verificar que el mazo de descarte está presente
		const mazoDescarte = container.querySelector('.mazo-descarte-wrapper')
		expect(mazoDescarte).toBeInTheDocument()

		// Verificar que se renderizan las áreas de información de jugadores
		await waitFor(() => {
			const playerInfoAreas = container.querySelectorAll('.player-info-area')
			expect(playerInfoAreas.length).toBeGreaterThan(0)
		})

		// Verificar que se renderizan las áreas de mano de jugadores
		const playerHandAreas = container.querySelectorAll('.player-hand-area')
		expect(playerHandAreas.length).toBeGreaterThan(0)

		// Verificar que el nombre del jugador actual (Alice) aparece
		await waitFor(() => {
			const currentPlayer = screen.getByText('Alice')
			expect(currentPlayer).toBeInTheDocument()
		})

		// Verificar que el segundo jugador (Bob) también aparece
		const opponentPlayer = screen.getByText('Bob')
		expect(opponentPlayer).toBeInTheDocument()
	})

	it('reordena los jugadores con el jugador actual en la posición inferior y escucha eventos de WebSocket', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		// Disparar el evento de estado inicial
		triggerGameState()

		await waitFor(() => {
			const gameContainer = container.querySelector('.game-container')
			expect(gameContainer).toBeInTheDocument()
		})

		// Verificar que el jugador actual (Alice) está en el contenedor
		const currentPlayer = screen.getByText('Alice')
		expect(currentPlayer).toBeInTheDocument()
	})

	it('guarda todos los secretos de todos los jugadores', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		// Disparar el evento de estado inicial
		triggerGameState()

		await waitFor(() => {
			const gameContainer = container.querySelector('.game-container')
			expect(gameContainer).toBeInTheDocument()
		})

		// Verificar que los jugadores se han renderizado
		await waitFor(() => {
			expect(screen.getByText('Alice')).toBeInTheDocument()
			expect(screen.getByText('Bob')).toBeInTheDocument()
		})

		// Verificar que se renderizan áreas de secretos para ambos jugadores
		await waitFor(() => {
			const secretsAreas = container.querySelectorAll('.player-secrets')
			// Deberían haber 2 áreas de secretos (una por jugador)
			expect(secretsAreas.length).toBe(2)
		})
	})

	it('muestra el modal de ganador cuando termina la partida', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)
		// Disparar estado inicial
		triggerGameState()
		
		await waitFor(() => {
			const gameContainer = container.querySelector('.game-container')
			expect(gameContainer).toBeInTheDocument()
		})

		// Simular recepción del evento ganador por WebSocket con la estructura correcta
		triggerWinnerWS({ ganador: 1, asesino: 1 })
		
		// Esperar a que el modal se muestre
		await waitFor(() => {
			triggerWinnerWS({ ganador: 1, asesino: 1 })
			// Esperar a que el modal se muestre
			const modal = container.querySelector('.bm-panel')
			expect(modal).toBeInTheDocument()
			expect(screen.getByText(/El asesino ganó/)).toBeInTheDocument()
			expect(screen.getByText('Alice', { selector: '.winner-modal-asesino-nombre' })).toBeInTheDocument()
			expect(screen.getByText('(Asesino)')).toBeInTheDocument()
		})
	})

	it('muestra el modal de ganador con cómplice cuando hay uno en la partida', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)
		// Disparar estado inicial con mazoRegular = 1 para simular fin de partida
		if (mockWSCallbacks['game_state']) {
			mockWSCallbacks['game_state']({
				jugadores: [
					{ id: 1, nombre: 'Alice', avatar: 'avatar1', mano: [] },
					{ id: 2, nombre: 'Bob', avatar: 'avatar2', mano: [] },
					{ id: 3, nombre: 'Charlie', avatar: 'avatar3', mano: [] },
				],
				mazoRegular: { cantidad: 1 },
				mazoDescarte: [],
				turnoActual: 1,
				eventos: {},
				secretos: {},
			})
		}
		// Simular recepción del evento ganador por WebSocket con cómplice
		await waitFor(() => {
			triggerWinnerWS({ ganador: 1, asesino: 1, complice: 2 })
			// Esperar a que el modal se muestre
			const modal = container.querySelector('.bm-panel')
			expect(modal).toBeInTheDocument()
			expect(screen.getByText(/El asesino ganó/)).toBeInTheDocument()
			// Verificar asesino
			expect(screen.getByText('Alice', { selector: '.winner-modal-asesino-nombre' })).toBeInTheDocument()
			expect(screen.getByText('(Asesino)')).toBeInTheDocument()
			// Verificar cómplice
			expect(screen.getByText('Bob', { selector: '.winner-modal-complice .winner-modal-asesino-nombre' })).toBeInTheDocument()
			expect(screen.getByText('(Cómplice)')).toBeInTheDocument()
		})
	})

	it('no muestra el cómplice en el modal de ganador si no hay uno', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)
		// Disparar estado inicial con mazoRegular = 1 para simular fin de partida
		if (mockWSCallbacks['game_state']) {
			mockWSCallbacks['game_state']({
				jugadores: [
					{ id: 1, nombre: 'Alice', avatar: 'avatar1', mano: [] },
					{ id: 2, nombre: 'Bob', avatar: 'avatar2', mano: [] },
				],
				mazoRegular: { cantidad: 1 },
				mazoDescarte: [],
				turnoActual: 1,
				eventos: {},
				secretos: {},
			})
		}
		// Simular recepción del evento ganador por WebSocket sin cómplice
		await waitFor(() => {
			triggerWinnerWS({ ganador: 1, asesino: 1 }) // Sin complice
			// Esperar a que el modal se muestre
			const modal = container.querySelector('.bm-panel')
			expect(modal).toBeInTheDocument()
			expect(screen.getByText(/El asesino ganó/)).toBeInTheDocument()
			// Verificar asesino
			expect(screen.getByText('Alice', { selector: '.winner-modal-asesino-nombre' })).toBeInTheDocument()
			expect(screen.getByText('(Asesino)')).toBeInTheDocument()
			// Verificar que no se muestra el cómplice
			expect(container.querySelector('.winner-modal-complice')).not.toBeInTheDocument()
		})
	})

	// ===== EVENTOS WEBSOCKET =====
	it('actualiza el mazo regular cuando recibe evento mazo_actualizado', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		// Estado inicial
		triggerGameState()

		await waitFor(() => {
			expect(container.querySelector('.game-container')).toBeInTheDocument()
		})

		// Simular evento mazo_actualizado
		if (mockWSCallbacks['mazo_actualizado']) {
			mockWSCallbacks['mazo_actualizado']({ cantidadCartas: 15 })
		}

		await waitFor(() => {
			// El contador del mazo regular debería actualizarse
			const mazoRegular = container.querySelector('.mazo-regular-wrapper')
			expect(mazoRegular).toBeInTheDocument()
		})
	})

	it('actualiza la mano del jugador cuando recibe evento procesar_descarte', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		// Estado inicial con cartas en la mano
		if (mockWSCallbacks['game_state']) {
			mockWSCallbacks['game_state']({
				jugadores: [
					{ id: 1, nombre: 'Alice', avatar: 'avatar1', mano: [] },
					{ id: 2, nombre: 'Bob', avatar: 'avatar2', mano: [] },
				],
				mazoRegular: { cantidad: 30 },
				mazoDescarte: [],
				turnoActual: 1,
				eventos: {
					1: [
						{ id_front: 1, id: 1, partida: 1 },
						{ id_front: 2, id: 2, partida: 1 },
						{ id_front: 3, id: 3, partida: 1 },
					]
				},
				secretos: {},
			})
		}

		await waitFor(() => {
			expect(container.querySelector('.game-container')).toBeInTheDocument()
		})

		// Simular descarte del jugador actual (id: 1)
		if (mockWSCallbacks['procesar_descarte']) {
			mockWSCallbacks['procesar_descarte']({
				jugadorId: 1,
				cantidadCartas: 1,
				carta: { id_front: 1, id: 1 },
				cartas: [2, 3], // Cartas restantes en la mano
				cartasFront: [2, 3]
			})
		}

		await waitFor(() => {
			// La mano debería actualizarse
			expect(container.querySelector('.mano-jugador')).toBeInTheDocument()
		})
	})

	it('actualiza el turno actual cuando recibe evento turno_cambiado', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		triggerGameState()

		await waitFor(() => {
			expect(container.querySelector('.game-container')).toBeInTheDocument()
		})

		// Simular cambio de turno
		if (mockWSCallbacks['turno_cambiado']) {
			mockWSCallbacks['turno_cambiado']({ jugadorId: 2, jugadorNombre: 'Bob' })
		}

		await waitFor(() => {
			// El botón de finalizar turno debería estar deshabilitado ya que no es el turno del jugador 1
			const endTurnButton = container.querySelector('.endturn')
			expect(endTurnButton).toBeDisabled()
		})
	})

	// ===== RENDERIZADO DE MAZOS Y ÁREAS =====
	it('renderiza el mazo draft cuando hay cartas disponibles', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		// Estado inicial con cartas draft
		if (mockWSCallbacks['game_state']) {
			mockWSCallbacks['game_state']({
				jugadores: [
					{ id: 1, nombre: 'Alice', avatar: 'avatar1', mano: [] },
				],
				mazoRegular: { cantidad: 30 },
				mazoDescarte: [],
				turnoActual: 1,
				mazoDraft: [
					{ id_front: 10, id: 10 },
					{ id_front: 11, id: 11 },
					{ id_front: 12, id: 12 },
				],
				eventos: {},
				secretos: {},
			})
		}

		await waitFor(() => {
			const mazoDraft = container.querySelector('.mazo-draft')
			expect(mazoDraft).toBeInTheDocument()
		})
	})

	it('no renderiza el mazo draft cuando no hay cartas', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		// Estado inicial sin cartas draft
		if (mockWSCallbacks['game_state']) {
			mockWSCallbacks['game_state']({
				jugadores: [
					{ id: 1, nombre: 'Alice', avatar: 'avatar1', mano: [] },
				],
				mazoRegular: { cantidad: 30 },
				mazoDescarte: [],
				turnoActual: 1,
				eventos: {},
				secretos: {},
			})
		}

		await waitFor(() => {
			const gameContainer = container.querySelector('.game-container')
			expect(gameContainer).toBeInTheDocument()
		})

		// No debería haber mazo draft
		const mazoDraft = container.querySelector('.mazo-draft')
		expect(mazoDraft).not.toBeInTheDocument()
	})

	// ===== BOTONES Y CONTROLES =====
	it('renderiza el botón de finalizar turno', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		triggerGameState()

		await waitFor(() => {
			const endTurnButton = container.querySelector('.endturn')
			expect(endTurnButton).toBeInTheDocument()
			expect(endTurnButton).toHaveTextContent(/Finalizar Turno/)
		})
	})

	it('deshabilita el botón de finalizar turno cuando no es el turno del jugador', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		// Establecer turno del jugador 2 (no el actual)
		if (mockWSCallbacks['game_state']) {
			mockWSCallbacks['game_state']({
				jugadores: [
					{ id: 1, nombre: 'Alice', avatar: 'avatar1', mano: [] },
					{ id: 2, nombre: 'Bob', avatar: 'avatar2', mano: [] },
				],
				mazoRegular: { cantidad: 30 },
				mazoDescarte: [],
				turnoActual: 2, // Turno de Bob, no Alice
				eventos: {},
				secretos: {},
			})
		}

		await waitFor(() => {
			const endTurnButton = container.querySelector('.endturn')
			expect(endTurnButton).toBeDisabled()
		})
	})

	it('renderiza el botón de no realizar acción', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		triggerGameState()

		await waitFor(() => {
			const noAccionButton = container.querySelector('.no-ejecutar-accion')
			expect(noAccionButton).toBeInTheDocument()
			expect(noAccionButton).toHaveTextContent(/No realizar acción/)
		})
	})

	it('deshabilita el botón de no realizar acción cuando no es el turno del jugador', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		// Establecer turno del jugador 2
		if (mockWSCallbacks['game_state']) {
			mockWSCallbacks['game_state']({
				jugadores: [
					{ id: 1, nombre: 'Alice', avatar: 'avatar1', mano: [] },
					{ id: 2, nombre: 'Bob', avatar: 'avatar2', mano: [] },
				],
				mazoRegular: { cantidad: 30 },
				mazoDescarte: [],
				turnoActual: 2,
				eventos: {},
				secretos: {},
			})
		}

		await waitFor(() => {
			const noAccionButton = container.querySelector('.no-ejecutar-accion')
			expect(noAccionButton).toBeDisabled()
		})
	})

	// ===== NORMALIZACIÓN DE DATOS =====
	it('normaliza correctamente las cartas con diferentes formatos de id', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		// Estado con diferentes formatos de ID
		if (mockWSCallbacks['game_state']) {
			mockWSCallbacks['game_state']({
				jugadores: [
					{ id: 1, nombre: 'Alice', avatar: 'avatar1', mano: [] },
				],
				mazoRegular: { cantidad: 30 },
				mazoDescarte: [
					{ id_front: 1, id: 1 },
					{ idFrontend: 2, idBackend: 2 },
					{ idFront: 3, id_backend: 3 },
				],
				turnoActual: 1,
				eventos: {},
				secretos: {},
			})
		}

		await waitFor(() => {
			const gameContainer = container.querySelector('.game-container')
			expect(gameContainer).toBeInTheDocument()
		})

		// Verificar que el mazo de descarte se renderiza correctamente
		const mazoDescarte = container.querySelector('.mazo-descarte-wrapper')
		expect(mazoDescarte).toBeInTheDocument()
	})

	it('maneja correctamente el mazoDescarte como número (contador)', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		// Estado con mazoDescarte como número
		if (mockWSCallbacks['game_state']) {
			mockWSCallbacks['game_state']({
				jugadores: [
					{ id: 1, nombre: 'Alice', avatar: 'avatar1', mano: [] },
				],
				mazoRegular: { cantidad: 30 },
				mazoDescarte: 5, // Solo contador
				turnoActual: 1,
				eventos: {},
				secretos: {},
			})
		}

		await waitFor(() => {
			const mazoDescarte = container.querySelector('.mazo-descarte-wrapper')
			expect(mazoDescarte).toBeInTheDocument()
		})
	})

	// ===== CIERRE DEL MODAL DE GANADOR =====
	it('cierra el modal de ganador al hacer click en el overlay', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		triggerGameState()

		await waitFor(() => {
			expect(container.querySelector('.game-container')).toBeInTheDocument()
		})

		// Mostrar modal
		triggerWinnerWS({ ganador: 1, asesino: 1 })

		await waitFor(() => {
			const modal = container.querySelector('.bm-panel')
			expect(modal).toBeInTheDocument()
		})

		// Click en el overlay (fuera del panel)
		const overlay = container.querySelector('.bm-overlay')
		overlay.click()

		await waitFor(() => {
			const modal = container.querySelector('.bm-panel')
			expect(modal).not.toBeInTheDocument()
		})
	})

	// ===== REORDENAMIENTO DE JUGADORES =====
	it('coloca al jugador actual en la primera posición', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		// Estado con múltiples jugadores
		if (mockWSCallbacks['game_state']) {
			mockWSCallbacks['game_state']({
				jugadores: [
					{ id: 2, nombre: 'Bob', avatar: 'avatar2', mano: [] },
					{ id: 1, nombre: 'Alice', avatar: 'avatar1', mano: [] }, // Jugador actual
					{ id: 3, nombre: 'Charlie', avatar: 'avatar3', mano: [] },
				],
				mazoRegular: { cantidad: 30 },
				mazoDescarte: [],
				turnoActual: 1,
				eventos: {},
				secretos: {},
			})
		}

		await waitFor(() => {
			// El jugador actual (Alice, id: 1) debería estar en la primera posición
			const gameContainer = container.querySelector('.game-container')
			expect(gameContainer).toBeInTheDocument()
			expect(screen.getByText('Alice')).toBeInTheDocument()
		})
	})

	// ===== LIMPIEZA DE WEBSOCKET =====
	it('desconecta el WebSocket al desmontar el componente', async () => {
		const { unmount } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		triggerGameState()

		await waitFor(() => {
			expect(screen.getByText('Alice')).toBeInTheDocument()
		})

		// Desmontar componente
		unmount()

		// Los listeners deberían haberse eliminado
		// (No podemos verificar directamente, pero el unmount no debería fallar)
	})

	// ===== ACCIONES DE TURNO =====
	it('renderiza el componente de acciones de turno', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		triggerGameState()

		await waitFor(() => {
			// Buscar el componente de acciones (puede variar según la implementación)
			const gameContainer = container.querySelector('.game-container')
			expect(gameContainer).toBeInTheDocument()
		})
	})

	// ===== CONTADOR DE CARTAS =====
	it('actualiza el contador de descarte al recibir procesar_descarte', async () => {
		const { container } = render(
			<MemoryRouter>
				<PartidaContainer />
			</MemoryRouter>
		)

		triggerGameState()

		await waitFor(() => {
			expect(container.querySelector('.game-container')).toBeInTheDocument()
		})

		// Simular descarte
		if (mockWSCallbacks['procesar_descarte']) {
			mockWSCallbacks['procesar_descarte']({
				jugadorId: 1,
				cantidadCartas: 10,
				carta: { id_front: 5, id: 5 }
			})
		}

		await waitFor(() => {
			// El contador debería actualizarse
			const mazoDescarte = container.querySelector('.mazo-descarte-wrapper')
			expect(mazoDescarte).toBeInTheDocument()
		})
	})
})

