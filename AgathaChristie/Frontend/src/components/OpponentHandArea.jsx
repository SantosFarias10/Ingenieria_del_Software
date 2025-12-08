import '../styles/Card.css'

export default function OpponentHandArea({ position, rotation, cardCount = 6 }) {
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
            <div 
                className="hand-fan opponent-hand"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                <div className="opponent-cards">
                    {Array.from({ length: cardCount }).map((_, i) => (
                        <div key={i} className="opponent-card" style={{ '--card-index': i }}>
                            <div className="carta">
                                <img 
                                    className="imagen-carta"
                                    src="/cartas/01-card_back.png"
                                    alt="Carta del oponente"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
