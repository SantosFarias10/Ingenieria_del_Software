
import { useState } from 'react'
import AccionesTurno from '../components/AccionesTurno'

export default function AccionesTurnoContainer({
    esMiTurno,           // Booleano: ¿Es el turno del jugador?
    faseActual,          // String: Fase actual del turno ('DESCARTAR', 'FINALIZAR')
    onFaseChange,        // Función: Callback para cambiar la fase desde el padre
    onTerminarTurno,     // Función: Terminar el turno actual
    onDescartar,         // Función: Descartar cartas seleccionadas (también repone automáticamente)
    onBajarSet,
    cartasSeleccionadas = [] // Array: Cartas seleccionadas para descartar
}) {
    
    // Estado para controlar loading durante acciones
    const [cargando, setCargando] = useState(false)

    // === HANDLERS DE ACCIONES ===
    
    const handleDescartar = async () => {
        if (faseActual !== 'DESCARTAR' || cargando) return
        if (cartasSeleccionadas.length === 0) return
        
        setCargando(true)
        try {
            // Esto descartará y repondrá automáticamente hasta 6 cartas
            await onDescartar()
            // La fase se cambia a FINALIZAR en el handler padre
        } catch (error) {
            console.error('Error al descartar:', error)
            alert('No se pudo descartar las cartas.')
        } finally {
            setCargando(false)
        }
    }

    const handleTerminarTurno = async () => {
        if (faseActual !== 'FINALIZAR' || cargando) return
        
        setCargando(true)
        try {
            await onTerminarTurno()
            // La fase se resetea a DESCARTAR en el handler padre
        } catch (error) {
            console.error('Error al terminar turno:', error)
            alert('No se pudo terminar el turno.')
        } finally {
            setCargando(false)
        }
    }

    // Delegar el renderizado al componente presentacional
    return (
        <AccionesTurno
            esMiTurno={esMiTurno}
            faseActual={faseActual}
            cargando={cargando}
            onTerminarTurno={handleTerminarTurno}
            onDescartar={handleDescartar}
            onBajarSet={onBajarSet}
            cartasSeleccionadas={cartasSeleccionadas}
        />
    )
}
