import React from "react";
import ManoJugador from "../components/ManoJugador";

const ManoJugadorContainer = ({
    cards = [],
    onPlayCard,
    isActive = false
}) => {

    const handleCardSelect = (cardData) => {
        console.log('🔍 ManoJugadorContainer - handleCardSelect called')
        console.log('  - cardData:', cardData)
        console.log('  - isActive:', isActive)
        console.log('  - onPlayCard exists:', !!onPlayCard)
        
        // Validaciones: debe estar activo, tener datos válidos y callback
        if (!isActive) {
            console.log('❌ No está activo')
            return
        }
        if (!cardData) {
            console.log('❌ No hay cardData')
            return
        }
        if (!cardData.idBackend) {
            console.log('❌ No hay idBackend')
            return
        }
        if (!onPlayCard) {
            console.log('❌ No hay onPlayCard')
            return
        }
        
        console.log('✅ Llamando a onPlayCard con:', cardData)
        // Enviar al PartidaContainer para que maneje la lógica de jugar carta
        onPlayCard(cardData);
    }

    return (
        <ManoJugador
            playerCards={cards}
            onSelectCard={handleCardSelect}
        />
    );
}

export default ManoJugadorContainer;
