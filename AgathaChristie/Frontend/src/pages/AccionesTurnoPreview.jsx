import React, { useState } from 'react'
import AccionesTurnoContainer from '../container/AccionesTurnoContainer'
import ManoJugadorContainer from '../container/ManoJugadorContainer'
import '../styles/AccionesTurno.css'
import '../styles/ManoJugador.css'

const AccionesTurnoPreview = () => {
    const [faseActual, setFaseActual] = useState('DESCARTAR')
    const [esMiTurno, setEsMiTurno] = useState(true)
    const [miMano, setMiMano] = useState([
        { idBackend: 1, idFrontend: 1 },   // Hercule Poirot
        { idBackend: 2, idFrontend: 10 },  // Cards on the Table
        { idBackend: 3, idFrontend: 19 },  // Not So Fast
        { idBackend: 4, idFrontend: 20 },  // Blackmailed
    ])
    const [logs, setLogs] = useState([])

    const addLog = (message) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    }

    const handleDescartar = async (cardData) => {
        addLog(`🗑️ Descartando carta ${cardData.idBackend}`)
        setMiMano(miMano.filter(c => c.idBackend !== cardData.idBackend))
        setFaseActual('ROBAR')
    }

    const handleRobarMazo = async () => {
        addLog('🎴 Robando carta del mazo...')
        await new Promise(resolve => setTimeout(resolve, 500)) // Simular delay
        const nuevaCarta = { idBackend: Date.now(), idFrontend: Math.floor(Math.random() * 30) + 1 }
        setMiMano([...miMano, nuevaCarta])
        addLog(`✅ Carta robada: ${nuevaCarta.idBackend}`)
    }

    const handleTerminarTurno = async () => {
        addLog('✅ Terminando turno...')
        await new Promise(resolve => setTimeout(resolve, 500))
        addLog('🔄 Turno terminado - Esperando siguiente turno')
    }

    return (
        <div style={{ 
            padding: '20px',
            backgroundColor: '#1a4d2e',
            minHeight: '100vh',
            paddingBottom: '320px'
        }}>
            <h1 style={{ 
                color: '#f0e68c', 
                marginBottom: '20px', 
                textAlign: 'center',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>
                Preview - Acciones del Turno
            </h1>

            {/* Controles de simulación */}
            <div style={{
                backgroundColor: '#fff8dc',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '20px',
                maxWidth: '800px',
                margin: '0 auto 20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                border: '2px solid #8b7355'
            }}>
                <h2 style={{ color: '#2d5016', marginBottom: '15px' }}>🎮 Controles de Simulación</h2>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ color: '#3d3d3d', fontWeight: 'bold', marginRight: '10px' }}>
                        ¿Es mi turno?
                    </label>
                    <button 
                        onClick={() => setEsMiTurno(!esMiTurno)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: esMiTurno ? '#27ae60' : '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        {esMiTurno ? '✅ SÍ' : '❌ NO'}
                    </button>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ color: '#3d3d3d', fontWeight: 'bold', marginRight: '10px' }}>
                        Fase actual:
                    </label>
                    <select 
                        value={faseActual}
                        onChange={(e) => setFaseActual(e.target.value)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '5px',
                            border: '1px solid #8b7355'
                        }}
                    >
                        <option value="DESCARTAR">DESCARTAR</option>
                        <option value="ROBAR">ROBAR</option>
                        <option value="FINALIZAR">FINALIZAR</option>
                    </select>
                </div>

                <div>
                    <label style={{ color: '#3d3d3d', fontWeight: 'bold', marginRight: '10px' }}>
                        Cartas en mano: {miMano.length}
                    </label>
                    <button 
                        onClick={() => setMiMano([
                            { idBackend: 1, idFrontend: 1 },
                            { idBackend: 2, idFrontend: 10 },
                            { idBackend: 3, idFrontend: 19 },
                            { idBackend: 4, idFrontend: 20 },
                        ])}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Resetear Mano
                    </button>
                </div>
            </div>

            {/* Log de acciones */}
            <div style={{
                backgroundColor: '#fff8dc',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '20px',
                maxWidth: '800px',
                margin: '0 auto 20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                border: '2px solid #8b7355',
                maxHeight: '200px',
                overflowY: 'auto'
            }}>
                <h3 style={{ color: '#2d5016', marginBottom: '10px' }}>📋 Log de Acciones</h3>
                {logs.length === 0 ? (
                    <p style={{ color: '#999', fontStyle: 'italic' }}>No hay acciones aún...</p>
                ) : (
                    <div>
                        {logs.map((log, idx) => (
                            <div key={idx} style={{ 
                                padding: '5px', 
                                borderBottom: '1px solid #d2b48c',
                                color: '#3d3d3d',
                                fontSize: '14px'
                            }}>
                                {log}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Flujo del turno */}
            <div style={{
                backgroundColor: '#fff8dc',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '20px',
                maxWidth: '800px',
                margin: '0 auto 20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                border: '2px solid #8b7355'
            }}>
                <h3 style={{ color: '#2d5016', marginBottom: '15px' }}>🔄 Flujo del Turno (Sprint 1)</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                    <div style={{ 
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: faseActual === 'DESCARTAR' ? '#27ae60' : '#95a5a6',
                        color: 'white',
                        borderRadius: '10px',
                        flex: 1,
                        margin: '0 5px'
                    }}>
                        <div style={{ fontSize: '32px' }}>1️⃣</div>
                        <div style={{ fontWeight: 'bold' }}>DESCARTAR</div>
                        <div style={{ fontSize: '12px' }}>Selecciona carta</div>
                    </div>
                    <div style={{ fontSize: '24px' }}>→</div>
                    <div style={{ 
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: faseActual === 'ROBAR' ? '#3498db' : '#95a5a6',
                        color: 'white',
                        borderRadius: '10px',
                        flex: 1,
                        margin: '0 5px'
                    }}>
                        <div style={{ fontSize: '32px' }}>2️⃣</div>
                        <div style={{ fontWeight: 'bold' }}>ROBAR</div>
                        <div style={{ fontSize: '12px' }}>Click botón</div>
                    </div>
                    <div style={{ fontSize: '24px' }}>→</div>
                    <div style={{ 
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: faseActual === 'FINALIZAR' ? '#e67e22' : '#95a5a6',
                        color: 'white',
                        borderRadius: '10px',
                        flex: 1,
                        margin: '0 5px'
                    }}>
                        <div style={{ fontSize: '32px' }}>3️⃣</div>
                        <div style={{ fontWeight: 'bold' }}>FINALIZAR</div>
                        <div style={{ fontSize: '12px' }}>Terminar turno</div>
                    </div>
                </div>
            </div>

            {/* Área de simulación del tablero */}
            <div style={{ 
                height: '300px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#4a752c',
                borderRadius: '8px',
                border: '3px dashed #f0e68c',
                maxWidth: '800px',
                margin: '0 auto 20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}>
                <p style={{ 
                    fontSize: '32px', 
                    color: '#f0e68c',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
                }}>
                    🎮 Área del tablero del juego
                </p>
            </div>

            {/* Mano del jugador (fixed bottom) */}
            <ManoJugadorContainer 
                cards={miMano}
                isActive={faseActual === 'DESCARTAR' && esMiTurno}
                onPlayCard={handleDescartar}
            />

            {/* Acciones del turno (fixed bottom) */}
            <AccionesTurnoContainer 
                esMiTurno={esMiTurno}
                faseActual={faseActual}
                onFaseChange={setFaseActual}
                onRobarMazo={handleRobarMazo}
                onTerminarTurno={handleTerminarTurno}
            />
        </div>
    )
}

export default AccionesTurnoPreview
