import PlayerInfo from "./PlayerInfo";
import PlayerHandArea from "./PlayerHandArea";
import OpponentHandArea from "./OpponentHandArea";
import PlayerSecrets from "./PlayerSecrets";
import {
  getTipoObjetivoParaDetective,
  getDetectivePrincipalDelSet,
  getTipoObjetivoParaEvento,
} from "../service/CardService";

export default function GamePlayer({
  player,
  isCurrentPlayer,
  isPlayerTurn,
  avatarSrc,
  handPosition,
  infoPosition,
  secretPosition,
  rotation,
  playerCards,
  playerSecrets,
  onSelectCard,
  cartasSeleccionadas = [],
  opponentCardCount,
  esperandoObjetivo = false,
  onSelectObjective = null,
  setArrayOriginal = null,
  // Props para eventos
  esperandoObjetivoEvento = false,
  eventoEnJuego = null,
  tipoObjetivoActual = null, // Tipo de objetivo que se espera en este momento (para Another Victim)
  onSelectEventoObjective = null,
  // FASE 4: Props para revelar secreto propio (webso=2)
  esperandoRevelarSecreto = false,
  onRevealSecret = null,
  // Props para Not So Fast
  esperandoUsarNSF = false,
  onUsarNSF = null,
  // Props para Dead Card Folly
  esperandoPasarCartaDCF = false,
  // Props para Card Trade
  esperandoCardTrade = false,
  cardTradeObjetivo = null,
}) {
  // Determinar si este jugador puede ser seleccionado como objetivo (jugador) para SET
  const puedeSerObjetivoJugador = () => {
    if (!esperandoObjetivo || !setArrayOriginal || isCurrentPlayer)
      return false;

    const detectivePrincipal = getDetectivePrincipalDelSet(setArrayOriginal);
    const tipoObjetivoEsperado =
      getTipoObjetivoParaDetective(detectivePrincipal);

    return tipoObjetivoEsperado === "jugador";
  };

  // Determinar si este jugador puede ser seleccionado como objetivo para EVENTO
  const puedeSerObjetivoJugadorEvento = () => {
    if (!esperandoObjetivoEvento || !eventoEnJuego )
      return false;

    // Si tipoObjetivoActual está seteado (Another Victim caso especial), usarlo
    if (tipoObjetivoActual) {
      return tipoObjetivoActual === "jugador";
    }

    // Si no, verificar en la configuración del evento
    const eventoId = eventoEnJuego.idFrontend;
    const tiposObjetivo = getTipoObjetivoParaEvento(eventoId);

    // Verificar si 'jugador' es uno de los tipos esperados para este evento
    return tiposObjetivo.tipos.includes("jugador");
  };

  const handleAvatarClick = () => {
    if (puedeSerObjetivoJugador() && onSelectObjective) {
      onSelectObjective(player.id, "jugador");
    } else if (puedeSerObjetivoJugadorEvento() && onSelectEventoObjective) {
      onSelectEventoObjective(player.id, "jugador");
    }
  };

  // Crear el handler para seleccionar secreto
  const handleSelectSecret = (secretId, secretData) => {
    if (esperandoObjetivo && onSelectObjective && !isCurrentPlayer) {
      // Determinar el tipo de secreto (oculto o revelado)
      const secreto = playerSecrets.find((s) => s.id === secretId);
      const tipoSecreto =
        secreto?.estado === 9 || secreto?.estado === null || secreto?.estado === undefined
          ? "secreto_oculto"
          : "secreto_revelado";

      // Permitir tanto secretos ocultos como revelados
      // Parker Pyne necesita secretos revelados para ocultarlos
      // Poirot/Marple necesitan secretos ocultos para revelarlos
      // La validación se hace en el backend según el detective
      onSelectObjective(secreto.idBackend, tipoSecreto);
    }
  };

  const esObjetivoJugador = puedeSerObjetivoJugador();
  const esObjetivoJugadorEvento = puedeSerObjetivoJugadorEvento();
  const puedeSeleccionarse = esObjetivoJugador || esObjetivoJugadorEvento;

  return (
    <div>
      {/* Avatar + Nombre del jugador */}
      <div
        onClick={handleAvatarClick}
        style={{
          cursor: puedeSeleccionarse ? "pointer" : "default",
          opacity: puedeSeleccionarse ? 1 : 1,
          transition: "all 0.2s ease",
        }}
      >
        <PlayerInfo
          player={player}
          isCurrentPlayer={isCurrentPlayer}
          isPlayerTurn={isPlayerTurn}
          avatarSrc={avatarSrc}
          position={infoPosition}
          canBeSelected={puedeSeleccionarse}
        />
      </div>

      {/* Mano del jugador */}
      {isCurrentPlayer ? (
        <PlayerHandArea
          position={handPosition}
          rotation={rotation}
          playerCards={playerCards}
          onSelectCard={onSelectCard}
          cartasSeleccionadas={cartasSeleccionadas}
          esperandoUsarNSF={esperandoUsarNSF}
          onUsarNSF={onUsarNSF}
          esperandoPasarCartaDCF={esperandoPasarCartaDCF}
          esperandoCardTrade={esperandoCardTrade}
        />
      ) : (
        <OpponentHandArea
          position={handPosition}
          rotation={rotation}
          cardCount={opponentCardCount}
        />
      )}

      {/* Secretos del jugador */}
      <PlayerSecrets
        secrets={playerSecrets}
        position={secretPosition}
        rotation={rotation}
        isCurrentPlayer={isCurrentPlayer}
        esperandoObjetivo={esperandoObjetivo}
        onSelectSecret={handleSelectSecret}
        setArrayOriginal={setArrayOriginal}
        // Props para eventos
        esperandoObjetivoEvento={esperandoObjetivoEvento}
        eventoEnJuego={eventoEnJuego}
        tipoObjetivoActual={tipoObjetivoActual}
        onSelectEventoSecret={onSelectEventoObjective}
        // FASE 4: Props para revelar secreto propio (webso=2)
        esperandoRevelarSecreto={esperandoRevelarSecreto}
        onRevealSecret={onRevealSecret}
      />
    </div>
  );
}

