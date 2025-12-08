import React from "react";
import Card from "./Card";
import '../styles/MazoDraft.css';

const MazoDraft = ({ cartas = [], onPick = null }) => {
	return (
		<div className="mazo-draft">
			{cartas.map((carta, idx) => {
				// Usar idFrontend si existe, sino idBackend, sino id
				const cartaId = carta.idFrontend ?? carta.idBackend ?? carta.id;
				
				// Validar que la carta tenga un ID válido
				if (!cartaId && cartaId !== 0) {
					console.error('[MazoDraft] Carta sin ID válido en posición', idx, ':', carta);
					return null; // No renderizar cartas sin ID
				}
				
				// IMPORTANTE: Usar la posición del backend, no el índice del array
				const posicionBackend = carta.posicion ?? idx;
				
				return (
					<Card 
						key={`draft-${idx}-${carta.idBackend ?? carta.id ?? carta.idFrontend}`} 
						id={cartaId} 
						flipped={true}
						puedeVoltearse={false}
						onSelect={() => {
							// Pasamos la posición real que espera el backend
							console.log('[MazoDraft] Carta seleccionada:', {
								indiceArray: idx,
								posicionBackend: posicionBackend,
								carta
							});
							if (typeof onPick === 'function') onPick(posicionBackend)
						}}
					/>
				);
			})}
		</div>
	);
};

export default MazoDraft;
