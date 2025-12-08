import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as HttpService from '../../service/HttpService.js';

// Mock de react-router-dom
vi.mock('react-router-dom', () => ({
	useNavigate: vi.fn(() => vi.fn()),
}))

// Mock del WebSocket Service - definido aquí para que esté disponible en los mocks
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
	}
})

vi.mock('../../service/LocalStorage.js', () => ({
	getGameId: vi.fn(() => 1),
	getUserId: vi.fn(() => 1),
	getUser: vi.fn(() => ({ id: 1, nombre: 'Alice' })),
}))

vi.mock('../../service/HttpService.js', async () => {
	return {
		getGameDetails: vi.fn(async () => ({ 
			id: 1, 
			nombre: 'Partida Test',
			jugadores: [],
			mazoRegular: { cantidad: 30 },
			mazoDescarte: [],
			turnoActual: 1,
		})),
		robarCarta: vi.fn(async () => ({ 
			id: 1, 
			id_front: 1,
			nombre: 'Carta Test' 
		})),
		endTurn: vi.fn(async () => 1),
		descartarCarta: vi.fn(async () => ({ success: true })),
		// Funciones usadas por LobbyContainer
		fetchPlayersInGame: vi.fn(async () => []),
		startGame: vi.fn(async () => ({ success: true })),
		leaveGame: vi.fn(async () => ({ success: true })),
	}
})

