import React from 'react';
import Card from './Card';
import '../styles/ModalDescarte.css';

const ModalDescarte = ({ isOpen, onClose, cartasDescarte = [], onCardClick = null }) => {
  if (!isOpen) return null;

  /* istanbul ignore next */
  const cartas = Array.isArray(cartasDescarte) ? cartasDescarte : [];
  /* istanbul ignore next */
  const ultimasCincoCartas = cartas.slice(-5).reverse();
  
  const handleCardClick = (idBackend) => {
    if (onCardClick) {
      onCardClick(idBackend);
    }
  };

  return (
    <div className="modal-descarte-overlay" onClick={onClose}>
      <div 
        className="modal-descarte-panel" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-descarte-title"
      >
        <header className="modal-descarte-header">
          <h2 id="modal-descarte-title" className="modal-descarte-title">
            Últimas Cartas Descartadas
          </h2>
          <button 
            type="button" 
            className="modal-descarte-close" 
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <div className="modal-descarte-content">
          {ultimasCincoCartas.length > 0 ? (
            <div className="modal-descarte-cartas">
              {ultimasCincoCartas.map((carta, index) => (
                <div key={`${carta.idBackend ?? carta.id ?? 'unknown'}-${index}`} className="modal-descarte-carta">
                  <Card 
                    id={carta.idFrontend ?? carta.id_front ?? carta.id}
                    flipped={true}
                    puedeVoltearse={false}
                    onSelect={() => handleCardClick(carta.idBackend ?? carta.id ?? carta.carta_id)}
                  />
                  <span className="modal-descarte-orden">
                    {ultimasCincoCartas.length > 1 && index === 0 ? 'Más reciente' : ''}
                    {ultimasCincoCartas.length > 1 && index === ultimasCincoCartas.length - 1 ? 'Más antigua' : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="modal-descarte-vacio">No hay cartas descartadas</p>
          )}
        </div>

        <footer className="modal-descarte-footer">
          <button 
            type="button"
            className="modal-descarte-btn-cerrar" 
            onClick={onClose}
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ModalDescarte;
