import { useEffect, useState, useRef } from "react";
import CentralArea from "../components/CentralArea";
import GamePlayer from "../components/GamePlayer";
import { getGameId, getUserId } from "../service/LocalStorage";
import { getAvatars } from "../service/playerService";
import {
  getPlayerBasePosition,
  getPlayerPositions,
  getCardRotation,
} from "../service/playerPositions";
import "../styles/Partida.css";
import "../styles/WinnerModalAsesino.css";
import {
  robarCarta,
  robarCartaDraft,
  endTurn,
  getGameDetails,
  jugar_carta_de_evento,
  descartarCarta,
  ganador,
  checkSets,
  jugarSet,
  intercambiarSets,
  intercambiarSet,
  verTodosLosSets,
  try_jugar_set,
  try_agregarDetectiveASet,
  agregarDetectiveASet,
  try_jugar_evento,
  revelarSecretoPropio,
  tengo_NSF,
  usar_NSF,
  pasar_carta_ronda,
  intercambiarCartas
} from "../service/HttpService";
import { useNavigate } from "react-router-dom";
import AccionesTurno from "../components/AccionesTurno";
import ManoJugador from "../components/ManoJugador";
import MazoDraft from "../components/MazoDraft";
import MazoEvento from "../components/MazoEvento";
import ModalSeleccionarSet from "../components/ModalSeleccionarSet";
import ModalRobarSet from "../components/ModalRobarSet";
import RobarSetModal from "../components/RobarSetModal";
import PlayerSets from "../components/PlayerSets";
import NotificationPopup from "../components/NotificationPopup";
import ModalAgregarDetective from "../components/ModalAgregarDetective";
import ModalSeleccionarDireccion from "../components/ModalSeleccionarDireccion";
import ModalSeleccionarCantidad from "../components/ModalSeleccionarCantidad";
import ModalDescarte from "../components/ModalDescarte";
import ModalDescarteConCantidad from "../components/ModalDescarteConCantidad";
import {
  necesitaObjetivo,
  encontrarCartaPorId,
  getTipoObjetivoParaDetective,
  getDetectivePrincipalDelSet,
  puedeJugarseSet,
  getTipoObjetivoParaEvento,
  puedeJugarseEvento,
  eventoNecesitaObjetivo,
  tieneSecretoDelTipo,
} from "../service/CardService";

import { WS } from "./LobbyContainer";

