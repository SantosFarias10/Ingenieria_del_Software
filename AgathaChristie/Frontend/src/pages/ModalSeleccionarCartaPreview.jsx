import React, { useState } from 'react';
import ModalSeleccionarCarta from '../components/ModalSeleccionarCarta';

const ModalSeleccionarCartaPreview = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [cantidadRequerida, setCantidadRequerida] = useState(3);

  // Cartas Detective simuladas (IDs 1-9 son detectives)
  const cartasDetective = [
    { id: 1, idFrontend: 1, idBackend: 101 },
    { id: 2, idFrontend: 2, idBackend: 102 },
    { id: 3, idFrontend: 3, idBackend: 103 },
    { id: 4, idFrontend: 4, idBackend: 104 },
    { id: 5, idFrontend: 5, idBackend: 105 },
    { id: 6, idFrontend: 6, idBackend: 106 },
    { id: 7, idFrontend: 7, idBackend: 107 },
    { id: 8, idFrontend: 8, idBackend: 108 },
    { id: 9, idFrontend: 9, idBackend: 109 },
  ];

  const handleOpenModal = (cantidad) => {
    setCantidadRequerida(cantidad);
    setIsModalOpen(true);
  };

  const handleConfirm = (cartas) => {
    console.log('✅ Cartas seleccionadas:', cartas);
    setSelectedCards(cartas);
    alert(`Seleccionaste ${cartas.length} cartas:\n${cartas.map(c => `ID: ${c.id}`).join('\n')}`);
  };

  const handleClose = () => {
    console.log('❌ Modal cerrado sin confirmar');
    setIsModalOpen(false);
  };

  return (
    <div style={{ 
      padding: '40px',
      backgroundColor: '#1a1a1a',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'white', marginBottom: '30px' }}>
        🃏 Vista Previa - Modal Seleccionar Cartas
      </h1>

      <div style={{ 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#2a2a2a',
        borderRadius: '8px'
      }}>
        <h2 style={{ color: 'white', marginBottom: '20px' }}>
          Escenarios de uso:
        </h2>

        <div style={{ 
          display: 'flex', 
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => handleOpenModal(2)}
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📋 Jugar Set (2 cartas)
          </button>

          <button 
            onClick={() => handleOpenModal(3)}
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📋 Jugar Set (3 cartas)
          </button>

          <button 
            onClick={() => handleOpenModal(4)}
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📋 Seleccionar 4 cartas
          </button>
        </div>
      </div>

      {/* Últimas cartas seleccionadas */}
      {selectedCards.length > 0 && (
        <div style={{ 
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#2a2a2a',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: 'white', marginBottom: '15px' }}>
            ✅ Últimas cartas seleccionadas:
          </h3>
          <ul style={{ color: '#4CAF50', fontSize: '16px' }}>
            {selectedCards.map(carta => (
              <li key={carta.id}>
                ID: {carta.id} | Frontend ID: {carta.idFrontend} | Backend ID: {carta.idBackend}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Instrucciones */}
      <div style={{ 
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#2a2a2a',
        borderRadius: '8px'
      }}>
        <h3 style={{ color: 'white', marginBottom: '15px' }}>
          📖 Instrucciones:
        </h3>
        <ul style={{ color: '#ccc', lineHeight: '1.8' }}>
          <li>Click en un botón para abrir el modal con diferentes cantidades requeridas</li>
          <li>Click en las cartas para seleccionarlas/deseleccionarlas</li>
          <li>Las cartas seleccionadas tendrán borde verde y un ✓</li>
          <li>El botón "Confirmar" solo se habilita cuando tienes la cantidad exacta</li>
          <li>Click en "Cancelar" o fuera del modal para cerrar sin confirmar</li>
          <li>Revisa la consola del navegador para ver los logs</li>
        </ul>
      </div>

      {/* Modal */}
      <ModalSeleccionarCarta
        isOpen={isModalOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        cartas={cartasDetective}
        cantRequerida={cantidadRequerida}
        titulo={`Seleccioná ${cantidadRequerida} ${cantidadRequerida === 1 ? 'carta' : 'cartas'}`}
      />
    </div>
  );
};

export default ModalSeleccionarCartaPreview;
