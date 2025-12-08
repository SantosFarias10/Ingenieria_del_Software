import React, { useState } from "react";
import '../styles/Card.css'
import { encontrarCartaPorId } from '../service/CardService';

const Card = ({ id, flipped = false, onSelect, puedeVoltearse = true }) => {
    const [flip,setFlip] = useState(flipped)
    const cartaData = encontrarCartaPorId(id)

    if (!cartaData){
        console.error(`Carta con ID ${id} no encontrada`)
        return <div className="carta-error">Carta no encontrada</div>
    }
    
    // Por ahora solo flipea, pero en un futuro intuyo que aca iran los efectos de la carta en base a que carta es
    const handleClick = () => {
        // Siempre permitir el callback onSelect (para seleccionar cartas en la mano)
        if(onSelect){
            onSelect(id, cartaData)
        }
        
        // Solo voltear si está permitido
        if (puedeVoltearse) {
            setFlip(!flip)
        }
    }

    // Determinar qué imagen de dorso usar según el tipo de carta
    const getBackImage = () => {
        if (cartaData.tipo === 'Secret') {
            return '/cartas/05-secret_front.png';
        }
        return '/cartas/01-card_back.png';
    }

    return(
        <div 
            className={`carta ${flip ? 'volteada' : ''}`} 
            onClick={handleClick}
        >
            <img 
            className="imagen-carta"
            src={flip ? cartaData.imagen : getBackImage()} 
            alt={flip ? cartaData.nombre : 'Carta Misteriosa'} 
            />
        </div>
    )
}

export default Card
