from fastapi import APIRouter, Query
from fastapi.encoders import jsonable_encoder

from app.data_access import partida
from app.websocket.connection_manager import manager
from app.data_access.jugador import JugadorRepository
from app.data_access.carta import CartaRepository
from app.logic.logica import *
from app.logic.logica_partida import *
from app.logic.logica_jugar_cartas import *


router = APIRouter()


#--------------------------------------------------------------------------------------------

# para testear con curl:
# curl -X POST "http://localhost:8000/descartar-carta?carta_id=INSERTE_CARTA_ID&partida_id=INSERTE_PARTIDA_ID"
@router.post("/descartar-carta")
async def descartar_carta_de_jugador(carta_id: int, partida_id: int):
    try:
        # Obtener info de la carta ANTES de sacarla
        carta_repo = CartaRepository()
        carta = carta_repo.get_by_id(carta_id, partida_id)
        descarte_repo = DescarteRepository()

        if carta and carta.jugador:
            jugador_id = carta.jugador
            partida_id = carta.partida

            # Ejecutar logica de negocio
            result = carta_descartar_carta_de_jugador(carta_id, partida_id)

            if partida_id:
                # Obtener cartas actualizadas del jugador
                repo = JugadorRepository()
                cartas = repo.ver_cartas_jugador(jugador_id)
                cartas_data = jsonable_encoder(cartas)
                #cartas_front = carta_repo.obtener_cartas_de_efecto_de_jugador(jugador_id,repo.get_by_id(jugador_id).partida)
                cartas_front = carta_repo.obtener_cartas_en_mano_de_jugador(jugador_id,repo.get_by_id(jugador_id).partida)
                # Asegurarse de enviar una lista serializable (no un generator)
                cartas_front_data = [c.id_front for c in cartas_front]
                cartas_back_data = [c.id for c in cartas_front]
                # Notificar que la mano cambio

                # Obtener cantidad de cartas en mazo de descarte actualizado
                cantidad = len(descarte_repo.get_by_partida(partida_id))
                
                carta = carta_repo.get_by_id(carta_id, partida_id)
                # Asegurarse que la carta enviada sea serializable
                carta_data = jsonable_encoder(carta)
                # Notificar que el mazo de descarte cambio
                await manager.notify_procesar_descarte(
                    partida_id,
                    jugador_id,
                    cartas_back_data,
                    cartas_front_data,
                    cantidad,
                    carta_data
                )

            return result
        else:
            return carta_descartar_carta_de_jugador(carta_id, partida_id) 
    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X GET "https://localhost:8000/consultar-secretos?jugador_id=INSERTE_JUGADOR_ID&partida_id=INSERTE_PARTIDA_ID"
@router.get("/consultar-secretos")
async def consultar_secretos_de_jugador(jugador_id: int, partida_id: int):
    try:
        return carta_consultar_secretos_de_jugador(jugador_id, partida_id)
    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X POST "http://localhost:8000/robar-carta-del-mazo-regular?jugador_id=INSERTE_JUGADOR_ID&partida_id=INSERTE_PARTIDA_ID"
@router.post("/robar-carta-del-mazo-regular")
async def robar_carta_del_mazo(jugador_id: int, partida_id: int):
    try: 
        result = robar_carta(jugador_id, partida_id)

        if partida_id: 
            repo_mazo = MazoRepository()
            cantidad = len(repo_mazo.get_by_partida(partida_id))
            await manager.notify_mazo_actualizado(
                partida_id,
                cantidad,
            )
        
        return result

    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X POST "http://localhost:8000/robar-carta-del-mazo-draft?jugador_id=INSERTE_JUGADOR_ID&partida_id=INSERTE_PARTIDA_ID&posicion=POSICION"
@router.post("/robar-carta-del-mazo-draft")
async def robar_carta_del_draft(jugador_id: int, partida_id: int, posicion: int):
    try:
        repo_cartas = CartaRepository()
        carta_draft = robar_carta_de_mazo_draft(jugador_id, partida_id, posicion)
        result = repo_cartas.get_by_id(carta_draft.carta_id, partida_id)

        repo_mazo = MazoRepository()
        repo_draft = DraftRepository()
        cantidad = len(repo_mazo.get_by_partida(partida_id))
        draft = jsonable_encoder(repo_draft.get_by_partida(partida_id))
        
        await manager.notify_draft_actualizado(
            partida_id,
            cantidad,
            draft
        )
        return result
    except Exception as e:
        return {"error": str(e)}


