import React, { useState } from 'react';
import '../styles/ModalDescarteConCantidad.css';

const ModalDescarteConCantidad = ({ isOpen, onClose, onSelect = null, minimo = 1, maximo = 5 }) => {
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(null);

  if (!isOpen) return null;

  const handleNumeroClick = (numero) => {
    setCantidadSeleccionada(numero);
  };

  const handleConfirm = () => {
    if (cantidadSeleccionada !== null && cantidadSeleccionada >= minimo && cantidadSeleccionada <= maximo) {
      if (onSelect) {
        onSelect(cantidadSeleccionada);
      }
      setCantidadSeleccionada(null);
      onClose();
    }
  };

  const isConfirmDisabled = cantidadSeleccionada === null;

  return (
    <div className="modal-descarte-cantidad-overlay" onClick={onClose}>
      <div 
        className="modal-descarte-cantidad-panel" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-descarte-cantidad-title"
      >
        <header className="modal-descarte-cantidad-header">
          <h2 id="modal-descarte-cantidad-title" className="modal-descarte-cantidad-title">
            Selecciona la Cantidad
          </h2>
          <button 
            type="button" 
            className="modal-descarte-cantidad-close" 
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <div className="modal-descarte-cantidad-content">
          <p className="modal-descarte-cantidad-info">
            ¿Cuántas cartas quieres mover? (1-{maximo})
            {cantidadSeleccionada !== null && (
              <span className="cantidad-actual"> - Seleccionadas: {cantidadSeleccionada}</span>
            )}
          </p>

          <div className="modal-descarte-numeros">
            {Array.from({ length: maximo }, (_, i) => i + 1).map((numero) => (
              <button
                key={numero}
                type="button"
                className={`numero-btn ${cantidadSeleccionada === numero ? 'seleccionado' : ''}`}
                onClick={() => handleNumeroClick(numero)}
              >
                {numero}
              </button>
            ))}
          </div>
        </div>

        <footer className="modal-descarte-cantidad-footer">
          <button 
            type="button"
            className="btn-confirmar" 
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            Confirmar
          </button>
          <button 
            type="button"
            className="btn-cancelar" 
            onClick={onClose}
          >
            Cancelar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ModalDescarteConCantidad;
