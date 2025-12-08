import pytest
from datetime import date
from pony.orm import db_session

from app.data_access.partida import PartidaRepository
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
        commit()

    yield

    db.provider = None
    db.schema = None
    db.disconnect()


def test_get_by_name(db_with_partidas):
    with db_session:
        repo = PartidaRepository()
        name = "art" 
        resultado = repo.get_by_name(name)

        assert len(resultado) == 2
