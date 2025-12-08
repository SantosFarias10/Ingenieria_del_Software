import React from 'react';
import Card from './Card';
import '../styles/MazoRegular.css';

const MazoRegular = ({ 
  cantidadCartas, 
  onRobarCarta, 
  estaActivo 
}) => {
  const puedeRobar = estaActivo && cantidadCartas > 0;
  
  const handleClick = () => {
    if (!puedeRobar) return;
    onRobarCarta();
  };

  return (
    <div className="mazo-regular-wrapper">
      <div 
        className={`mazo-regular ${puedeRobar ? 'activo' : 'inactivo'}`}
        onClick={handleClick}
        title={!estaActivo ? "No es tu turno" : cantidadCartas <= 0 ? "Mazo vacío" : "Haz clic para robar carta"}
      >
        <Card 
          id={1}
          flipped={false}
          puedeVoltearse={false}
        />
        <span className="contador-cartas">{cantidadCartas}</span>
      </div>
      <p className="label-mazo">Mazo Principal</p>
    </div>
  );
};

export default MazoRegular;