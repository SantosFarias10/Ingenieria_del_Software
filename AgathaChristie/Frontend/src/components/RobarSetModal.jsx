import React, { useState, useEffect } from 'react'
import Card from './Card'
import './RobarSetModal.css'

const RobarSetModal = ({ 
  isOpen, 
  onClose, 
  currentPlayerId, 
  playerNames = {},
  onRobarSet,
  allPlayerSets = {} // Recibir sets como prop
}) => {
  const [error, setError] = useState(null)
  const [selectedSet, setSelectedSet] = useState(null)

  // Usar los sets pasados como prop en lugar de hacer llamada propia
  const allSets = allPlayerSets

  // Limpiar selección cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setSelectedSet(null)
      setError(null)
    }
  }, [isOpen])

  const handleRobarSet = (jugadorId, setIndex, setCards) => {
    if (onRobarSet) {
      onRobarSet(jugadorId, setIndex, setCards)
    }
    onClose()
  }

  const getPlayerName = (playerId) => {
    return playerNames[playerId] || `Jugador ${playerId}`
  }

  const getDetectiveName = (idFront) => {
    const detectives = {
      1: 'Hercule Poirot',
      2: 'Miss Marple', 
      3: 'Mr Satterthwaite',
      4: 'Parker Pyne',
      5: 'Lady Eileen',
      6: 'Tommy Beresford',
      7: 'Tuppence Beresford',
      8: 'Harley Quin',
      9: 'Adriane Oliver'
    }
    return detectives[idFront] || `Detective ${idFront}`
  }

  const renderSetCards = (setCards) => {
    return setCards.map((card, cardIndex) => (
      <div key={cardIndex} className="set-card-wrapper">
        <Card
          id={card.id_front || card.idFrontend}
          flipped={true}
          puedeVoltearse={false}
        />
      </div>
    ))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="robar-set-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎯 Robar Set de Otro Jugador</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {error && (
            <div className="error">
              <p>{error}</p>
            </div>
          )}

          {!error && (
            <div className="players-sets">
              {(() => {
                // Filtrar sets disponibles (de otros jugadores con sets)
                const availableSets = Object.entries(allSets).filter(([playerId, playerSets]) => {
                  return parseInt(playerId) !== currentPlayerId && 
                         playerSets && 
                         Object.keys(playerSets).length > 0
                })

                if (availableSets.length === 0) {
                  return <p className="no-sets">No hay sets disponibles para robar</p>
                }

                return availableSets.map(([playerId, playerSets]) => (
                  <div key={playerId} className="player-sets-section">
                    <h3 className="player-name">
                      {getPlayerName(parseInt(playerId))}
                    </h3>
                    
                    <div className="sets-grid">
                      {Object.entries(playerSets).map(([setIndex, setCards]) => (
                        <div 
                          key={setIndex} 
                          className={`set-item ${selectedSet?.playerId === playerId && selectedSet?.setIndex === setIndex ? 'selected' : ''}`}
                          onClick={() => setSelectedSet({ playerId, setIndex, setCards })}
                        >
                          <div className="set-header">
                            <span className="set-label">Set #{setIndex}</span>
                            <span className="set-count">({setCards.length} cartas)</span>
                          </div>
                          
                          <div className="set-cards">
                            {renderSetCards(setCards)}
                          </div>
                          
                          <button 
                            className="robar-button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRobarSet(parseInt(playerId), setIndex, setCards)
                            }}
                          >
                            🎯 Robar Este Set
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              })()}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancelar
          </button>
          {selectedSet && (
            <button 
              className="confirm-robar-button"
              onClick={() => handleRobarSet(
                parseInt(selectedSet.playerId), 
                selectedSet.setIndex, 
                selectedSet.setCards
              )}
            >
              🎯 Robar Set Seleccionado
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RobarSetModal