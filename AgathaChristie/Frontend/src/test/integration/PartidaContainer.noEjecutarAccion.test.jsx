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
			id: 100, 
			id_front: 100,
			nombre: 'Carta Robada' 
		})),
		endTurn: vi.fn(async () => 1),
		descartarCarta: vi.fn(async () => ({ success: true })),
		// Funciones usadas por LobbyContainer
		fetchPlayersInGame: vi.fn(async () => []),
		startGame: vi.fn(async () => ({ success: true })),
		leaveGame: vi.fn(async () => ({ success: true })),
		ganador: vi.fn(async () => ({ success: true })),
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

describe('PartidaContainer - botón No realizar acción', () => {
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

	it('el botón "No realizar acción" existe y está correctamente configurado', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 6);

		await waitFor(() => {
			const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
			expect(noEjecutarBtn).toBeInTheDocument();
			expect(noEjecutarBtn).toHaveAttribute('type', 'button');
		});
	});

	it('el botón está habilitado cuando es el turno del jugador y no ha descartado', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 6); // Turno del jugador 1 (Alice)

		await waitFor(() => {
			const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
			expect(noEjecutarBtn).not.toBeDisabled();
		});
	});

	it('el botón está deshabilitado cuando NO es el turno del jugador', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(2, 6); // Turno del jugador 2 (Bob), no de Alice

		await waitFor(() => {
			const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
			expect(noEjecutarBtn).toBeDisabled();
		});
	});

	it('el botón está deshabilitado cuando ya se descartó en este turno', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 6);

		// Esperar a que el botón esté disponible
		await waitFor(() => {
			const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
			expect(noEjecutarBtn).not.toBeDisabled();
		});

		// Simular que se descartó
		const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
		fireEvent.click(noEjecutarBtn);

		// El botón debe deshabilitarse después de usarlo
		await waitFor(() => {
			expect(noEjecutarBtn).toBeDisabled();
		});
	});

	it('el botón está deshabilitado cuando el jugador no tiene cartas', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 0); // Sin cartas

		await waitFor(() => {
			const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
			expect(noEjecutarBtn).toBeDisabled();
		});
	});

	it('llama a descartarCarta y robarCarta cuando se hace click', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 6);

		await waitFor(() => {
			const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
			expect(noEjecutarBtn).not.toBeDisabled();
		});

		const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
		fireEvent.click(noEjecutarBtn);

		await waitFor(() => {
			// Debe haber llamado a descartarCarta
			expect(HttpService.descartarCarta).toHaveBeenCalledTimes(1);
			// Debe haber llamado a robarCarta
			expect(HttpService.robarCarta).toHaveBeenCalledTimes(1);
		});
	});

	it('descarta la primera carta de la mano y roba una nueva', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 6);

		await waitFor(() => {
			const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
			expect(noEjecutarBtn).not.toBeDisabled();
		});

		const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
		fireEvent.click(noEjecutarBtn);

		await waitFor(() => {
			// Debe haber llamado a descartarCarta con el id de la primera carta
			expect(HttpService.descartarCarta).toHaveBeenCalledWith(1, 1);
			// Debe haber llamado a robarCarta con el userId y gameId
			expect(HttpService.robarCarta).toHaveBeenCalledWith(1, 1);
		});
	});

	it('se habilita nuevamente cuando cambia el turno', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 6);

		// Verificar que está habilitado
		await waitFor(() => {
			const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
			expect(noEjecutarBtn).not.toBeDisabled();
		});

		// Usar el botón
		const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
		fireEvent.click(noEjecutarBtn);

		// Debe deshabilitarse
		await waitFor(() => {
			expect(noEjecutarBtn).toBeDisabled();
		});

		// Simular cambio de turno a otro jugador y luego de vuelta
		triggerTurnChange(2, 'Bob');
		
		await waitFor(() => {
			expect(noEjecutarBtn).toBeDisabled(); // Sigue deshabilitado (no es su turno)
		});

		// Volver al turno del jugador 1
		triggerTurnChange(1, 'Alice');

		// Debe habilitarse nuevamente
		await waitFor(() => {
			expect(noEjecutarBtn).not.toBeDisabled();
		});
	});

	it('mantiene 6 cartas después de descartar y robar', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 6);

		await waitFor(() => {
			const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
			expect(noEjecutarBtn).not.toBeDisabled();
		});

		const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
		fireEvent.click(noEjecutarBtn);

		await waitFor(() => {
			// Verificar que se llamaron ambas funciones
			expect(HttpService.descartarCarta).toHaveBeenCalled();
			expect(HttpService.robarCarta).toHaveBeenCalled();
			
			// El botón de finalizar turno debería estar habilitado después
			// (porque ya descartó y tiene 6 cartas)
			const endTurnBtn = screen.getByRole('button', { name: /Finalizar Turno/i });
			expect(endTurnBtn).not.toBeDisabled();
		});
	});

	it('muestra el tooltip correcto cuando no es tu turno', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(2, 6); // Turno de Bob

		await waitFor(() => {
			const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
			expect(noEjecutarBtn).toHaveAttribute('title', 'No es tu turno');
		});
	});

	it('muestra el tooltip correcto cuando ya descartaste', async () => {
		render(<PartidaContainer />);
		
		await waitFor(() => {
			expect(mockWSCallbacks['game_state']).toBeDefined();
		});
		
		triggerGameState(1, 6);

		await waitFor(() => {
			const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
			expect(noEjecutarBtn).not.toBeDisabled();
		});

		const noEjecutarBtn = screen.getByRole('button', { name: /No realizar acción/i });
		fireEvent.click(noEjecutarBtn);

		await waitFor(() => {
			expect(noEjecutarBtn).toHaveAttribute('title', 'Ya descartaste en este turno');
		});
	});
});
