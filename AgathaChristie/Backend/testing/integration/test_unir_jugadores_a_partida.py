import pytest
from datetime import date
from pony.orm import db_session

from app.data_access.partida import PartidaRepository
from app.data_access.jugador import JugadorRepository
from app.db.models import Partida
from app.db.models import db, Jugador, Partida

from pony.orm import commit, db_session, count, select


@pytest.fixture()
def fresh_db():
    db.bind(provider="sqlite", filename=":memory:", create_db=True)
    db.generate_mapping(create_tables=True)

    yield

    db.provider = None
    db.schema = None
    db.disconnect()

@pytest.fixture()
def db_with_partidas():

    db.bind(provider="sqlite", filename=":memory:", create_db=True)
    db.generate_mapping(create_tables=True)
    
    with db_session:
        Partida(nombre="aaaaaa", creador=1, estado=False, max_jugadores=4, jugadores=[], min_jugadores=3)
        Partida(nombre="partidadebrandon", creador=2, estado=False, max_jugadores=4, jugadores=[], min_jugadores=3) 
        Partida(nombre="partidadeale", creador=3, estado=False, max_jugadores=4, jugadores=[], min_jugadores=3)
        
        
        Jugador(nombre="Ponch", cumple=date(2003,12,29))
        Jugador(nombre="Ale", cumple=date(2002,7,25))
        Jugador(nombre="Emi", cumple=date(2005,6,29))
        Jugador(nombre="Mauro", cumple=date(2003,6,4))
        Jugador(nombre="Brandon", cumple=date(2005,2,15))
        Jugador(nombre="Santos", cumple=date(2002,9,20))

        # Mostrar todos los jugadores y partidas
        print("\n=== TODOS LOS JUGADORES ===")
        for j in Jugador.select():
            print(f"{j.nombre}, con id = {j.id}, cumple el {j.cumple}")
        print("\n=== TODAS LAS PARTIDAS ===")
        for p in Partida.select():
            print(f"ID PARTIDA {p.id}, CREADOR {p.creador}, NOMBRE {p.nombre}, ESTADO {p.estado}, JUGADORES = {p.jugadores}")



        commit()

    yield
    with db_session: 
        # Mostrar todos los jugadores y partidas
        print("\n=== TODOS LOS JUGADORES ===")
        for j in Jugador.select():
            print(f"{j.nombre}, con id = {j.id}, cumple el {j.cumple}")
        print("\n=== TODAS LAS PARTIDAS ===")
        for p in Partida.select():
            print(f"ID PARTIDA {p.id}, CREADOR {p.creador}, NOMBRE {p.nombre}, ESTADO {p.estado}, JUGADORES = {p.jugadores}")
    db.provider = None
    db.schema = None
    db.disconnect()


def test_unir_jugadores_a_partida(db_with_partidas):
    with db_session:
        repo = JugadorRepository()
        repo.unir_jugador_a_partida(1, 2)
        repo.unir_jugador_a_partida(3, 2)
        repo_partida = PartidaRepository()



        repo_partida.eliminar_partida(1)

        assert(len(repo_partida.get_all()) == 2)
        assert(len(repo_partida.get_by_id(2).jugadores) == 2)













