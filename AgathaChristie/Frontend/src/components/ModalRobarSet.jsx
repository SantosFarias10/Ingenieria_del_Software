import React, { useState } from "react";
import "../styles/ModalRobarSet.css";

export default function ModalRobarSet({ isOpen, onClose, setsJugados, onSelectSet }) {
    const [selected, setSelected] = useState({ jugadorId: null, setIdx: null });
    if (!isOpen) return null;

    // Log para depuración
    console.log('[ModalRobarSet] setsJugados:', setsJugados);

    const handleSelect = (jugadorId, setIdx) => {
        setSelected({ jugadorId, setIdx });
    };

    const handleConfirm = () => {
        if (selected.jugadorId !== null && selected.setIdx !== null) {
            const setRobar = setsJugados[selected.jugadorId][selected.setIdx];
            onSelectSet(selected.jugadorId, setRobar);
            setSelected({ jugadorId: null, setIdx: null });
        }
    };

    return (
        <div className="modal-robar-set-overlay" onClick={onClose}>
            <div className="modal-robar-set-panel" onClick={e => e.stopPropagation()}>
                <header className="modal-robar-set-header">
                    <h2>Sets jugados en la mesa</h2>
                </header>
                <div className="modal-robar-set-content">
                    {Object.keys(setsJugados).length === 0 ? (
                        <p>No hay sets jugados en la mesa.</p>
                    ) : (
                        Object.entries(setsJugados).map(([jugadorId, sets]) => (
                            <div key={jugadorId} className="modal-robar-set-jugador">
                                <h4>Jugador {jugadorId}</h4>
                                {(!Array.isArray(sets) || sets.length === 0) ? (
                                    <p>No tiene sets jugados.</p>
                                ) : (
                                    <ul>
                                        {sets.map((set, idx) => (
                                            <li
                                                key={idx}
                                                className={`modal-robar-set-item${selected.jugadorId === jugadorId && selected.setIdx === idx ? ' selected' : ''}`}
                                                onClick={() => handleSelect(jugadorId, idx)}
                                                style={{ cursor: 'pointer', background: selected.jugadorId === jugadorId && selected.setIdx === idx ? '#d0eaff' : undefined }}
                                            >
                                                Set {idx + 1}: {Array.isArray(set)
                                                    ? set.map(carta => {
                                                        if (carta.nombre) return carta.nombre;
                                                        if (carta.idFrontend !== undefined && carta.idFrontend !== null) return `idFront:${carta.idFrontend}`;
                                                        if (carta.idBackend !== undefined && carta.idBackend !== null) return `idBack:${carta.idBackend}`;
                                                        return JSON.stringify(carta);
                                                    }).join(", ")
                                                    : JSON.stringify(set)
                                                }
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <footer className="modal-robar-set-footer">
                    <button onClick={onClose}>Cerrar</button>
                    <button
                        onClick={handleConfirm}
                        disabled={selected.jugadorId === null || selected.setIdx === null}
                        style={{ marginLeft: 8 }}
                    >
                        Robar Set Seleccionado
                    </button>
                </footer>
            </div>
        </div>
    );
}
