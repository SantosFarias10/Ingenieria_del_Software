import Card from "./Card";
import { getTipoObjetivoParaEvento } from "../service/CardService";
import "../styles/PlayerSets.css";

export default function PlayerSets({
  sets = [],
  position,
  rotation = 0,
  isCurrentPlayer,
  onExtenderSet = null,
  esMiTurno = false,
  esSetPropio = false,
  // Props para eventos
  esperandoObjetivoEvento = false,
  eventoEnJuego = null,
  onSelectEventoSet = null,
}) {
  // Verificar que position existe antes de hacer destructuring
  /* istanbul ignore next */
  if (!position || !sets || sets.length === 0) {
    return null; // No mostrar nada si no hay position o sets
  }

  const { x, y } = position;

  // Determinar si se puede extender un set
  const puedeExtender = esMiTurno && typeof onExtenderSet === "function";

  // Determinar si los sets pueden ser seleccionados para evento
  const puedeSeleccionarseSet = () => {
    /* istanbul ignore next */
    if (!esperandoObjetivoEvento || !eventoEnJuego || isCurrentPlayer) return false;
    const tiposObjetivo = getTipoObjetivoParaEvento(eventoEnJuego.idFrontend);
    /* istanbul ignore next */
    return tiposObjetivo.tipos.includes("set");
  };

  const puedoSeleccionar = puedeSeleccionarseSet();

  const handleSetClick = (setIndex, set) => {
    /* istanbul ignore next */
    if (puedoSeleccionar && onSelectEventoSet) {
      const setId = set[0]?.set || set[0]?.setId || setIndex + 1;
      onSelectEventoSet(setId, "set");
    }
  };

  return (
    <div
      className="player-sets-area"
      style={{
        left: "50%",
        top: "50%",
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
      }}
    >
      <div
        className="sets-container"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {sets.map((set, setIndex) => {
          // Obtener el set_id del primer elemento (todas las cartas del set tienen el mismo set_id)
          /* istanbul ignore next */
          const setId = set[0]?.set || setIndex + 1;

          return (
            <div
              key={setIndex}
              className={`set-group ${puedoSeleccionar ? "seleccionable" : ""}`}
              onClick={() => handleSetClick(setIndex, set)}
              style={{ cursor: puedoSeleccionar ? "pointer" : "default" }}
            >
              <div className="set-label">
                Set #{setIndex + 1}
                {puedeExtender && (
                  <button
                    className="btn-extender-set"
                    onClick={() => onExtenderSet(setIndex, setId, set, esSetPropio)}
                    title={esSetPropio ? "Agregar detective a este set" : "Agregar Ariadne Oliver a este set"}
                  >
                    +
                  </button>
                )}
              </div>
              <div className="set-cards">
                {set.map((carta, cardIndex) => (
                  <div
                    key={carta.id || carta.idBackend || cardIndex}
                    className="set-card"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Card
                      id={carta.id_front || carta.idFrontend}
                      flipped={true}
                      puedeVoltearse={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

