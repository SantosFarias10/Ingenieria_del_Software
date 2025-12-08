import React, { useState } from 'react';
import ManoJugador from '../components/ManoJugador';
import '../styles/ManoJugador.css';

const ManoJugadorPreview = () => {
  const [selectedCard, setSelectedCard] = useState(null);

  // Ejemplo 1: Mano con varias cartas (simulando respuesta del backend)
  // Usando IDs reales del CardService
  const manoCompleta = [
    { idBackend: 1, idFrontend: 1 },   // Hercule Poirot (Detective)
    { idBackend: 2, idFrontend: 10 },  // Cards on the Table (Event)
    { idBackend: 3, idFrontend: 19 },  // Not So Fast (Instant)
    { idBackend: 4, idFrontend: 20 },  // Blackmailed (Devious)
  ];

  // Ejemplo 2: Mano con pocas cartas
  const manoPequena = [
    { idBackend: 5, idFrontend: 2 },   // Miss Marple (Detective)
    { idBackend: 6, idFrontend: 11 },  // Another Victim (Event)
  ];

  // Ejemplo 3: Mano vacía
  const manoVacia = [];

  const handleSelectCard = (cardData) => {
    console.log('Carta seleccionada:', cardData);
    setSelectedCard(cardData);
  };

  return (
    <div style={{ 
      padding: '40px',
      backgroundColor: '#1a4d2e',
      minHeight: '100vh',
      paddingBottom: '300px' // Espacio para la mano fija
    }}>
      <h1 style={{ 
        color: '#f0e68c', 
        marginBottom: '30px', 
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }}>
        Vista Previa - Mano del Jugador
      </h1>

      {/* Información de la carta seleccionada */}
      {selectedCard && (
        <div style={{
          backgroundColor: '#fff8dc',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px',
          maxWidth: '600px',
          margin: '0 auto 30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          border: '2px solid #8b7355'
        }}>
          <h3 style={{ color: '#2d5016', marginBottom: '15px' }}>Carta Seleccionada:</h3>
          <pre style={{ 
            backgroundColor: '#faf0e6', 
            padding: '15px', 
            borderRadius: '5px',
            overflow: 'auto',
            border: '1px solid #d2b48c',
            color: '#2d2d2d',
            fontSize: '14px'
          }}>
            {JSON.stringify(selectedCard, null, 2)}
          </pre>
        </div>
      )}

      {/* Instrucciones */}
      <div style={{
        backgroundColor: '#fff8dc',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px',
        maxWidth: '800px',
        margin: '0 auto 30px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        border: '2px solid #8b7355'
      }}>
        <h2 style={{ color: '#2d5016', marginBottom: '15px' }}>Instrucciones:</h2>
        <ul style={{ color: '#3d3d3d', lineHeight: '1.8' }}>
          <li>La mano se muestra fija en la parte inferior de la pantalla</li>
          <li>Haz clic en las cartas para voltearlas</li>
          <li>Al seleccionar una carta, se muestra su información completa arriba</li>
          <li>Incluye <code style={{ 
            backgroundColor: '#faf0e6', 
            padding: '2px 6px', 
            borderRadius: '3px',
            color: '#d63031'
          }}>idBackend</code> (único del servidor) e <code style={{ 
            backgroundColor: '#faf0e6', 
            padding: '2px 6px', 
            borderRadius: '3px',
            color: '#0984e3'
          }}>idFrontend</code> (para buscar info)</li>
        </ul>
      </div>

      {/* Ejemplos de diferentes estados */}
      <div style={{
        backgroundColor: '#fff8dc',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px',
        maxWidth: '800px',
        margin: '0 auto',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        border: '2px solid #8b7355'
      }}>
        <h2 style={{ color: '#2d5016', marginBottom: '20px' }}>Estados de ejemplo (scroll hacia abajo):</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#27ae60' }}>✅ Mano completa (4 cartas)</h3>
          <p style={{ color: '#3d3d3d' }}>
            Renderizada en la parte inferior fija de la pantalla<br/>
            <em style={{ fontSize: '0.9em', color: '#666' }}>
              IDs: Hercule Poirot (1), Cards on the Table (10), Not So Fast (19), Blackmailed (20)
            </em>
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#f39c12' }}>⚠️ Mano con pocas cartas (2 cartas)</h3>
          <p style={{ color: '#3d3d3d' }}>
            Para probar, cambia <code style={{ 
              backgroundColor: '#faf0e6', 
              padding: '2px 6px', 
              borderRadius: '3px' 
            }}>manoCompleta</code> por <code style={{ 
              backgroundColor: '#faf0e6', 
              padding: '2px 6px', 
              borderRadius: '3px' 
            }}>manoPequena</code> en línea 111
          </p>
        </div>

        <div>
          <h3 style={{ color: '#e74c3c' }}>❌ Mano vacía</h3>
          <p style={{ color: '#3d3d3d' }}>
            Para probar, usa <code style={{ 
              backgroundColor: '#faf0e6', 
              padding: '2px 6px', 
              borderRadius: '3px' 
            }}>manoVacia</code> en lugar de <code style={{ 
              backgroundColor: '#faf0e6', 
              padding: '2px 6px', 
              borderRadius: '3px' 
            }}>manoCompleta</code>
          </p>
        </div>
      </div>

      {/* Contenido de prueba para simular scroll */}
      <div style={{
        backgroundColor: 'rgba(255, 248, 220, 0.9)',
        padding: '40px',
        borderRadius: '10px',
        marginTop: '30px',
        maxWidth: '800px',
        margin: '30px auto',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        border: '2px solid #8b7355'
      }}>
        <h3 style={{ color: '#2d5016', marginBottom: '20px' }}>Contenido del juego aquí...</h3>
        <p style={{ color: '#3d3d3d', marginBottom: '10px' }}>
          Este es un espacio para simular el tablero del juego.
        </p>
        <p style={{ color: '#3d3d3d', marginBottom: '20px' }}>
          La mano del jugador permanece fija en la parte inferior.
        </p>
        <div style={{ 
          height: '400px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#4a752c',
          borderRadius: '8px',
          border: '3px dashed #f0e68c'
        }}>
          <p style={{ 
            fontSize: '32px', 
            color: '#f0e68c',
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
          }}>
            🎮 Área del tablero
          </p>
        </div>
      </div>

      {/* Componente ManoJugador - Se renderiza fijo abajo */}
      <ManoJugador 
        playerCards={manoCompleta}  // Cambia a manoPequena o manoVacia para probar
        onSelectCard={handleSelectCard}
        playerName="Emi"
      />
    </div>
  );
};

export default ManoJugadorPreview;
