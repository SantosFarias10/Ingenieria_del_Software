from fastapi import APIRouter

from app.websocket.connection_manager import manager
from app.data_access.jugador import JugadorRepository
from app.data_access.turnos import TurnoRepository
from app.logic.logica import *
from app.logic.logica_turnos import *

router = APIRouter()


# para testear con curl:
# curl -X PUT "http://localhost:8000/partida/{id_partida}/terminar-turno"
@router.put("/partida/{id_partida}/terminar-turno")
async def terminar_turno(id_partida: int):
    try:
        # Ejecutar logica de negocio (avanza el turno)
        result = turno_terminar_turno(id_partida)

        # Obtener el jugador que ahora tiene el turno
        repo_turno = TurnoRepository()
        jugador_turno_id = repo_turno.get_id_jugador_actual(id_partida)

        repo_jugador = JugadorRepository()
        jugador_actual = repo_jugador.get_by_id(jugador_turno_id)

        # Notificar cambio de turno via WebSocket
        await manager.notify_turno_cambiado(
            id_partida, 
            jugador_actual.id, 
            jugador_actual.nombre
        )

        return result
    except Exception as e:
        return {"error": str(e)}

