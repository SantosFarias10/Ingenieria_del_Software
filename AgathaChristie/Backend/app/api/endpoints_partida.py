from app.websocket import estado_partida
from fastapi import APIRouter

from app.websocket.connection_manager import manager
from app.websocket.estado_partida import construir_estado_partida
from app.logic.logica import *

router = APIRouter()


# para testear con curl:
# curl -X GET "http://localhost:8000/listar-partidas"
@router.get("/listar-partidas")
async def listar_partidas():
    try:
        return partida_listar_partidas()
    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X GET "http://localhost:8000/listar-partidas/FILTRO_NOMBRE"
@router.get("/listar-partidas/{filtro_nombre}")
async def listar_partidas_filtradas(filtro_nombre: str):
    try:
        return partida_listar_partidas(filtro_nombre)
    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X PUT "http://localhost:8000/iniciar-partida/ID_DE_PARTIDA"
@router.put("/iniciar-partida/{partida_id}")
async def iniciar_partida(partida_id: int):
    try:
        # Iniciar la partida (cambia estado y carga turnos)
        result = partida_iniciar_partida(partida_id)

        # Enviar evento de partida iniciada con estado de si inicio o no
        await manager.notify_partida_iniciada_completa(partida_id, result.estado)

        return result

    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X POST "http://localhost:8000/crear-partida?nombre=NOMBRE&creador=ID_DE_CREADOR&max_jugadores=MAXIMO_DE_JUGADORES&min_jugadores=MINIMO_JUGADORES"
@router.post("/crear-partida")
async def crear_partida(nombre: str, creador: int, max_jugadores: int, min_jugadores: int):
    try:
        return partida_crear_partida(nombre, creador, max_jugadores, min_jugadores)
    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X GET "http://localhost:8000/ganador?partida_id=ID_DE_PARTIDA"
@router.get("/ganador")
async def victoria_gloriosa(partida_id: int):
    try:
        final = determinar_ganador(partida_id)
        estado_partida = final[0]
        asesino_id = final[1]
        complice_id = final[2]
        victoria = final[3]
        
        await manager.notify_ganador(partida_id, asesino_id, complice_id, victoria, estado_partida)
    
        return estado_partida
    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X DELETE "http://localhost:8000/eliminar-partida/ID_DE_PARTIDA"
@router.delete("/eliminar-partida/{partida_id}")
async def eliminar_partida(partida_id: int):
    try:
        return partida_eliminar_partida(partida_id)
    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X GET "http://localhost:8000/detalles-partida?partida_id=INSERTE_PARTIDA_ID"
@router.get("/detalles-partida")
async def detalles_partida(partida_id: int):
    try:
        partida_obtener_detalles_partida(partida_id)

        estado_completo = construir_estado_partida(partida_id)
        estado_completo['mensaje'] = "Detalles de la partida"
        await manager.notify_estado_partida(partida_id, estado_completo)

        return estado_completo
    except Exception as e:
        return {"error": str(e)}
