from pony.orm import db_session, delete, flush
from datetime import date

from app.db.models import Jugador, Partida
from app.db.database import db, init_pony
from app.data_access.carta import *
from app.data_access.jugador import *
from app.data_access.partida import *
from app.data_access.turnos import *
from app.data_access.mazos import *




def test_all():
    
    # Bind temporal solo para este test
    if db.provider is None:
        init_pony()
    try:
        #testear todo
        with db_session:
            repo_carta = CartaRepository()
            repo_jugador = JugadorRepository()
            repo_partida = PartidaRepository()
            repo_turno = TurnoRepository()
            repo_mazo = MazoRepository()


            #crear jugador
            repo_jugador.create(CreateJugadorData(nombre="Ponch", cumple=date(2003,12,29), avatar="avatar1.png"))
            repo_jugador.create(CreateJugadorData(nombre="Ale", cumple=date(2002,7,25), avatar="avatar2.png"))
            repo_jugador.create(CreateJugadorData(nombre="Emi", cumple=date(2005,6,29), avatar="avatar3.png"))
            repo_jugador.create(CreateJugadorData(nombre="Mauro", cumple=date(2003,6,4), avatar="avatar4.png"))
            repo_jugador.create(CreateJugadorData(nombre="Brandon", cumple=date(2005,2,15), avatar="avatar5.png"))
            repo_jugador.create(CreateJugadorData(nombre="Santos", cumple=date(2002,9,20), avatar="avatar6.png"))
            flush()

            jugadores = repo_jugador.get_all()

            assert len(jugadores) == 6
            assert jugadores[0].nombre == "Ponch"
            assert jugadores[1].nombre == "Ale"
            assert jugadores[2].cumple == date(2005,6,29)
            assert jugadores[3].avatar == "avatar4.png"

            j1 = repo_jugador.get_by_id(jugadores[0].id)
            j2 = repo_jugador.get_by_id(jugadores[1].id)
            j3 = repo_jugador.get_by_id(jugadores[2].id)
            j4 = repo_jugador.get_by_id(jugadores[3].id)
            j5 = repo_jugador.get_by_id(jugadores[4].id)
            j6 = repo_jugador.get_by_id(jugadores[5].id)
            assert j1.nombre == "Ponch"

            #crear partida
            repo_partida.create(CreatePartidaData(creador=j1.id, nombre="Partida 1", estado=True, min_jugadores=2, max_jugadores=4))
            repo_partida.create(CreatePartidaData(creador=j2.id, nombre="Partida 2", estado=False, min_jugadores=2, max_jugadores=6))
            flush()

            partidas = repo_partida.get_all()
            p1 = repo_partida.get_by_id(partidas[0].id)
            p2 = repo_partida.get_by_id(partidas[1].id)
            assert len(partidas) == 2
            assert partidas[0].nombre == "Partida 1"
            assert partidas[1].creador == j2.id
            assert partidas[1].max_jugadores == 6

            assert p1.nombre == "Partida 1"
            assert p1.creador == j1.id

            #unir jugadores a partida
            repo_jugador.unir_jugador_a_partida(j3.id,p1.id)
            repo_jugador.unir_jugador_a_partida(j4.id,p1.id)
            repo_jugador.unir_jugador_a_partida(j5.id,p1.id)
            repo_jugador.unir_jugador_a_partida(j6.id,p2.id)

            assert len(repo_jugador.get_jugadores_by_partida(p1.id)) == 3
            assert len(repo_jugador.get_jugadores_by_partida(p2.id)) == 1

            repo_jugador.salir_de_partida_by_id(j3.id)
            assert len(repo_jugador.get_jugadores_by_partida(p1.id)) == 2

            repo_partida.iniciar_partida(p1.id)
            assert repo_partida.get_by_id(p1.id).estado == True
            assert len(repo_partida.get_no_iniciadas()) == 1

            repo_partida.eliminar_partida(p2.id)
            assert len(repo_partida.get_all()) == 1

            #crear cartas
            cargar_cartas(p1.id)
            cartas = repo_carta.get_all(p1.id)
            assert len(cartas) == 80

            repo_carta.agregar_a_jugador(j1.id, cartas[0].id, p1.id)
            repo_carta.agregar_a_jugador(j1.id, cartas[1].id, p1.id)
            repo_carta.agregar_a_jugador(j4.id, cartas[2].id, p1.id)

            assert repo_carta.get_all(p1.id)[0].jugador == j1.id

            repo_carta.sacar_de_jugador(cartas[0].id, p1.id)

            assert repo_carta.get_all(p1.id)[0].jugador == None



    finally:
        # Limpiar y desconectar
        with db_session:
            delete(p for p in Partida)
            delete(j for j in Jugador)
            delete(c for c in Carta)
            delete(t for t in Turnos)
            delete(m for m in Mazo)
        db.disconnect()
        print("Tests finalizados")
            
if __name__ == "__main__":
    test_all()
