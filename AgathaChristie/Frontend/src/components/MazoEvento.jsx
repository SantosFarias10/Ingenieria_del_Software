import React from 'react'
import Card from './Card'
import '../styles/MazoEvento.css'

const MazoEvento = ({ cartaEvento, onClick, disabled }) => {
  return (
    <div className="mazo-evento-wrapper">
      <div 
        className={`mazo-evento ${!disabled ? 'clickeable' : ''}`}
        onClick={!disabled ? onClick : undefined}
        role={!disabled ? "button" : undefined}
        tabIndex={!disabled ? 0 : undefined}
        aria-label={!disabled ? "Jugar carta de evento" : undefined}
      >
        {cartaEvento ? (
          <div className="carta-evento">
            <Card
              id={cartaEvento.idFrontend ?? cartaEvento.id_front ?? cartaEvento.idBackend ?? cartaEvento.id}
              flipped={true}
              puedeVoltearse={false}
            />
          </div>
        ) : (
          <div className="evento-vacio">
            <p>Evento</p>
          </div>
        )}
      </div>
      <p className="label-mazo">Carta de Evento</p>
    </div>
  )
}

export default MazoEvento