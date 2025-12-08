import MazoRegular from "./MazoRegular"
import MazoDescarte from "./MazoDescarte"
import MazoEvento from "./MazoEvento"

export default function CentralArea({ 
    cantidadCartasMazo, 
    cartasDescarte, 
    cantidadCartasDescarte,
    onRobarCarta, 
    estaActivo,
    cartaEventoSeleccionada,
    cartasSeleccionadas = [],
    onJugarEvento
}) {
    // Verificar si hay cartas de evento seleccionadas (idFrontend >= 10 y < 19)
    const hayEventosSeleccionados = cartasSeleccionadas.some(c => c.idFrontend >= 10 && c.idFrontend < 19)
    
    return (
        <div className="central-area">
            <div className="decks-container">
                <MazoRegular 
                    cantidadCartas={cantidadCartasMazo}
                    onRobarCarta={onRobarCarta}
                    estaActivo={estaActivo}
                />
                <MazoDescarte 
                    cartasDescarte={cartasDescarte}
                    cantidadCartasDescarte={cantidadCartasDescarte}
                />
                <MazoEvento
                    cartaEvento={cartaEventoSeleccionada}
                    onClick={onJugarEvento}
                    disabled={!hayEventosSeleccionados && !cartaEventoSeleccionada}
                />
            </div>
        </div>
    )
}
