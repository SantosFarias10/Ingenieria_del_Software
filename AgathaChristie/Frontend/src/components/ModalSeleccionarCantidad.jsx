import React, { useState } from 'react';
import '../styles/ModalSeleccionarCantidad.css';

const ModalSeleccionarCantidad = ({ isOpen, onClose, onSelect, minimo = 1, maximo = 5, titulo = 'Selecciona Cantidad de Cartas' }) => {
  const [cantidad, setCantidad] = useState(1);

  if (!isOpen) return null;

  const handleSelect = () => {
    if (cantidad >= minimo && cantidad <= maximo) {
      onSelect(cantidad);
      onClose();
    }
  };

  const incrementar = () => {
    if (cantidad < maximo) {
      setCantidad(cantidad + 1);
    }
  };

  const decrementar = () => {
    if (cantidad > minimo) {
      setCantidad(cantidad - 1);
    }
  };

  return (
    <div className="modal-cantidad-overlay" onClick={onClose}>
      <div
        className="modal-cantidad-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-cantidad-title"
      >
        <header className="modal-cantidad-header">
          <h2 id="modal-cantidad-title" className="modal-cantidad-title">
            {titulo}
          </h2>
          <button
            type="button"
            className="modal-cantidad-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <div className="modal-cantidad-content">
          <p className="modal-cantidad-rango">
            Selecciona entre {minimo} y {maximo} cartas
          </p>

          <div className="cantidad-selector">
            <button
              type="button"
              className="btn-cantidad-control"
              onClick={decrementar}
              disabled={cantidad <= minimo}
              aria-label="Disminuir cantidad"
            >
              −
            </button>

            <div className="cantidad-display">
              <span className="cantidad-numero">{cantidad}</span>
              <span className="cantidad-label">
                {cantidad === 1 ? 'carta' : 'cartas'}
              </span>
            </div>

            <button
              type="button"
              className="btn-cantidad-control"
              onClick={incrementar}
              disabled={cantidad >= maximo}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <div className="modal-cantidad-botones">
            <button
              type="button"
              className="btn-seleccionar"
              onClick={handleSelect}
            >
              Seleccionar
            </button>
            <button
              type="button"
              className="btn-cancelar"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalSeleccionarCantidad;
