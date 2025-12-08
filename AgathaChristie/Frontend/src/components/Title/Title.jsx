import "../../styles/HomeContainer.css";
import "../../styles/CrearJugador.css";

export default function Title({ title, subtitle, variant = "default" }) {
  const titleClass = variant === "home" ? "title-home" : "title-crear-jugador";
  const subtitleClass = variant === "home" ? "subtitle-home" : "subtitle-crear-jugador";

  return (
    <div className={titleClass}>
      <h1>{title}</h1>
      {subtitle && <h2 className={subtitleClass}>{subtitle}</h2>}
    </div>
  );
}
