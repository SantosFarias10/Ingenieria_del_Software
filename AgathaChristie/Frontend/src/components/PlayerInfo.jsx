export default function PlayerInfo({ player, isCurrentPlayer, isPlayerTurn, avatarSrc, position, canBeSelected = false }) {
    const { x, y } = position
    const desgraciado = player?.desgraciado || false

    return (
        <div
            className="player-info-area"
            style={{
                left: "50%",
                top: "49%",
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
        >
            <div className={`player-info ${isPlayerTurn ? 'active' : ''} ${canBeSelected ? 'selectable' : ''} ${desgraciado ? 'desgraciado' : ''}`}>
                <div className="player-avatar">
                    <img src={avatarSrc} alt={player.nombre || 'Jugador'} />
                    {desgraciado && (
                        <div className="desgracia-badge">⚠️</div>
                    )}
                </div>
                <div className="player-name">
                    <span>{player.nombre || 'Jugador'}</span>
                    {isPlayerTurn && (
                        <span className="active-indicator">
                            {isCurrentPlayer ? 'Tu turno' : 'Su turno'}
                        </span>
                    )}
                    {desgraciado && (
                        <span className="desgracia-indicator">
                            En Desgracia Social
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
