import React, { useState, useEffect } from "react";
import { encontrarSecretoPorId } from "../service/SecretService";  
import "../styles/Secret.css";

const Secret = ({ 
    id, 
    flipped = false, 
    onSelect, 
    sePuedeVoltearse = false, 
    canBeSelected = false, 
    estado = null,
    isViewable = false,
    onView = null
}) => {
    const secretId = encontrarSecretoPorId(id);
    
    // Auto-voltear si está revelado (estado = 0) o si es propio (flipped)
    const debeEstarVolteado = flipped || estado === 0;
    const [flip, setFlip] = useState(debeEstarVolteado);

    // Sincronizar flip cuando cambia el estado o flipped
    useEffect(() => {
        setFlip(debeEstarVolteado);
    }, [debeEstarVolteado, estado, flipped]);

    if (!secretId){
        console.error(`Secreto con ID ${id} no encontrado`)
    }

    // Función para el flip (voltear la carta) - BLOQUEADO
    const handleFlip = () => {
        // Los secretos NO deben poder voltearse manualmente
        // - Secretos propios siempre se muestran (flipped=true por defecto)
        // - Secretos revelados se voltean automáticamente (estado=0)
        // - Solo Parker Pyne puede ocultar secretos revelados (vía efecto de set)
        return;
    };

    // Función para seleccionar el secreto como objetivo
    const handleSelect = (e) => {
        e.stopPropagation();
        if (canBeSelected && onSelect) {
            onSelect(id, secretId);
        }
    };

    // Función para ver secreto revelado (ahora solo log, ya que está auto-volteado)
    const handleView = (e) => {
        e.stopPropagation();
        if (onView) {
            onView(id, secretId);
        }
    };

    // Determinar qué acción ejecutar al hacer click
    const handleClick = (e) => {
        // Prioridad 1: Seleccionar como objetivo (set/evento en curso)
        if (canBeSelected) {
            handleSelect(e);
            return;
        }
        
        // Prioridad 2: Ver secreto revelado ajeno (callback informativo)
        if (isViewable && estado === 0) {
            handleView(e);
            return;
        }
    };

    // Determinar cursor y clases CSS
    const isClickable = canBeSelected || (isViewable && estado === 0);
    const cursorStyle = canBeSelected ? 'pointer' : (isViewable && estado === 0) ? 'pointer' : 'default';

    return(
        <div
            className={`secreto ${flip ? 'volteada' : ''} ${canBeSelected ? 'seleccionable' : ''} ${estado === 0 ? 'revelado' : ''}`}
            onClick={isClickable ? handleClick : undefined}
            style={{ cursor: cursorStyle }}
        >
            <img 
                src={flip ? secretId.imagen : "/secretos/01-secret_atras.png"} 
                alt={flip ? secretId.nombre : "Carta secreta"} 
            />
            
            {/* Badge solo para secretos revelados que NO son propios */}
            {estado === 0 && !flipped && (
                <div className="secreto-revelado-badge">👁</div>
            )}
        </div>
    )
}

export default Secret