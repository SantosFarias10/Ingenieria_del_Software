import Title from "../components/Title/Title";
import Button from "../components/Button/Button";
import { useNavigate } from "react-router-dom";
import "../styles/CrearPartida.css";
import Form from "../components/Form/Form";
import { useState } from "react";
import { createGame } from "../service/HttpService";
import { openLobby } from "./LobbyContainer";
import { saveGame } from '../service/LocalStorage';

export default function CrearPartidaContainer() {
    const [gameName, setGameName] = useState("");
    const [minPlayers, setMinPlayers] = useState(2);
    const [maxPlayers, setMaxPlayers] = useState(6); 
    const [error, setError] = useState(""); // Para mostrar mensajes de error
    const navigate = useNavigate();

    // Función para validar rangos de jugadores
    const validatePlayerCounts = (min, max) => {
        const minNum = parseInt(min);
        const maxNum = parseInt(max);
        
        // Validar min si tiene valor
        if (!isNaN(minNum)) {
            if (minNum < 2) {
                return "El número mínimo de jugadores debe ser al menos 2";
            }
            if (minNum > 6) {
                return "El número máximo de jugadores es 6";
            }
        }
        
        // Validar max si tiene valor
        if (!isNaN(maxNum)) {
            if (maxNum < 2) {
                return "El número mínimo de jugadores debe ser al menos 2";
            }
            if (maxNum > 6) {
                return "El número máximo de jugadores es 6";
            }
        }
        
        // Validar relación min-max solo si ambos tienen valor
        if (!isNaN(minNum) && !isNaN(maxNum) && minNum > maxNum) {
            return "El mínimo no puede ser mayor al máximo de jugadores";
        }
        
        return "";
    };

    // Función para manejar el cambio en el número mínimo de jugadores
    const handleMinPlayersChange = (e) => {
        const inputValue = e.target.value;
        
        // Permitir campo vacío temporalmente
        if (inputValue === '' || inputValue === null) {
            setMinPlayers('');
            setError("");
            return;
        }
        
        const value = parseInt(inputValue);
        
        // Si no es un número válido, no actualizar
        if (isNaN(value)) {
            return;
        }
        
        let newMin = value;
        let newMax = maxPlayers;
        
        // Auto-corrección: si el mínimo es mayor al máximo, ajustar el máximo
        if (value > maxPlayers && maxPlayers !== '' && !isNaN(maxPlayers)) {
            newMax = value;
            setMaxPlayers(value);
        }
        
        setMinPlayers(newMin);
        
        const errorMessage = validatePlayerCounts(newMin, newMax);
        setError(errorMessage);
    };

    // Función para manejar el cambio en el número máximo de jugadores
    const handleMaxPlayersChange = (e) => {
        const inputValue = e.target.value;
        
        // Permitir campo vacío temporalmente
        if (inputValue === '' || inputValue === null) {
            setMaxPlayers('');
            setError("");
            return;
        }
        
        const value = parseInt(inputValue);
        
        // Si no es un número válido, no actualizar
        if (isNaN(value)) {
            return;
        }
        
        let newMin = minPlayers;
        let newMax = value;
        
        // Auto-corrección: si el máximo es menor al mínimo, ajustar el mínimo
        if (value < minPlayers && minPlayers !== '' && !isNaN(minPlayers)) {
            newMin = value;
            setMinPlayers(value);
        }
        
        setMaxPlayers(newMax);
        
        const errorMessage = validatePlayerCounts(newMin, newMax);
        setError(errorMessage);
    };

    async function onSubmit(e) {
        e.preventDefault();

        setError("");
        const validar = gameName.trim();

        if (!validar) {
            setError("El nombre de la partida es obligatorio");
            return;
        }

        if (validar.length > 50) {
            setError("El nombre no puede superar los 50 caracteres");
            return;
        }

        // Asegurar que los campos de jugadores tienen valores válidos
        const finalMinPlayers = minPlayers === '' || isNaN(minPlayers) ? 2 : parseInt(minPlayers);
        const finalMaxPlayers = maxPlayers === '' || isNaN(maxPlayers) ? 6 : parseInt(maxPlayers);

        // Validar rangos de jugadores antes del envío
        const validationError = validatePlayerCounts(finalMinPlayers, finalMaxPlayers);
        if (validationError) {
            setError(validationError);
            return;
        }

        const GameData = { gameName: validar, minPlayers: finalMinPlayers, maxPlayers: finalMaxPlayers };

        try {
            const createdGame = await createGame(GameData);
            console.log("Partida creada:", createdGame);
            try {
                saveGame({ 
                    id: createdGame.id ?? createdGame._id ??  createdGame.gameId, 
                    nombre_partida: createdGame.name ?? createdGame.nombre ?? validar, 
                    max_jugadores: finalMaxPlayers,
                    min_jugadores: finalMinPlayers,
                    creator: createdGame.creador
                });
            } catch (err2) {
                console.warn('No se pudo persistir la partida localmente', err2)
            }
            // Abrir el lobby con los datos reales retornados por el backend
            const lobbyData = { 
                id: createdGame.id ?? createdGame._id ?? createdGame.gameId, 
                name: createdGame.name ?? createdGame.nombre ?? validar,
                minPlayers: finalMinPlayers,
                maxPlayers: finalMaxPlayers,
                creador: createdGame.creador
            };
            openLobby(lobbyData);
        } catch (err) {
            console.error('Error creando la partida', err);
            setError('Ocurrió un error al crear la partida. Intenta nuevamente.');
        }
    }

    return (
        <>
            <Title
                variant="crear-partida"
                title="Crear Partida"
                subtitle="Configura los detalles de tu nueva partida"
            />
            <div className="crear-partida-container">
                <Form onSubmit={onSubmit}>
                    <p>Nombre de la Partida</p>
                    <input
                        className="nombre-partida"
                        type="text"
                        placeholder="Nombre de la Partida"
                        value={gameName}
                        maxLength={50}
                        onChange ={(e) => setGameName(e.target.value)}
                    />
                    <br />
                    
                    <p>Número Mínimo de Jugadores</p>
                    <input
                        className="numero-jugadores-min"
                        type="number"
                        placeholder="Mínimo de Jugadores"
                        value={minPlayers}
                        min="2"
                        max="6"
                        onChange={handleMinPlayersChange}
                    />
                    <br />
                    
                    <p>Número Máximo de Jugadores</p>
                    <input
                        className="numero-jugadores-max"
                        type="number"
                        placeholder="Máximo de Jugadores"
                        value={maxPlayers}
                        min="2"
                        max="6"
                        onChange={handleMaxPlayersChange}
                    />
                    {error && <p className="error-message">{error}</p>}
                    <br />
                    <Button type="submit">Crear Partida</Button>
                </Form>
                <Button onClick={()=> navigate("/home")}> Volver </Button>
            </div>
        </>
    )
}