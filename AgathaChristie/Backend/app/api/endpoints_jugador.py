from datetime import date
from fastapi import APIRouter
from fastapi.encoders import jsonable_encoder

from app.websocket.connection_manager import manager
from app.data_access.partida import PartidaRepository
from app.logic.logica import *

router = APIRouter()


# para testear con curl:
# curl -X GET "http://localhost:8000/listar-jugadores"
@router.get("/listar-jugadores")
async def listar_jugadores():
    try:
        return jugador_listar_jugadores()
    except Exception as e:
        return {"error": str(e)}

#para testear con curl:
# curl -X PUT "http://localhost:8000/unirse-partida?partida_id=INSERTE_PARTIDA_ID&jugador_id=INSERTE_JUGADOR_ID"
@router.put("/unirse-partida")
async def unirse_a_partida(partida_id: int, jugador_id: int):
    try:
        # Unir jugador a la partida
        jugador_unirse_a_partida(partida_id, jugador_id)
        # Obtener todos los jugadores y hacer broadcast de la lista actualizada(mandar mensajito con todos los players)

        repo_jugador = JugadorRepository()
        jugadores = repo_jugador.get_jugadores_by_partida(partida_id)
        jugadores_data = jsonable_encoder([j for j in jugadores])
        await manager.broadcast_players_update(partida_id, jugadores_data)

        return {"message": "Jugador unido a la partida"}
    except Exception as e:
        return {"error": str(e)}

#para testear con curl:
# curl -X POST "http://localhost:8000/crear-jugador?nombre=NOMBRE&cumple=FECHA(2000-10-30)&avatar=URL_AVATAR"
@router.post("/crear-jugador")
async def crear_jugador(nombre: str, cumple: date, avatar: str):
    try:
        return jugador_crear_jugador(nombre, cumple, avatar)
    except Exception as e:
        return {"error": str(e)}

#para testear con curl:
# curl -X PUT "http://localhost:8000/salir-partida?jugador_id=INSERTE_JUGADOR_ID"
@router.put("/salir-partida")
async def salir_de_partida(jugador_id: int):
    try:
        # Obtener datos del jugador y partida ANTES de salir
        repo = JugadorRepository()
        jugador = repo.get_by_id(jugador_id)
        partida_id = jugador.partida

        if not partida_id:
            return {"message": "El jugador no está en ninguna partida"}

        # Verificar si es el creador para saber si la partida sera eliminada
        repo_partida = PartidaRepository()
        partida = repo_partida.get_by_id(partida_id)
        es_creador = (partida.creador == jugador_id)

        # IMPORTANTE: Enviar broadcast ANTES de ejecutar la logica de salida
        if es_creador:
            # Creador va a salir → partida sera eliminada → enviar lista vacia PRIMERO
            await manager.broadcast_players_update(partida_id, [])

            # Ahora si ejecutar la lógica que elimina todo
            result = jugador_salir_de_partida(jugador_id)
        else:
            # Jugador normal → primero sacar de la partida, luego enviar lista actualizada
            result = jugador_salir_de_partida(jugador_id)

            # Obtener jugadores restantes y notificar
            jugadores = repo.get_jugadores_by_partida(partida_id)
            jugadores_data = jsonable_encoder([j for j in jugadores])
            await manager.broadcast_players_update(partida_id, jugadores_data)

        return result

    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X GET "http://localhost:8000/partida/jugadores?partida_id=INSERTE_PARTIDA_ID"
@router.get("/partida/jugadores")
async def get_jugadores_de_partida(partida_id: int):
    try:
        return jugador_get_jugadores_de_partida(partida_id)
    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X GET "http://localhost:8000/obtener-datos-jugador/INSERTE_JUGADOR_ID"
@router.get("/obtener-datos-jugador/{id}")
async def obtener_datos_jugador(id: int):
    try:
        return jugador_obtener_datos_jugador(id)
    except Exception as e:
        return {"error": str(e)}