export default function PartidaContainer() {
  // Estado para el modal de robar set
  const [modalRobarSetOpen, setModalRobarSetOpen] = useState(false);
  const [modalRobarSetNuevoOpen, setModalRobarSetNuevoOpen] = useState(false);

  const idGame = getGameId();
  const userId = getUserId();
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [mazoRegular, setMazoRegular] = useState(0);
  const [mazoDescarte, setMazoDescarte] = useState([]); // Solo cartas reales
  const [contadorDescarte, setContadorDescarte] = useState(0); // Contador separado
  const [turnoActual, setTurnoActual] = useState(null);
  const [playerHand, setPlayerHand] = useState([]);
  const [allSecrets, setAllSecrets] = useState({});
  const [cartasSeleccionadas, setCartasSeleccionadas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [faseActual, setFaseActual] = useState("DESCARTAR"); // Por ahora siempre en fase DESCARTAR
  const [haDescartadoEnTurno, setHaDescartadoEnTurno] = useState(false); // Flag para rastrear si descartó en este turno
  const [winnerRequested, setWinnerRequested] = useState(false);
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [idAsesino, setIdAsesino] = useState(null);
  const [idComplice, setIdComplice] = useState(null);
  const [haRobadoEnTurno, setHaRobadoEnTurno] = useState(false); // Flag para rastrear si robó cartas en este turno
  const [cartaEventoSeleccionada, setCartaEventoSeleccionada] = useState(null);
  const [haJugadoEventoEnTurno, setHaJugadoEventoEnTurno] = useState(false); // Flag para rastrear si jugó una carta de evento en este turno
  const [haJugadoSetEnTurno, setHaJugadoSetEnTurno] = useState(false); // Flag para rastrear si jugó un set en este turno
  const [cartaDrafts, setCartaDrafts] = useState([]);
  const [modalSetsOpen, setModalSetsOpen] = useState(false);
  const [availableSets, setAvailableSets] = useState([]);
  const [allPlayerSets, setAllPlayerSets] = useState({}); // Sets jugados por cada jugador
  const [lastProcessedSetId, setLastProcessedSetId] = useState(null); // Para evitar duplicados simples
  const [handlerCount, setHandlerCount] = useState(0); // Contador de ejecuciones del handler
  const [notification, setNotification] = useState({
    message: "",
    type: "info",
  });

  // Estado para esperar selección de objetivo después de jugar set
  const [esperandoObjetivo, setEsperandoObjetivo] = useState(false);
  const [cartasEnJuego, setCartasEnJuego] = useState(null);
  const [tipoObjentivoEsperado, setTipoObjetivoEsperado] = useState(null); // 'jugador', 'set', 'carta', 'secreto', etc.
  const [setArrayOriginal, setSetArrayOriginal] = useState(null);

  const [esperandoRevelarSecreto, setEsperandoRevelarSecreto] = useState(false);
  const [jugadorObjetivoRevelacion, setJugadorObjetivoRevelacion] =
    useState(null);
  const [setActivoParaRevelacion, setSetActivoParaRevelacion] = useState(null);
  const [jugadorQueJugoSet, setJugadorQueJugoSet] = useState(null);

  // Estado para eventos que necesitan objetivos
  const [esperandoObjetivoEvento, setEsperandoObjetivoEvento] = useState(false);
  const [eventoEnJuego, setEventoEnJuego] = useState(null);
  const [eventosSeleccionados, setEventosSeleccionados] = useState([]); // Array de objetivos del evento
  const [modalDireccionOpen, setModalDireccionOpen] = useState(false);
  const [modalCantidadOpen, setModalCantidadOpen] = useState(false);
  const [modalDescarteForEventoOpen, setModalDescarteForEventoOpen] =
    useState(false);
  const [modalDescarteConCantidadOpen, setModalDescarteConCantidadOpen] =
    useState(false); // Para evento 16
  const [eventoObjetivoIndex, setEventoObjetivoIndex] = useState(0); // Índice del objetivo actual que se está esperando
  const [tipoObjetivoActual, setTipoObjetivoActual] = useState(null); // Tipo de objetivo que se espera actualmente (para Another Victim)
  // Estado específico para Dead Card Folly
  const [esperandoPasarCartaDCF, setEsperandoPasarCartaDCF] = useState(false);
  const [direccionDCF, setDireccionDCF] = useState(null); // 1 = derecha, -1 = izquierda
  const [yaPaseMiCartaDCF, setYaPaseMiCartaDCF] = useState(false); // true = ya pasé mi carta, esperando a los demás

  // Estado para extender set
  const [modalAgregarDetectiveOpen, setModalAgregarDetectiveOpen] =
    useState(false);
  const [setAExtender, setSetAExtender] = useState(null); // { index, setId, cartas }
  const [cartasDisponiblesParaSet, setCartasDisponiblesParaSet] = useState([]);

  // Estado para manejar el timer de NSF (Not So Fast)
  const [nsfTimerActive, setNsfTimerActive] = useState(false);
  const [nsfTimerId, setNsfTimerId] = useState(null);
  const [accionPendiente, setAccionPendiente] = useState(null); // Guarda la acción a ejecutar después del timer
  
  // Ref para saber si una acción fue cancelada con NSF (evita problemas de closure)
  const accionCanceladaRef = useRef(false);

  // Estados adicionales para Not So Fast
  const [esperandoUsarNSF, setEsperandoUsarNSF] = useState(false);
  const [accionACancelar, setAccionACancelar] = useState(null); // Info de la acción que se puede cancelar
  const [tengoNSF, setTengoNSF] = useState(false);
  const [cartasNSFDisponibles, setCartasNSFDisponibles] = useState([]);
  const [tiempoRestanteNSF, setTiempoRestanteNSF] = useState(5);

  // Estados para Card Trade
  const [esperandoCardTrade, setEsperandoCardTrade] = useState(false); // Si el usuario debe seleccionar carta para intercambiar
  const [cardTradeObjetivo, setCardTradeObjetivo] = useState(null); // ID del jugador con quien se intercambia
  const [cardTradeJugadorActivo, setCardTradeJugadorActivo] = useState(null); // ID del jugador que jugó la carta

  // Funcion para mostrar notificaciones
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
  };

  // Funcion para cerrar notificacion
  const closeNotification = () => {
    setNotification({ message: "", type: "info" });
  };

  // Función para cancelar el timer de NSF (cuando alguien juega Not So Fast)
  const cancelarTimerNSF = () => {
    if (nsfTimerId) {
      clearTimeout(nsfTimerId);
      setNsfTimerId(null);
      setAccionACancelar(null);
      setEsperandoUsarNSF(false);
      showNotification("¡Not So Fast! La acción fue cancelada.", "warning");
    }
  };

  // Handler para usar una carta Not So Fast
  const handleUsarNSF = async (nsfCarta) => {
    try {
      if (!accionACancelar) {
        showNotification("No hay acción para cancelar", "error");
        return;
      }
      
      console.log("[DEBUG] Usando NSF:", {
        nsfCarta,
        accionACancelar
      });
      
      setCargando(true);
      
      const partidaId = getGameId();
      const jugadorId = getUserId();
      
      // Determinar objetivo y si es set
      let objetivoId = null;
      let esSet = false;
      
      if (accionACancelar.tipo === 'set') {
        // Si es un set, el objetivo puede estar en setId u objetivo
        objetivoId = accionACancelar.setId || accionACancelar.objetivo || 0;
        esSet = true;
      } else if (accionACancelar.tipo === 'detective' || accionACancelar.tipo === 'agregar_detective') {
        // Si es agregar detective a set, el objetivo es el setId
        objetivoId = accionACancelar.setId;
        esSet = true;
        console.log("[DEBUG NSF] Tipo agregar_detective - usando setId:", accionACancelar.setId);
      } else if (accionACancelar.tipo === 'evento') {
        // Si es evento, el objetivo es la carta de evento
        objetivoId = accionACancelar.carta?.idBackend || accionACancelar.cartaId;
        esSet = false;
      }
      
      console.log("[DEBUG] Parámetros NSF:", {
        partidaId,
        jugadorId,
        nsfCartaId: nsfCarta.idBackend,
        objetivoId,
        esSet,
        tipoAccion: accionACancelar.tipo,
        accionCompleta: accionACancelar
      });
      
      // Cancelar el timer
      if (nsfTimerId) {
        clearTimeout(nsfTimerId);
        setNsfTimerId(null);
      }
      
      // Llamar al backend
      await usar_NSF(partidaId, jugadorId, nsfCarta.idBackend, objetivoId, esSet);
      
      // Limpiar estados
      setNsfTimerActive(false);
      setEsperandoUsarNSF(false);
      setAccionACancelar(null);
      setAccionPendiente(null);
      
      showNotification("¡Not So Fast! Acción cancelada correctamente", "success");
      
    } catch (error) {
      console.error("Error al usar NSF:", error);
      showNotification(
        error?.response?.data?.error || "Error al usar Not So Fast",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  // Función para verificar si tengo cartas NSF en mi mano
  const verificarSiTengoNSF = async () => {
    try {
      const partidaId = getGameId();
      const jugadorId = getUserId();
      
      if (!partidaId || !jugadorId) return;
      
      const tieneNSF = await tengo_NSF(partidaId, jugadorId);
      
      setTengoNSF(tieneNSF);
      
      // Filtrar NSF de la mano (id_front = 19 es Not So Fast)
      if (tieneNSF && playerHand.length > 0) {
        const nsfCards = playerHand.filter(c => c.idFrontend === 19);
        setCartasNSFDisponibles(nsfCards);
        console.log("[DEBUG] NSF encontradas:", nsfCards.length);
      } else {
        setCartasNSFDisponibles([]);
      }
    } catch (error) {
      console.error("Error verificando NSF:", error);
      setTengoNSF(false);
      setCartasNSFDisponibles([]);
    }
  };

  // Helper: Verificar si un set es de Hermanos Beresford (Tommy + Tuppence)
  // Tommy = idFrontend 6, Tuppence = idFrontend 7
  // NO se puede cancelar con NSF cuando se juega por primera vez
  const esSetDeHermanosBeresford = (cartasJugadas) => {
    if (!Array.isArray(cartasJugadas) || cartasJugadas.length < 2) {
      return false;
    }

    // Obtener los idFrontend de las cartas
    const idsFrontend = cartasJugadas.map(c => c.idFrontend || c.id_front).filter(Boolean);
    
    // Verificar si contiene Tommy (6) y Tuppence (7)
    const tieneTommy = idsFrontend.includes(6);
    const tieneTuppence = idsFrontend.includes(7);
    
    console.log("[DEBUG] Verificando set Beresford - IDs:", idsFrontend, "Tommy:", tieneTommy, "Tuppence:", tieneTuppence);
    
    return tieneTommy && tieneTuppence;
  };

  // Helper para convertir id_front a numero si es posible
  const parseFrontendId = (val) => {
    if (val === undefined || val === null) return null;
    const n = Number(val);
    return Number.isNaN(n) ? null : n;
  };

  // Normalizador de estado de partida
  const applyGameState = (payload) => {
    if (!payload || typeof payload !== "object") return;

    // jugadores
    setPlayers(Array.isArray(payload?.jugadores) ? payload.jugadores : []);

    // mazo regular
    if (payload?.mazoRegular && payload.mazoRegular.cantidad !== undefined) {
      setMazoRegular(payload.mazoRegular.cantidad);
    }
    if (payload?.mazoDraft && Array.isArray(payload.mazoDraft)) {
      const normalized = payload.mazoDraft.map((c) => {
        const cartaNormalizada = {
          idFrontend: c?.id_front ?? c?.idFrontend ?? c?.idFront ?? null,
          idBackend: c?.id ?? c?.idBackend ?? c?.id_backend ?? null,
          posicion: c?.posicion ?? null, // Preservar la posición del backend
          ...c,
        };
        return cartaNormalizada;
      });
      // Ordenar por posición para asegurar que siempre estén en orden 0, 1, 2
      const sorted = normalized.sort(
        (a, b) => (a.posicion ?? 0) - (b.posicion ?? 0),
      );
      setCartaDrafts(sorted);
    }
    // mazo descarte
    if (Array.isArray(payload?.mazoDescarte)) {
      const normalized = payload.mazoDescarte.map((c) => ({
        idFrontend: c?.id_front ?? c?.idFrontend ?? c?.idFront ?? null,
        idBackend:
          c?.id ?? c?.idBackend ?? c?.id_backend ?? c?.carta_id ?? null,
        ...c,
      }));
      // Invertir el array para que la última carta descartada aparezca primero
      setMazoDescarte(normalized.reverse());
      setContadorDescarte(normalized.length);
    } else if (typeof payload?.mazoDescarte === "number") {
      setMazoDescarte([]); // Array vacío para cartas reales
      setContadorDescarte(payload.mazoDescarte); // Contador separado
    }

    const uidNum = Number(getUserId());
    // turno actual
    setTurnoActual(payload.turnoActual);
    setHaDescartadoEnTurno(
      payload.turnos?.[uidNum]?.descarte_realizado || false,
    );
    setHaJugadoEventoEnTurno(false);
    setHaJugadoSetEnTurno(false);
    setHaRobadoEnTurno(false);

    // mano del usuario
    const eventos = payload?.eventos || {};
    const userEventos =
      eventos[uidNum] ?? eventos[String(uidNum)] ?? eventos[getUserId()];
    if (userEventos) {
      const cartas = userEventos
        .map((carta) => {
          if (typeof carta === "number") {
            return { idFrontend: null, idBackend: carta };
          }
          return {
            idFrontend: parseFrontendId(
              carta.id_front ?? carta.idFrontend ?? carta.idFront ?? null,
            ),
            idBackend: carta.id ?? carta.idBackend ?? carta.id_backend ?? null,
          };
        })
        .filter(Boolean);

      // Filtrar las cartas que ya están en sets jugados
      const setsJugados = payload?.setsJugados || {};
      const misSets = setsJugados[uidNum] ?? setsJugados[String(uidNum)] ?? [];
      const cartasEnSets = new Set();

      // Recolectar todos los IDs de cartas que están en sets
      misSets.forEach((setArray) => {
        if (Array.isArray(setArray)) {
          setArray.forEach((carta) => {
            const idBackend =
              carta?.id ?? carta?.idBackend ?? carta?.id_backend ?? carta;
            if (idBackend) {
              cartasEnSets.add(idBackend);
            }
          });
        }
      });

      // Filtrar cartas que no están en sets
      const cartasFiltradas = cartas.filter(
        (carta) => !cartasEnSets.has(carta.idBackend),
      );

      // ⚠️ NO actualizar la mano si estamos en medio de Dead Card Folly
      // esperando a que evento_dead_card_folly actualice todo
      if (esperandoPasarCartaDCF || yaPaseMiCartaDCF) {
        // No actualizar la mano durante Dead Card Folly
      } else {
        setPlayerHand(cartasFiltradas);
      }
    }

    // secretos
    if (payload?.secretos) {
      const todosSecretos = {};
      Object.keys(payload.secretos).forEach((jugadorId) => {
        todosSecretos[jugadorId] = payload.secretos[jugadorId].map(
          (secreto) => ({
            id: secreto.id_front || secreto.id,
            idBackend: secreto.id,
            estado: secreto.estado,
          }),
        );
      });
      setAllSecrets(todosSecretos);
    } else {
      setAllSecrets({});
    }

    // sets jugados (cargar desde el backend si están disponibles)
    if (payload?.setsJugados) {
      const todosSets = {};
      Object.keys(payload.setsJugados).forEach((jugadorId) => {
        let setsDelJugador = payload.setsJugados[jugadorId] || [];

        // Asegurar que siempre sea un array (si viene como objeto, convertir a array de valores)
        if (!Array.isArray(setsDelJugador)) {
          setsDelJugador = Object.values(setsDelJugador);
        }

        // Los sets ya vienen como arrays de cartas desde el backend
        todosSets[jugadorId] = setsDelJugador;
      });
      setAllPlayerSets(todosSets);
    }
  };

  // Cargar los jugadores y datos de la partida
  useEffect(() => {
    if (!idGame) return;

    // Conectar al WS con la partida actual
    try {
      WS.connect(idGame);
    } catch (err) {
      console.error("[useEffect] WS connect failed:", err);
    }

    (async () => {
      try {
        const details = await getGameDetails(idGame);
        applyGameState(details);
      } catch (e) {
        console.error(
          "[useEffect] No se pudieron cargar los detalles de la partida:",
          e,
        );
      }
    })();

    // Handlers para eventos WebSocket
    const handleGameState = (payload) => {
      applyGameState(payload);
    };

    const handleMazoActualizado = (payload) => {
      if (payload && payload.cantidadCartas !== undefined) {
        setMazoRegular(payload.cantidadCartas);
      }
    };

    const handleProcesarDescarte = (payload) => {
      try {
        if (payload.cantidadCartas <= 1) {
          setWinnerRequested(true);
          handleEndGame();
        }

        const userIdNum = Number(getUserId());
        const payloadJugadorId =
          payload.jugadorId ?? payload.jugador_id ?? null;
        const payloadJugadorIdNum =
          payloadJugadorId != null ? Number(payloadJugadorId) : null;

        if (payload.cantidadCartas !== undefined) {
          // Actualizar contador
          setContadorDescarte(payload.cantidadCartas);

          // Agregar carta real si existe
          if (payload.carta) {
            const cartaObj = payload.carta;
            const normalizedCarta = {
              idFrontend: parseFrontendId(
                cartaObj.id_front ??
                  cartaObj.idFrontend ??
                  cartaObj.idFront ??
                  null,
              ),
              idBackend:
                cartaObj.id ??
                cartaObj.idBackend ??
                cartaObj.id_backend ??
                cartaObj.carta_id ??
                null,
              ...cartaObj,
            };
            setMazoDescarte((prev) => [...prev, normalizedCarta]);
          }
        }

        // Actualizar la mano del jugador si es quien esta descartando
        if (payloadJugadorIdNum !== null && userIdNum === payloadJugadorIdNum) {
          const cartas = payload.cartas || [];
          const cartasFront = payload.cartasFront || [];

          let cartasNormalizadas = [];
          if (Array.isArray(cartasFront) && cartasFront.length > 0) {
            // Mapeamos las cartas entrantes usando el diccionario y el id_front de cada carta
            cartasNormalizadas = cartas.map((c, idx) => {
              const rawFront = cartasFront[idx] ?? null;
              const idFrontend = parseFrontendId(rawFront);
              const idBackend =
                typeof c === "number" ? c : (c?.id ?? c?.idBackend ?? null);
              return {
                idFrontend,
                idBackend,
                ...(typeof c === "object" ? c : {}),
              };
            });
          } else {
            cartasNormalizadas = cartas.map((c) => {
              if (typeof c === "number") {
                return { idFrontend: null, idBackend: c };
              }
              return {
                idFrontend: parseFrontendId(
                  c.id_front ?? c.idFrontend ?? c.idFront ?? null,
                ),
                idBackend: c.id ?? c.idBackend ?? c.id_backend ?? null,
                ...c,
              };
            });
          }

          // Por las dudas que quede alguna carta indefinida o null la sacamos para que no joda
          cartasNormalizadas = cartasNormalizadas.filter(
            (x) => x && x.idBackend !== null && x.idBackend !== undefined,
          );
          setPlayerHand(cartasNormalizadas);

          // Clear selected cards since they were discarded
          setCartasSeleccionadas([]);
        }
      } catch (err) {
        console.error("handleProcesarDescarte Error", err);
      }
    };

    const handleTurn = async (payload) => {
      // El backend envía { partidaId, jugadorId, jugadorNombre }
      // jugadorId es el ID del jugador que tiene el nuevo turno
      const nuevoTurno = payload?.jugadorId;

      if (nuevoTurno !== null && nuevoTurno !== undefined) {
        setTurnoActual(nuevoTurno);
        
        // Resetear los flags para el nuevo turno
        setHaDescartadoEnTurno(false);
        setHaJugadoEventoEnTurno(false);
        setHaJugadoSetEnTurno(false);
        setHaRobadoEnTurno(false);
        // Limpiar selección de cartas
        setCartasSeleccionadas([]);
        // Resetear a fase DESCARTAR
        setFaseActual("DESCARTAR");
      } else {
        console.error(
          "[WS handleTurn] ❌ ERROR: nuevoTurno es null o undefined!",
          payload,
        );
      }
    };

    // Handler para cuando se juega un set
    const handleSetJugado = (payload) => {
      try {
        setHandlerCount((prev) => prev + 1);

        const userIdNum = Number(getUserId());
        const payloadJugadorId =
          payload.jugadorId ?? payload.jugador_id ?? null;
        const payloadJugadorIdNum =
          payloadJugadorId != null ? Number(payloadJugadorId) : null;
        const cartasJugadas = payload.cartasJugadas || [];

        // Crear un ID único para este set
        const setId = cartasJugadas[0]?.set;
        const setUniqueId = `${payloadJugadorIdNum}-${setId}`;

        // Verificar si ya procesamos este set
        if (lastProcessedSetId === setUniqueId) {
          return;
        }

        // Marcar como procesado
        setLastProcessedSetId(setUniqueId);

        // Agregar el set a la visualización del jugador
        if (payloadJugadorIdNum !== null && cartasJugadas.length > 0) {
          setAllPlayerSets((prev) => {
            const newSets = { ...prev };

            // Inicializar si no existe
            if (!newSets[payloadJugadorIdNum]) {
              newSets[payloadJugadorIdNum] = [];
            }

            // Asegurar que sea un array (convertir objeto a array si es necesario)
            if (!Array.isArray(newSets[payloadJugadorIdNum])) {
              newSets[payloadJugadorIdNum] = Object.values(
                newSets[payloadJugadorIdNum],
              );
            }

            // Normalizar a array si es un objeto (puede venir como objeto de objetos)
            let setsJugador = newSets[payloadJugadorIdNum];
            if (!Array.isArray(setsJugador)) {
              // Convertir objeto { setId: [cartas] } a array [[cartas]]
              setsJugador = Object.values(setsJugador);
              newSets[payloadJugadorIdNum] = setsJugador;
            }

            // Verificar si este set ya existe en el estado (por setId)
            const yaExiste = setsJugador.some(
              (existingSet) =>
                Array.isArray(existingSet) &&
                existingSet.some((carta) => carta.set === setId),
            );

            if (yaExiste) {
              return prev; // No cambiar el estado
            }

            newSets[payloadJugadorIdNum].push(cartasJugadas);
            return newSets;
          });
        }

        // Si el set fue jugado por el usuario actual, actualizar su mano filtrando las cartas jugadas
        if (payloadJugadorIdNum !== null && userIdNum === payloadJugadorIdNum) {

          // Filtrar las cartas jugadas de la mano actual
          setPlayerHand((prev) => {
            const cartasJugadasIds = cartasJugadas.map((c) => c.id);
            const nuevaMano = prev.filter(
              (carta) => !cartasJugadasIds.includes(carta.idBackend),
            );
            return nuevaMano;
          });

          showNotification("¡Set jugado exitosamente!", "success");
        }
      } catch (err) {
        console.error("handleSetJugado Error", err);
      }
    };

    const handleSetActualizados = (payload) => {
      // Recargar detalles de la partida para obtener sets actualizados
      if (payload?.partidaId === parseInt(idGame)) {
        try {
          getGameDetails(idGame).then((gameDetails) => {
            if (gameDetails?.setsJugados) {
              // Normalizar sets para asegurar que sean arrays
              const setsNormalizados = {};
              Object.keys(gameDetails.setsJugados).forEach((jugadorId) => {
                let sets = gameDetails.setsJugados[jugadorId] || [];
                if (!Array.isArray(sets)) {
                  sets = Object.values(sets);
                }
                setsNormalizados[jugadorId] = sets;
              });
              setAllPlayerSets(setsNormalizados);
            }
          });
        } catch (err) {
          console.error("Error recargando sets por WebSocket:", err);
        }
      }
    };

    const handleTodosLosSetsActualizados = (payload) => {
      if (payload?.partidaId === parseInt(idGame) && payload?.sets) {
        // Normalizar sets para asegurar que sean arrays
        const setsNormalizados = {};
        Object.keys(payload.sets).forEach((jugadorId) => {
          let sets = payload.sets[jugadorId] || [];
          if (!Array.isArray(sets)) {
            sets = Object.values(sets);
          }
          setsNormalizados[jugadorId] = sets;
        });

        // Este evento tiene autoridad completa sobre el estado de sets
        // Reemplaza completamente el estado actual
        setAllPlayerSets(setsNormalizados);

        // Resetear el ID del último set procesado para evitar conflictos
        setLastProcessedSetId(null);
      }
    };

    const handleDetectivePorAgregar = async (payload) => {
      // Mostrar notificación a todos los jugadores
      const userIdNum = Number(getUserId());
      const jugadorIdNum = Number(payload.jugadorId);

      console.log("[WS detective_por_agregar] ===== DEBUG NSF =====");
      console.log("[WS detective_por_agregar] getUserId():", getUserId(), "tipo:", typeof getUserId());
      console.log("[WS detective_por_agregar] payload.jugadorId:", payload.jugadorId, "tipo:", typeof payload.jugadorId);
      console.log("[WS detective_por_agregar] userIdNum:", userIdNum, "tipo:", typeof userIdNum);
      console.log("[WS detective_por_agregar] jugadorIdNum:", jugadorIdNum, "tipo:", typeof jugadorIdNum);
      console.log("[WS detective_por_agregar] userIdNum !== jugadorIdNum:", userIdNum !== jugadorIdNum);

      // CRÍTICO: Solo activar NSF para OTROS jugadores, NO para quien agregó el detective
      if (userIdNum !== jugadorIdNum) {
        console.log("[WS detective_por_agregar] ✅ Entrando en bloque OTROS JUGADORES");
        // Otros jugadores ven la notificación de que alguien está agregando
        const jugador = players.find((p) => p.id === jugadorIdNum);
        const nombreJugador = jugador?.nombre || `Jugador ${jugadorIdNum}`;

        // CRÍTICO: Usar setPlayerHand con callback para obtener el estado MÁS RECIENTE
        setPlayerHand(currentHand => {
          console.log("[WS detective_por_agregar] currentHand.length:", currentHand.length);
          
          // Verificar si tengo NSF DIRECTAMENTE en la mano actual
          const nsfCardsEnMano = currentHand.filter(c => c.idFrontend === 19);
          console.log("[WS detective_por_agregar] NSF cards encontradas:", nsfCardsEnMano.length);
          
          if (nsfCardsEnMano.length > 0) {
            // Tengo NSF - Activar toolkit
            setCartasNSFDisponibles(nsfCardsEnMano);
            setTengoNSF(true);
            
            setAccionACancelar({
              tipo: 'detective',
              jugadorId: jugadorIdNum,
              objetivoId: payload.objetivoId,
              setId: payload.setId,
            });
            
            setEsperandoUsarNSF(true);
            
            showNotification(
              `⚡ ${nombreJugador} está agregando un detective! Tienes ${nsfCardsEnMano.length} NOT SO FAST disponible(s) (5s)`,
              "warning",
            );
            
            // Timer de 5 segundos
            const timerId = setTimeout(() => {
              setEsperandoUsarNSF(false);
              setAccionACancelar(null);
              closeNotification();
            }, 5000);
            
            setNsfTimerId(timerId);
          } else {
            // No tengo NSF, solo mostrar notificación normal
            showNotification(
              `${nombreJugador} está agregando un detective al set.`,
              "warning",
            );
          }
          
          // IMPORTANTE: Retornar la mano sin cambios
          return currentHand;
        });
      } else {
        // El jugador que está agregando ve una confirmación
        console.log("[WS detective_por_agregar] ❌ Entrando en bloque YO JUGUÉ");
        showNotification("Detective enviado. Esperando 5 segundos...", "info");
      }
    };

    const handleSetPorJugar = async (payload) => {
      console.log("[WS set_por_jugar] ===== INICIO HANDLER =====");
      console.log("[WS set_por_jugar] Payload completo:", payload);
      
      const userIdNum = Number(getUserId());
      const jugadorIdNum = Number(payload.jugadorId);

      console.log("[WS set_por_jugar] ===== DEBUG NSF =====");
      console.log("[WS set_por_jugar] getUserId():", getUserId(), "tipo:", typeof getUserId());
      console.log("[WS set_por_jugar] payload.jugadorId:", payload.jugadorId, "tipo:", typeof payload.jugadorId);
      console.log("[WS set_por_jugar] userIdNum:", userIdNum, "tipo:", typeof userIdNum);
      console.log("[WS set_por_jugar] jugadorIdNum:", jugadorIdNum, "tipo:", typeof jugadorIdNum);
      console.log("[WS set_por_jugar] userIdNum !== jugadorIdNum:", userIdNum !== jugadorIdNum);
      console.log("[WS set_por_jugar] playerHand.length:", playerHand.length);

      setJugadorQueJugoSet(jugadorIdNum);

      try {
        const setsActualizados = await verTodosLosSets(idGame);
        if (setsActualizados && typeof setsActualizados === "object") {
          setAllPlayerSets(setsActualizados);
        }
      } catch (err) {
        console.error("[WS] Error al obtener sets desde set_por_jugar:", err);
      }

      // Mostrar notificaciones
      if (userIdNum !== jugadorIdNum) {
        console.log("[WS set_por_jugar] ✅ Entrando en bloque OTROS JUGADORES");
        
        // ⛔ VERIFICAR SI ES UN SET DE HERMANOS BERESFORD - NO SE PUEDE CANCELAR
        if (esSetDeHermanosBeresford(payload.cartasJugadas)) {
          console.log("[WS set_por_jugar] ⛔ Set de Hermanos Beresford - NO se puede cancelar con NSF");
          // Mostrar notificación pero NO activar NSF
          const jugador = players.find((p) => p.id === jugadorIdNum);
          const nombreJugador = jugador?.nombre || `Jugador ${jugadorIdNum}`;
          showNotification(
            `${nombreJugador} jugó un set de Hermanos Beresford (no se puede cancelar).`,
            "info",
          );
          return; // No activar NSF
        }
        
        // Otros jugadores ven la notificación de que alguien está jugando un set
        const jugador = players.find((p) => p.id === jugadorIdNum);
        const nombreJugador = jugador?.nombre || `Jugador ${jugadorIdNum}`;

        // CRÍTICO: Usar setPlayerHand con callback para obtener el estado MÁS RECIENTE
        setPlayerHand(currentHand => {
          console.log("[WS set_por_jugar] currentHand.length:", currentHand.length);
          
          // Verificar si tengo NSF DIRECTAMENTE en la mano actual
          const nsfCardsEnMano = currentHand.filter(c => c.idFrontend === 19);
          console.log("[WS set_por_jugar] NSF cards encontradas:", nsfCardsEnMano.length);
          
          if (nsfCardsEnMano.length > 0) {
            // Tengo NSF - Activar toolkit
            setCartasNSFDisponibles(nsfCardsEnMano);
            setTengoNSF(true);
            
            setAccionACancelar({
              tipo: 'set',
              jugadorId: jugadorIdNum,
              setId: payload.setId,  // ✅ Ahora usamos el setId del payload
              objetivoId: payload.objetivoId,
            });
            
            setEsperandoUsarNSF(true);
            
            showNotification(
              `⚡ ${nombreJugador} está jugando un set! Tienes ${nsfCardsEnMano.length} NOT SO FAST disponible(s) (5s)`,
              "warning",
            );
            
            // Timer de 5 segundos
            const timerId = setTimeout(() => {
              setEsperandoUsarNSF(false);
              setAccionACancelar(null);
              closeNotification();
            }, 5000);
            
            setNsfTimerId(timerId);
          } else {
            // No tengo NSF, solo mostrar notificación normal
            showNotification(
              `${nombreJugador} está jugando un set.`,
              "warning",
            );
          }
          
          // IMPORTANTE: Retornar la mano sin cambios
          return currentHand;
        });
      } else {
        // El jugador que está jugando ve una confirmación
        console.log("[WS set_por_jugar] ❌ Entrando en bloque YO JUGUÉ");
        showNotification("Set enviado. Esperando 5 segundos...", "info");
      }
    };

    // Handler para WebSocket carta_por_jugar (eventos)
    const handleCartaPorJugar = async (payload) => {
      const userIdNum = Number(getUserId());
      const jugadorIdNum = Number(payload.jugadorId);

      console.log("[WS carta_por_jugar] ===== DEBUG NSF =====");
      console.log("[WS carta_por_jugar] getUserId():", getUserId(), "tipo:", typeof getUserId());
      console.log("[WS carta_por_jugar] payload.jugadorId:", payload.jugadorId, "tipo:", typeof payload.jugadorId);
      console.log("[WS carta_por_jugar] userIdNum:", userIdNum, "tipo:", typeof userIdNum);
      console.log("[WS carta_por_jugar] jugadorIdNum:", jugadorIdNum, "tipo:", typeof jugadorIdNum);
      console.log("[WS carta_por_jugar] userIdNum !== jugadorIdNum:", userIdNum !== jugadorIdNum);
      console.log("[WS carta_por_jugar] userIdNum === jugadorIdNum:", userIdNum === jugadorIdNum);

      // CRÍTICO: Solo activar NSF para OTROS jugadores, NO para quien jugó la carta
      if (userIdNum !== jugadorIdNum) {
        console.log("[WS carta_por_jugar] ✅ Entrando en bloque OTROS JUGADORES (correcto)");
        
        // ⛔ VERIFICAR SI ES CARDS OFF THE TABLE (ID 10) - NO SE PUEDE CANCELAR
        const cartaIdFrontend = payload.carta?.idFrontend || payload.carta?.id_front;
        if (cartaIdFrontend === 10) {
          console.log("[WS carta_por_jugar] ⛔ Cards Off The Table - NO se puede cancelar con NSF");
          return; // No activar NSF para este evento
        }
        
        // Otros jugadores ven que alguien está jugando un evento
        const jugador = players.find((p) => p.id === jugadorIdNum);
        const nombreJugador = jugador?.nombre || `Jugador ${jugadorIdNum}`;
        const nombreCarta = payload.carta?.nombre || "un evento";

        // CRÍTICO: Usar setPlayerHand con callback para obtener el estado MÁS RECIENTE
        setPlayerHand(currentHand => {
          console.log("[WS carta_por_jugar] currentHand.length:", currentHand.length);
          
          // Verificar si tengo NSF DIRECTAMENTE en la mano actual
          const nsfCardsEnMano = currentHand.filter(c => c.idFrontend === 19);
          console.log("[WS carta_por_jugar] NSF cards encontradas:", nsfCardsEnMano.length);
          
          if (nsfCardsEnMano.length > 0) {
            // Tengo NSF - Activar toolkit
            setCartasNSFDisponibles(nsfCardsEnMano);
            setTengoNSF(true);
            
            setAccionACancelar({
              tipo: 'evento',
              jugadorId: jugadorIdNum,
              cartaId: payload.carta?.id,
              objetivoId: payload.objetivoId,
            });
            
            setEsperandoUsarNSF(true);
            
            showNotification(
              `⚡ ${nombreJugador} está jugando ${nombreCarta}! Tienes ${nsfCardsEnMano.length} NOT SO FAST disponible(s) (5s)`,
              "warning",
            );
            
            // Timer de 5 segundos
            const timerId = setTimeout(() => {
              setEsperandoUsarNSF(false);
              setAccionACancelar(null);
              closeNotification();
            }, 5000);
            
            setNsfTimerId(timerId);
          } else {
            // No tengo NSF, solo mostrar notificación normal
            showNotification(
              `${nombreJugador} está jugando ${nombreCarta}.`,
              "info",
            );
          }
          
          // IMPORTANTE: Retornar la mano sin cambios
          return currentHand;
        });
      } else {
        // El jugador que está jugando ve una confirmación
        console.log("[WS carta_por_jugar] ❌ Entrando en bloque YO JUGUÉ (no debería activar NSF)");
        const nombreCarta = payload.carta?.nombre || "evento";
        showNotification(`${nombreCarta} enviada. Esperando 5 segundos...`, "info");
      }
    };

    const handleSecretoModificado = async (payload) => {
      const secreto = payload.secreto;
      if (!secreto) {
        console.error("secreto_modificado sin datos de secreto");
        return;
      }

      const nuevoJugadorId = Number(secreto.jugador);
      const estadoSecreto = Number(secreto.estado);
      const secretoIdBackend = Number(secreto.id);
      const idFrontSecreto = Number(secreto.id_front);

      // ✅ VERIFICAR SI SE REVELÓ EL SECRETO DEL ASESINO (id_front = 18)
      if (estadoSecreto === 0 && idFrontSecreto === 18) {
        showNotification(
          "¡Se ha revelado el secreto del asesino! El asesino pierde.",
          "info",
        );
        
        // Llamar al endpoint de ganador
        if (!winnerRequested) {
          setWinnerRequested(true);
          try {
            await ganador(idGame);
          } catch (err) {
            console.error("Error al determinar ganador después de revelar asesino:", err);
          }
        }
      }

      // Actualizar el secreto en el estado allSecrets
      setAllSecrets((prevSecrets) => {
        const nuevosSecretos = { ...prevSecrets };

        // Buscar el secreto en TODOS los jugadores (puede haber cambiado de dueño)
        let jugadorAnterior = null;
        let secretoEncontrado = null;

        for (const jugadorId in nuevosSecretos) {
          const secretos = nuevosSecretos[jugadorId];
          const indice = secretos.findIndex(
            (s) => s.idBackend === secretoIdBackend,
          );

          if (indice !== -1) {
            jugadorAnterior = Number(jugadorId);
            secretoEncontrado = secretos[indice];

            // Si el jugador cambió, remover del jugador anterior
            if (jugadorAnterior !== nuevoJugadorId) {
              nuevosSecretos[jugadorId].splice(indice, 1);
            }
            break;
          }
        }

        // Asegurarse de que existe la lista de secretos del nuevo jugador
        if (!nuevosSecretos[nuevoJugadorId]) {
          nuevosSecretos[nuevoJugadorId] = [];
        }

        // Si cambió de jugador O no se encontró, agregarlo al nuevo jugador
        if (jugadorAnterior !== nuevoJugadorId || !secretoEncontrado) {
          const secretoActualizado = secretoEncontrado
            ? {
                ...secretoEncontrado,
                estado: estadoSecreto,
                jugador: nuevoJugadorId,
              }
            : {
                idBackend: secretoIdBackend,
                jugador: nuevoJugadorId,
                estado: estadoSecreto,
                id: secreto.id_front || secretoIdBackend, // id_front si existe
                ...secreto,
              };

          nuevosSecretos[nuevoJugadorId].push(secretoActualizado);
        } else {
          // Mismo jugador, solo actualizar estado
          const indice = nuevosSecretos[nuevoJugadorId].findIndex(
            (s) => s.idBackend === secretoIdBackend,
          );
          if (indice !== -1) {
            nuevosSecretos[nuevoJugadorId][indice] = {
              ...nuevosSecretos[nuevoJugadorId][indice],
              estado: estadoSecreto,
            };
          }
        }

        return nuevosSecretos;
      });

      // Recargar sets para reflejar cambios visuales
      try {
        const setsActualizados = await verTodosLosSets(idGame);
        if (setsActualizados && typeof setsActualizados === "object") {
          setAllPlayerSets(setsActualizados);
        }
      } catch (err) {
        console.error(
          "[WS] Error al recargar sets después de secreto_modificado:",
          err,
        );
      }

      // Notificación - ✅ ACTUALIZADO: estado 0 = revelado, estado 9 = oculto
      const jugador = players.find((p) => p.id === nuevoJugadorId);
      const nombreJugador = jugador?.nombre || `Jugador ${nuevoJugadorId}`;
      const accion = estadoSecreto === 0 ? "revelado" : "ocultado";

      showNotification(
        `Se ha ${accion} un secreto de ${nombreJugador}.`,
        "info",
      );
    };

    const handleJugadorElegidoParaRevelarSecreto = (payload) => {
      try {
        const userIdNum = Number(userId);
        const jugadorObjetivoId = Number(
          payload.jugador_objetivo_id || payload.jugadorId,
        );

        if (payload.cartasJugadas && Array.isArray(payload.cartasJugadas)) {
          setSetActivoParaRevelacion(payload.cartasJugadas);
        }

        if (!jugadorObjetivoId || isNaN(jugadorObjetivoId)) {
          console.error("jugadorObjetivoId inválido:", jugadorObjetivoId);
          showNotification(
            "Error: No se pudo identificar al jugador objetivo.",
            "error",
          );
          return;
        }

        if (userIdNum === jugadorObjetivoId) {
          setEsperandoRevelarSecreto(true);
          setJugadorObjetivoRevelacion(jugadorObjetivoId);

          showNotification(
            "Debes elegir un secreto tuyo para revelar.",
            "info",
          );
        } else {
          const jugadorObjetivo = players.find(
            (p) => p.id === jugadorObjetivoId,
          );
          const nombreJugadorObjetivo =
            jugadorObjetivo?.nombre || `Jugador ${jugadorObjetivoId}`;

          showNotification(
            `${nombreJugadorObjetivo} debe elegir un secreto para revelar.`,
            "info",
          );
        }
      } catch (error) {
        console.error(
          "Error en handleJugadorElegidoParaRevelarSecreto:",
          error,
        );
      }
    };

    const handleSecretoYPartidaActualizada = (payload) => {
      const userIdNum = Number(getUserId());
      const jugadorIdNum = Number(payload.jugadorId);

      // ✅ NUEVO: Actualizar secreto si viene en el payload
      if (payload?.secreto) {
        const secreto = payload.secreto;
        const nuevoJugadorId = Number(secreto.jugador);
        const estadoSecreto = Number(secreto.estado);
        const secretoIdBackend = Number(secreto.id);

        setAllSecrets((prevSecrets) => {
          const nuevosSecretos = { ...prevSecrets };

          // Buscar y actualizar el secreto
          let encontrado = false;
          for (const jugadorId in nuevosSecretos) {
            const secretos = nuevosSecretos[jugadorId];
            const indice = secretos.findIndex(
              (s) => s.idBackend === secretoIdBackend,
            );

            if (indice !== -1) {
              // Actualizar el secreto existente
              nuevosSecretos[jugadorId][indice] = {
                ...nuevosSecretos[jugadorId][indice],
                estado: estadoSecreto,
                jugador: nuevoJugadorId,
              };
              encontrado = true;
              break;
            }
          }

          // Si no se encontró, agregarlo al jugador correspondiente
          if (!encontrado) {
            if (!nuevosSecretos[nuevoJugadorId]) {
              nuevosSecretos[nuevoJugadorId] = [];
            }
            nuevosSecretos[nuevoJugadorId].push({
              idBackend: secretoIdBackend,
              jugador: nuevoJugadorId,
              estado: estadoSecreto,
              id: secreto.id_front || secretoIdBackend,
              ...secreto,
            });
          }

          return nuevosSecretos;
        });

        // Notificación
        const jugador = players.find((p) => p.id === nuevoJugadorId);
        const nombreJugador = jugador?.nombre || `Jugador ${nuevoJugadorId}`;
        const accion = estadoSecreto === 0 ? "revelado" : "ocultado";
        showNotification(
          `Se ha ${accion} un secreto de ${nombreJugador}.`,
          "info",
        );
      }

      // Actualizar sets (backend envía "sets_actualizados" en este caso)
      if (payload?.sets_actualizados) {
        const setsNormalizados = {};
        Object.keys(payload.sets_actualizados).forEach((jugadorId) => {
          let sets = payload.sets_actualizados[jugadorId] || [];
          if (!Array.isArray(sets)) {
            sets = Object.values(sets);
          }
          setsNormalizados[jugadorId] = sets;
        });
        setAllPlayerSets(setsNormalizados);
      }

      // Actualizar mano del jugador si es el usuario actual
      if (userIdNum === jugadorIdNum && payload?.mano_jugador) {
        const cartasNormalizadas = payload.mano_jugador
          .map((c) => ({
            idFrontend: parseFrontendId(c.id_front ?? c.idFrontend ?? null),
            idBackend: c.id ?? c.idBackend ?? null,
            ...c,
          }))
          .filter((c) => c.idBackend !== null);

        setPlayerHand(cartasNormalizadas);
      }

      // Marcar que se jugó un set en este turno
      if (userIdNum === jugadorIdNum) {
        setHaJugadoSetEnTurno(true);
        showNotification("Detective agregado al set exitosamente!", "success");
      }
    };

    const handleObjetivoYPartidaActualizada = async (payload) => {
      const userIdNum = Number(getUserId());
      const jugadorIdNum = Number(payload.jugadorId ?? 0);
      const objetivoIdNum = Number(payload.objetivoId ?? 0);

      // Guardar las cartas del set si vienen en el payload
      if (payload?.cartasJugadas && Array.isArray(payload.cartasJugadas)) {
        setSetActivoParaRevelacion(payload.cartasJugadas);
      }

      // ✅ NUEVO: Actualizar secreto si viene en el payload (para webso=2 si el backend decide ejecutar el efecto)
      if (payload?.secreto) {
        const secreto = payload.secreto;
        const nuevoJugadorId = Number(secreto.jugador);
        const estadoSecreto = Number(secreto.estado);
        const secretoIdBackend = Number(secreto.id);
        const idFrontSecreto = Number(secreto.id_front);

        // ✅ VERIFICAR SI SE REVELÓ EL SECRETO DEL ASESINO (id_front = 18)
        if (estadoSecreto === 0 && idFrontSecreto === 18) {
          showNotification(
            "¡Se ha revelado el secreto del asesino! El asesino pierde.",
            "info",
          );
          
          // Llamar al endpoint de ganador
          if (!winnerRequested) {
            setWinnerRequested(true);
            try {
              await ganador(idGame);
            } catch (err) {
              console.error("Error al determinar ganador después de revelar asesino:", err);
            }
          }
        }

        setAllSecrets((prevSecrets) => {
          const nuevosSecretos = { ...prevSecrets };

          // Buscar y actualizar el secreto
          let encontrado = false;
          for (const jugadorId in nuevosSecretos) {
            const secretos = nuevosSecretos[jugadorId];
            const indice = secretos.findIndex(
              (s) => s.idBackend === secretoIdBackend,
            );

            if (indice !== -1) {
              // Actualizar el secreto existente
              nuevosSecretos[jugadorId][indice] = {
                ...nuevosSecretos[jugadorId][indice],
                estado: estadoSecreto,
                jugador: nuevoJugadorId,
              };
              encontrado = true;
              break;
            }
          }

          // Si no se encontró, agregarlo al jugador correspondiente
          if (!encontrado) {
            if (!nuevosSecretos[nuevoJugadorId]) {
              nuevosSecretos[nuevoJugadorId] = [];
            }
            nuevosSecretos[nuevoJugadorId].push({
              idBackend: secretoIdBackend,
              jugador: nuevoJugadorId,
              estado: estadoSecreto,
              id: secreto.id_front || secretoIdBackend,
              ...secreto,
            });
          }

          return nuevosSecretos;
        });

        // Notificación
        const jugador = players.find((p) => p.id === nuevoJugadorId);
        const nombreJugador = jugador?.nombre || `Jugador ${nuevoJugadorId}`;
        const accion = estadoSecreto === 0 ? "revelado" : "ocultado";
        showNotification(
          `Se ha ${accion} un secreto de ${nombreJugador}.`,
          "info",
        );
      }

      // Actualizar sets (backend envía "sets" en este caso)
      if (payload?.sets) {
        const setsNormalizados = {};
        Object.keys(payload.sets).forEach((jugadorId) => {
          let sets = payload.sets[jugadorId] || [];
          if (!Array.isArray(sets)) {
            sets = Object.values(sets);
          }
          setsNormalizados[jugadorId] = sets;
        });
        setAllPlayerSets(setsNormalizados);
      }

      // Actualizar mano del jugador si es el usuario actual
      if (userIdNum === jugadorIdNum && payload?.mano_jugador) {
        const cartasNormalizadas = payload.mano_jugador
          .map((c) => ({
            idFrontend: parseFrontendId(c.id_front ?? c.idFrontend ?? null),
            idBackend: c.id ?? c.idBackend ?? null,
            ...c,
          }))
          .filter((c) => c.idBackend !== null);

        setPlayerHand(cartasNormalizadas);
      }

      // Marcar que se jugó un set
      if (userIdNum === jugadorIdNum) {
        setHaJugadoSetEnTurno(true);
        showNotification("Detective agregado al set exitosamente!", "success");
      }

      // ✅ ACTIVAR ESTADO: El jugador objetivo debe revelar un secreto
      if (userIdNum === objetivoIdNum) {
        setEsperandoRevelarSecreto(true);
        setJugadorObjetivoRevelacion(objetivoIdNum);
        showNotification(
          "Debes elegir un secreto tuyo para revelar.",
          "info",
        );
      } else if (objetivoIdNum) {
        // Mostrar notificación a los otros jugadores
        const jugadorObjetivo = players.find((p) => p.id === objetivoIdNum);
        const nombreJugadorObjetivo =
          jugadorObjetivo?.nombre || `Jugador ${objetivoIdNum}`;
        showNotification(
          `${nombreJugadorObjetivo} debe elegir un secreto para revelar.`,
          "info",
        );
      }
    };
    const handleDraftActualizado = (payload) => {
      // ✅ FIX: Solo terminar partida cuando draft está VACÍO (0 cartas), no cuando tiene 1
      if (payload.cantidad === 0) {
        setWinnerRequested(true);
        handleEndGame();
      }

      // El backend envía { partidaId, cantidad, draft: [...] }
      if (payload.cantidad !== undefined) {
          // Actualizar contador
          setMazoRegular(payload.cantidad);
      }
      if (
        payload?.partidaId === parseInt(idGame) &&
        Array.isArray(payload?.draft)
      ) {
        const normalized = payload.draft.map((c) => {
          const cartaNormalizada = {
            idFrontend: c?.id_front ?? c?.idFrontend ?? c?.idFront ?? null,
            idBackend: c?.id ?? c?.idBackend ?? c?.id_backend ?? null,
            posicion: c?.posicion ?? null, // Preservar la posición del backend
            ...c,
          };
          return cartaNormalizada;
        });

        // Ordenar por posición para asegurar que siempre estén en orden 0, 1, 2
        const sorted = normalized.sort(
          (a, b) => (a.posicion ?? 0) - (b.posicion ?? 0),
        );

        setCartaDrafts(sorted);
      }
    };
    
    const handleEarlyTrain = (payload) => {
      try {
        // Actualizar cantidad del mazo regular (debería reducirse en 6)
        if (payload.cantidadMazo !== undefined) {
          setMazoRegular(payload.cantidadMazo);
        }

        // Actualizar cantidad del descarte (debería aumentar en 6)
        if (payload.cantidadDescarte !== undefined) {
          setContadorDescarte(payload.cantidadDescarte);
        }

        // El backend no envía las 6 cartas individuales descartadas, solo los contadores
        // Por lo tanto, NO modificamos el array mazoDescarte aquí
        // El componente MazoDescarte debe confiar en contadorDescarte para mostrar la cantidad

        // Mostrar notificación
        const jugadorNombre = players.find((p) => p.id === payload.jugadorId)?.nombre || 
                             `Jugador ${payload.jugadorId}`;
        showNotification(
          `${jugadorNombre} jugó Early Train: 6 cartas del mazo fueron descartadas`,
          "info"
        );

        // Verificar si el mazo está casi vacío (condición de victoria)
        if (payload.cantidadMazo <= 6) {
          setWinnerRequested(true);
          handleEndGame();
        }
      } catch (error) {
        console.error("[WS] Error en handleEarlyTrain:", error);
      }
    };

    const handleOneMore = (payload) => {
      if (payload?.partidaId !== parseInt(idGame)) return;

      // Actualizar secretos de todos los jugadores
      if (payload?.secretos) {
        const todosSecretos = {};
        Object.keys(payload.secretos).forEach((jugadorId) => {
          todosSecretos[jugadorId] = payload.secretos[jugadorId].map(
            (secreto) => ({
              id: secreto.id_front || secreto.id,
              idBackend: secreto.id,
              estado: secreto.estado,
            }),
          );
        });
        setAllSecrets(todosSecretos);
      }

      // Actualizar mazo de descarte
      if (payload?.ultCarta) {
        const cartaObj = payload.ultCarta;
        const normalizedCarta = {
          idFrontend: parseFrontendId(
            cartaObj.id_front ?? cartaObj.idFrontend ?? cartaObj.idFront ?? null,
          ),
          idBackend:
            cartaObj.id ??
            cartaObj.idBackend ??
            cartaObj.id_backend ??
            cartaObj.carta_id ??
            null,
          ...cartaObj,
        };
        setMazoDescarte((prev) => [...prev, normalizedCarta]);
        
        if (payload.cantidadDescarte !== undefined) {
          setContadorDescarte(payload.cantidadDescarte);
        } else {
          setContadorDescarte((prev) => prev + 1);
        }
      }
    };

    const handleAnotherVictimCaso1 = (payload) => {
      if (payload?.partidaId !== parseInt(idGame)) return;
      
      const jugadorNombre = players.find((p) => p.id === payload.jugadorId)?.nombre || 
                           `Jugador ${payload.jugadorId}`;
      
      // Actualizar sets de todos los jugadores
      if (payload?.sets) {
        const setsNormalizados = {};
        Object.keys(payload.sets).forEach((jugadorId) => {
          let sets = payload.sets[jugadorId] || [];
          if (!Array.isArray(sets)) {
            sets = Object.values(sets);
          }
          setsNormalizados[jugadorId] = sets;
        });
        setAllPlayerSets(setsNormalizados);
      }
      
      // Actualizar secreto revelado automáticamente (victima_id=1)
      if (payload?.secreto) {
        const secreto = payload.secreto;
        const nuevoJugadorId = Number(secreto.jugador);
        const estadoSecreto = Number(secreto.estado);
        const secretoIdBackend = Number(secreto.id);
        
        setAllSecrets((prevSecrets) => {
          const nuevosSecretos = { ...prevSecrets };
          
          // Buscar y actualizar el secreto
          for (const jugadorId in nuevosSecretos) {
            const secretos = nuevosSecretos[jugadorId];
            const indice = secretos.findIndex(s => s.idBackend === secretoIdBackend);
            
            if (indice !== -1) {
              nuevosSecretos[jugadorId][indice] = {
                ...nuevosSecretos[jugadorId][indice],
                estado: estadoSecreto,
              };
              break;
            }
          }
          
          return nuevosSecretos;
        });
      }
      
      // Actualizar descarte
      if (payload?.ultCarta) {
        const cartaObj = payload.ultCarta;
        const normalizedCarta = {
          idFrontend: parseFrontendId(
            cartaObj.id_front ?? cartaObj.idFrontend ?? cartaObj.idFront ?? null,
          ),
          idBackend:
            cartaObj.id ??
            cartaObj.idBackend ??
            cartaObj.id_backend ??
            cartaObj.carta_id ??
            null,
          ...cartaObj,
        };
        setMazoDescarte((prev) => [...prev, normalizedCarta]);
      }
      
      if (payload?.cantidadDescarte !== undefined) {
        setContadorDescarte(payload.cantidadDescarte);
      }
      
      showNotification(
        `${jugadorNombre} robó un set y reveló un secreto automáticamente`,
        "success"
      );
    };

    const handleAnotherVictimCaso2 = (payload) => {
      if (payload?.partidaId !== parseInt(idGame)) return;
      
      const jugadorNombre = players.find((p) => p.id === payload.jugadorId)?.nombre || 
                           `Jugador ${payload.jugadorId}`;
      const victimaId = Number(payload.victimaId);
      
      // Actualizar sets de todos los jugadores
      if (payload?.sets) {
        const setsNormalizados = {};
        Object.keys(payload.sets).forEach((jugadorId) => {
          let sets = payload.sets[jugadorId] || [];
          if (!Array.isArray(sets)) {
            sets = Object.values(sets);
          }
          setsNormalizados[jugadorId] = sets;
        });
        setAllPlayerSets(setsNormalizados);
      }
      
      // Actualizar descarte
      if (payload?.ultCarta) {
        const cartaObj = payload.ultCarta;
        const normalizedCarta = {
          idFrontend: parseFrontendId(
            cartaObj.id_front ?? cartaObj.idFrontend ?? cartaObj.idFront ?? null,
          ),
          idBackend:
            cartaObj.id ??
            cartaObj.idBackend ??
            cartaObj.id_backend ??
            cartaObj.carta_id ??
            null,
          ...cartaObj,
        };
        setMazoDescarte((prev) => [...prev, normalizedCarta]);
      }
      
      if (payload?.cantidadDescarte !== undefined) {
        setContadorDescarte(payload.cantidadDescarte);
      }
      
      // El jugador víctima debe elegir un secreto para revelar
      if (victimaId === Number(userId)) {
        // Soy el jugador que debe elegir secreto
        setEsperandoRevelarSecreto(true);
        showNotification(
          "Debes elegir uno de tus secretos para revelar",
          "warning"
        );
      } else {
        const victimaNombre = players.find((p) => p.id === victimaId)?.nombre || 
                             `Jugador ${victimaId}`;
        showNotification(
          `${jugadorNombre} robó un set. ${victimaNombre} debe elegir un secreto para revelar`,
          "info"
        );
      }
    };

    const handlePYS = (payload) => {
      if (payload?.partidaId !== parseInt(idGame)) return;

      // Actualizar mazo de descarte con la carta del evento
      if (payload?.ultCarta) {
        const cartaObj = payload.ultCarta;
        const normalizedCarta = {
          idFrontend: parseFrontendId(
            cartaObj.id_front ?? cartaObj.idFrontend ?? cartaObj.idFront ?? null,
          ),
          idBackend:
            cartaObj.id ??
            cartaObj.idBackend ??
            cartaObj.id_backend ??
            cartaObj.carta_id ??
            null,
          ...cartaObj,
        };
        setMazoDescarte((prev) => [...prev, normalizedCarta]);
        
        if (payload.cantidadDescarte !== undefined) {
          setContadorDescarte(payload.cantidadDescarte);
        } else {
          setContadorDescarte((prev) => prev + 1);
        }
      }

      // Actualizar solo la mano del jugador activo (quien jugó la carta)
      if (payload?.cartas_en_mano && payload?.jugadorId) {
        const userIdNum = Number(getUserId());
        const jugadorActivoId = Number(payload.jugadorId);
        
        // Solo actualizar si el usuario actual es el jugador activo
        if (userIdNum === jugadorActivoId) {
          // cartas_en_mano viene como array directo
          const cartas = Array.isArray(payload.cartas_en_mano) 
            ? payload.cartas_en_mano 
            : payload.cartas_en_mano[jugadorActivoId];
          
          // Validar que cartas sea un array
          if (Array.isArray(cartas)) {
            const cartasNormalizadas = cartas.map((c) => ({
              idFrontend: parseFrontendId(c?.id_front ?? c?.idFrontend ?? c?.idFront ?? null),
              idBackend: c?.id ?? c?.idBackend ?? c?.id_backend ?? null,
              ...c,
            }));
            setPlayerHand(cartasNormalizadas);
          }
        }
      }

      // Mostrar notificación sobre quién fue elegido como víctima
      if (payload?.victimaId) {
        const userIdNum = Number(getUserId());
        const victimaIdNum = Number(payload.victimaId);
        const jugadorIdNum = Number(payload.jugadorId);
        
        const victima = players.find(p => Number(p.id) === victimaIdNum);
        const jugador = players.find(p => Number(p.id) === jugadorIdNum);
        
        if (victimaIdNum === userIdNum) {
          // El usuario es la víctima, activar modo de revelación
          setEsperandoRevelarSecreto(true);
          setJugadorObjetivoRevelacion(userIdNum);
          
          const nombreJugador = jugador?.nombre || `Jugador ${jugadorIdNum}`;
          showNotification(
            `${nombreJugador} jugó Point Your Suspicions. Debes elegir un secreto para revelar.`,
            'warning'
          );
        } else if (victima && jugador) {
          showNotification(
            `${jugador.nombre} jugó Point Your Suspicions en ${victima.nombre}.`,
            'info'
          );
        }
      }
    }

    
    const handleLookAshes = (payload) => {
      if (payload?.partidaId !== parseInt(idGame)) {
        return;
      }

      try {
        const userIdNum = Number(getUserId());

        // Solo actualizar la mano si el evento es del jugador actual
        if (Number(payload.jugadorId) === userIdNum && payload?.cartas) {
          // Normalizar las cartas de la mano
          const cartasNormalizadas = Array.isArray(payload.cartas)
            ? payload.cartas.map(carta => ({
                idFrontend: parseFrontendId(
                  carta.id_front ?? carta.idFrontend ?? carta.idFront ?? null
                ),
                idBackend: carta.id ?? carta.idBackend ?? carta.id_backend ?? null,
                ...carta
              }))
            : [];

          // Actualizar la mano del jugador con la carta del descarte agregada
          setPlayerHand(cartasNormalizadas);
        }

        // Actualizar el mazo de descarte
        if (payload?.ultCarta) {
          const cartaObj = payload.ultCarta;
          const normalizedCarta = {
            idFrontend: parseFrontendId(
              cartaObj.id_front ?? cartaObj.idFrontend ?? cartaObj.idFront ?? null
            ),
            idBackend: cartaObj.id ?? cartaObj.idBackend ?? cartaObj.id_backend ?? null,
            ...cartaObj
          };
          setMazoDescarte(prev => [...prev, normalizedCarta]);
        }

        // Actualizar contador de descarte
        if (payload?.cantidadDescarte !== undefined) {
          setContadorDescarte(payload.cantidadDescarte);
        }

        // Mostrar notificación
        const jugador = players.find(p => Number(p.id) === Number(payload.jugadorId));
        const nombreJugador = jugador?.nombre || `Jugador ${payload.jugadorId}`;
        
        if (Number(payload.jugadorId) === userIdNum) {
          showNotification(
            "Look Into The Ashes: Carta del descarte agregada a tu mano.",
            "success"
          );
        } else {
          showNotification(
            `${nombreJugador} jugó Look Into The Ashes y tomó una carta del descarte.`,
            "info"
          );
        }

      } catch (error) {
        console.error("[WS] Error procesando Look Into The Ashes:", error);
        showNotification("Error al procesar Look Into The Ashes", "error");
      }
    }
    const handleDelayEscape = (payload) => {
      if (payload?.partidaId !== parseInt(idGame)) {
        return;
      }

      try {
        // Actualizar el mazo regular
        if (payload?.cantidadMazo !== undefined) {
          setMazoRegular(payload.cantidadMazo);
        }

        // Actualizar el mazo de descarte
        if (payload?.ultCarta) {
          const cartaObj = payload.ultCarta;
          const normalizedCarta = {
            idFrontend: parseFrontendId(
              cartaObj.id_front ?? cartaObj.idFrontend ?? cartaObj.idFront ?? null
            ),
            idBackend: cartaObj.id ?? cartaObj.idBackend ?? cartaObj.id_backend ?? null,
            ...cartaObj
          };
          setMazoDescarte(prev => [...prev, normalizedCarta]);
        }

        // Actualizar contador de descarte
        if (payload?.cantidadDescarte !== undefined) {
          setContadorDescarte(payload.cantidadDescarte);
        }

        // Mostrar notificación
        const jugador = players.find(p => Number(p.id) === Number(payload.jugadorId));
        const nombreJugador = jugador?.nombre || `Jugador ${payload.jugadorId}`;
        
        showNotification(
          `${nombreJugador} jugó Delay The Murderer's Escape! Las cartas del descarte se mezclaron en el mazo.`,
          "info"
        );

      } catch (error) {
        console.error("[WS] Error procesando Delay The Murderer's Escape:", error);
        showNotification("Error al procesar Delay The Murderer's Escape", "error");
      }
    }

    // Handler para prep_card_trade: Preparar el intercambio de cartas
    const handlePrepCardTrade = (payload) => {
      if (payload?.partidaId !== parseInt(idGame)) {
        return;
      }

      const userIdNum = Number(getUserId());
      const jugadorIdNum = Number(payload.jugadorId);
      const victimaIdNum = Number(payload.victimaId);

      // Actualizar mazo de descarte con la carta del evento
      if (payload?.ultCarta) {
        const cartaObj = payload.ultCarta;
        const normalizedCarta = {
          idFrontend: parseFrontendId(
            cartaObj.id_front ?? cartaObj.idFrontend ?? cartaObj.idFront ?? null,
          ),
          idBackend:
            cartaObj.id ??
            cartaObj.idBackend ??
            cartaObj.id_backend ??
            cartaObj.carta_id ??
            null,
          ...cartaObj,
        };
        setMazoDescarte((prev) => [...prev, normalizedCarta]);
        
        if (payload.cantidadDescarte !== undefined) {
          setContadorDescarte(payload.cantidadDescarte);
        } else {
          setContadorDescarte((prev) => prev + 1);
        }
      }

      // Verificar si el usuario actual está involucrado en el intercambio
      if (userIdNum === jugadorIdNum || userIdNum === victimaIdNum) {
        // Activar estado de selección de carta
        setEsperandoCardTrade(true);
        setCardTradeObjetivo(userIdNum === jugadorIdNum ? victimaIdNum : jugadorIdNum);
        setCardTradeJugadorActivo(jugadorIdNum);
        
        const otroJugador = players.find(p => 
          Number(p.id) === (userIdNum === jugadorIdNum ? victimaIdNum : jugadorIdNum)
        );
        const nombreOtro = otroJugador?.nombre || `Jugador ${userIdNum === jugadorIdNum ? victimaIdNum : jugadorIdNum}`;
        
        showNotification(
          `💱 Card Trade: Selecciona una carta de tu mano para intercambiar con ${nombreOtro}.`,
          'warning'
        );
      } else {
        const jugador = players.find(p => Number(p.id) === jugadorIdNum);
        const victima = players.find(p => Number(p.id) === victimaIdNum);
        const nombreJugador = jugador?.nombre || `Jugador ${jugadorIdNum}`;
        const nombreVictima = victima?.nombre || `Jugador ${victimaIdNum}`;
        
        showNotification(
          `${nombreJugador} y ${nombreVictima} están intercambiando cartas...`,
          'info'
        );
      }
    };

    // Handler para evento_card_trade: Completar el intercambio de cartas
    const handleCardTrade = (payload) => {
      if (payload?.partidaId !== parseInt(idGame)) return;

      const userIdNum = Number(getUserId());
      const jugadorIdNum = Number(payload.jugadorId);
      const victimaIdNum = Number(payload.victimaId);

      // Actualizar las manos de los jugadores involucrados
      if (userIdNum === jugadorIdNum && payload?.manoJugador) {
        // Actualizar mi mano si soy el jugador que inició el intercambio
        const cartasNormalizadas = payload.manoJugador.map((c) => ({
          idFrontend: parseFrontendId(c?.id_front ?? c?.idFrontend ?? c?.idFront ?? null),
          idBackend: c?.id ?? c?.idBackend ?? c?.id_backend ?? null,
          ...c,
        })).filter((c) => c.idBackend !== null);
        
        setPlayerHand(cartasNormalizadas);
        
        // Desactivar estado de selección
        setEsperandoCardTrade(false);
        setCardTradeObjetivo(null);
        setCardTradeJugadorActivo(null);
        
        const victima = players.find(p => Number(p.id) === victimaIdNum);
        const nombreVictima = victima?.nombre || `Jugador ${victimaIdNum}`;
        showNotification(
          `✅ Intercambio completado con ${nombreVictima}.`,
          'success'
        );
      } else if (userIdNum === victimaIdNum && payload?.manoVictima) {
        // Actualizar mi mano si soy la víctima del intercambio
        const cartasNormalizadas = payload.manoVictima.map((c) => ({
          idFrontend: parseFrontendId(c?.id_front ?? c?.idFrontend ?? c?.idFront ?? null),
          idBackend: c?.id ?? c?.idBackend ?? c?.id_backend ?? null,
          ...c,
        })).filter((c) => c.idBackend !== null);
        
        setPlayerHand(cartasNormalizadas);
        
        // Desactivar estado de selección
        setEsperandoCardTrade(false);
        setCardTradeObjetivo(null);
        setCardTradeJugadorActivo(null);
        
        const jugador = players.find(p => Number(p.id) === jugadorIdNum);
        const nombreJugador = jugador?.nombre || `Jugador ${jugadorIdNum}`;
        showNotification(
          `✅ Intercambio completado con ${nombreJugador}.`,
          'success'
        );
      } else {
        // Notificación para espectadores
        const jugador = players.find(p => Number(p.id) === jugadorIdNum);
        const victima = players.find(p => Number(p.id) === victimaIdNum);
        const nombreJugador = jugador?.nombre || `Jugador ${jugadorIdNum}`;
        const nombreVictima = victima?.nombre || `Jugador ${victimaIdNum}`;
        
        showNotification(
          `✅ ${nombreJugador} y ${nombreVictima} completaron el intercambio.`,
          'info'
        );
      }
    };
    const handleCardsOffTheTable = (payload) => {
      if (payload?.partidaId !== parseInt(idGame)) {
        return;
      }

      const userIdNum = Number(getUserId());
      const jugadorIdNum = Number(payload.jugadorId);
      const victimaIdNum = Number(payload.victimaId);

      // Actualizar la mano del jugador que jugó el evento
      if (userIdNum === jugadorIdNum && payload?.manoJugador) {
        const cartasNormalizadas = payload.manoJugador
          .map((c) => ({
            idFrontend: parseFrontendId(c?.id_front ?? c?.idFrontend ?? c?.idFront ?? null),
            idBackend: c?.id ?? c?.idBackend ?? c?.id_backend ?? null,
            ...c,
          }))
          .filter((c) => c.idBackend !== null);
        
        setPlayerHand(cartasNormalizadas);
        
        const victima = players.find(p => Number(p.id) === victimaIdNum);
        const nombreVictima = victima?.nombre || `Jugador ${victimaIdNum}`;
        showNotification(
          `Cards Off The Table: ${nombreVictima} descartó todas sus cartas Not So Fast.`,
          'success'
        );
      } else if (userIdNum === victimaIdNum && payload?.manoVictima) {
        // Actualizar la mano de la víctima (sin sus Not So Fast)
        const cartasNormalizadas = payload.manoVictima
          .map((c) => ({
            idFrontend: parseFrontendId(c?.id_front ?? c?.idFrontend ?? c?.idFront ?? null),
            idBackend: c?.id ?? c?.idBackend ?? c?.id_backend ?? null,
            ...c,
          }))
          .filter((c) => c.idBackend !== null);
        
        setPlayerHand(cartasNormalizadas);
        
        const jugador = players.find(p => Number(p.id) === jugadorIdNum);
        const nombreJugador = jugador?.nombre || `Jugador ${jugadorIdNum}`;
        showNotification(
          `Cards Off The Table: ${nombreJugador} te hizo descartar todas tus cartas Not So Fast.`,
          'warning'
        );
      } else {
        // Notificación para espectadores
        const jugador = players.find(p => Number(p.id) === jugadorIdNum);
        const victima = players.find(p => Number(p.id) === victimaIdNum);
        const nombreJugador = jugador?.nombre || `Jugador ${jugadorIdNum}`;
        const nombreVictima = victima?.nombre || `Jugador ${victimaIdNum}`;
        
        showNotification(
          `${nombreJugador} jugó Cards Off The Table. ${nombreVictima} descartó todas sus Not So Fast.`,
          'info'
        );
      }

      // Actualizar el mazo de descarte con la carta del evento
      // NOTA: ultCarta debería ser el último Not So Fast descartado, no la carta del evento
      // El backend está enviando la carta del evento en ultCarta
      // Por ahora, game_state actualizará correctamente el descarte
      if (payload?.ultCarta) {
        const cartaObj = payload.ultCarta;
        const normalizedCarta = {
          idFrontend: parseFrontendId(
            cartaObj.id_front ?? cartaObj.idFrontend ?? cartaObj.idFront ?? null
          ),
          idBackend: cartaObj.id ?? cartaObj.idBackend ?? cartaObj.id_backend ?? null,
          ...cartaObj
        };
        setMazoDescarte(prev => [...prev, normalizedCarta]);
      }

      // Actualizar contador de descarte
      if (payload?.cantidadDescarte !== undefined) {
        setContadorDescarte(payload.cantidadDescarte);
      }
    }

    const handlePrepDeadCardFolly = (payload) => {
      if (payload?.partidaId !== parseInt(idGame)) {
        return;
      }

      // 1. Actualizar mazo de descarte con la carta del evento
      if (payload?.ultCarta) {
        const cartaObj = payload.ultCarta;
        const normalizedCarta = {
          idFrontend: parseFrontendId(
            cartaObj.id_front ?? cartaObj.idFrontend ?? cartaObj.idFront ?? null,
          ),
          idBackend:
            cartaObj.id ??
            cartaObj.idBackend ??
            cartaObj.id_backend ??
            cartaObj.carta_id ??
            null,
          ...cartaObj,
        };
        setMazoDescarte((prev) => [...prev, normalizedCarta]);
        
        if (payload.cantidadDescarte !== undefined) {
          setContadorDescarte(payload.cantidadDescarte);
        } else {
          setContadorDescarte((prev) => prev + 1);
        }
      }

      // 2. Guardar la dirección para Dead Card Folly
      const direccion = payload?.direccion;
      
      if (direccion !== undefined && direccion !== null) {
        setDireccionDCF(direccion);
      }

      // 3. Mostrar notificación a todos los jugadores
      const jugador = players.find(p => Number(p.id) === Number(payload.jugadorId));
      const nombreJugador = jugador?.nombre || `Jugador ${payload.jugadorId}`;
      const direccionTexto = direccion === 1 ? "derecha" : "izquierda";
      
      showNotification(
        `${nombreJugador} jugó Dead Card Folly. Todos deben pasar una carta hacia la ${direccionTexto}.`,
        'warning'
      );

      // 4. Activar el estado específico de Dead Card Folly
      setEsperandoPasarCartaDCF(true);
      setYaPaseMiCartaDCF(false);
      setEventoEnJuego({
        idFrontend: 12,
        nombre: 'Dead Card Folly',
        direccion: direccion
      });
    }

    const handleDeadCardFolly = (payload) => {
      if (payload?.partidaId !== parseInt(idGame)) {
        return;
      }

      try {
        const userIdNum = Number(getUserId());
        
        // Actualizar las manos de todos los jugadores
        if (payload?.manosActualizadas) {
          // Actualizar la mano del jugador actual
          const manoKey = String(userIdNum);
          if (payload.manosActualizadas[manoKey]) {
            const manosJugador = payload.manosActualizadas[manoKey];
            
            // Normalizar las cartas
            const cartasNormalizadas = Array.isArray(manosJugador) 
              ? manosJugador.map(carta => ({
                  idFrontend: parseFrontendId(
                    carta.id_front ?? carta.idFrontend ?? carta.idFront ?? null
                  ),
                  idBackend: carta.id ?? carta.idBackend ?? carta.id_backend ?? null,
                  ...carta
                }))
              : [];

            setPlayerHand([...cartasNormalizadas]);
          } else if (payload.manosActualizadas[userIdNum]) {
            // Intentar con número si string no funcionó
            const manosJugador = payload.manosActualizadas[userIdNum];
            
            const cartasNormalizadas = Array.isArray(manosJugador) 
              ? manosJugador.map(carta => ({
                  idFrontend: parseFrontendId(
                    carta.id_front ?? carta.idFrontend ?? carta.idFront ?? null
                  ),
                  idBackend: carta.id ?? carta.idBackend ?? carta.id_backend ?? null,
                  ...carta
                }))
              : [];

            setPlayerHand(cartasNormalizadas);
          }

          // Actualizar el contador de cartas en mano de los otros jugadores
          const updatedPlayers = players.map(player => {
            const playerId = Number(player.id);
            const playerIdStr = String(playerId);
            
            // Intentar con ambos tipos de key
            const manoJugador = payload.manosActualizadas[playerIdStr] || payload.manosActualizadas[playerId];
            
            if (manoJugador) {
              return {
                ...player,
                mano: manoJugador.length
              };
            }
            return player;
          });
          setPlayers(updatedPlayers);
        }

        // Mostrar notificación de éxito
        showNotification(
          "Dead Card Folly completado. Todas las cartas han sido intercambiadas.",
          "success"
        );

        // Limpiar estados de Dead Card Folly
        setEsperandoPasarCartaDCF(false);
        setDireccionDCF(null);
        setEventoEnJuego(null);
        setYaPaseMiCartaDCF(false);
        setCargando(false);

      } catch (error) {
        console.error("[WS] ERROR procesando evento Dead Card Folly:", error);
        showNotification("Error al procesar Dead Card Folly", "error");
      }
    }

    // Escuchar eventos WebSocket
    WS.on("game_state", handleGameState);
    WS.on("mazo_actualizado", handleMazoActualizado);
    WS.on("procesar_descarte", handleProcesarDescarte);
    WS.on("turno_cambiado", handleTurn);
    WS.on("ganador", handleWinner);
    WS.on("set_por_jugar", handleSetPorJugar);
    WS.on("carta_por_jugar", handleCartaPorJugar);
    WS.on("set_actualizados", handleSetActualizados);
    WS.on("todos_los_sets_actualizados", handleTodosLosSetsActualizados);
    WS.on("detective_por_agregar", handleDetectivePorAgregar);
    WS.on("secreto_modificado", handleSecretoModificado);
    WS.on(
      "jugador_elegido_para_revelar_secreto",
      handleJugadorElegidoParaRevelarSecreto,
    );
    WS.on(
      "secreto_modificado_y_partida_actualizada",
      handleSecretoYPartidaActualizada,
    );
    WS.on(
      "jugador_elegido_para_revelar_secreto_y_partida_actualizada",
      handleObjetivoYPartidaActualizada,
    );
    WS.on("draft_actualizado", handleDraftActualizado);
    WS.on("evento_early_train", handleEarlyTrain);
    WS.on("evento_and_then_one_more", handleOneMore);
    WS.on("usar_NSF", handleUsarNSFWebSocket);
    WS.on("evento_another_victim_caso1", handleAnotherVictimCaso1);
    WS.on("evento_another_victim_caso2", handleAnotherVictimCaso2);
    WS.on("prep_point_your_suspicions", handlePYS);
    WS.on("carta_por_jugar", handleCartaPorJugar);
    WS.on("prep_dead_card_folly", handlePrepDeadCardFolly);
    WS.on("evento_dead_card_folly", handleDeadCardFolly);
    WS.on("evento_look_into_ashes", handleLookAshes);
    WS.on("evento_delay_escape", handleDelayEscape);
    WS.on("evento_card_trade", handleCardTrade);
    WS.on("prep_card_trade", handlePrepCardTrade);
    WS.on("evento_cards_off_the_table", handleCardsOffTheTable);

    return () => {
      WS.off("game_state", handleGameState);
      WS.off("mazo_actualizado", handleMazoActualizado);
      WS.off("procesar_descarte", handleProcesarDescarte);
      WS.off("turno_cambiado", handleTurn);
      WS.off("ganador", handleWinner);
      WS.off("set_por_jugar", handleSetPorJugar);
      WS.off("carta_por_jugar", handleCartaPorJugar);
      WS.off("set_actualizados", handleSetActualizados);
      WS.off("todos_los_sets_actualizados", handleTodosLosSetsActualizados);
      WS.off("detective_por_agregar", handleDetectivePorAgregar);
      WS.off("secreto_modificado", handleSecretoModificado);
      WS.off(
        "jugador_elegido_para_revelar_secreto",
        handleJugadorElegidoParaRevelarSecreto,
      );
      WS.off(
        "secreto_modificado_y_partida_actualizada",
        handleSecretoYPartidaActualizada,
      );
      WS.off(
        "jugador_elegido_para_revelar_secreto_y_partida_actualizada",
        handleObjetivoYPartidaActualizada,
      );
      WS.off("draft_actualizado", handleDraftActualizado);
      WS.off("evento_early_train", handleEarlyTrain);
      WS.off("evento_and_then_one_more", handleOneMore);
      WS.off("usar_NSF", handleUsarNSFWebSocket);
      WS.off("evento_another_victim_caso1", handleAnotherVictimCaso1);
      WS.off("evento_another_victim_caso2", handleAnotherVictimCaso2);
      WS.off("prep_point_your_suspicions", handlePYS);
      WS.off("carta_por_jugar", handleCartaPorJugar);
      WS.off("prep_dead_card_folly", handlePrepDeadCardFolly);
      WS.off("evento_dead_card_folly", handleDeadCardFolly);
      WS.off("evento_look_into_ashes", handleLookAshes);
      WS.off("evento_delay_escape", handleDelayEscape);
      WS.off("evento_card_trade", handleCardTrade);
      WS.off("prep_card_trade", handlePrepCardTrade);
      WS.off("evento_cards_off_the_table", handleCardsOffTheTable);
      
      // Limpiar timer de NSF si existe
      if (nsfTimerId) {
        clearTimeout(nsfTimerId);
      }
    };
  }, [idGame]);

  const handleRobarSet = (jugadorId, setRobar) => {
    (async () => {
      try {
        if (!Array.isArray(setRobar) || setRobar.length === 0) {
          showNotification("Set invalido seleccionado para robar.", "error");
          return;
        }

        // Normalizar ids de backend de las cartas del set
        const cartasJugadasId = setRobar
          .map(
            (c) =>
              c?.id ?? c?.idBackend ?? c?.id_backend ?? c?.id_front ?? null,
          )
          .filter(Boolean);

        if (cartasJugadasId.length === 0) {
          console.error(
            "No se pudieron obtener los ids de las cartas del set a robar.",
          );
          return;
        }

        setCargando(true);

        // Llamar al endpoint intercambiar-sets
        const resp = await intercambiarSets(
          idGame,
          Number(userId),
          cartasJugadasId,
        );

        // Cerrar modal
        setModalRobarSetOpen(false);

        // Actualización optimista del estado local: remover el set del jugador origen y agregarlo a mis sets
        setAllPlayerSets((prev) => {
          const newSets = { ...prev };
          const origenKey = String(jugadorId);
          const miKey = String(Number(userId));

          // Remover el set exacto del jugador origen (comparando ids)
          if (Array.isArray(newSets[origenKey])) {
            newSets[origenKey] = newSets[origenKey].filter((existingSet) => {
              const existingIds = (
                Array.isArray(existingSet) ? existingSet : []
              )
                .map(
                  (x) =>
                    x?.id ?? x?.idBackend ?? x?.id_front ?? JSON.stringify(x),
                )
                .join("-");
              const incomingIds = cartasJugadasId.join("-");
              return existingIds !== incomingIds;
            });
          }

          // Agregar el set robado a mis sets (si no existe)
          const normalizedSet = setRobar.map((item) => ({
            idFrontend: parseFrontendId(
              item?.id_front ?? item?.idFrontend ?? item?.idFront ?? null,
            ),
            idBackend: item?.id ?? item?.idBackend ?? item?.id_backend ?? null,
            ...item,
          }));
          if (!newSets[miKey]) newSets[miKey] = [];
          const incomingKey = normalizedSet
            .map((c) => c?.idBackend ?? c?.id_front ?? JSON.stringify(c))
            .join("-");
          const exists = newSets[miKey].some(
            (existing) =>
              (Array.isArray(existing)
                ? existing
                    .map(
                      (c) =>
                        c?.idBackend ??
                        c?.id ??
                        c?.id_front ??
                        JSON.stringify(c),
                    )
                    .join("-")
                : "") === incomingKey,
          );
          if (!exists) newSets[miKey] = [...newSets[miKey], normalizedSet];

          return newSets;
        });

        showNotification("Set robado correctamente.", "success");
      } catch (err) {
        console.error("Error al robar set:", err);
        showNotification(
          err?.response?.data?.error ||
            err?.message ||
            "No se pudo robar el set",
          "error",
        );
      } finally {
        setCargando(false);
      }
    })();
  };

  const handleRobarSetNuevo = (jugadorId, setIndex, setCards) => {
    (async () => {
      try {
        if (!Array.isArray(setCards) || setCards.length === 0) {
          showNotification("Set invalido seleccionado para robar.", "error");
          return;
        }

        // Extraer los IDs de backend de las cartas del set
        const cartasJugadasId = setCards
          .map(
            (carta) =>
              carta?.id ?? carta?.idBackend ?? carta?.id_backend ?? null,
          )
          .filter(Boolean);

        if (cartasJugadasId.length === 0) {
          console.error(
            "No se pudieron obtener los ids de las cartas del set a robar.",
          );
          return;
        }

        setCargando(true);

        // Llamar al endpoint intercambiar-set
        await intercambiarSet(idGame, Number(userId), cartasJugadasId);

        // Cerrar modal inmediatamente
        setModalRobarSetNuevoOpen(false);

        // El WebSocket 'todos_los_sets_actualizados' se encargará de actualizar el estado automáticamente

        showNotification(
          `Set robado correctamente del ${players.find((p) => p.id === jugadorId)?.nombre || `Jugador ${jugadorId}`}`,
          "success",
        );
      } catch (err) {
        console.error("Error al robar set:", err);
        showNotification(
          err?.response?.data?.error ||
            err?.message ||
            "No se pudo robar el set",
          "error",
        );
      } finally {
        setCargando(false);
      }
    })();
  };

  // ✅ FIX: Detectar mazoRegular en 0 (VACÍO) para solicitar ganador, no cuando tiene 1
  useEffect(() => {
    if (mazoRegular <= 1) {
      setWinnerRequested(true);
      handleEndGame();
    }
  }, [mazoRegular, idGame, winnerRequested]);

  // Verificar si tengo NSF cada vez que cambie mi mano
  useEffect(() => {
    if (playerHand.length > 0) {
      verificarSiTengoNSF();
    }
  }, [playerHand]);

  // ✅ Actualizar estado de desgracia social basándose en los secretos
  useEffect(() => {
    if (!players || players.length === 0 || !allSecrets || Object.keys(allSecrets).length === 0) {
      return;
    }

    setPlayers((prevPlayers) => {
      return prevPlayers.map((player) => {
        const jugadorId = String(player.id);
        const secretosJugador = allSecrets[jugadorId] || [];

        // Un jugador está en desgracia si:
        // 1. Tiene al menos 1 secreto
        // 2. TODOS sus secretos están revelados (estado === 0)
        const tieneSecretos = secretosJugador.length > 0;
        const todosRevelados = tieneSecretos && secretosJugador.every((s) => s.estado === 0);

        // Solo actualizar si el estado cambió
        if (player.desgraciado !== todosRevelados) {
          return {
            ...player,
            desgraciado: todosRevelados,
          };
        }

        return player;
      });
    });
  }, [allSecrets]); // Se ejecuta cada vez que cambian los secretos

  // Handler para cuando la partida termina y se solicita el ganador
  const handleEndGame = async () => {
    try {
      const resp = await ganador(idGame);
    } catch (err) {
      console.error("Error al terminar partida", err);
    }
  };

  // Handler para WebSocket usar_NSF (Not So Fast)
  const handleUsarNSFWebSocket = (payload) => {
    console.log("[WS] usar_NSF recibido:", payload);
    
    if (payload?.partidaId !== parseInt(idGame)) {
      return;
    }
    
    try {
      const userIdNum = Number(getUserId());
      
      // Actualizar todas las manos
      if (payload?.allCartasMano) {
        const manoKey = String(userIdNum);
        
        if (payload.allCartasMano[manoKey] || payload.allCartasMano[userIdNum]) {
          const miMano = payload.allCartasMano[manoKey] || payload.allCartasMano[userIdNum];
          
          const cartasNormalizadas = Array.isArray(miMano)
            ? miMano.map(carta => ({
                idFrontend: parseFrontendId(carta.id_front ?? carta.idFrontend),
                idBackend: carta.id ?? carta.idBackend,
                ...carta
              }))
            : [];
          
          setPlayerHand(cartasNormalizadas);
        }
      }
      
      // Actualizar sets
      if (payload?.setsActualizados) {
        setAllPlayerSets(payload.setsActualizados);
      }
      
      // Actualizar descarte
      if (payload?.ultCarta) {
        const cartaObj = payload.ultCarta;
        const normalizedCarta = {
          idFrontend: parseFrontendId(cartaObj.id_front ?? cartaObj.idFrontend),
          idBackend: cartaObj.id ?? cartaObj.idBackend,
          ...cartaObj
        };
        setMazoDescarte(prev => [...prev, normalizedCarta]);
        
        if (payload.cantidadDescarte !== undefined) {
          setContadorDescarte(payload.cantidadDescarte);
        }
      }
      
      // Cancelar timer local si estaba activo
      if (nsfTimerId) {
        console.log("[WS usar_NSF] Cancelando timer con ID:", nsfTimerId);
        clearTimeout(nsfTimerId);
        setNsfTimerId(null);
        setNsfTimerActive(false);
        setEsperandoUsarNSF(false);
        setAccionACancelar(null);
      } else {
        console.log("[WS usar_NSF] No había timer activo para cancelar");
        // Igual limpiar estados por si acaso
        setEsperandoUsarNSF(false);
        setAccionACancelar(null);
      }
      
      // CRÍTICO: Marcar que la acción fue cancelada (previene ejecución en timeout)
      accionCanceladaRef.current = true;
      console.log("[WS usar_NSF] ⚠️ MARCANDO ACCIÓN COMO CANCELADA - accionCanceladaRef.current =", accionCanceladaRef.current);
      
      // Notificación
      const jugador = players.find(p => Number(p.id) === Number(payload.jugadorId));
      const nombreJugador = jugador?.nombre || `Jugador ${payload.jugadorId}`;
      
      showNotification(
        `${nombreJugador} jugó Not So Fast! La acción fue cancelada.`,
        "warning"
      );
      
    } catch (error) {
      console.error("[WS] Error procesando usar_NSF:", error);
    }
  };

  // Handler para recibir el ganador por WS
  const handleWinner = (payload) => {
    // Payload: { partidaId: partida_id, asesino: asesino_id, ganador: ganoperdio, estado: estado }
    try {
      setWinnerInfo(payload?.ganador);
      setIdAsesino(payload?.asesino);
      setIdComplice(payload?.complice || null);
      setWinnerModalOpen(true);
    } catch (err) {
      console.error("handleWinner error", err);
    }
  };

  const confirmWinnerAndGoHome = () => {
    try {
      // Desconectar WS
      try {
        WS.disconnect();
      } catch {
        /* silent */
      }
      setWinnerModalOpen(false);
      navigate("/home");
    } catch (err) {
      console.error("Error confirming winner navigation", err);
    }
  };

  const avatars = getAvatars();

  // Función para obtener el avatar del jugador
  const getPlayerAvatar = (player) => {
    if (player.avatar?.startsWith("http")) {
      return player.avatar;
    }
    const avatarData = avatars.find((a) => a.value === player.avatar);
    return avatarData?.src || "/assets/Avatares/avatar1.jpg";
  };

  // Handler para seleccionar/deseleccionar carta de la mano
  const handleSeleccionarCarta = async (carta) => {
    // Caso especial: Dead Card Folly - pasar carta inmediatamente
    if (esperandoPasarCartaDCF) {
      // Si ya pasé mi carta, ignorar el click
      if (yaPaseMiCartaDCF) {
        showNotification("Ya pasaste tu carta. Esperando que los demás jugadores pasen las suyas...", "warning");
        return;
      }
      
      try {
        setCargando(true);
        const partidaId = getGameId();
        const jugadorId = getUserId();

        const response = await pasar_carta_ronda(partidaId, jugadorId, carta.idBackend, direccionDCF);
        
        showNotification(
          `Carta pasada correctamente. Esperando que los demás jugadores pasen sus cartas...`,
          'info'
        );

        setYaPaseMiCartaDCF(true); // Ya no puede pasar otra carta
        
      } catch (error) {
        console.error("Error al pasar carta:", error);
        showNotification("Error al pasar la carta", "error");
      } finally {
        setCargando(false);
      }
      return;
    }

    // Si estamos esperando selección para Card Trade
    if (esperandoCardTrade) {
      try {
        setCargando(true);
        
        // Llamar al endpoint de intercambiar cartas
        await intercambiarCartas(
          idGame,
          Number(userId),
          cardTradeObjetivo,
          carta.idBackend
        );
        
        showNotification(
          "Carta seleccionada para intercambio. Esperando a la otra persona...",
          "info"
        );
        
        // No desactivamos el estado aquí porque el WebSocket lo hará cuando ambos hayan seleccionado
      } catch (error) {
        console.error("[handleSeleccionarCarta] Error al intercambiar carta:", error);
        showNotification(
          "Error al seleccionar carta para intercambio. Intenta nuevamente.",
          "error"
        );
      } finally {
        setCargando(false);
      }
      return;
    }

    // Lógica normal: selección múltiple para descartar
    // Comportamiento normal: selección múltiple para descartar
    setCartasSeleccionadas((prev) => {
      // Si ya está seleccionada, la quitamos
      const yaSeleccionada = prev.find((c) => c.idBackend === carta.idBackend);
      if (yaSeleccionada) {
        return prev.filter((c) => c.idBackend !== carta.idBackend);
      }
      // Si no está, la agregamos
      return [...prev, carta];
    });
  };

  // Handler para descartar todas las cartas seleccionadas
  const handleDescartarCartas = async () => {
    if (cartasSeleccionadas.length === 0) return;

    // Validar si el jugador está en desgracia social - solo puede descartar 1 carta
    if (jugadorActualEnDesgracia() && cartasSeleccionadas.length > 1) {
      showNotification(
        "⚠️ Estás en Desgracia Social. Solo puedes descartar 1 carta por turno.",
        "error",
      );
      return;
    }

    // Validar que no haya descartado ya en este turno
    if (haDescartadoEnTurno) {
      showNotification(
        "Ya descartaste cartas en este turno. Ahora debes robar hasta tener 6 cartas y finalizar tu turno.",
        "warning",
      );
      return;
    }

    setCargando(true);
    try {
      const partidaId = getGameId();

      // Descartar cada carta seleccionada en el backend
      for (const carta of cartasSeleccionadas) {
        await descartarCarta(partidaId, carta.idBackend);
      }

      setFaseActual("Alzar");

      // Marcar que el jugador ya descartó en este turno
      setHaDescartadoEnTurno(true);

      // Limpiar selección
      setCartasSeleccionadas([]);
    } catch (error) {
      console.error("Error al descartar:", error);
      showNotification(
        "No se pudo descartar las cartas. Intente nuevamente.",
        "error",
      );
    } finally {
      setCargando(false);
    }
  };

  const handleEndTurn = async () => {
    // Validar que el jugador haya descartado, jugado evento o jugado set antes de finalizar
    if (!haDescartadoEnTurno && !haJugadoEventoEnTurno && !haJugadoSetEnTurno) {
      showNotification(
        "Debes descartar al menos una carta, jugar un evento o bajar un set antes de finalizar tu turno.",
        "warning",
      );
      return;
    }

    // Validar que el jugador tenga exactamente 6 cartas
    if (playerHand.length > 6) {
      showNotification(
        "Debes descartar cartas hasta tener 6 antes de terminar tu turno.",
        "warning",
      );
      return;
    }

    if (playerHand.length < 6) {
      showNotification(
        "Debes robar cartas hasta completar 6 antes de terminar tu turno.",
        "warning",
      );
      return;
    }

    try {
      // Solo llamar a la API para finalizar el turno
      const response = await endTurn(idGame);

      // Resetear inmediatamente para evitar doble clic
      setHaDescartadoEnTurno(false);
      setHaJugadoEventoEnTurno(false);
      setHaJugadoSetEnTurno(false);
      setHaRobadoEnTurno(false);
      setFaseActual("FINALIZAR");
      setCartasSeleccionadas([]);

      // El WebSocket (evento 'turno_cambiado') actualizará turnoActual cuando llegue
    } catch (err) {
      console.error("[handleEndTurn] ========== ERROR CAPTURADO ==========");
      console.error("[handleEndTurn] Error al finalizar el turno:", err);
      console.error(
        "[handleEndTurn] Error detallado:",
        err.response?.data || err.message,
      );
      showNotification(
        "No se pudo finalizar el turno. Intente nuevamente.",
        "error",
      );
    }
  };

  // Handler para no realizar accion (descartar y robar 1 carta)
  const handleNoAccion = async () => {
    // Validar que no haya robado ya en este turno (después de descartar)
    if (haRobadoEnTurno) {
      showNotification(
        "Ya completaste la fase de robo en este turno. Ahora debes finalizar tu turno.",
        "warning",
      );
      return;
    }
    // Validar que no haya descartado ya en este turno
    if (haDescartadoEnTurno) {
      showNotification(
        "Ya descartaste cartas en este turno. Debes robar y finalizar tu turno.",
        "warning",
      );
      return;
    }

    // Validar que tenga al menos 1 carta para descartar
    if (playerHand.length === 0) {
      showNotification("No tienes cartas para descartar.", "warning");
      return;
    }

    try {
      setCargando(true);
      const partidaId = getGameId();

      // 1. Descartar la primera carta de la mano
      const cartaADescartar = playerHand[0];
      await descartarCarta(partidaId, cartaADescartar.idBackend);

      // Marcar que descartó
      setHaDescartadoEnTurno(true);

      // 2. Robar una carta para mantener las 6
      const playerId = userId;
      const respuesta = await robarCarta(playerId, idGame);

      // Validar respuesta
      if (respuesta.error) {
        console.error("Error al robar carta:", respuesta.error);
        return;
      }

      if (!respuesta.id && !respuesta.id_front) {
        console.error(
          "Error: La carta recibida no tiene un identificador válido:",
          respuesta,
        );
        return;
      }

      // Normalizar la carta
      const cartaParaMano = {
        idFrontend: respuesta.id_front ?? respuesta.id ?? respuesta.idFrontend,
        idBackend: respuesta.id ?? respuesta.idBackend ?? null,
        ...respuesta,
      };

      // Validar que la carta tenga un idBackend válido
      if (
        cartaParaMano.idBackend === null ||
        cartaParaMano.idBackend === undefined
      ) {
        console.error(
          "Error: La carta robada no tiene un idBackend válido:",
          cartaParaMano,
        );
        return;
      }

      // Actualizar la mano: remover carta descartada y agregar nueva
      setPlayerHand((prev) => {
        const nuevaMano = prev.filter(
          (c) => c.idBackend !== cartaADescartar.idBackend,
        );
        return [...nuevaMano, cartaParaMano];
      });

      // Marcar que completó la fase de robo
      setHaRobadoEnTurno(true);

      // Mensaje de confirmación
      showNotification(
        "Pasaste tu turno. Carta descartada y robada automáticamente.",
        "success",
      );
    } catch (error) {
      console.error("Error al no ejecutar accion:", error);
      showNotification(
        "No se pudo no ejecutar accion. Intente nuevamente.",
        "error",
      );
    } finally {
      setCargando(false);
    }
  };

  // Handler para robar carta
  const handleRobarCarta = async (player, idGame) => {
    // Validar que ya haya descartado, jugado evento o jugado set antes de robar
    if (!haDescartadoEnTurno && !haJugadoEventoEnTurno && !haJugadoSetEnTurno) {
      showNotification(
        "Debes descartar cartas, jugar un evento o bajar un set antes de robar.",
        "warning",
      );
      return;
    }

    // Validar límite de cartas según estado de desgracia
    const maxCartas = jugadorActualEnDesgracia() ? playerHand.length + 1 : 6;
    const mensajeDesgracia = jugadorActualEnDesgracia() 
      ? "⚠️ Estás en Desgracia Social. Solo puedes robar 1 carta por turno."
      : "Ya tienes 6 cartas. Debes finalizar tu turno.";

    if (playerHand.length >= maxCartas) {
      showNotification(mensajeDesgracia, "warning");
      return;
    }

    try {
      // player may be either an object { id, ... } or a numeric id
      const playerId =
        player && typeof player === "object" ? player.id : player;
      if (!playerId) {
        console.error("handleRobarCarta: invalid player or missing id", player);
        return;
      }
      const respuesta = await robarCarta(playerId, idGame);

      // Validar si la respuesta es un error del backend
      if (respuesta.error) {
        console.error("Error al robar carta:", respuesta.error);
        return;
      }

      // Validar que la respuesta tenga un id válido
      if (!respuesta.id && !respuesta.id_front) {
        console.error(
          "Error: La carta recibida no tiene un identificador válido:",
          respuesta,
        );
        return;
      }

      // Normalizar la carta al formato que espera la mano del jugador
      const cartaParaMano = {
        idFrontend: respuesta.id_front ?? respuesta.id ?? respuesta.idFrontend,
        idBackend: respuesta.id ?? respuesta.idBackend ?? null,
        ...respuesta,
      };

      // Validar que la carta tenga un idBackend válido
      if (
        cartaParaMano.idBackend === null ||
        cartaParaMano.idBackend === undefined
      ) {
        console.error(
          "Error: La carta robada no tiene un idBackend válido:",
          cartaParaMano,
        );
        return;
      }

      setPlayerHand((prev) => {
        const nuevaMano = [...prev, cartaParaMano];

        // Si al robar esta carta llega al límite (6 o 1 en desgracia), marcar que completó la fase de robo
        if (nuevaMano.length >= maxCartas) {
          setHaRobadoEnTurno(true);
        }

        return nuevaMano;
      });
    } catch (err) {
      console.error("Error al robar carta:", err);
    }
  };

  // Handler para robar una carta específica del mazo draft
  const handleRobarCartaDraft = async (player, idGame, posicion) => {
    // Validar parámetros
    if (posicion === undefined || posicion === null) {
      return;
    }

    // Validar que ya haya descartado, jugado evento o jugado set antes de robar
    if (!haDescartadoEnTurno && !haJugadoEventoEnTurno && !haJugadoSetEnTurno) {
      showNotification(
        "Debes descartar cartas, jugar un evento o bajar un set antes de robar.",
        "warning",
      );
      return;
    }

    // Validar límite de cartas según estado de desgracia
    const maxCartas = jugadorActualEnDesgracia() ? playerHand.length + 1 : 6;
    const mensajeDesgracia = jugadorActualEnDesgracia() 
      ? "⚠️ Estás en Desgracia Social. Solo puedes robar 1 carta por turno."
      : "Ya tienes 6 cartas. Debes finalizar tu turno.";

    if (playerHand.length >= maxCartas) {
      showNotification(mensajeDesgracia, "warning");
      return;
    }

    try {
      setCargando(true);

      // player may be either an object { id, ... } or a numeric id
      const playerId =
        player && typeof player === "object" ? player.id : player;
      if (!playerId) {
        return;
      }

      // Llamar al endpoint para robar carta del draft --- enviando la posicion (int) que pide el backend
      const respuesta = await robarCartaDraft(playerId, idGame, posicion);

      // Validar si la respuesta es un error del backend
      if (respuesta.error) {
        return;
      }

      // Validar que la respuesta tenga un id válido
      if (!respuesta.id && !respuesta.id_front) {
        return;
      }

      // Normalizar la carta al formato que espera la mano del jugador
      const cartaParaMano = {
        idFrontend: respuesta.id_front ?? respuesta.id ?? respuesta.idFrontend,
        idBackend: respuesta.id ?? respuesta.idBackend ?? null,
        ...respuesta,
      };

      // Validar que la carta tenga un idBackend válido
      if (
        cartaParaMano.idBackend === null ||
        cartaParaMano.idBackend === undefined
      ) {
        return;
      }

      setPlayerHand((prev) => {
        const nuevaMano = [...prev, cartaParaMano];

        // Si al robar esta carta llega al límite (6 o 1 en desgracia), marcar que completó la fase de robo
        if (nuevaMano.length >= maxCartas) {
          setHaRobadoEnTurno(true);
        }

        return nuevaMano;
      });

      // Verificar si el mazo regular queda 1 carta
      if (mazoRegular <= 1) {
        setWinnerRequested(true);
        handleEndGame();
      }

      // NO hacer actualización optimista - esperar el WebSocket 'draft_actualizado'
      // para asegurar que el backend rellenó correctamente el draft
    } catch (err) {
      showNotification(
        err?.response?.data?.error ||
          err?.message ||
          "No se pudo robar la carta del draft",
        "error",
      );
    } finally {
      setCargando(false);
    }
  };

  // Validación básica de sets
  const validarSet = (setArray) => {
    if (!setArray || setArray.length === 0) return false;

    // Obtener las cartas del set desde playerHand
    const cartasDelSet = setArray
      .map((idFront) => {
        return playerHand.find((c) => Number(c.idFrontend) === Number(idFront));
      })
      .filter(Boolean);

    if (cartasDelSet.length !== setArray.length) return false;

    // Identificar el detective principal (no Harley Quin)
    const detectivePrincipal = setArray.find((id) => id !== 8);

    if (!detectivePrincipal) return false; // Solo Harley Quin
    if (detectivePrincipal === 9) return false; // Adriane Oliver no puede iniciar

    // Verificar que todas las cartas sean del mismo detective o Harley Quin
    // Excepción especial: Tommy (6) y Tuppence (7) Beresford pueden jugarse juntos
    const hermanosBeresfords = [6, 7];
    const esSetBeresford = setArray.every(
      (id) => hermanosBeresfords.includes(id) || id === 8,
    );

    const esValido =
      setArray.every((id) => id === detectivePrincipal || id === 8) ||
      esSetBeresford;
    if (!esValido) return false;

    // Verificar cantidad mínima según detective
    const minCartas = [1, 2].includes(detectivePrincipal) ? 3 : 2;
    return setArray.length >= minCartas;
  };

  // Helper para verificar si el jugador actual está en desgracia social
  const jugadorActualEnDesgracia = () => {
    const jugadorActual = players.find((p) => Number(p.id) === Number(userId));
    return jugadorActual?.desgraciado || false;
  };

  // Sets handlers
  const openCheckSets = async () => {
    // Validar si el jugador está en desgracia social
    if (jugadorActualEnDesgracia()) {
      showNotification(
        "⚠️ Estás en Desgracia Social. Solo puedes descartar 1 carta y robar 1 carta.",
        "error",
      );
      return;
    }

    try {
      const partidaId = idGame;
      const jugadorId = Number(userId);
      const response = await checkSets(partidaId, jugadorId);

      const rawSets = response?.sets_disponibles ?? [];
      setAvailableSets(rawSets); // El modal se encarga de normalizar
      setModalSetsOpen(true);
    } catch (err) {
      console.error("Error checkSets:", err);
    }
  };

  // Handler para jugar carta de evento
  const handleJugarEvento = async () => {
    // Validar si el jugador está en desgracia social
    if (jugadorActualEnDesgracia()) {
      showNotification(
        "⚠️ Estás en Desgracia Social. Solo puedes descartar 1 carta y robar 1 carta.",
        "error",
      );
      return;
    }

    // Buscar cartas de evento seleccionadas (idFrontend >= 10 y < 19)
    const eventosJuego = cartasSeleccionadas.filter(
      (c) => c.idFrontend >= 10 && c.idFrontend < 19,
    );

    if (eventosJuego.length === 0) {
      showNotification(
        "Selecciona una carta de evento de tu mano primero.",
        "warning",
      );
      return;
    }

    // Si hay múltiples eventos seleccionados, mostrar error
    if (eventosJuego.length > 1) {
      showNotification(
        "No se puede jugar más de una carta de evento a la vez.",
        "warning",
      );
      return;
    }

    // Tomar la carta de evento seleccionada
    const cartaEvento = eventosJuego[0];

    // Validar que sea el turno del jugador
    if (turnoActual !== userId) {
      showNotification("No es tu turno.", "warning");
      return;
    }

    // Validar que no haya robado cartas en este turno
    if (haRobadoEnTurno) {
      showNotification(
        "No puedes jugar cartas de evento después de robar cartas. Debes finalizar tu turno.",
        "warning",
      );
      return;
    }

    try {
      setCargando(true);

      const eventoId = cartaEvento.idFrontend;
      const objetivosNecesarios = getTipoObjetivoParaEvento(eventoId);

      // Validar específicamente para evento 15 (And Then There Was One More)
      if (eventoId === 15) {
        const haySecretoRevelado = Object.values(allSecrets).some((secrets) =>
          tieneSecretoDelTipo(secrets || [], "revelado"),
        );
        if (!haySecretoRevelado) {
          showNotification(
            "No hay secretos revelados disponibles. No puedes jugar esta carta.",
            "error",
          );
          setCargando(false);
          return;
        }
      }

      // Verificar si el evento necesita objetivos
      if (objetivosNecesarios.cantidad === 0) {
        // El evento no necesita objetivos, se puede jugar directamente
        await jugarEventoDirectamente(cartaEvento, objetivosNecesarios);
      } else {
        // El evento necesita objetivos, iniciar flujo de selección
        setEventoEnJuego(cartaEvento);
        setEventosSeleccionados([]);
        setEventoObjetivoIndex(0);
        setEsperandoObjetivoEvento(true);

        // Mostrar notificación del primer objetivo
        const primerObjetivo = objetivosNecesarios.tipos[0];
        mostrarNotificacionParaObjetivoEvento(primerObjetivo, eventoId);
      }
    } catch (error) {
      console.error("Error al jugar carta de evento:", error);
      showNotification("No se pudo jugar la carta de evento.", "error");
    } finally {
      setCargando(false);
    }
  };

  // Helper para mostrar la notificación apropiada según el tipo de objetivo
  const mostrarNotificacionParaObjetivoEvento = (tipoObjetivo, eventoId) => {
    const mensajes = {
      jugador: `Selecciona un jugador haciendo click en él`,
      set: eventoId === 11 
        ? `Selecciona el set que quieres robar de otro jugador`
        : `Selecciona un set haciendo click en él`,
      secreto_oculto: `Selecciona un secreto oculto para revelar`,
      secreto_revelado: `Selecciona un secreto revelado haciendo click en él`,
      carta_descarte: `Haz click en una carta del descarte para seleccionarla`,
      direccion: `Selecciona una dirección (abre modal)`,
      cantidad: `Selecciona cantidad de cartas (abre modal)`,
    };

    const mensaje =
      mensajes[tipoObjetivo] || `Selecciona objetivo para el evento`;
    showNotification(mensaje, "info");

    // Abrir modales si es necesario
    if (tipoObjetivo === "direccion") {
      setTimeout(() => setModalDireccionOpen(true), 300);
    } else if (tipoObjetivo === "cantidad") {
      // Para evento 16, usar modal de descarte con cantidad
      if (eventoId === 16) {
        setTimeout(() => setModalDescarteConCantidadOpen(true), 300);
      } else {
        setTimeout(() => setModalCantidadOpen(true), 300);
      }
    } else if (tipoObjetivo === "carta_descarte") {
      setTimeout(() => setModalDescarteForEventoOpen(true), 300);
    }
  };

  // Helper para jugar evento sin objetivos
  const jugarEventoDirectamente = async (cartaEvento, objetivosNecesarios) => {
    try {
      // Mover la carta al MazoEvento inmediatamente
      setCartaEventoSeleccionada(cartaEvento);
      showNotification(
        `${cartaEvento.nombre}: Ejecutando efecto...`,
        "success",
      );

      // Llamar a try_jugar_evento para notificar (permite cancelación con NSF)
      // Este endpoint NO ejecuta el efecto, solo notifica
      let response = await try_jugar_evento(
        idGame,
        Number(userId),
        cartaEvento.idBackend,
      );

      // Establecer acción a cancelar para NSF
      setAccionACancelar({
        tipo: "evento",
        carta: cartaEvento,
        objetivos: [],
      });

      // Mostrar modal NSF si tengo cartas NSF disponibles
      if (tengoNSF && cartasNSFDisponibles.length > 0) {
        setEsperandoUsarNSF(true);
        showNotification(
          `⚡ ¡NOT SO FAST! Tienes ${cartasNSFDisponibles.length} carta(s) para cancelar (5s)`,
          "warning"
        );
      }

      // Resetear flag de cancelación
      accionCanceladaRef.current = false;

      // Mantener la carta visible por 5 segundos
      const timerId = setTimeout(async () => {
        try {
          if (accionCanceladaRef.current) {
            
            // La acción fue cancelada, no ejecutar el efecto
            setCartaEventoSeleccionada(null);
            setAccionACancelar(null);
            setEsperandoUsarNSF(false);
            return;
          }



          // Remover de la mano del jugador localmente
          setPlayerHand((prev) =>
            prev.filter((c) => c.idBackend !== cartaEvento.idBackend),
          );

          // Limpiar las selecciones
          setCartaEventoSeleccionada(null);
          setCartasSeleccionadas((prev) =>
            prev.filter((c) => c.idBackend !== cartaEvento.idBackend),
          );
          
          // Ahora sí ejecutar el efecto con jugar_carta_de_evento
          response = await jugar_carta_de_evento(
            idGame,
            Number(userId),
            cartaEvento.idBackend,
          );
          
          showNotification("Efecto de evento completado.", "success");
          setHaJugadoEventoEnTurno(true);
          
          // Limpiar NSF
          setAccionACancelar(null);
          setEsperandoUsarNSF(false);
        } catch (error) {
          console.error("Error post-evento:", error);
          showNotification("Error al completar el evento.", "error");
        }
      }, 5000);

      // Guardar el timer ID para poder cancelarlo si se usa NSF
      setNsfTimerId(timerId);
    } catch (error) {
      console.error("Error al jugar evento:", error);
      showNotification(
        error?.response?.data?.error || "Error al jugar evento.",
        "error",
      );
      setEsperandoObjetivoEvento(false);
      setEventoEnJuego(null);
      setEventosSeleccionados([]);
    }
  };

  const handleRevelarSecretoPropio = async (secretoIdBackend) => {
    try {
      const tieneSatterthwaite = setActivoParaRevelacion?.some(
        (carta) => carta.id_front === 3,
      );
      const tieneQuin = setActivoParaRevelacion?.some(
        (carta) => carta.id_front === 8,
      );
      const esSatterthwaiteQuin = tieneSatterthwaite && tieneQuin;

      await revelarSecretoPropio(
        idGame,
        Number(userId),
        secretoIdBackend,
        esSatterthwaiteQuin,
        esSatterthwaiteQuin ? jugadorQueJugoSet : null,
      );

      setEsperandoRevelarSecreto(false);
      setJugadorObjetivoRevelacion(null);
      setSetActivoParaRevelacion(null);
      setJugadorQueJugoSet(null);

      closeNotification();
      showNotification("Secreto procesado exitosamente.", "success");
    } catch (err) {
      console.error("Error al revelar secreto propio:", err);
      showNotification(
        err?.response?.data?.error || err.message || "Error al revelar secreto",
        "error",
      );
    }
  };

  // Helper para obtener un set específico por su setId
  const obtenerSetPorId = (setId) => {
    // Buscar en allPlayerSets el set con ese ID
    for (const jugadorId in allPlayerSets) {
      const setsBySetId = allPlayerSets[jugadorId];
      
      // setsBySetId puede ser un objeto { 1: [cartas], 2: [cartas] } o un array
      if (typeof setsBySetId === 'object' && setsBySetId !== null) {
        // Si es un objeto con setIds como keys
        for (const setIdKey in setsBySetId) {
          const set = setsBySetId[setIdKey];
          
          if (Array.isArray(set) && set.length > 0) {
            // Verificar si alguna carta del set tiene el setId buscado
            const primeraCarta = set[0];
            const setIdDelSet = primeraCarta.set || primeraCarta.setId || Number(setIdKey);
            
            if (Number(setIdDelSet) === Number(setId)) {
              return set;
            }
          }
        }
      }
    }
    
    return null;
  };

  // Handler para seleccionar objetivo de evento
  const handleSeleccionarObjetivoEvento = async (objetivoId, tipoObjetivo) => {
    try {
      if (!eventoEnJuego) {
        showNotification("Error: No hay evento en juego", "error");
        setEsperandoObjetivoEvento(false);
        return;
      }

      const eventoId = eventoEnJuego.idFrontend;
      const objetivosNecesarios = getTipoObjetivoParaEvento(eventoId);
      const nuevoArrayObjetivos = [
        ...eventosSeleccionados,
        { id: objetivoId, tipo: tipoObjetivo },
      ];

      setEventosSeleccionados(nuevoArrayObjetivos);

      // ========== LÓGICA ESPECIAL PARA ANOTHER VICTIM (ID 11) ==========
      if (eventoId === 11 && tipoObjetivo === "set") {
        // Se seleccionó el set a robar, ahora determinar objetivo2
        
        // Obtener las cartas del set seleccionado
        const setSeleccionado = obtenerSetPorId(objetivoId);
        
        if (!setSeleccionado || setSeleccionado.length === 0) {
          showNotification("Error: No se pudo obtener el set seleccionado", "error");
          setEsperandoObjetivoEvento(false);
          setEventoEnJuego(null);
          setEventosSeleccionados([]);
          return;
        }
        
        // Determinar el detective principal del set
        const detectivePrincipal = getDetectivePrincipalDelSet(
          setSeleccionado.map(c => c.id_front || c.idFrontend)
        );
        
        const tipoObjetivo2 = getTipoObjetivoParaDetective(detectivePrincipal);
        
        if (tipoObjetivo2 === null) {
          // Comodín (Harley Quin/Ariadne) - no necesita objetivo2
          await finalizarEventoConObjetivos(eventoEnJuego, nuevoArrayObjetivos);
          return;
        }
        
        // Setear el tipo de objetivo que se espera ahora
        setTipoObjetivoActual(tipoObjetivo2);
        
        // Mostrar notificación para el siguiente objetivo
        setEventoObjetivoIndex(1);
        
        if (tipoObjetivo2 === 'secreto_oculto') {
          showNotification("Ahora selecciona un secreto oculto para revelar", "info");
        } else if (tipoObjetivo2 === 'secreto_revelado') {
          showNotification("Ahora selecciona un secreto revelado para ocultar", "info");
        } else if (tipoObjetivo2 === 'jugador') {
          showNotification("Ahora selecciona el jugador objetivo", "info");
        }
        
        return; // Esperar segundo objetivo
      }
      // ========== FIN LÓGICA ESPECIAL ANOTHER VICTIM ==========

      // Verificar si necesitamos más objetivos
      if (nuevoArrayObjetivos.length < objetivosNecesarios.cantidad) {
        // Mostrar notificación del siguiente objetivo
        const siguienteObjetivo =
          objetivosNecesarios.tipos[nuevoArrayObjetivos.length];
        setEventoObjetivoIndex(nuevoArrayObjetivos.length);
        mostrarNotificacionParaObjetivoEvento(siguienteObjetivo, eventoId);
        return;
      }

      // Se han seleccionado todos los objetivos, jugar evento
      await finalizarEventoConObjetivos(eventoEnJuego, nuevoArrayObjetivos);
    } catch (error) {
      showNotification(
        error.message || "Error al seleccionar objetivo",
        "error",
      );
      setEsperandoObjetivoEvento(false);
      setEventoEnJuego(null);
      setEventosSeleccionados([]);
      setTipoObjetivoActual(null);
    }
  };

  // Helper para finalizar evento con objetivos seleccionados
  const finalizarEventoConObjetivos = async (cartaEvento, objetivos) => {
    try {
      setCartaEventoSeleccionada(cartaEvento);
      showNotification(
        `${cartaEvento.nombre}: Ejecutando efecto...`,
        "success",
      );

      // Mapear objetivos según el evento
      let objetivo_id = null;
      let objetivo2_id = null;

      if (objetivos.length >= 1) {
        objetivo_id = objetivos[0].id;
      }
      if (objetivos.length >= 2) {
        objetivo2_id = objetivos[1].id;
      }

      // Enviar al backend
      const response = await try_jugar_evento(
        idGame,
        Number(userId),
        cartaEvento.idBackend,
        objetivo_id,
        objetivo2_id,
      );

      // Establecer acción a cancelar para NSF
      setAccionACancelar({
        tipo: "evento",
        carta: cartaEvento,
        objetivos: objetivos,
      });

      // Mostrar modal NSF si tengo cartas NSF disponibles
      if (tengoNSF && cartasNSFDisponibles.length > 0) {
        setEsperandoUsarNSF(true);
        showNotification(
          `⚡ ¡NOT SO FAST! Tienes ${cartasNSFDisponibles.length} carta(s) para cancelar (5s)`,
          "warning"
        );
      }

      // Resetear flag de cancelación
      accionCanceladaRef.current = false;
      
      // Mantener la carta visible por 5 segundos
      const timerId = setTimeout(async () => {
        try {
          if (accionCanceladaRef.current) {
           
            // La acción fue cancelada, no ejecutar el efecto
            setCartaEventoSeleccionada(null);
            setAccionACancelar(null);
            setEsperandoUsarNSF(false);
            setEsperandoObjetivoEvento(false);
            setEventoEnJuego(null);
            setEventosSeleccionados([]);
            setTipoObjetivoActual(null);
            return;
          }

          // Remover de la mano del jugador localmente
          setPlayerHand((prev) =>
            prev.filter((c) => c.idBackend !== cartaEvento.idBackend),
          );

          // Limpiar las selecciones
          setCartaEventoSeleccionada(null);
          setCartasSeleccionadas((prev) =>
            prev.filter((c) => c.idBackend !== cartaEvento.idBackend),
          );
          setEsperandoObjetivoEvento(false);
          setEventoEnJuego(null);
          setEventosSeleccionados([]);
          setTipoObjetivoActual(null);

          // Ahora sí ejecutar el efecto con jugar_carta_de_evento
          const efectoResponse = await jugar_carta_de_evento(
            idGame,
            Number(userId),
            cartaEvento.idBackend,
            objetivo_id,
            objetivo2_id
          );
          
          console.log("[DEBUG] Respuesta jugar_carta_de_evento:", efectoResponse);

          showNotification("Efecto de evento completado.", "success");
          setHaJugadoEventoEnTurno(true);
          
          // Limpiar NSF
          setAccionACancelar(null);
          setEsperandoUsarNSF(false);
        } catch (error) {
          console.error("Error al completar evento:", error);
          showNotification("Error al completar el evento.", "error");
        }
      }, 5000);

      // Guardar el timer ID para poder cancelarlo si se usa NSF
      setNsfTimerId(timerId);
    } catch (error) {
      showNotification(
        error?.response?.data?.error || "Error al jugar evento.",
        "error",
      );
      setEsperandoObjetivoEvento(false);
      setEventoEnJuego(null);
      setEventosSeleccionados([]);
      setTipoObjetivoActual(null);
    }
  };

  // Handler para cancelar selección de objetivos de evento
  const handleCancelarEventoObjetivos = () => {
    setEsperandoObjetivoEvento(false);
    setEventoEnJuego(null);
    setEventosSeleccionados([]);
    setTipoObjetivoActual(null);
    closeNotification();
    showNotification("Selección de evento cancelada", "info");
  };

  const confirmarSet = async (setArray) => {
    try {
      console.log(
        "[DEBUG FRONTEND] confirmarSet iniciado con setArray:",
        setArray,
      );
      console.log(
        "[DEBUG FRONTEND] playerHand completa:",
        JSON.stringify(playerHand, null, 2),
      );

      // Validar que no haya robado cartas en este turno
      if (haRobadoEnTurno) {
        showNotification(
          "No puedes bajar sets después de robar cartas. Debes finalizar tu turno.",
          "warning",
        );
        return;
      }

      // Validar el set antes de enviarlo
      if (!validarSet(setArray)) {
        showNotification(
          "Set invalido. Verifica las reglas de los detectives.",
          "error",
        );
        return;
      }

      // Mapear id_front -> idBackend usando playerHand, evitando duplicados
      const cartas_jugadas_id = [];
      const cartasUsadas = new Set();

      for (const idFront of setArray) {

        // Buscar una carta con este id_front que no hayamos usado ya
        const carta = playerHand.find(
          (c) =>
            Number(c.idFrontend) === Number(idFront) &&
            !cartasUsadas.has(c.idBackend),
        );

        if (!carta)
          throw new Error(
            `No se encontró carta disponible con id_front: ${idFront}`,
          );

        cartas_jugadas_id.push(carta.idBackend);
        cartasUsadas.add(carta.idBackend);
      }

      // Las cartas ya están mapeadas correctamente sin duplicados de idBackend
      console.log(
        "[DEBUG FRONTEND] Cartas mapeadas (idBackend):",
        cartas_jugadas_id,
      );

      // Verificar si alguna carta necesita objetivo
      const cartaNecesitaObjetivo = setArray.some((idFront) =>
        necesitaObjetivo(idFront),
      );

      if (cartaNecesitaObjetivo) {
        // Obtener el detective principal para validar si hay objetivos disponibles
        const detectivePrincipal = getDetectivePrincipalDelSet(setArray);
        const validacion = puedeJugarseSet(
          detectivePrincipal,
          allSecrets,
          Number(userId),
        );

        if (!validacion.canPlay) {
          showNotification(validacion.reason, "error");
          return;
        }

        // Guardar las cartas en espera y activar modo espera de objetivo
        console.log(
          "[DEBUG FRONTEND] Carta necesita objetivo, esperando selección del jugador",
        );
        setCartasEnJuego(cartas_jugadas_id);
        setSetArrayOriginal(setArray); // Guardar también el setArray original para validación
        setEsperandoObjetivo(true);
        setModalSetsOpen(false);

        // Mostrar notificación según el tipo de objetivo
        const tipoObjetivoEsperado =
          getTipoObjetivoParaDetective(detectivePrincipal);
        if (tipoObjetivoEsperado === "jugador") {
          showNotification("👆 Haz clic en el avatar de un jugador", "info");
        } else if (tipoObjetivoEsperado === "secreto_oculto") {
          showNotification(
            "👆 Haz clic en un secreto oculto para revelar",
            "info",
          );
        } else if (tipoObjetivoEsperado === "secreto_revelado") {
          showNotification(
            "👆 Haz clic en un secreto revelado para ocultar",
            "info",
          );
        }
        return;
      }

      const tryResponse = await try_jugar_set(
        idGame,
        Number(userId),
        0,
        cartas_jugadas_id[0] || null,
        cartas_jugadas_id[1] || null,
        cartas_jugadas_id[2] || null,
      );

      // Establecer acción a cancelar para NSF
      setAccionACancelar({
        tipo: "set",
        cartas: cartas_jugadas_id,
        objetivo: 0,
      });

      // Mostrar modal NSF si tengo cartas NSF disponibles
      if (tengoNSF && cartasNSFDisponibles.length > 0) {
        setEsperandoUsarNSF(true);
      }

      // Reset cancellation flag antes de iniciar el timer
      accionCanceladaRef.current = false;
      console.log("[NSF DEBUG] Set sin objetivo - Flag reseteado a false, iniciando timer de 5s");

      const timerId = setTimeout(async () => {
        // ⛔ Verificar si la acción fue cancelada por NSF
        console.log("[NSF DEBUG] Timer de 5s cumplido - Verificando flag:", accionCanceladaRef.current);
        if (accionCanceladaRef.current) {
          console.log("⛔ Set cancelado por NSF, no se ejecuta el efecto");
          setAccionACancelar(null);
          setEsperandoUsarNSF(false);
          setNsfTimerId(null);
          return; // No ejecutar jugarSet
        }

        try {
          console.log("✅ Ejecutando jugarSet (no fue cancelado)");
          const response = await jugarSet(
            idGame,
            Number(userId),
            0,
            cartas_jugadas_id[0] || null,
            cartas_jugadas_id[1] || null,
            cartas_jugadas_id[2] || null,
          );

          setPlayerHand((prev) => {
            const nuevaMano = prev.filter(
              (carta) => !cartas_jugadas_id.includes(carta.idBackend),
            );
            return nuevaMano;
          });

          setHaJugadoSetEnTurno(true);
          setModalSetsOpen(false);
          showNotification("Set jugado exitosamente.", "success");
          
          // Limpiar NSF
          setAccionACancelar(null);
          setEsperandoUsarNSF(false);
          setNsfTimerId(null);
        } catch (err) {
          console.error("Error ejecutando jugarSet después de NSF:", err);
          setAccionACancelar(null);
          setEsperandoUsarNSF(false);
          setNsfTimerId(null);
          showNotification(
            err?.response?.data?.error || err.message || "Error al jugar set",
            "error",
          );
        }
      }, 5000);

      // Guardar el timer ID
      setNsfTimerId(timerId);
    } catch (err) {
      console.error("[ERROR FRONTEND] Error jugando set:", err);
      console.error(
        "[ERROR FRONTEND] Error completo:",
        err?.response?.data || err.message,
      );
      showNotification(
        err?.response?.data?.error || err.message || "Error al jugar set",
        "error",
      );
    }
  };

  // Handler para cuando se selecciona un jugador objetivo (haciendo clic en su avatar) o un secreto
  const handleSeleccionarObjetivo = async (
    objetivoId,
    tipoObjetivo = "jugador",
  ) => {
    try {
      if (!cartasEnJuego) {
        showNotification("Error: No hay cartas en espera", "error");
        setEsperandoObjetivo(false);
        return;
      }

      // Verificar si es extender set (cartasEnJuego tiene carta y setId)
      if (cartasEnJuego.carta && cartasEnJuego.setId) {
        // Es extender set con detective
        const { carta, setId } = cartasEnJuego;

        setCargando(true);

        // 1. Enviar try primero (notifica a todos los jugadores)
        await try_agregarDetectiveASet(
          idGame,
          Number(userId),
          carta.idBackend,
          setId,
          objetivoId,
        );

        // 2. Establecer acción a cancelar para NSF
        setAccionACancelar({
          tipo: "agregar_detective",
          carta: carta,
          setId: setId,
          objetivoId: objetivoId,
        });

        // Mostrar modal NSF si tengo cartas NSF disponibles
        if (tengoNSF && cartasNSFDisponibles.length > 0) {
          setEsperandoUsarNSF(true);
        }

        // Reset cancellation flag antes de iniciar el timer
        accionCanceladaRef.current = false;
        console.log("[NSF DEBUG] ⚙️ Agregar detective - Flag RESETEADO a false, iniciando timer de 5s, setId:", setId);

        const timerId = setTimeout(async () => {
          // ⛔ Verificar si la acción fue cancelada por NSF
          console.log("[NSF DEBUG] Timer de 5s cumplido (agregar detective) - Verificando flag:", accionCanceladaRef.current);
          if (accionCanceladaRef.current) {
            console.log("⛔ Agregar detective cancelado por NSF, no se ejecuta");
            setAccionACancelar(null);
            setEsperandoUsarNSF(false);
            setNsfTimerId(null);
            return; // No ejecutar agregarDetectiveASet
          }

          try {
            console.log("✅ Ejecutando agregarDetectiveASet (no fue cancelado)");
            // 3. Ejecutar la acción final (agregar detective al set)
            const response = await agregarDetectiveASet(
              idGame,
              Number(userId),
              carta.idBackend,
              setId,
              objetivoId,
            );

            // Verificar si el backend devolvió un error
            if (response && response.error) {
              showNotification(`Error: ${response.error}`, "error");
              setAccionACancelar(null);
              setEsperandoUsarNSF(false);
              setNsfTimerId(null);
              return;
            }

            setAccionACancelar(null);
            setEsperandoUsarNSF(false);
            setNsfTimerId(null);

            // Los WebSockets actualizarán el estado (sets y mano)
            // El WS secreto_modificado_y_partida_actualizada manejará la actualización
          } catch (err) {
            showNotification(
              err?.response?.data?.error ||
                err.message ||
                "Error al agregar detective al set",
              "error",
            );
            setAccionACancelar(null);
            setEsperandoUsarNSF(false);
            setNsfTimerId(null);
          }
        }, 5000); // 5 segundos para NSF

        setNsfTimerId(timerId);

        setEsperandoObjetivo(false);
        setCartasEnJuego(null);
        setSetAExtender(null);

        closeNotification();
        showNotification(
          "Detective por agregar. Esperando posibles Not So Fast (5 seg)...",
          "info",
        );

        setCargando(false);
        return;
      }

      // Si llega aquí, es jugar set normal
      if (!cartasEnJuego) {
        showNotification("Error: No hay cartas en espera", "error");
        setEsperandoObjetivo(false);
        return;
      }

      if (!setArrayOriginal || setArrayOriginal.length === 0) {
        showNotification("Error: No se encontró el set original", "error");
        setEsperandoObjetivo(false);
        return;
      }

      // Obtener el detective principal del set
      const detectivePrincipal = getDetectivePrincipalDelSet(setArrayOriginal);
      const tipoObjetivoEsperado =
        getTipoObjetivoParaDetective(detectivePrincipal);

      console.log(
        "[DEBUG FRONTEND] Tipo de objetivo esperado:",
        tipoObjetivoEsperado,
      );
      console.log(
        "[DEBUG FRONTEND] Tipo de objetivo seleccionado:",
        tipoObjetivo,
      );

      // Validar que el tipo de objetivo sea correcto
      let objetivoValido = false;
      if (tipoObjetivoEsperado === "jugador" && tipoObjetivo === "jugador") {
        objetivoValido = true;
      } else if (
        tipoObjetivoEsperado === "secreto_oculto" &&
        tipoObjetivo === "secreto_oculto"
      ) {
        objetivoValido = true;
      } else if (
        tipoObjetivoEsperado === "secreto_revelado" &&
        tipoObjetivo === "secreto_revelado"
      ) {
        objetivoValido = true;
      } else if (
        tipoObjetivoEsperado === "secreto_cualquiera" &&
        (tipoObjetivo === "secreto_oculto" ||
          tipoObjetivo === "secreto_revelado")
      ) {
        objetivoValido = true;
      }

      if (!objetivoValido) {
        const mensajeError = `Tipo de objetivo incorrecto. Se espera ${tipoObjetivoEsperado} pero seleccionaste ${tipoObjetivo}`;
        showNotification(mensajeError, "error");
        return;
      }

      console.log(
        "[DEBUG FRONTEND] Validando set con setArray:",
        setArrayOriginal,
      );
      console.log(
        "[DEBUG FRONTEND] playerHand completa:",
        JSON.stringify(playerHand, null, 2),
      );

      // Validar el set antes de enviarlo
      if (!validarSet(setArrayOriginal)) {
        showNotification(
          "Set invalido. Verifica las reglas de los detectives.",
          "error",
        );
        setEsperandoObjetivo(false);
        setCartasEnJuego(null);
        setSetArrayOriginal(null);
        return;
      }

      // Las cartas ya están mapeadas a idBackend en cartasEnJuego
      console.log(
        "[DEBUG FRONTEND] Llamando try_jugar_set con objetivo:",
        objetivoId,
      );

      const cartasParaJugar = [...cartasEnJuego];
      const objetivoFinal = objetivoId || 0;

      const tryResponse = await try_jugar_set(
        idGame,
        Number(userId),
        objetivoFinal,
        cartasParaJugar[0] || null,
        cartasParaJugar[1] || null,
        cartasParaJugar[2] || null,
      );

      // Establecer acción a cancelar para NSF
      setAccionACancelar({
        tipo: "set",
        cartas: cartasParaJugar,
        objetivo: objetivoFinal,
      });

      // Mostrar modal NSF si tengo cartas NSF disponibles
      if (tengoNSF && cartasNSFDisponibles.length > 0) {
        setEsperandoUsarNSF(true);
      }

      setEsperandoObjetivo(false);
      setCartasEnJuego(null);
      setSetArrayOriginal(null);
      closeNotification();

      showNotification("Set enviado. Esperando 5 segundos...", "info");

      // Reset cancellation flag antes de iniciar el timer
      accionCanceladaRef.current = false;
      console.log("[NSF DEBUG] Set con objetivo - Flag reseteado a false, iniciando timer de 5s");

      const timerId = setTimeout(async () => {
        // ⛔ Verificar si la acción fue cancelada por NSF
        console.log("[NSF DEBUG] Timer de 5s cumplido (set con objetivo) - Verificando flag:", accionCanceladaRef.current);
        if (accionCanceladaRef.current) {
          console.log("⛔ Set con objetivo cancelado por NSF, no se ejecuta el efecto");
          setAccionACancelar(null);
          setEsperandoUsarNSF(false);
          setNsfTimerId(null);
          return; // No ejecutar jugarSet
        }

        try {
          console.log("✅ Ejecutando jugarSet con objetivo (no fue cancelado)");
          const response = await jugarSet(
            idGame,
            Number(userId),
            objetivoFinal,
            cartasParaJugar[0] || null,
            cartasParaJugar[1] || null,
            cartasParaJugar[2] || null,
          );

          setPlayerHand((prev) => {
            const nuevaMano = prev.filter(
              (carta) => !cartasParaJugar.includes(carta.idBackend),
            );
            return nuevaMano;
          });

          setHaJugadoSetEnTurno(true);
          showNotification("Set jugado exitosamente.", "success");
          
          // Limpiar NSF
          setAccionACancelar(null);
          setEsperandoUsarNSF(false);
          setNsfTimerId(null);
        } catch (err) {
          console.error("Error ejecutando jugarSet después de NSF:", err);
          setAccionACancelar(null);
          setEsperandoUsarNSF(false);
          setNsfTimerId(null);
          showNotification(
            err?.response?.data?.error || err.message || "Error al jugar set",
            "error",
          );
        }
      }, 5000);

      // Guardar el timer ID
      setNsfTimerId(timerId);
    } catch (err) {
      console.error("[ERROR FRONTEND] Error al jugar set con objetivo:", err);
      console.error(
        "[ERROR FRONTEND] Error completo:",
        err?.response?.data || err.message,
      );
      showNotification(
        err?.response?.data?.error || err.message || "Error al jugar set",
        "error",
      );
      setEsperandoObjetivo(false);
      setCartasEnJuego(null);
      setSetArrayOriginal(null);
    }
  };

  // Handler para cancelar la espera de objetivo
  const handleCancelarEsperaObjetivo = () => {
    setEsperandoObjetivo(false);
    setCartasEnJuego(null);
    setSetArrayOriginal(null);
    closeNotification(); // Remover la notificación de selección de objetivo
    showNotification("Selección cancelada", "info");
  };

  // ===== HANDLERS PARA EXTENDER SET =====

  // Handler para cuando se hace click en el botón "+" de un set
  const handleExtenderSet = (
    setIndex,
    setId,
    cartasDelSet,
    esSetPropio = true,
  ) => {
    // Validar que es mi turno
    if (turnoActual !== userId) {
      showNotification("No es tu turno", "warning");
      return;
    }

    // Validar que no haya robado cartas
    if (haRobadoEnTurno) {
      showNotification(
        "No puedes extender sets después de robar cartas. Debes finalizar tu turno.",
        "warning",
      );
      return;
    }

    // Obtener cartas válidas para este set
    const cartasValidas = obtenerCartasValidasParaSet(
      cartasDelSet,
      esSetPropio,
    );

    if (cartasValidas.length === 0) {
      const mensaje = esSetPropio
        ? "No tienes cartas válidas para agregar a este set."
        : "No tienes Ariadne Oliver para agregar a sets de otros jugadores.";
      showNotification(mensaje, "warning");
      return;
    }

    // Guardar información del set a extender
    setSetAExtender({
      index: setIndex,
      setId,
      cartas: cartasDelSet,
      esSetPropio,
    });
    setCartasDisponiblesParaSet(cartasValidas);
    setModalAgregarDetectiveOpen(true);
  };

  // Función para obtener cartas válidas para un set
  const obtenerCartasValidasParaSet = (cartasDelSet, esSetPropio = false) => {
    if (!cartasDelSet || cartasDelSet.length === 0) return [];

    // Obtener el detective principal del set (no comodines)
    const detectivePrincipal = cartasDelSet.find((c) => {
      const idFront = c.id_front || c.idFrontend;
      return idFront !== 8 && idFront !== 9; // No Harley Quin (8) ni Ariadne Oliver (9)
    });

    if (!detectivePrincipal) {
      // Si el set solo tiene comodines, cualquier detective es válido
      return playerHand.filter((carta) => {
        const idFront = carta.idFrontend;
        const cartaInfo = encontrarCartaPorId(idFront);

        if (!cartaInfo || cartaInfo.tipo !== "Detective") return false;

        // Harley Quin (8) solo en sets propios
        if (idFront === 8 && !esSetPropio) return false;

        // Ariadne Oliver (9) solo en sets ajenos
        if (idFront === 9 && esSetPropio) return false;

        return true;
      });
    }

    const idDetectivePrincipal =
      detectivePrincipal.id_front || detectivePrincipal.idFrontend;

    // Caso especial: Tommy y Tuppence Beresford pueden estar en el mismo set
    const hermanosBeresfords = [6, 7];
    const esSetBeresford = hermanosBeresfords.includes(idDetectivePrincipal);

    // Filtrar cartas de la mano que sean válidas
    return playerHand.filter((carta) => {
      const idFront = carta.idFrontend;
      const cartaInfo = encontrarCartaPorId(idFront);

      // Debe ser detective
      if (!cartaInfo || cartaInfo.tipo !== "Detective") return false;

      // Harley Quin (8) solo puede agregarse a sets propios
      if (idFront === 8) {
        return esSetPropio; // Solo válido si es set propio
      }

      // Ariadne Oliver (9) solo puede agregarse a sets de otros jugadores
      if (idFront === 9) {
        return !esSetPropio; // Solo válido si NO es set propio
      }

      // Para sets AJENOS: solo Ariadne Oliver puede agregarse (ya validado arriba)
      if (!esSetPropio) {
        return false; // Ningún otro detective puede ir en sets ajenos
      }

      // --- A partir de aquí, solo validaciones para sets PROPIOS ---

      // Set de Beresfords acepta Tommy o Tuppence (solo en sets propios)
      if (esSetBeresford && hermanosBeresfords.includes(idFront)) return true;

      // Mismo detective que el principal (solo para sets propios)
      if (idFront === idDetectivePrincipal) return true;

      // Cualquier otro caso es inválido
      return false;
    });
  };

  // Handler para confirmar agregar carta al set
  const handleConfirmarAgregarDetective = async (carta) => {
    try {
      if (!setAExtender) {
        showNotification("Error: No se encontró el set a extender", "error");
        return;
      }

      // Obtener el detective principal del set ORIGINAL (el que determina el efecto)
      const detectivePrincipalOriginal = setAExtender.cartas.find(
        (c) => {
          const idFront = c.id_front || c.idFrontend;
          return idFront !== 8 && idFront !== 9; // Ignorar Quin y Oliver
        }
      )?.id_front || null;

      // Determinar qué detective define el efecto
      const cartaIdFront = carta.idFrontend || carta.id_front;
      const esComodin = cartaIdFront === 8 || cartaIdFront === 9;
      
      const detectiveQueDefineEfecto = esComodin 
        ? detectivePrincipalOriginal 
        : cartaIdFront;

      // ✅ VALIDACIÓN: Verificar que existan objetivos válidos del tipo requerido
      if (detectiveQueDefineEfecto) {
        const tipoObjetivo = getTipoObjetivoParaDetective(detectiveQueDefineEfecto);

        if (tipoObjetivo === "secreto_oculto") {
          // Poirot (1), Marple (2): necesitan secreto oculto (estado 9)
          const hayObjetivosValidos = Object.keys(allSecrets).some((jugadorId) => {
            if (Number(jugadorId) === Number(userId)) return false; // No contar al jugador actual
            const secretos = allSecrets[jugadorId] || [];
            return secretos.some((s) => s.estado === 9); // Al menos un secreto oculto
          });

          if (!hayObjetivosValidos) {
            showNotification(
              "No hay jugadores con secretos ocultos para revelar. No puedes agregar este detective al set.",
              "error",
            );
            setModalAgregarDetectiveOpen(false);
            return;
          }
        } else if (tipoObjetivo === "secreto_revelado") {
          // Pyne (4): necesita secreto revelado (estado 0)
          const hayObjetivosValidos = Object.keys(allSecrets).some((jugadorId) => {
            if (Number(jugadorId) === Number(userId)) return false; // No contar al jugador actual
            const secretos = allSecrets[jugadorId] || [];
            return secretos.some((s) => s.estado === 0); // Al menos un secreto revelado
          });

          if (!hayObjetivosValidos) {
            showNotification(
              "No hay jugadores con secretos revelados para ocultar. No puedes agregar este detective al set.",
              "error",
            );
            setModalAgregarDetectiveOpen(false);
            return;
          }
        }
        // Para "jugador" (Satterthwaite, Brent, Tommy, Tuppence) no hay validación adicional
        // ya que siempre hay otros jugadores disponibles
      }

      // TODOS los detectives necesitan objetivo, siempre pedir selección
      // Guardar la carta y el set para cuando se seleccione objetivo
      setCartasEnJuego({ carta, setId: setAExtender.setId });
      setEsperandoObjetivo(true);

      const setArray = new Set(
        Array.from(setAExtender.cartas).map((c) => c.id_front),
      );
      setSetArrayOriginal(setArray);

      setModalAgregarDetectiveOpen(false);
      showNotification(
        "Selecciona el jugador objetivo para aplicar el efecto",
        "info",
      );
    } catch (err) {
      console.error("[ERROR] Error al agregar detective:", err);
      showNotification(
        err?.response?.data?.error ||
          err.message ||
          "Error al agregar detective al set",
        "error",
      );
    }
  };

  // Reordenar jugadores: el jugador actual siempre primero (posición inferior)
  const currentPlayerIndex = players.findIndex((p) => p.id === userId);

  // Crear un nuevo array con el jugador actual primero y los demás después
  // ----------------------------------------------------------------------------------------------------------------------
  // En el Futuro habra que modificar esto ya que el back supuestamente ya nos envian los jugadores en el orden correcto xd
  // ----------------------------------------------------------------------------------------------------------------------
  const reorderedPlayers =
    currentPlayerIndex !== -1
      ? [
          players[currentPlayerIndex], // Jugador actual primero
          ...players.slice(currentPlayerIndex + 1), // Jugadores después del actual
          ...players.slice(0, currentPlayerIndex), // Jugadores antes del actual
        ]
      : players;

  return (
    <div className="game-container">
      {/* Área central de mazos */}
      <CentralArea
        cantidadCartasMazo={mazoRegular}
        cartasDescarte={mazoDescarte}
        cantidadCartasDescarte={contadorDescarte}
        onRobarCarta={() =>
          handleRobarCarta(players[currentPlayerIndex] || players[0], idGame)
        } // Pasar jugador actual (fallback al primero)
        estaActivo={playerHand.length < 6} // Solo permitir robar si tiene menos de 6 cartas
        cartaEventoSeleccionada={cartaEventoSeleccionada}
        cartasSeleccionadas={cartasSeleccionadas}
        onJugarEvento={handleJugarEvento}
      />{" "}
      {/* Mazo Draft - muestra las cartas disponibles para elegir */}
      {cartaDrafts && cartaDrafts.length > 0 && (
        <MazoDraft
          cartas={cartaDrafts}
          onPick={(posicion) =>
            handleRobarCartaDraft(
              players[currentPlayerIndex] || players[0],
              idGame,
              posicion,
            )
          }
        />
      )}
      {/* Boton de finalizar turno */}
      <button
        className="endturn"
        type="submit"
        onClick={handleEndTurn}
        disabled={
          turnoActual !== userId ||
          (!haDescartadoEnTurno &&
            !haJugadoEventoEnTurno &&
            !haJugadoSetEnTurno) ||
          playerHand.length !== 6
        }
        title={
          turnoActual !== userId
            ? "No es tu turno"
            : !haDescartadoEnTurno &&
                !haJugadoEventoEnTurno &&
                !haJugadoSetEnTurno
              ? "Debes descartar al menos una carta, jugar un evento o bajar un set antes de finalizar tu turno"
              : playerHand.length > 6
                ? "Debes descartar cartas hasta tener 6"
                : playerHand.length < 6
                  ? "Debes robar cartas hasta completar 6"
                  : "Finalizar turno"
        }
      >
        Finalizar Turno{" "}
        {!haDescartadoEnTurno && !haJugadoEventoEnTurno && !haJugadoSetEnTurno
          ? "⚠️"
          : ""}{" "}
        {playerHand.length !== 6 ? `(${playerHand.length}/6)` : ""}
      </button>
      {/* Botón para no realizar accion(descartar y robar automáticamente) */}
      <button
        className="no-ejecutar-accion"
        type="button"
        onClick={handleNoAccion}
        disabled={
          turnoActual !== userId ||
          haDescartadoEnTurno ||
          cargando ||
          playerHand.length === 0
        }
        title={
          turnoActual !== userId
            ? "No es tu turno"
            : haDescartadoEnTurno
              ? "Ya descartaste en este turno"
              : playerHand.length === 0
                ? "No tienes cartas para descartar"
                : "No realizar accion: descarta y roba 1 carta automáticamente"
        }
      >
        No realizar acción
      </button>
      {/* Botón para bajar sets */}
      <button
        className="bajar-set"
        type="button"
        onClick={openCheckSets}
        disabled={turnoActual !== userId || cargando || jugadorActualEnDesgracia()}
        title={
          turnoActual !== userId
            ? "No es tu turno"
            : jugadorActualEnDesgracia()
              ? "No puedes bajar sets en Desgracia Social"
              : "Verificar sets disponibles con tus cartas"
        }
      >
        🃏 Bajar Set
      </button>
      {/* Modal para seleccionar sets a bajar */}
      <ModalSeleccionarSet
        isOpen={modalSetsOpen}
        onClose={() => setModalSetsOpen(false)}
        onConfirm={confirmarSet}
        sets={availableSets}
        titulo={"Selecciona set detectives"}
      />
      {/* Modal para mostrar sets jugados en la mesa */}
      <ModalRobarSet
        isOpen={modalRobarSetOpen}
        onClose={() => setModalRobarSetOpen(false)}
        setsJugados={allPlayerSets}
        onSelectSet={handleRobarSet}
      />
      {/* Nuevo modal para robar sets */}
      <RobarSetModal
        isOpen={modalRobarSetNuevoOpen}
        onClose={() => setModalRobarSetNuevoOpen(false)}
        currentPlayerId={userId}
        playerNames={players.reduce(
          (acc, p) => ({ ...acc, [p.id]: p.nombre }),
          {},
        )}
        onRobarSet={handleRobarSetNuevo}
        allPlayerSets={allPlayerSets}
      />
      {/* Modal para agregar detective a set */}
      <ModalAgregarDetective
        isOpen={modalAgregarDetectiveOpen}
        onClose={() => {
          setModalAgregarDetectiveOpen(false);
          setSetAExtender(null);
          setCartasDisponiblesParaSet([]);
        }}
        onConfirm={handleConfirmarAgregarDetective}
        cartasDisponibles={cartasDisponiblesParaSet}
        setInfo={setAExtender}
      />
      {/* Jugadores alrededor de la mesa en distribución dinámica */}
      {reorderedPlayers.map((player, index) => {
        const isCurrentPlayer = player.id === userId;
        const isPlayerTurn = player.id === turnoActual;
        const esMiTurno = turnoActual === userId; // Es MI turno (del usuario actual)

        // Obtener posición base del jugador
        const basePosition = getPlayerBasePosition(
          index,
          reorderedPlayers.length,
        );

        // Calcular posiciones ajustadas para mano, info, secretos y sets
        const { handPosition, infoPosition, secretPosition, setsPosition } =
          getPlayerPositions(basePosition);

        // Obtener rotación según alineación
        const rotation = getCardRotation(basePosition.align);

        // Solo mostrar las cartas si es el jugador actual
        // Para otros jugadores, se mostrará solo la cantidad (dorso)

        // Secretos: todos los jugadores muestran sus secretos
        // - Jugador actual: los ve (flipped=true)
        // - Otros jugadores: solo ve el dorso (flipped=false)
        const secretsToShow = allSecrets[player.id] || [];

        // Cantidad de cartas del oponente
        const opponentCardCount = isCurrentPlayer
          ? 0
          : player.cartas?.length || 0;

        return (
          <div key={player.id}>
            {/* Acá se renderiza el jugador */}
            <GamePlayer
              player={player}
              isCurrentPlayer={isCurrentPlayer}
              isPlayerTurn={isPlayerTurn}
              avatarSrc={getPlayerAvatar(player)}
              handPosition={handPosition}
              infoPosition={infoPosition}
              secretPosition={secretPosition}
              rotation={rotation}
              playerCards={playerHand} // NO SE ACTUALIZA CORRECTAMENTE
              playerSecrets={secretsToShow}
              onSelectCard={handleSeleccionarCarta}
              cartasSeleccionadas={cartasSeleccionadas}
              cartaEventoSeleccionada={cartaEventoSeleccionada}
              opponentCardCount={opponentCardCount} // TODO: usar cantidad real de cartas
              esperandoObjetivo={esperandoObjetivo}
              onSelectObjective={handleSeleccionarObjetivo}
              setArrayOriginal={setArrayOriginal}
              // Props para eventos
              esperandoObjetivoEvento={esperandoObjetivoEvento}
              eventoEnJuego={eventoEnJuego}
              tipoObjetivoActual={tipoObjetivoActual}
              onSelectEventoObjective={handleSeleccionarObjetivoEvento}
              esperandoRevelarSecreto={esperandoRevelarSecreto}
              onRevealSecret={handleRevelarSecretoPropio}
              esperandoUsarNSF={esperandoUsarNSF}
              onUsarNSF={handleUsarNSF}
              // Props para Dead Card Folly
              esperandoPasarCartaDCF={esperandoPasarCartaDCF}
              // Props para Card Trade
              esperandoCardTrade={esperandoCardTrade}
              cardTradeObjetivo={cardTradeObjetivo}
            />

            {/* Mostrar sets jugados por este jugador */}
            <PlayerSets
              sets={
                allPlayerSets[player.id]
                  ? Object.values(allPlayerSets[player.id])
                  : []
              }
              position={setsPosition}
              rotation={rotation}
              isCurrentPlayer={isCurrentPlayer}
              onExtenderSet={esMiTurno ? handleExtenderSet : null}
              esMiTurno={esMiTurno}
              esSetPropio={isCurrentPlayer}
              // Props para eventos
              esperandoObjetivoEvento={esperandoObjetivoEvento}
              eventoEnJuego={eventoEnJuego}
              onSelectEventoSet={handleSeleccionarObjetivoEvento}
            />
          </div>
        );
      })}
      {/* Componente de acciones del turno */}
      <AccionesTurno
        esMiTurno={turnoActual === userId}
        faseActual="DESCARTAR"
        cargando={cargando}
        onDescartar={handleDescartarCartas}
        cartasSeleccionadas={cartasSeleccionadas}
      />
      {/* Winner modal (simple) */}
      {winnerModalOpen && (
        <div className="bm-overlay" onClick={() => setWinnerModalOpen(false)}>
          <div
            className="bm-panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="bm-header">
              <h2 className="bm-title">Resultado de la Partida</h2>
            </header>
            <div className="bm-content winner-modal-asesino-content">
              <p className="winner-modal-asesino-resultado">
                {winnerInfo === 1 ? "El asesino ganó" : "El asesino perdió"}
              </p>
              {/* Mostrar avatar y nombre del asesino */}
              {idAsesino &&
                (() => {
                  const asesino = players.find(
                    (p) => String(p.id) === String(idAsesino),
                  );
                  if (!asesino) return null;
                  const avatarSrc = getPlayerAvatar(asesino);
                  return (
                    <div className="winner-modal-asesino">
                      <img
                        src={avatarSrc}
                        alt={asesino.nombre || "Asesino"}
                        className="winner-modal-asesino-avatar"
                      />
                      <span className="winner-modal-asesino-nombre">
                        {asesino.nombre || "Asesino"}
                      </span>
                      <span className="winner-modal-asesino-label">
                        (Asesino)
                      </span>
                    </div>
                  );
                })()}

              {/* Mostrar avatar y nombre del cómplice si existe */}
              {idComplice &&
                (() => {
                  const complice = players.find(
                    (p) => String(p.id) === String(idComplice),
                  );
                  if (!complice) return null;
                  const avatarSrc = getPlayerAvatar(complice);
                  return (
                    <div className="winner-modal-complice">
                      <img
                        src={avatarSrc}
                        alt={complice.nombre || "Cómplice"}
                        className="winner-modal-asesino-avatar"
                      />
                      <span className="winner-modal-asesino-nombre">
                        {complice.nombre || "Cómplice"}
                      </span>
                      <span className="winner-modal-asesino-label">
                        (Cómplice)
                      </span>
                    </div>
                  );
                })()}
            </div>
            <footer className="bm-footer">
              <button className="bm-start" onClick={confirmWinnerAndGoHome}>
                Ir al inicio
              </button>
            </footer>
          </div>
        </div>
      )}
      {/* Componente de notificaciones */}
      <NotificationPopup
        message={notification.message}
        type={notification.type}
        duration={5000}
        onClose={closeNotification}
      />
      {/* Modales para eventos */}
      <ModalSeleccionarDireccion
        isOpen={modalDireccionOpen}
        onClose={() => setModalDireccionOpen(false)}
        onSelect={(direccion) => {
          handleSeleccionarObjetivoEvento(direccion, "direccion");
          setModalDireccionOpen(false);
        }}
      />
      <ModalSeleccionarCantidad
        isOpen={modalCantidadOpen}
        onClose={() => setModalCantidadOpen(false)}
        onSelect={(cantidad) => {
          handleSeleccionarObjetivoEvento(cantidad, "cantidad");
          setModalCantidadOpen(false);
        }}
        minimo={1}
        maximo={5}
        titulo="Selecciona Cartas del Descarte"
      />
      <ModalDescarte
        isOpen={modalDescarteForEventoOpen}
        onClose={() => setModalDescarteForEventoOpen(false)}
        cartasDescarte={mazoDescarte}
        onCardClick={(cartaId, cartaData) => {
          console.log("[PartidaContainer] onCardClick recibido:", {
            cartaId,
            tipoCartaId: typeof cartaId,
            cartaData,
          });
          handleSeleccionarObjetivoEvento(cartaId, "carta_descarte");
          setModalDescarteForEventoOpen(false);
        }}
      />
      <ModalDescarteConCantidad
        isOpen={modalDescarteConCantidadOpen}
        onClose={() => setModalDescarteConCantidadOpen(false)}
        cartasDescarte={mazoDescarte}
        onSelect={(cartasIds) => {
          // Para evento 16, enviamos el array de cartas seleccionadas
          handleSeleccionarObjetivoEvento(cartasIds, "cantidad");
          setModalDescarteConCantidadOpen(false);
        }}
        minimo={1}
        maximo={5}
      />
    </div>
  );
}
