/**
 * Hook personalizado para calcular las posiciones de los jugadores en el tablero
 * según la cantidad total de jugadores
 */

// Configuraciones de layout para diferentes cantidades de jugadores
const PLAYER_LAYOUTS = {
    2: [
        { x: 0, y: 450, align: 'bottom' },      // Tú - Abajo
        { x: 0, y: -280, align: 'top' },        // Oponente - Arriba
    ],
    3: [
        { x: 0, y: 450, align: 'bottom' },      // Tú - Abajo
        { x: 830, y: -100, align: 'right' },    // J1 - Derecha
        { x: -830, y: -100, align: 'left' },    // J2 - Izquierda
    ],
    4: [
        { x: 0, y: 450, align: 'bottom' },      // Tú - Abajo
        { x: 830, y: 50, align: 'right' },      // J1 - Derecha
        { x: 0, y: -280, align: 'top' },        // J2 - Arriba
        { x: -830, y: 50, align: 'left' },      // J3 - Izquierda
    ],
    5: [
        { x: 0, y: 450, align: 'bottom' },      // Tú - Abajo
        { x: 830, y: 200, align: 'right' },     // J1 - Derecha abajo
        { x: 830, y: -150, align: 'right' },    // J2 - Derecha arriba
        { x: -830, y: -150, align: 'left' },    // J3 - Izquierda arriba
        { x: -830, y: 200, align: 'left' },     // J4 - Izquierda abajo
    ],
    6: [
        { x: 0, y: 450, align: 'bottom' },      // Tú - Abajo centro
        { x: 830, y: 140, align: 'right' },     // J1 - Derecha abajo (Fernanda) - más arriba
        { x: 830, y: -250, align: 'right' },    // J2 - Derecha arriba (Carlos) - más arriba
        { x: 0, y: -300, align: 'top' },        // J3 - Arriba centro (Diana)
        { x: -830, y: -250, align: 'left' },    // J4 - Izquierda arriba (Eduardo) - más arriba
        { x: -830, y: 140, align: 'left' },     // J5 - Izquierda abajo (Ana) - más arriba
    ]
}

// Mapa de rotaciones según la alineación del jugador
const ROTATION_MAP = {
    'bottom': 0,
    'top': 180,
    'right': 270,
    'left': 90
}

/**
 * Calcula la posición base de un jugador
 */
export function getPlayerBasePosition(index, totalPlayers) {
    const layout = PLAYER_LAYOUTS[totalPlayers] || PLAYER_LAYOUTS[6]
    return layout[index] || { x: 0, y: 0, align: 'center' }
}

/**
 * Calcula las posiciones ajustadas para la mano, la info y los secretos del jugador
 */
export function getPlayerPositions(basePosition) {
    const handOffset = 40  // Las manos están más cerca del centro
    const infoOffset = 100 // Avatar+nombre están más lejos del centro
    
    let handPosition = { x: basePosition.x, y: basePosition.y }
    let infoPosition = { x: basePosition.x, y: basePosition.y }
    let secretPosition = { x: basePosition.x, y: basePosition.y }
    let setsPosition = { x: basePosition.x, y: basePosition.y }
    
    // Ajustar posiciones según la alineación
    switch (basePosition.align) {
        case 'bottom':
            handPosition.y -= handOffset
            infoPosition.x -= 210  // Avatar a la IZQUIERDA de la mano (más cerca)
            infoPosition.y -= handOffset  // Misma altura que la mano
            secretPosition.x -= 440  // Secretos más cerca del avatar
            secretPosition.y -= handOffset
            setsPosition.x += 450  // Sets a la DERECHA de la mano (espaciado igual que secretos)
            setsPosition.y -= handOffset
            break
        case 'top':
            handPosition.y += handOffset
            infoPosition.y -= infoOffset
            secretPosition.x -= 320  // Secretos a la IZQUIERDA de la mano (más alejados)
            secretPosition.y += handOffset - 60  // Más cerca del borde superior
            setsPosition.x += 320  // Sets a la DERECHA de la mano
            setsPosition.y += handOffset - 60
            break
        case 'right':
            handPosition.x -= handOffset
            infoPosition.x += infoOffset
            secretPosition.x -= handOffset + 80  // Más cerca de la mano y hacia la izquierda
            secretPosition.y -= 100  // Desplazamiento hacia arriba (izquierda en su rotación)
            setsPosition.x -= handOffset + 80  // Sets en el lado opuesto a secretos
            setsPosition.y += 100  // Desplazamiento hacia abajo (derecha en su rotación)
            break
        case 'left':
            handPosition.x += handOffset
            infoPosition.x -= infoOffset
            secretPosition.x += handOffset + 80  // Más cerca de la mano
            secretPosition.y -= 100  // Desplazamiento hacia arriba (izquierda en su rotación)
            setsPosition.x += handOffset + 80  // Sets en el lado opuesto a secretos
            setsPosition.y += 100  // Desplazamiento hacia abajo (derecha en su rotación)
            break
        default:
            // Para casos no manejados (como 'center'), usar posiciones por defecto
            setsPosition.x += 320  // Sets a la derecha de la posición base
            break
    }
    
    return { handPosition, infoPosition, secretPosition, setsPosition }
}

/**
 * Obtiene la rotación de las cartas según la posición del jugador
 */
export function getCardRotation(alignment) {
    return ROTATION_MAP[alignment] || 0
}
