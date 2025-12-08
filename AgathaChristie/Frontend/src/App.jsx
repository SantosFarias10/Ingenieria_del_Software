// import { useState } from 'react';
// Agregamos la librería de enrutamiento para React
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ListadoDePartidas from "./pages/ListadoDePartidas"
import CrearJugador from "./pages/CrearJugador"
import Home from "./pages/Home"
import CrearPartida from "./pages/CrearPartida"
import LobbyContainer from "./container/LobbyContainer"
import CardPreview from "./pages/CardPreview"
import SecretPreview from "./pages/SecretPreview"
import ManoJugadorPreview from "./pages/ManoJugadorPreview"
import AccionesTurnoPreview from "./pages/AccionesTurnoPreview"
import ModalSeleccionarCartaPreview from "./pages/ModalSeleccionarCartaPreview"
import DescartarCartasPreview from "./pages/DescartarCartasPreview"
import Partida from "./pages/Partida"
// import Avatars from './Componentes/Avatars'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CrearJugador />} />
        <Route path="/home" element={<Home />} />
        <Route path="/crear-partida" element={<CrearPartida />} />
        <Route path="/listar-partidas" element={<ListadoDePartidas />} />
        <Route path="/card-preview" element={<CardPreview />} />
        <Route path="/secret-preview" element={<SecretPreview />} />
        <Route path="/mano-preview" element={<ManoJugadorPreview />} />
        <Route path="/acciones-turno-preview" element={<AccionesTurnoPreview />} />
        <Route path="/modal-seleccionar-carta-preview" element={<ModalSeleccionarCartaPreview />} />
        <Route path="/descartar-cartas-preview" element={<DescartarCartasPreview />} />
        <Route path="/partida" element={<Partida />} />
      </Routes>

      {/* LobbyContainer siempre montado para que las funciones funcionen */}
      <LobbyContainer />

    </BrowserRouter>
  );
}

export default App
