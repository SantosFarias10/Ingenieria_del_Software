from app.data_access.partida import PartidaRepository, CreatePartidaData
from app.data_access.jugador import JugadorRepository, CreateJugadorData
from app.data_access.carta import CartaRepository, cargar_cartas
from app.data_access.turnos import TurnoRepository, cargar_turnos
from datetime import date

def turno_terminar_turno(partida_id: int):
    repo_turnos = TurnoRepository()
    turnos = repo_turnos.get_turnos_by_partida(partida_id)
    if not turnos:
        raise ValueError("No hay turnos para esta partida")
    turno_actual = repo_turnos.get_id_jugador_actual(partida_id)
    if not turno_actual:
        raise ValueError("No hay un jugador con el turno activo")
    repo_turnos.avanzar_turno(partida_id)
    nuevo_turno = repo_turnos.get_id_jugador_actual(partida_id)
    return nuevo_turno
