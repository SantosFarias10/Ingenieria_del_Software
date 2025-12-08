import React, { useState } from 'react';
import MazoRegular from '../components/MazoRegular';
import MazoDescarte from '../components/MazoDescarte';

const MazosPreview = () => {
  // Estados de prueba
  const [cantidadRegular, setCantidadRegular] = useState(42);
  const [turnoActivo, setTurnoActivo] = useState(true);
  const [cartasDescarte, setCartasDescarte] = useState([
    { idFrontend: 1, idBackend: 101 },
    { idFrontend: 5, idBackend: 105 },
    { idFrontend: 12, idBackend: 112 },
  ]);

  const handleRobarCarta = () => {
    if (cantidadRegular > 0) {
      setCantidadRegular(prev => prev - 1);
      alert(`¡Carta robada! Quedan ${cantidadRegular - 1} cartas`);
    }
  };

  const handleDescartar = () => {
    const nuevaCarta = { 
      idFrontend: Math.floor(Math.random() * 50) + 1,
      idBackend: Math.floor(Math.random() * 1000) + 100 
    };
    setCartasDescarte(prev => [...prev, nuevaCarta]);
    alert(`Carta descartada! Total en descarte: ${cartasDescarte.length + 1}`);
  };

  const handleVaciarDescarte = () => {
    setCartasDescarte([]);
  };

  return (
    <div style={{ 
      padding: '40px',
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🎴 Vista Previa de Mazos
      </h1>

      {/* Controles de prueba */}
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto 40px',
        padding: '20px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '10px'
      }}>
        <h2>Controles de Prueba</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ marginRight: '10px' }}>
            Cantidad en Mazo Regular: 
            <input 
              type="number" 
              value={cantidadRegular}
              onChange={(e) => setCantidadRegular(Number(e.target.value))}
              style={{ marginLeft: '10px', padding: '5px', width: '80px' }}
              min="0"
              max="100"
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <input 
              type="checkbox"
              checked={turnoActivo}
              onChange={(e) => setTurnoActivo(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            Es mi turno (activo)
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleDescartar}
            style={{ padding: '10px 20px', cursor: 'pointer' }}
          >
            🗑️ Descartar carta aleatoria
          </button>
          <button 
            onClick={handleVaciarDescarte}
            style={{ padding: '10px 20px', cursor: 'pointer' }}
          >
            🧹 Vaciar descarte
          </button>
          <button 
            onClick={() => setCantidadRegular(0)}
            style={{ padding: '10px 20px', cursor: 'pointer', background: '#CD1C18', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            ⚠️ Vaciar mazo regular
          </button>
          <button 
            onClick={() => setCantidadRegular(42)}
            style={{ padding: '10px 20px', cursor: 'pointer', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            🔄 Reset mazo regular
          </button>
        </div>
      </div>

      {/* Mazos en display */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '60px',
        flexWrap: 'wrap',
        marginBottom: '40px'
      }}>
        <div>
          <h3 style={{ textAlign: 'center' }}>Mazo Regular</h3>
          <MazoRegular 
            cantidadCartas={cantidadRegular}
            estaActivo={turnoActivo}
            onRobarCarta={handleRobarCarta}
          />
          <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.9rem' }}>
            Estado: {turnoActivo ? '✅ Activo' : '⏳ Inactivo'}
          </p>
        </div>

        <div>
          <h3 style={{ textAlign: 'center' }}>Mazo de Descarte</h3>
          <MazoDescarte 
            cartasDescarte={cartasDescarte}
          />
          <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.9rem' }}>
            {cartasDescarte.length} carta{cartasDescarte.length !== 1 ? 's' : ''} descartada{cartasDescarte.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Información adicional */}
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        padding: '20px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '10px'
      }}>
        <h3>ℹ️ Información de Prueba</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>El <strong>Mazo Regular</strong> permite robar cartas solo cuando está activo (es tu turno) y tiene cartas disponibles</li>
          <li>Cuando no es tu turno, muestra el emoji ⏳</li>
          <li>Cuando está vacío, muestra el emoji 📭</li>
          <li>El hover solo funciona cuando está activo</li>
          <li>El <strong>Mazo de Descarte</strong> muestra siempre la última carta descartada (volteada)</li>
          <li>El contador en el mazo de descarte indica cuántas cartas hay en total</li>
          <li>Cuando el descarte está vacío, muestra un área punteada con el emoji 📭</li>
        </ul>
      </div>
    </div>
  );
};

export default MazosPreview;
