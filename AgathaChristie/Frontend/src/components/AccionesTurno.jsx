import '../styles/AccionesTurno.css'

export default function AccionesTurno({
    esMiTurno,
    faseActual,
    cargando,
    onTerminarTurno,
    onDescartar,
    cartasSeleccionadas = [],
    onBajarSet
}) {
    
    // Si no es mi turno, mostrar mensaje de espera
    if (!esMiTurno) {
        return (
            <div className="acciones-turno">
                <p className="mensaje-espera">No es tu turno</p>
            </div>
        )
    }

    return (
        <div className="acciones-turno">
            {/* FASE 1: DESCARTAR - Seleccionar y descartar cartas */}
            {faseActual === 'DESCARTAR' && (
                <div className="fase-descartar">
                    <button 
                        className="btn-accion btn-descartar"
                        onClick={onDescartar}
                        disabled={cargando || cartasSeleccionadas.length === 0}
                    >
                        {cargando ? 'Descartando...' : `🗑️ Descartar ${cartasSeleccionadas.length > 0 ? `(${cartasSeleccionadas.length})` : ''}`}
                    </button>
                    {/* Bajar set: visible durante el turno (puede estar deshabilitado si no aplica) */}
                    {typeof onBajarSet === 'function' && (
                        <button
                            className="btn-accion btn-bajar-set"
                            onClick={onBajarSet}
                            style={{ marginLeft: 8 }}
                        >
                            🃏 Bajar Set
                        </button>
                    )}
                </div>
            )}

            {/* FASE 2: FINALIZAR - Después de descartar y reponer, terminar turno */}
            {faseActual === 'FINALIZAR' && (
                <div className="fase-finalizar">
                    <p className="instruccion-fase">
                         Cartas repuestas. Ya podés terminar tu turno
                    </p>
                    <button 
                        className="btn-accion btn-terminar-turno"
                        onClick={onTerminarTurno}
                        disabled={cargando}
                    >
                        {cargando ? 'Terminando...' : 'Terminar Turno'}
                    </button>
                </div>
            )}
        </div>
    )
}
