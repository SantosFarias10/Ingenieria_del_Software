import React from 'react';
import Card from '../components/Card';
import { todasLasCartas } from '../service/CardService';

const CardPreview = () => {
  const handleSelect = (id, cartaData, flipped) => {
    console.log('Carta seleccionada:', { id, nombre: cartaData.nombre, flipped });
    alert(`Seleccionaste: ${cartaData.nombre}`);
  };

  return (
    <div style={{ 
      padding: '40px',
      backgroundColor: '#1a1a1a',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'white', marginBottom: '30px' }}>
        Vista Previa de Cartas
      </h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px',
        maxWidth: '1200px'
      }}>
        {todasLasCartas.map(carta => (
          <Card 
            key={carta.id}
            id={carta.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <h2 style={{ color: 'white', marginTop: '40px', marginBottom: '20px' }}>
        Con diferentes estados
      </h2>
      
      <div style={{
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <div>
          <p style={{ color: 'white', marginBottom: '10px' }}>Volteada (flipped)</p>
          <Card 
            id={1} 
            flipped={true}
            onSelect={handleSelect}
          />
        </div>
        
        <div>
          <p style={{ color: 'white', marginBottom: '10px' }}>Normal (sin voltear)</p>
          <Card 
            id={1} 
            flipped={false}
            onSelect={handleSelect}
          />
        </div>
        
        <div>
          <p style={{ color: 'white', marginBottom: '10px' }}>No puede voltearse</p>
          <Card 
            id={1} 
            flipped={true}
            puedeVoltearse={false}
          />
        </div>
      </div>
    </div>
  );
};

export default CardPreview;
