import Card from './Card'
import '../styles/ModalAgregarDetective.css'

export default function ModalAgregarDetective({
    isOpen,
    onClose,
    onConfirm,
    cartasDisponibles = [],
    setInfo = null
}) {
    if (!isOpen) return null

    const handleConfirm = (carta) => {
        onConfirm(carta)
        onClose()
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content modal-agregar-detective"
                onClick={(e) => e.stopPropagation()}
            >
                <h2>Agregar Detective al Set #{setInfo?.index + 1 || '?'}</h2>
                
                {cartasDisponibles.length === 0 ? (
                    <div className="no-cartas-disponibles">
                        <p>No tienes cartas válidas para agregar a este set.</p>
                        <p className="hint">
                            Solo puedes agregar detectives del mismo tipo o comodines (Harley Quin, Ariadne Oliver).
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="instrucciones">
                            Selecciona una carta para agregar al set:
                        </p>
                        <div className="cartas-disponibles">
                            {cartasDisponibles.map((carta) => (
                                <div
                                    key={carta.idBackend}
                                    className="carta-disponible"
                                    onClick={() => handleConfirm(carta)}
                                >
                                    <Card
                                        id={carta.idFrontend}
                                        flipped={true}
                                        puedeVoltearse={false}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}
                
                <div className="modal-footer">
                    <button onClick={onClose} className="btn-cancelar">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
}