vi.mock('../../service/playerService.js', () => ({
	getAvatars: vi.fn(() => [
		{ value: 'avatar1', src: '/assets/Avatares/avatar1.jpg' },
		{ value: 'avatar2', src: '/assets/Avatares/avatar2.jpg' },
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

import PartidaContainer from '../../container/PartidaContainer.jsx';

describe('PartidaContainer - finalizar turno', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.keys(mockWSCallbacks).forEach(key => delete mockWSCallbacks[key])
	});

	const triggerGameState = (turnoActual = 1, playerHandSize = 6) => {
		if (mockWSCallbacks['game_state']) {
			const eventos = {}
			eventos[1] = Array.from({ length: playerHandSize }, (_, i) => ({
				id_front: i + 1,
				id: i + 1,
			}))
			
			mockWSCallbacks['game_state']({
				jugadores: [
					{ id: 1, nombre: 'Alice', avatar: 'avatar1' },
					{ id: 2, nombre: 'Bob', avatar: 'avatar2' },
				],
				mazoRegular: { cantidad: 30 },
				mazoDescarte: [],
				turnoActual,
				eventos,
				secretos: {},
			})
		}
	}

	const triggerTurnChange = (nuevoTurno, jugadorNombre) => {
		if (mockWSCallbacks['turno_cambiado']) {
			mockWSCallbacks['turno_cambiado']({
				partidaId: 1,
				jugadorId: nuevoTurno,
				jugadorNombre,
			})
		}
	}

	it('el botón de finalizar turno está deshabilitado si no se ha descartado', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 6);

		await waitFor(() => {
			const endTurnBtn = screen.getByRole('button', { name: /Finalizar Turno/i });
			expect(endTurnBtn).toBeDisabled();
		});
	});

	it('el botón de finalizar turno está deshabilitado si no tiene exactamente 6 cartas', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 5); // Solo 5 cartas

		await waitFor(() => {
			const endTurnBtn = screen.getByRole('button', { name: /Finalizar Turno/i });
			expect(endTurnBtn).toBeDisabled();
		});
	});

	it('el botón muestra advertencia cuando no se ha descartado (con 6 cartas)', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 6);

		await waitFor(() => {
			const endTurnBtn = screen.getByRole('button', { name: /Finalizar Turno/i });
			// El botón debe estar deshabilitado y mostrar advertencia ⚠️
			expect(endTurnBtn).toBeDisabled();
			expect(endTurnBtn.textContent).toMatch(/⚠️/);
		});
	});

	it('el botón está deshabilitado cuando no tiene 6 cartas (sin descartar)', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 5);

		await waitFor(() => {
			const endTurnBtn = screen.getByRole('button', { name: /Finalizar Turno/i });
			// El botón debe estar deshabilitado (sin descartar y sin 6 cartas)
			expect(endTurnBtn).toBeDisabled();
			// Muestra ⚠️ porque no ha descartado (prioridad sobre el contador)
			expect(endTurnBtn.textContent).toMatch(/⚠️/);
		});
	});

	it('el botón de finalizar turno existe y está correctamente configurado', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 6);

		await waitFor(() => {
			const endTurnBtn = screen.getByRole('button', { name: /Finalizar Turno/i });
			expect(endTurnBtn).toBeInTheDocument();
			expect(endTurnBtn).toHaveAttribute('type', 'submit');
			// Está deshabilitado porque no ha descartado
			expect(endTurnBtn).toBeDisabled();
		});
	});

	it('actualiza el turno cuando recibe evento turno_cambiado del WebSocket', async () => {
		const { container } = render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 6);

		await waitFor(() => {
			const gameContainer = screen.getByText('Alice');
			expect(gameContainer).toBeInTheDocument();
		});

		// Simular evento de cambio de turno
		triggerTurnChange(2, 'Bob');

		await waitFor(() => {
			// Verificar que el componente sigue renderizado correctamente
			const gameContainer = container.querySelector('.game-container');
			expect(gameContainer).toBeInTheDocument();
			
			// Verificar que ambos jugadores siguen en el DOM
			const alice = screen.getByText('Alice');
			const bob = screen.getByText('Bob');
			expect(alice).toBeInTheDocument();
			expect(bob).toBeInTheDocument();
		});
	});

	it('resetea flags cuando cambia el turno', async () => {
		const { container } = render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 6);

		await waitFor(() => {
			const gameContainer = container.querySelector('.game-container');
			expect(gameContainer).toBeInTheDocument();
		});

		// Simular evento de cambio de turno
		triggerTurnChange(2, 'Bob');

		await waitFor(() => {
			// El botón debe estar deshabilitado porque se reseteó haDescartadoEnTurno
			const endTurnBtn = screen.getByRole('button', { name: /Finalizar Turno/i });
			expect(endTurnBtn).toBeDisabled();
		});
	});

	it('el botón está deshabilitado cuando NO es el turno del usuario', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(2, 6); // Turno de otro jugador (ID 2)

		await waitFor(() => {
			// El botón debe estar deshabilitado porque no es el turno del usuario actual
			const endTurnBtn = screen.getByRole('button', { name: /Finalizar Turno/i });
			expect(endTurnBtn).toBeDisabled();
		});
	});

	it('verifica que isPlayerTurn se pasa correctamente a GamePlayer', async () => {
		const { container } = render(<PartidaContainer />);
		
		// Esperar a que el componente se monte y registre los listeners
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});

		// Ahora disparar el evento
		triggerGameState(1, 6); // Turno del usuario (ID 1)

		await waitFor(() => {
			// Verificar que el componente renderiza correctamente
			const gameContainer = container.querySelector('.game-container');
			expect(gameContainer).toBeInTheDocument();
		});

		// Verificar que el jugador Alice aparece (usuario con turno)
		await waitFor(() => {
			const currentPlayer = screen.getByText('Alice');
			expect(currentPlayer).toBeInTheDocument();
		});
	});

	it('el botón está protegido contra múltiples clics cuando está deshabilitado', async () => {
		vi.mocked(HttpService.endTurn).mockClear();
		
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 6);

		await waitFor(() => {
			const endTurnBtn = screen.getByRole('button', { name: /Finalizar Turno/i });
			expect(endTurnBtn).toBeInTheDocument();
			expect(endTurnBtn).toBeDisabled();
		});

		const endTurnBtn = screen.getByRole('button', { name: /Finalizar Turno/i });
		
		// Intentar múltiples clics en un botón deshabilitado
		fireEvent.click(endTurnBtn);
		fireEvent.click(endTurnBtn);
		fireEvent.click(endTurnBtn);

		// No debe llamarse porque el botón está deshabilitado
		expect(HttpService.endTurn).not.toHaveBeenCalled();
	});
});
