import React, { useEffect } from "react";
import { useState } from "react";
import Card from "./Card";
import '../styles/ModalSeleccionarCarta.css';
import '../styles/ModalSeleccionarCarta.css'

const ModalSeleccionarCarta = ({isOpen,onClose,onConfirm,cartas,cantRequerida,titulo}) => {
    const [cartasSeleccionadas,setCartasSeleccionadas] = useState([])
    const canConfirm = cartasSeleccionadas.length === cantRequerida

    useEffect(() => {
        if(!isOpen) {
            setCartasSeleccionadas([])
        }
    },[isOpen])

    const handleSeleccionarCarta = (carta) => {
        const alreadySelect = cartasSeleccionadas.find(c => c.id === carta.id)
        if (alreadySelect) {
            setCartasSeleccionadas(cartasSeleccionadas.filter(c => c.id !== carta.id))
        }else {
            if (cartasSeleccionadas.length < cantRequerida){
                setCartasSeleccionadas([...cartasSeleccionadas,carta])
            }
        }
    }

    const handleConfirmar = () => {
        if(cartasSeleccionadas.length === cantRequerida){
            onConfirm(cartasSeleccionadas)
            setCartasSeleccionadas([])
            onClose()
        }
    }

    const handleCancelar = () => {
        setCartasSeleccionadas([])
        onClose()
    }

    if(!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{titulo}</h2>
                <p>Seleccionadas : {cartasSeleccionadas.length}/{cantRequerida}</p>
                <div className="cartas-grid">
                    {cartas.map(carta => (
                        <div
                            key={carta.id}
                            className={`carta ${cartasSeleccionadas.find(c => c.id === carta.id) ? 'seleccionada' : ''}`}
                            onClick={() => handleSeleccionarCarta(carta)}
                        >
                            <Card
                                id ={carta.idFrontend}
                                flipped={true}
                                puedeVoltearse={false}
                                onSelect={() => {}} // COmo defini el OnClick en el map de antes, este lo pongo vacio
                                />
                        </div>
                    ))}
                </div>
                <div className="modal-buttons">
                    <button onClick={handleCancelar}>Cancelar</button>
                    <button onClick={handleConfirmar} disabled={!canConfirm}>Confirmar</button>
                </div>
                
            </div>
        </div>
    )
}

export default ModalSeleccionarCarta;