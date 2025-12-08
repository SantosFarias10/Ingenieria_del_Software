
import React from 'react';
import '../styles/FiltrarPorNombre.css';

const FiltrarPorNombreVisual = ({ filterText, items = [], loading, error, onFilterChange }) => {
    return (
        <div>
            <input
                className="input-filtrar"
                type="text"
                placeholder="Filtrar partida por nombre"
                value={filterText}
                onChange={onFilterChange}
            />
            {loading && <p>Cargando partidas...</p>}
            {error && <p className="error-message-filtrar">{error}</p>}
            {!loading && !error && items.length === 0 && (
                <div className="no-partidas-filtrar">
                    <p>No hay partidas disponibles con ese nombre</p>
                </div>
            )}
            {!loading && !error && items.length > 0 && (
                <ul>
                    {items.map(item => (
                        <li key={item.id}>{item.nombre || item.name}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};


export default FiltrarPorNombreVisual;