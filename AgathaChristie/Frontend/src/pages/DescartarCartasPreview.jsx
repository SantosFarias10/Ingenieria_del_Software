import React, { useState } from 'react';
import ManoJugador from '../components/ManoJugador';
import AccionesTurno from '../components/AccionesTurno';

const DescartarCartasPreview = () => {
  // Cartas de Detective simuladas
  const cartasIniciales = [
    { id: 1, idFrontend: 1, idBackend: 101, nombre: 'Hercule Poirot' },
    { id: 2, idFrontend: 2, idBackend: 102, nombre: 'Miss Marple' },
    { id: 3, idFrontend: 3, idBackend: 103, nombre: 'Mr. Satterthwaite' },
    { id: 4, idFrontend: 4, idBackend: 104, nombre: 'Parker Pyne' },
    { id: 5, idFrontend: 5, idBackend: 105, nombre: 'George Brent' },
    { id: 6, idFrontend: 6, idBackend: 106, nombre: 'Tommy Beresford' },
  ];

  const [playerCards, setPlayerCards] = useState(cartasIniciales);
  const [cartasSeleccionadas, setCartasSeleccionadas] = useState([]);
  const [cartasDescartadas, setCartasDescartadas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (mensaje) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${mensaje}`]);
  };

  // Handler para seleccionar/deseleccionar carta
  const handleSeleccionarCarta = (carta) => {
    setCartasSeleccionadas(prev => {
      const yaSeleccionada = prev.find(c => c.idBackend === carta.idBackend);
      
      if (yaSeleccionada) {
        addLog(`❌ Deseleccionada: ${carta.nombre || `Carta ${carta.idBackend}`}`);
        return prev.filter(c => c.idBackend !== carta.idBackend);
      }
      
      addLog(`✅ Seleccionada: ${carta.nombre || `Carta ${carta.idBackend}`}`);
      return [...prev, carta];
    });
  };

  // Handler para descartar cartas
  const handleDescartar = async () => {
    if (cartasSeleccionadas.length === 0) return;

    setCargando(true);
    addLog(`🗑️ Descartando ${cartasSeleccionadas.length} carta(s)...`);

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mover cartas a descartadas
    setCartasDescartadas(prev => [...prev, ...cartasSeleccionadas]);
    
    // Remover de la mano
    setPlayerCards(prev => 
      prev.filter(c => !cartasSeleccionadas.some(sel => sel.idBackend === c.idBackend))
    );

    cartasSeleccionadas.forEach(carta => {
      addLog(`✓ Descartada: ${carta.nombre || `Carta ${carta.idBackend}`}`);
    });

    // Limpiar selección
    setCartasSeleccionadas([]);
    setCargando(false);
    addLog('✅ Descarte completado');
  };

  // Botón para resetear
  const handleReset = () => {
    setPlayerCards(cartasIniciales);
    setCartasSeleccionadas([]);
    setCartasDescartadas([]);
    setLogs([]);
    addLog('🔄 Preview reseteada');
  };

  return (
    <div style={{ 
      padding: '40px',
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1 style={{ marginBottom: '30px' }}>
        🗑️ Preview: Descartar Cartas
      </h1>

      {/* Instrucciones */}
      <div style={{ 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#2a2a2a',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginBottom: '15px' }}>📖 Instrucciones:</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>Click en una carta para seleccionarla (se eleva y muestra ✓)</li>
          <li>Click otra vez en la misma carta para deseleccionarla</li>
          <li>Podés seleccionar múltiples cartas (1, 2, 3... todas)</li>
          <li>El botón "Descartar" muestra cuántas cartas tenés seleccionadas</li>
          <li>Al descartar, las cartas se mueven a la pila de descarte</li>
          <li>Usá el botón "Reset" para volver al estado inicial</li>
        </ul>
      </div>

      {/* Stats */}
      <div style={{ 
        marginBottom: '30px',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ 
          padding: '15px 25px',
          backgroundColor: '#2a2a2a',
          borderRadius: '8px'
        }}>
          <strong>🃏 Cartas en mano:</strong> {playerCards.length}
        </div>
        <div style={{ 
          padding: '15px 25px',
          backgroundColor: '#2a2a2a',
          borderRadius: '8px'
        }}>
          <strong>✓ Seleccionadas:</strong> {cartasSeleccionadas.length}
        </div>
        <div style={{ 
          padding: '15px 25px',
          backgroundColor: '#2a2a2a',
          borderRadius: '8px'
        }}>
          <strong>🗑️ Descartadas:</strong> {cartasDescartadas.length}
        </div>
      </div>

      {/* Mano del jugador */}
      <div style={{ marginBottom: '200px' }}>
        <ManoJugador
          playerCards={playerCards}
          onSelectCard={handleSeleccionarCarta}
          cartasSeleccionadas={cartasSeleccionadas}
        />
      </div>

      {/* Acciones de turno */}
      <div style={{ 
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000
      }}>
        <AccionesTurno
          esMiTurno={true}
          faseActual="DESCARTAR"
          cargando={cargando}
          onDescartar={handleDescartar}
          cartasSeleccionadas={cartasSeleccionadas}
        />
      </div>

      {/* Cartas descartadas */}
      {cartasDescartadas.length > 0 && (
        <div style={{ 
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#2a2a2a',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>🗑️ Pila de Descarte:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {cartasDescartadas.map(carta => (
              <div 
                key={carta.idBackend}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3a3a3a',
                  borderRadius: '6px',
                  border: '1px solid #555'
                }}
              >
                {carta.nombre || `Carta ${carta.idBackend}`}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs */}
      <div style={{ 
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#2a2a2a',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>📜 Logs de Actividad:</h3>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 20px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Reset Preview
          </button>
        </div>
        <div style={{ 
          maxHeight: '200px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '14px',
          backgroundColor: '#1a1a1a',
          padding: '15px',
          borderRadius: '6px'
        }}>
          {logs.length === 0 ? (
            <p style={{ color: '#666' }}>Sin actividad aún...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '5px', color: '#4CAF50' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DescartarCartasPreview;
