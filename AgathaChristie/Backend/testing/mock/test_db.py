from pony.orm import db_session, delete, flush
from datetime import date

from app.db.models import Jugador, Partida

def test_db_operations():
    from app.db.database import db, init_pony

    # Bind temporal solo para este test
    if db.provider is None:
        init_pony()

    try:
        with db_session:
            # Crear jugadores
            j1 = Jugador(nombre="Ponch", cumple=date(2003,12,29), cartas=[])
            j2 = Jugador(nombre="Ale", cumple=date(2002,7,25), cartas=[])
            j3 = Jugador(nombre="Emi", cumple=date(2005,6,29), cartas=[])
            j4 = Jugador(nombre="Mauro", cumple=date(2003,6,4), cartas=[])
            j5 = Jugador(nombre="Brandon", cumple=date(2005,2,15), cartas=[])
            j6 = Jugador(nombre="Santos", cumple=date(2002,9,20), cartas=[])

            flush()

            # Crear partidas
            p1 = Partida(creador=j1.id, nombre="Partida 1", estado=True, max_jugadores=4, jugadores=[j1,j3,j4,j5], min_jugadores=3)
            p2 = Partida(creador=j2.id, nombre="Partida 2", estado=False, max_jugadores=4, jugadores=[j2,j6], min_jugadores=3)

        with db_session:
            # Mostrar todos los jugadores y partidas
            print("\n=== TODOS LOS JUGADORES ===")
            for j in Jugador.select():
                print(f"{j.nombre}, con id = {j.id}, cumple el {j.cumple}")
            print("\n=== TODAS LAS PARTIDAS ===")
            for p in Partida.select():
                print(f"ID PARTIDA {p.id}, CREADOR {p.creador}, NOMBRE {p.nombre}, ESTADO {p.estado}, JUGADORES = {p.jugadores}")

    finally:
        # Limpiar y desconectar
        with db_session:
            delete(p for p in Partida)
            delete(j for j in Jugador)
        db.disconnect()

if __name__ == "__main__":
    test_db_operations()
