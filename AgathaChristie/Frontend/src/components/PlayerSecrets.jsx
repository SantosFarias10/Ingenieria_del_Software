import Secret from "./Secret"
import { getTipoObjetivoParaDetective, getDetectivePrincipalDelSet, getTipoObjetivoParaEvento } from "../service/CardService"
import "../styles/PlayerSecrets.css"

export default function PlayerSecrets({ 
    secrets = [], 
    position, 
    rotation = 0, 
    isCurrentPlayer, 
    esperandoObjetivo = false, 
    onSelectSecret,
    setArrayOriginal = null,
    // Props para eventos
    esperandoObjetivoEvento = false,
    eventoEnJuego = null,
    tipoObjetivoActual = null, // Tipo de objetivo que se espera actualmente (para Another Victim)
    onSelectEventoSecret = null,
    // ✅ NUEVO: Props para revelar secreto (efecto de set)
    esperandoRevelarSecreto = false,
    onRevealSecret = null
}) {
    // Si no hay secretos, no renderizamos nada
    if (!secrets || secrets.length === 0) {
        return null
    }

    const { x, y } = position

    // Determinar qué tipo de secreto puede ser seleccionado para SETS
    const getTipoSecretoSeleccionable = () => {
        if (!esperandoObjetivo || !setArrayOriginal || isCurrentPlayer) return null
        
        const detectivePrincipal = getDetectivePrincipalDelSet(setArrayOriginal)
        const tipoObjetivoEsperado = getTipoObjetivoParaDetective(detectivePrincipal)
        
        return tipoObjetivoEsperado
    }

    // Determinar qué tipo de secreto puede ser seleccionado para EVENTOS
    const getTipoSecretoSeleccionableEvento = () => {
        if (!esperandoObjetivoEvento || !eventoEnJuego || isCurrentPlayer) return null
        
        // Si tipoObjetivoActual está seteado (Another Victim caso especial), usarlo
        if (tipoObjetivoActual && tipoObjetivoActual.startsWith('secreto')) {
            return tipoObjetivoActual
        }
        
        // Si no, verificar en la configuración del evento
        const eventoId = eventoEnJuego.idFrontend
        const tiposObjetivo = getTipoObjetivoParaEvento(eventoId)
        
        // Retornar el primer tipo de secreto si hay
        for (const tipo of tiposObjetivo.tipos) {
            if (tipo.startsWith('secreto')) {
                return tipo
            }
        }
        return null
    }

    const tipoSecretoSeleccionable = getTipoSecretoSeleccionable()
    const tipoSecretoSeleccionableEvento = getTipoSecretoSeleccionableEvento()

    // Determinar si un secreto específico puede ser seleccionado
    const puedeSeleccionarseSecreto = (secreto) => {
        if (!tipoSecretoSeleccionable && !tipoSecretoSeleccionableEvento) return false
        
        // estado 9 = oculto, estado 0 = revelado
        const esOculto = secreto.estado === 9 || secreto.estado === null || secreto.estado === undefined
        const esRevelado = secreto.estado === 0
        
        // Check para SET
        if (tipoSecretoSeleccionable) {
            if (tipoSecretoSeleccionable === 'secreto_oculto') return esOculto
            if (tipoSecretoSeleccionable === 'secreto_revelado') return esRevelado
            if (tipoSecretoSeleccionable === 'secreto_cualquiera') return esOculto || esRevelado
        }
        
        // Check para EVENTO
        if (tipoSecretoSeleccionableEvento) {
            if (tipoSecretoSeleccionableEvento === 'secreto_oculto') return esOculto
            if (tipoSecretoSeleccionableEvento === 'secreto_revelado') return esRevelado
            if (tipoSecretoSeleccionableEvento === 'secreto_cualquiera') return esOculto || esRevelado
        }
        
        return false
    }

    // Determinar si secreto puede revelarse (efecto de set)
    const puedeRevelarse = (secreto) => {
        if (!esperandoRevelarSecreto || !isCurrentPlayer) return false
        // Solo secretos ocultos pueden revelarse (estado 9)
        return secreto.estado === 9 || secreto.estado === null || secreto.estado === undefined
    }

    // Determinar si secreto puede verse (ya revelado ajeno)
    const puedeVerse = (secreto) => {
        if (isCurrentPlayer) return false  // Propios siempre volteables
        // Solo secretos revelados pueden verse (estado 0)
        return secreto.estado === 0
    }

    const handleSelectSecret = (secretId, secretData) => {
        const secreto = secrets.find(s => s.id === secretId)
        if (!secreto) return

        // estado 9 = oculto, estado 0 = revelado
        const tipoSecreto = (secreto.estado === 9 || secreto.estado === null || secreto.estado === undefined) ? 'secreto_oculto' : 'secreto_revelado'
        
        // PRIORIDAD 1: Revelar secreto propio (efecto de set Beresfords)
        if (esperandoRevelarSecreto && isCurrentPlayer && onRevealSecret) {
            // Solo secretos ocultos pueden revelarse
            if (tipoSecreto === 'secreto_oculto') {
                onRevealSecret(secreto.idBackend)  // Pasar idBackend
            } else {
                console.warn('Solo puedes revelar secretos ocultos')
            }
            return
        }
        
        // Prioridad 2: Evento
        if (tipoSecretoSeleccionableEvento && onSelectEventoSecret) {
            onSelectEventoSecret(secreto.idBackend, tipoSecreto)
            return
        } 
        
        // Prioridad 3: Set (seleccionar como objetivo)
        if (onSelectSecret) {
            onSelectSecret(secretId, secretData)
        }
    }

    // Handler para ver secreto revelado (tooltip)
    const handleViewSecret = (secretId, secretData) => {
        // Por ahora solo log, el tooltip se muestra automáticamente
        console.log('[PlayerSecrets] Viendo secreto revelado:', secretData?.nombre)
    }

    return (
        <div 
            className="player-secrets" 
            style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
        >
            <div 
                className={`secrets-container ${isCurrentPlayer ? 'current-player' : ''}`}
                style={{
                    transform: `rotate(${rotation}deg)`
                }}
            >
                            {secrets.map((secret) => (
                <Secret
                    key={secret.idBackend}
                    id={secret.id}
                    estado={secret.estado}
                    flipped={isCurrentPlayer}
                    canBeSelected={puedeSeleccionarseSecreto(secret) || puedeRevelarse(secret)}
                    sePuedeVoltearse={isCurrentPlayer}
                    onSelect={handleSelectSecret}
                    isViewable={puedeVerse(secret)}
                    onView={handleViewSecret}
                />
            ))}
            </div>
        </div>
    )
}