# para testear con curl:
# curl -X GET "http://localhost:8000/ver-todos-los-sets?partida_id=INSERTE_PARTIDA_ID"
@router.get("/ver-todos-los-sets")
async def ver_todos_los_sets_de_jugador(partida_id: int):
    try:
        sets = sets_de_partida(partida_id)

        await manager.notify_todos_los_sets_actualizados(
            partida_id,
            sets
        )
        print("Sets enviados por websocket:", sets)

        return jsonable_encoder(sets)
    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X POST "http://localhost:8000/intercambiar-set?jugador_id=INSERTE_JUGADOR_ID&cartas_jugadas_id[]=ID1&cartas_jugadas_id[]=ID2"
@router.post("/intercambiar-set")
async def intercambiar_set_entre_jugadores(jugador_id: int, 
                                           cartas_jugadas_id: list[int] = Query(alias="cartas_jugadas_id[]")):
    try:
        result = carta_intercambiar_set_entre_jugadores(jugador_id, cartas_jugadas_id)

        repo = JugadorRepository()
        jugador = repo.get_by_id(jugador_id)
        partida_id = jugador.partida

        if jugador and partida_id:
            sets_actualizados = sets_de_partida(partida_id)
            
            await manager.notify_todos_los_sets_actualizados(
                partida_id,
                sets_actualizados
            )

        return result
    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X POST "http://localhost:8000/jugar-set?partida_id=PARTIDA&jugador_id=JUGADOR&objetivo_id=OBJETIVO&carta_1_id=CARTA1&carta_2_id=CARTA2&carta_3_id=CARTA3"
@router.post("/jugar-set")
async def jugar_set(partida_id: int, jugador_id: int, objetivo_id: int, carta_1_id: int, carta_2_id: int, carta_3_id: int = None):
    try:
        cartas_jugadas_id = [carta_1_id, carta_2_id]
        if carta_3_id:
            cartas_jugadas_id.append(carta_3_id)
            
        webso = jugar_set_detective_jugado(partida_id, jugador_id, cartas_jugadas_id, objetivo_id)

        cartas_jugadas = [jsonable_encoder(CartaRepository().get_by_id(cid,partida_id)) for cid in cartas_jugadas_id]

        match webso:
            case 1: # El secreto a revelar/ocultar lo eligio el jugador que jugo el set
                await manager.notify_secreto_modificado(
                    partida_id, 
                    jsonable_encoder(CartaRepository().get_by_id(objetivo_id, partida_id))  # La carta que fue revelada
                    )
            case 2: # El secreto a revelar/ocultar lo debe elegir el objetivo del set
                await manager.notify_jugador_elegido_para_revelar_secreto(
                    partida_id, 
                    objetivo_id,    # El id del jugador objetivo, que debe elegir que secreto revelar
                    cartas_jugadas
                    )
            case _:
                raise ValueError("Error: no se reconoce ws valido")

        return {"mensaje": "Set jugado correctamente"}
    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X POST "http://localhost:8000/try-jugar-set?partida_id=PARTIDA&jugador_id=JUGADOR&objetivo_id=OBJETIVO&carta_1_id=CARTA1&carta_2_id=CARTA2&carta_3_id=CARTA3"
@router.post("/try-jugar-set")
async def try_jugar_set(partida_id: int, jugador_id: int, objetivo_id: int, carta_1_id: int, carta_2_id: int, carta_3_id: int = None):
    try:
        repo_cartas = CartaRepository()
        repo_turnos = TurnoRepository()

        nuevo_set = repo_cartas.crear_set(partida_id)
        repo_turnos.marcar_descarte_realizado(partida_id)   # Porque descarto de su mano

        cartas_jugadas_id = [carta_1_id, carta_2_id]
        if carta_3_id:
            cartas_jugadas_id.append(carta_3_id)

        for cid in cartas_jugadas_id:
            cartas_jugar_en_mesa(partida_id, jugador_id, cid, nuevo_set)

        cartas_jugadas = []
        for cid in cartas_jugadas_id:
            carta = CartaRepository().get_by_id(cid, partida_id)
            cartas_jugadas.append(jsonable_encoder(carta))
        
        cartas_en_mano = jsonable_encoder(CartaRepository().obtener_cartas_en_mano_de_jugador(jugador_id, partida_id))

        await manager.notify_set_por_jugar(
            partida_id,
            jugador_id,
            nuevo_set,
            cartas_jugadas,
            cartas_en_mano,
            objetivo_id
        )

    except Exception as e:
        return {"error": str(e)}
    
