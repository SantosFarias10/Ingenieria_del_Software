import React from 'react';
import Card from './Card';
import '../styles/MazoDescarte.css';

const MazoDescarte = ({ 
  cartasDescarte = [],
  cantidadCartasDescarte = undefined
}) => {
  // Usar el contador explícito si está disponible, sino usar el length del array
  const cantidadTotal = cantidadCartasDescarte !== undefined 
    ? cantidadCartasDescarte 
    : cartasDescarte.length;
  
  const cartaSuperior = cartasDescarte.length > 0 
    ? cartasDescarte[cartasDescarte.length - 1] 
    : null;

  return (
    <>
      <div className="mazo-descarte-wrapper">
        <div 
          className="mazo-descarte"
        >
          {cantidadTotal > 0 ? (
            <div className="carta-descarte">
              <Card 
                id={cartaSuperior?.idFrontend || 1}
                flipped={true}
                puedeVoltearse={false}
              />
              <span className="contador-descarte">{cantidadTotal}</span>
            </div>
          ) : (
            <div className="descarte-vacio">
              <p>Descarte Vacío</p>
            </div>
          )}
        </div>
        <p className="label-mazo">Mazo de Descarte</p>
      </div>
    </>
  );
};

export default MazoDescarte;