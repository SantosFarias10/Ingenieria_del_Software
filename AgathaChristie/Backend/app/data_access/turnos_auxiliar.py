from app.data_access.jugador import JugadorRepository, JugadorData
from app.data_access.partida import PartidaRepository
from app.db.models import Partida
from datetime import date
from random import shuffle


def closer_to_agathas(jugador1: JugadorData, jugador2: JugadorData):
    date1 = date(2000, jugador1.cumple.month, jugador1.cumple.day)
    date2 = date(2000, jugador2.cumple.month, jugador2.cumple.day)
    a_bd  = date(2000, 9, 15)
    centro = date(2000, 5, 31)
    out_diff = date(2000, 3, 17)
    # situacion 1: date1 esta en centro
    if date1 > centro:
        #s ituacion 1a: date2 esta afuera de centro
        if date2 < centro:
            return jugador1
        # situacion 1b: ambos estan en  centro
        else:
            closer = (jugador1 if (abs(date1 - a_bd) < abs(date2 - a_bd)) else jugador2)
    # situacion 2: date1 esta afuera de centro
    else: # date1 <= centro
        # situacion 2a: date2 esta en centro
        if date2 > centro:
            return jugador2
        # situacion 2b: ninguno esta en centro
        else:
            # situacion 3: date1 esta a la derecha de out_diff
            if date1 > out_diff:
                # situacion 3a: ambos estan a la derecha de out_diff
                if date2 > out_diff:
                    closer = (jugador1 if date1 > date2 else jugador2)
                # situacion 3b: date2 esta a la izquierda de out_diff
                else:
                    date2.year = 2001
                    closer = (jugador1 if (a_bd - date1 < date2 - a_bd) else jugador2)
            # situacion 4: date1 esta a la izquierda de out_diff
            else:
                # situacion 4a: ambos estan a la izquierda de outdiff
                if date2 < out_diff:
                    closer = (jugador1 if date1 < date2 else jugador2)
                # situacion 4b: date2 esta a la derecha de out_diff
                else:
                    date1.year = 2001
                    closer = (jugador1 if (date1 - a_bd < a_bd - date2) else jugador2)
    return closer


def orden_turnos(partida_id: int):
    repo_partida = PartidaRepository()
    partida = repo_partida.get_by_id(partida_id)
    if not partida:
        raise ValueError("La partida no existe")

    repo_jugadores = JugadorRepository()

    orden_jugadores_id = []

    jugadores = repo_jugadores.get_jugadores_by_partida(partida_id)
    if not jugadores:
        raise ValueError("No hay jugadores en la partida")

    primero = jugadores[0]
    for jugador in jugadores:
        primero = closer_to_agathas(primero, jugador)

    orden_jugadores_id.append(primero.id)

    jugadores.remove(primero)
    shuffle(jugadores)
    for jugador in jugadores:
        orden_jugadores_id.append(jugador.id)

    return orden_jugadores_id

