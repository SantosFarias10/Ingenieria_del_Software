import React, { useState, useEffect } from 'react';
import { fetchPartidasService } from '../service/HttpService';
import ListadoDePartidasPresentacional from '../components/ListadoDePartidasVisual';
import Button from '../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import "../styles/ListadoDePartidas.css"
import FiltrarPorNombreContainer from './FiltrarPorNombreContainer';


const ListadoDePartidasContainer = () => {
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');
  const navigate = useNavigate();

  const fetchPartidas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchPartidasService();
      if (Array.isArray(response)) {
        setPartidas(response);
      } else if (response && Array.isArray(response.partidas)) {
        setPartidas(response.partidas);
      } else if (response && Array.isArray(response.lista)) {
        setPartidas(response.lista);
      } else {
        setPartidas([]);
      }
    } catch (err) {
      setError('No se pudieron cargar las partidas. Mostrando datos de ejemplo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartidas();
  }, []);

  // Filtrar partidas por nombre
  const filteredPartidas = filterText.trim() === ''
    ? partidas
    : partidas.filter(p => (p.nombre || p.name || '').toLowerCase().includes(filterText.toLowerCase()));

  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
  };

  return (
    <div>
      <ListadoDePartidasPresentacional
        partidas={filteredPartidas}
        loading={loading}
        error={error}
        fetchPartidas={fetchPartidas}
        filterText={filterText}
        onFilterChange={handleFilterChange}
      />
      <Button onClick={()=> navigate("/home")}
              className={"btn-crear-partida"}> Volver </Button>
    </div>
  );
};

export default ListadoDePartidasContainer;