# para testear con curl:
# curl -X POST "http://localhost:8000/agregar-detective-a-set?partida_id=PARTIDA&jugador_id=JUGADOR&carta_id=CARTA&set_id=SET&objetivo_id=OBJETIVO"
@router.post("/agregar-detective-a-set")
async def agregar_detective_a_set_y_ejecutar_set(partida_id: int, jugador_id: int, carta_id: int, set_id: int, objetivo_id: int = None):
    try:
        repo_cartas = CartaRepository()
        
        set_completo = carta_agregar_detective_a_set(partida_id, jugador_id, carta_id, set_id)

        if repo_cartas.get_by_id(carta_id, partida_id).id_front == 9: # Si el detective es Oliver
            webso = 2
            objetivo_id = set_completo[0].jugador
        else:
            # Saco los ids de las cartas del set completo
            cartas_ids = []
            for carta in set_completo:
                cartas_ids.append(carta.id)

            webso = jugar_set_detective_jugado(partida_id, jugador_id, cartas_ids, objetivo_id)

        cartas_en_mano = jsonable_encoder(repo_cartas.obtener_cartas_en_mano_de_jugador(jugador_id, partida_id))
        sets_actualizados = sets_de_partida(partida_id)
        set_json = jsonable_encoder(set_completo)
       
        match webso:
            case 1:
                secreto = jsonable_encoder(repo_cartas.get_by_id(objetivo_id, partida_id))
                await manager.notify_secreto_y_manos(
                    partida_id,
                    jugador_id,
                    objetivo_id,
                    cartas_en_mano,
                    sets_actualizados,
                    secreto
                )
            case 2:
                await manager.notify_objetivo_mano_sets(    # Necesitan el jugador_id, por lo que para que queda diferenciado
                    partida_id,
                    jugador_id,
                    objetivo_id,
                    sets_actualizados,
                    cartas_en_mano,
                    set_json
                )
            case _:
                raise ValueError("Error: no se reconoce ws valido")
       
    except Exception as e:
        return {"error": str(e)}
    
# para testear con curl:
# curl -X POST "http://localhost:8000/try-agregar-detective-a-set?partida_id=PARTIDA&jugador_id=JUGADOR&carta_id=CARTA&objetivo_id=OBJETIVO&set_id=SET"
@router.post("/try-agregar-detective-a-set")
async def try_agregar_detective_a_set(partida_id: int, jugador_id: int, carta_id: int, objetivo_id: int, set_id: int):
    try:
        repo_turnos = TurnoRepository()
        repo_turnos.marcar_descarte_realizado(partida_id)   # Porque descarto de su mano

        await manager.notify_detective_por_agregar(
            partida_id,
            jugador_id,
            objetivo_id,
            carta_id,
            set_id
        )
    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X GET "http://localhost:8000/check-sets?partida_id=PARTIDA&jugador_id=JUGADOR"
@router.get("/check-sets")
async def check_sets(partida_id: int, jugador_id: int):
    try:
        sets_disponibles = set_check_sets(partida_id, jugador_id)
        return {"sets_disponibles": sets_disponibles}
    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X POST "http://localhost:8000/revelar-secreto-propio?partida_id=PARTIDA&jugador_id=JUGADOR&secreto_id=SECRETO"
@router.post("/revelar-secreto-propio")     # Se usa para los detectives que revelan secretos y tambien para evento PyS
async def revelar_secreto_propio(partida_id: int, jugador_id: int, secreto_id: int, debe_robar: bool = False, jug_obj_id: int = None):
    try:
        efecto_revelar_secreto_propio(partida_id, jugador_id, secreto_id)

        if debe_robar:
            efecto_mover_secreto(partida_id, secreto_id, jug_obj_id)

        secreto = CartaRepository().get_by_id(secreto_id, partida_id)
        secreto_data = jsonable_encoder(secreto)
        await manager.notify_secreto_modificado(partida_id, secreto_data)
    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X POST "http://localhost:8000/robar-secreto?partida_id=PARTIDA&jugador_id=JUGADOR&secreto_id=SECRETO"
@router.post("/robar-secreto")
async def robar_secreto(partida_id: int, jugador_id: int, secreto_id: int):
    try:
        efecto_mover_secreto(partida_id, secreto_id, jugador_id)

        secreto = CartaRepository().get_by_id(secreto_id, partida_id)
        secreto_data = jsonable_encoder(secreto)
        await manager.notify_secreto_modificado(partida_id, secreto_data)
    except Exception as e:
        return {"error": str(e)}

