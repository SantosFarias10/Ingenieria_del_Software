from app.data_access.jugador import JugadorRepository
from app.data_access.carta import CartaRepository, CartaData
from app.data_access.mazos import MazoRepository


def robar_carta(jugador_id, partida_id: int):
    repo_cartas = CartaRepository()
    repo_jugadores = JugadorRepository()
    repo_mazo = MazoRepository()
    carta_id = repo_mazo.get_ultima_carta_id(partida_id)
    carta_robada = repo_cartas.get_by_id(carta_id, partida_id)
    if carta_robada.categoria == "Special":
        raise ValueError(f"No se puede robar la carta {carta_robada.nombre}")
    if not carta_robada:
        raise ValueError("No existe la carta")
    if carta_robada.estado != 3:
        raise ValueError("La carta no esta en el mazo")
    jugadores = repo_jugadores.get_jugadores_by_partida(partida_id)
    jugador = repo_jugadores.get_by_id(jugador_id)
    if jugador not in jugadores:
        raise ValueError(f"El jugador no pertenece a la partida {partida_id}")
    if len(repo_cartas.obtener_cartas_en_mano_de_jugador(jugador_id, partida_id)) >= 6:
        raise ValueError("El jugador ya tiene 6 cartas asignadas")
    repo_cartas.agregar_a_jugador(jugador_id, carta_robada.id, partida_id)
    repo_mazo.eliminar_carta_de_mazo_id(partida_id, carta_id)
    carta_actualizada = repo_cartas.get_by_id(carta_robada.id, partida_id)

    return carta_actualizada
