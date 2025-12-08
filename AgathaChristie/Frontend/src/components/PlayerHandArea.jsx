import ManoJugador from "./ManoJugador"

export default function PlayerHandArea({ 
    position, 
    rotation, 
    playerCards, 
    onSelectCard, 
    cartasSeleccionadas = [],
    esperandoUsarNSF = false,
    onUsarNSF = null,
    esperandoPasarCartaDCF = false,
    esperandoCardTrade = false
}) {
    const { x, y } = position

    return (
        <div
            className="player-hand-area"
            style={{
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
        >
            {/* Indicador visual para Card Trade */}
            {esperandoCardTrade && (
                <div 
                    style={{
                        position: 'absolute',
                        top: '-40px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(255, 193, 7, 0.95)',
                        color: '#000',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                        whiteSpace: 'nowrap',
                        animation: 'pulse 2s ease-in-out infinite'
                    }}
                >
                    💱 Selecciona una carta para intercambiar
                </div>
            )}
            <div 
                className="hand-fan"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                <ManoJugador 
                    playerCards={playerCards}
                    onSelectCard={onSelectCard}
                    cartasSeleccionadas={cartasSeleccionadas}
                    esperandoUsarNSF={esperandoUsarNSF}
                    onUsarNSF={onUsarNSF}
                    esperandoPasarCartaDCF={esperandoPasarCartaDCF}
                    esperandoCardTrade={esperandoCardTrade}
                />
            </div>
        </div>
    )
}
