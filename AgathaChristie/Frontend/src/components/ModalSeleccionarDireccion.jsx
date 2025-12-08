import React from 'react';
import '../styles/ModalSeleccionarDireccion.css';

const ModalSeleccionarDireccion = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const handleDerecha = () => {
    onSelect(1); // 1 = derecha
    onClose();
  };

  const handleIzquierda = () => {
    onSelect(-1); // -1 = izquierda
    onClose();
  };

  return (
    <div className="modal-direccion-overlay" onClick={onClose}>
      <div
        className="modal-direccion-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-direccion-title"
      >
        <header className="modal-direccion-header">
          <h2 id="modal-direccion-title" className="modal-direccion-title">
            Selecciona una Dirección
          </h2>
          <button
            type="button"
            className="modal-direccion-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <div className="modal-direccion-content">
          <div className="direccion-buttons">
            <button
              type="button"
              className="btn-direccion izquierda"
              onClick={handleIzquierda}
            >
              <span className="flecha">←</span>
              <span className="texto">Izquierda</span>
            </button>

            <button
              type="button"
              className="btn-direccion derecha"
              onClick={handleDerecha}
            >
              <span className="texto">Derecha</span>
              <span className="flecha">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalSeleccionarDireccion;
