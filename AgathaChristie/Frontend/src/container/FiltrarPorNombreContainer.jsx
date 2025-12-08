import React, { useState, useEffect } from "react";
import FiltrarPorNombreVisual from "../components/FiltrarPorNombreVisual";
import {filtrarPartidas} from "../service/HttpService";

const FiltrarPorNombreContainer = ({ items = [] }) => {
    const [filterText, setFilterText] = useState('');
    const [filteredItems, setFilteredItems] = useState(items || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const filtrarPartidasPorNombre = async (nombre) => {
        try {
            const response = await filtrarPartidas(nombre);
            setFilteredItems(response);
            setError(null);
        } catch (err) {
            setError('No se pudieron cargar las partidas filtradas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        filtrarPartidasPorNombre(filterText);
    }, [filterText]);
   

    const handleFilterChange = (e) => {
        setFilterText(e.target.value);
    };
    return (
        <div className="filtrar-por-nombre-container">
            <FiltrarPorNombreVisual 
                items={filteredItems}
                filterText={filterText}
                onFilterChange={handleFilterChange}
                loading={loading}
                error={error}
                filtrarPartidasPorNombre={filtrarPartidasPorNombre}
            />
        </div>
    );
}
export default FiltrarPorNombreContainer;
