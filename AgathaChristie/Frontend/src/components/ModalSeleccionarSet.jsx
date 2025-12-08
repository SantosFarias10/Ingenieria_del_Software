import React, { useEffect, useState } from 'react'
import Card from './Card'
import '../styles/ModalSeleccionarCarta.css'

const ModalSeleccionarSet = ({
  isOpen,
  onClose,
  onConfirm,
  sets = [],
  titulo = 'Selecciona un set'
}) => {
  const [selectedIndex, setSelectedIndex] = useState(null)

  // Limpiar selección cuando se abre/cierra el modal
  useEffect(() => {
    if (!isOpen) setSelectedIndex(null)
  }, [isOpen])

  // Normalizar sets a arrays de números
  const normalizedSets = sets.map(setArray => {
    if (!Array.isArray(setArray)) return []
    return setArray
      .map(item => {
        if (typeof item === 'number') return item
        if (typeof item === 'string') {
          const num = Number(item)
          return Number.isNaN(num) ? null : num
        }
        if (typeof item === 'object' && item) {
          const value = item.id_front ?? item.id ?? item.idFrontend ?? item.idFront
          const num = Number(value)
          return Number.isNaN(num) ? null : num
        }
        return null
      })
      .filter(id => id !== null)
  })

  const handleSetSelection = (index) => {
    setSelectedIndex(index)
  }

  const handleConfirm = () => {
    if (selectedIndex !== null) {
      onConfirm(normalizedSets[selectedIndex], selectedIndex)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '900px' }}
      >
        <h2>{titulo}</h2>
        <p>{normalizedSets.length} sets disponibles</p>

        <div className="cartas-grid">
          {normalizedSets.length > 0 ? (
            normalizedSets.map((setArray, index) => (
              <div
                key={index}
                className={`set-row ${selectedIndex === index ? 'seleccionada' : ''}`}
                onClick={() => handleSetSelection(index)}
              >
                <div className="set-cards-row">
                  {setArray.map((idFront, cardIndex) => (
                    <div key={cardIndex} className="card-wrapper">
                      <Card
                        id={idFront}
                        flipped={true}
                        puedeVoltearse={false}
                        onSelect={() => { }}
                      />
                    </div>
                  ))}
                </div>
                <div className="set-info">
                  Set #{index + 1} ({setArray.length} cartas)
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              No hay sets disponibles
            </div>
          )}
        </div>

        <div className="modal-buttons">
          <button onClick={onClose}>
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedIndex === null}
          >
            Confirmar Set
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalSeleccionarSet
