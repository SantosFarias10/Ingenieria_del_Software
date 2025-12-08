import React from "react";
import Card from "./Card";
import '../styles/ManoJugador.css';

const ManoJugador = ({
  playerCards = [],
  onSelectCard,
  cartasSeleccionadas = [],
  esperandoUsarNSF = false,
  onUsarNSF = null,
  esperandoPasarCartaDCF = false,
  esperandoCardTrade = false,
}) => {
  // Validación de mano vacía
  if (!playerCards || playerCards.length === 0) {
    return (
      <div className="mano-jugador">
        <p>No tienes cartas</p>
      </div>
    );
  }

  // Handler para cuando se selecciona una carta
  const handleCardClick = (carta) => {
    console.log('🃏 ManoJugador - handleCardClick called')
    console.log('  - carta completa:', carta)
    console.log('  - esperandoCardTrade:', esperandoCardTrade)
    
    // PRIORIDAD 1: Si estamos esperando usar NSF y la carta es NSF (id 19)
    if (esperandoUsarNSF && carta.idFrontend === 19 && onUsarNSF) {
      console.log('  - Usando carta NSF')
      onUsarNSF(carta);
      return;
    }
    
    // PRIORIDAD 2: Selección normal de carta
    if (carta && onSelectCard) {
      console.log('  - Llamando onSelectCard con:', carta)
      onSelectCard(carta);
    } else {
      console.log('  - No se llamó onSelectCard:', { carta: !!carta, onSelectCard: !!onSelectCard })
    }
  };

  return (
    <div className="mano-jugador">
      {esperandoPasarCartaDCF && (
        <p style={{ color: '#ff9800', fontWeight: 'bold', marginBottom: '8px' }}>
          ⚠️ Selecciona una carta para pasar
        </p>
      )}
      <p>{playerCards.length} {playerCards.length === 1 ? 'carta' : 'cartas'}</p>
      
      <div className="cartas-container">
        {playerCards
          .filter(carta => carta.idBackend !== null && carta.idBackend !== undefined)
          .map(carta => {
          // Verificar si esta carta está seleccionada
          const estaSeleccionada = cartasSeleccionadas.some(c => c.idBackend === carta.idBackend)
          
          // Verificar si es una carta NSF seleccionable
          const esNSFSeleccionable = esperandoUsarNSF && carta.idFrontend === 19
          
          // Determinar clases CSS según el modo
          let clases = 'carta-wrapper';
          if (esNSFSeleccionable) {
            clases += ' nsf-seleccionable';
          } else if (esperandoCardTrade) {
            clases += ' carta-trade-mode'; // Modo Card Trade: hover especial
          } else if (estaSeleccionada) {
            clases += ' carta-seleccionada'; // Modo normal: selección múltiple
          }
          
          return (
            <div 
              key={carta.idBackend}
              className={clases}
              onClick={() => handleCardClick(carta)}
              style={esperandoCardTrade ? {
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              } : undefined}
              onMouseEnter={(e) => {
                if (esperandoCardTrade) {
                  e.currentTarget.style.transform = 'translateY(-20px) scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 193, 7, 0.6)';
                  e.currentTarget.style.zIndex = '100';
                }
              }}
              onMouseLeave={(e) => {
                if (esperandoCardTrade) {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.zIndex = '';
                }
              }}
            >
              <Card 
                id={carta.idFrontend}
                flipped={true}
                puedeVoltearse={false}
              />
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default ManoJugador;