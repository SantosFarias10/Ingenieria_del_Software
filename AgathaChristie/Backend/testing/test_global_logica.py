from pony.orm import db_session, delete, flush
from datetime import date

from app.db.models import Jugador, Partida, Carta, Turnos, Mazo
from app.db.database import db, init_pony
from app.logic.logica import *
from app.logic.logica_turnos import *

def test_all():
    
    init_pony()
    # Bind temporal solo para este test
    if db.provider:
        with db_session:
            delete(p for p in Partida)
            delete(j for j in Jugador)
            delete(c for c in Carta)
            delete(t for t in Turnos)
            delete(m for m in Mazo)
    try:
        # crear jugadores
        jugador_crear_jugador("Ponch", date(2003,12,29), "avatar1.png")
        jugador_crear_jugador("Ale", date(2002,7,25), "avatar2.png")
        jugador_crear_jugador("Emi", date(2005,6,29), "avatar3.png")
        jugador_crear_jugador("Mauro", date(2003,6,4), "avatar4.png")
        jugador_crear_jugador("Brandon", date(2005,2,15), "avatar5.png")
        jugador_crear_jugador("Santos", date(2002,9,20), "avatar6.png")
        

        jugadores = jugador_listar_jugadores()

        assert len(jugadores) == 6
        assert jugadores[0].nombre == "Ponch"
        assert jugadores[1].nombre == "Ale"
        assert jugadores[2].cumple == date(2005,6,29)
        assert jugadores[3].avatar == "avatar4.png"

        j1 = jugador_listar_jugadores()[0]
        j2 = jugador_listar_jugadores()[1]
        j3 = jugador_listar_jugadores()[2]
        j4 = jugador_listar_jugadores()[3]
        j5 = jugador_listar_jugadores()[4]
        j6 = jugador_listar_jugadores()[5]
        assert j1.nombre == "Ponch"    

        # crear partidas
        partida1 = partida_crear_partida("Partida 1", j1.id, 6, 3)
        flush()

        assert len(partida_listar_partidas()) == 1
        assert partida1.creador == j1.id

        jugador_unirse_a_partida(partida1.id, j2.id)
        jugador_unirse_a_partida(partida1.id, j3.id)
        jugador_unirse_a_partida(partida1.id, j4.id)
        jugador_unirse_a_partida(partida1.id, j5.id)
        jugador_unirse_a_partida(partida1.id, j6.id)

        assert len(jugador_get_jugadores_de_partida(partida1.id)) == 6

        partida_iniciar_partida(partida1.id)

        assert partida_listar_partidas()[0].estado == True
        assert len(jugador_obtener_datos_jugador(j1.id).cartas) == 9
        assert len(jugador_obtener_datos_jugador(j2.id).cartas) == 9
        assert len(jugador_obtener_datos_jugador(j3.id).cartas) == 9
        assert len(jugador_obtener_datos_jugador(j4.id).cartas) == 9




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
