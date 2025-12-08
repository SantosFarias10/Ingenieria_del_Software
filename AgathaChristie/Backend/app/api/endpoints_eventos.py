from fastapi import APIRouter
from fastapi.encoders import jsonable_encoder

from app.data_access import partida
from app.websocket.connection_manager import manager
from app.data_access.jugador import JugadorRepository
from app.data_access.carta import CartaRepository
from app.data_access.contador import ContadorRepository
from app.logic.logica import *
from app.logic.logica_partida import *
from app.logic.logica_jugar_cartas import *
from app.logic.logica_efectos import *


router = APIRouter()

# para testear con curl:
# curl -X POST "http://localhost:8000/jugar-carta-de-evento?partida_id=PARTIDA&jugador_id=JUGADOR&carta_id=CARTA&objetivo_id=OBJETIVO&objetivo2_id=OBJETIVO2"
@router.post("/jugar-carta-de-evento")
async def jugar_carta_de_evento(partida_id: int, jugador_id: int, carta_id: int, objetivo_id: int = None, objetivo2_id: int = None):
    try:
        webso = jugar_evento_jugado(partida_id, jugador_id, carta_id, objetivo_id, objetivo2_id)

        #si es early train to pad eliminar la carta del juego 
        # si es otra, descartarla.
        repo_cartas = CartaRepository()
        repo_jugador = JugadorRepository()
        repo_descarte = DescarteRepository()
        repo_mazo = MazoRepository()
        carta = repo_cartas.get_by_id(carta_id, partida_id)
        repo_cartas.sacar_de_jugador(carta_id, partida_id)
        if carta.id_front == 17:  # early train to paddington
            repo_cartas.cambiar_estado(carta_id, partida_id, 5)  # fuera del juego
        else:
            repo_cartas.cambiar_estado(carta_id, partida_id, 4)
            descarte_agregar_carta_a_descarte(partida_id, carta_id)

        # preparar para enviar el ws
        cartas_en_mano = jsonable_encoder(repo_cartas.obtener_cartas_en_mano_de_jugador(jugador_id, partida_id))
        carta_data = jsonable_encoder(carta)
        cantidad = len(repo_descarte.get_by_partida(partida_id))
        sets = sets_de_partida(partida_id)
        #todas_las_manos = {j.id: jsonable_encoder(repo_cartas.obtener_cartas_en_mano_de_jugador(j.id, partida_id)) for j in repo_jugador.get_jugadores_by_partida(partida_id)}
        secretos_partida = {j.id: jsonable_encoder(repo_cartas.obtener_cartas_de_secreto_de_jugador(j.id, partida_id)) for j in repo_jugador.get_jugadores_by_partida(partida_id)}
        cantidad_mazo = len(repo_mazo.get_by_partida(partida_id))

        if isinstance(webso, list):
            value = webso[0]
            victima_id = webso[1]
        else:
            value = webso

        # comparar y enviar el ws correcto
        match value:
            case 0: # cards off the table
                cartas_victima = jsonable_encoder(repo_cartas.obtener_cartas_en_mano_de_jugador(objetivo_id, partida_id))
                await manager.notify_cards_off_the_table(
                    partida_id,
                    jugador_id,
                    cartas_en_mano,
                    objetivo_id,
                    cartas_victima,
                    cantidad,
                    carta_data
                )
            case 1: # another victim
                if victima_id == 1:
                    secreto = jsonable_encoder(repo_cartas.get_by_id(objetivo2_id, partida_id))
                    await manager.notify_another_victim_caso1(
                        partida_id,
                        jugador_id,
                        sets,
                        secreto, # secreto (objetivo2_id)
                        cantidad,
                        carta_data
                    )
                elif victima_id == 2:
                    await manager.notify_another_victim_caso2(
                        partida_id,
                        jugador_id,
                        sets,
                        objetivo2_id, # jugador_id
                        cantidad,
                        carta_data
                    )
                        
            case 2: # dead card folly
                await manager.notify_prep_dead_card_folly(
                    partida_id,
                    jugador_id,
                    objetivo_id,
                    cantidad,
                    carta_data
                )
            case 3: # look into the ashes
                await manager.notify_look_into_ashes(
                    partida_id,
                    jugador_id,
                    cartas_en_mano,
                    cantidad,
                    carta_data
                )
            case 4: # card trade
                await manager.notify_prep_card_trade(
                    partida_id,
                    jugador_id,
                    objetivo_id,
                    cantidad,
                    carta_data
                )
            case 5: # and then there was one more...
                await manager.notify_and_then_one_more(
                    partida_id,
                    jugador_id,
                    secretos_partida,
                    cantidad,
                    carta_data
                )
            case 6: # delay the murderer's escape
                await manager.notify_delay_escape(
                    partida_id,
                    jugador_id,
                    cantidad_mazo,
                    cantidad,
                    carta_data
                )
            case 7: # early train
                await manager.notify_early_train(
                    partida_id,
                    jugador_id,
                    cantidad_mazo,
                    cantidad,
                    carta_data
                )
            case 8: # point ys
                await manager.notify_prep_point_sus(
                    partida_id,
                    jugador_id,
                    victima_id, # Queda "unbound" pero no nos importa pq siempre va a existir si se juega un PyS
                    cantidad,
                    carta_data,
                    cartas_en_mano
                )
            case _:
                raise ValueError("Error: no se reconoce ws valido")
        
    except Exception as e:
        return {"error": str(e)}
    finally:
        pass

# para testear con curl:
# curl -X POST "http://localhost:8000/try-jugar-carta?partida_id=PARTIDA&jugador_id=JUGADOR&carta_id=CARTA&objetivo_id=OBJETIVO&objetivo2_id=OBJETIVO2"
@router.post("/try-jugar-carta")
async def try_jugar_carta(partida_id: int, jugador_id: int, carta_id: int, objetivo_id: int, objetivo2_id: int = None):
    try:
        
        repo_cartas = CartaRepository()
        repo_turnos = TurnoRepository()
        
        # jugar la carta fisicamente a la mesa o estado de jugada
        repo_cartas.cambiar_estado(carta_id, partida_id, 2) # se juega en la mesa momentaneamente
        repo_turnos.marcar_descarte_realizado(partida_id)   # Porque descarto de su mano

        carta = repo_cartas.get_by_id(carta_id, partida_id)
        carta_data = jsonable_encoder(carta)

        await manager.notify_carta_por_jugar(
            partida_id,
            jugador_id,
            carta_data,
            objetivo_id,
            objetivo2_id
        )
    except Exception as e:
        return {"error": str(e)}
    
# para testear con curl:
# curl -X POST "http://localhost:8000/pasar-carta-ronda?partida_id=PARTIDA&jugador_id=JUGADOR&carta_id=CARTA&direccion=DIRECCION"
@router.post("/pasar-carta-ronda")   # Para Dead Card Folly
async def pasar_carta_ronda(partida_id: int, jugador_id: int, carta_id: int, direccion: int): # direccion 1 es derecha, -1 es izquierda
    try:
        efecto_chancho_va(partida_id, jugador_id, carta_id, direccion)
        contador_decrementar_contador(partida_id)
        contador = contador_obtener_contador(partida_id)

        if contador == 0:
            repo_carta = CartaRepository()
            repo_jugadores = JugadorRepository()
            jugadores = repo_jugadores.get_jugadores_by_partida(partida_id)

            manos = {
                j.id: jsonable_encoder(
                    repo_carta.obtener_cartas_en_mano_de_jugador(j.id, partida_id)
                )
                for j in jugadores
            }
            await manager.notify_dead_card_folly(
                partida_id,
                manos
            )

    except Exception as e:
        return {"error": str(e)}
    finally:
        pass
    
# para testear con curl:
# curl -X GET "http://localhost:8000/tengo-NSF?partida_id=PARTIDA&jugador_id=JUGADOR"
@router.get("/tengo-NSF")
async def tengo_not_so_fast(partida_id: int, jugador_id: int):
    try:
        cuantos_nsf = carta_consultar_not_so_fast(partida_id, jugador_id)
        return True if cuantos_nsf > 0 else False
    except Exception as e:
        return {"error": str(e)}

# para testear con curl:
# curl -X POST "http://localhost:8000/usar-NSF?partida_id=PARTIDA&jugador_id=JUGADOR&carta_id=CARTA&objetivo_id=OBJETIVO&es_set=BOOLEAN"
@router.post("/usar-NSF")
async def usar_not_so_fast(partida_id: int, jugador_id: int, carta_id: int, objetivo_id: int, es_set: bool): # carta_id es NSF, objetvio_id es la carta o set cancelado
    try:

        repo_cartas = CartaRepository()
        repo_descarte = DescarteRepository()
        repo_jugador = JugadorRepository()
        # aplicar el efecto
        efecto_not_so_fast(partida_id, jugador_id, carta_id, objetivo_id, es_set)

        # descartar el nsf
        repo_cartas.cambiar_estado(carta_id, partida_id, 4)
        repo_cartas.sacar_de_jugador(carta_id, partida_id)
        descarte_agregar_carta_a_descarte(partida_id, carta_id)

        manos = {j.id: jsonable_encoder(repo_cartas.obtener_cartas_en_mano_de_jugador(j.id, partida_id)) for j in repo_jugador.get_jugadores_by_partida(partida_id)}
            
        sets_actualizados = sets_de_partida(partida_id)
        cantidad_descarte = len(repo_descarte.get_by_partida(partida_id))
        carta_id = repo_cartas.get_by_id(carta_id, partida_id)
        ult_carta = jsonable_encoder(carta_id)

        await manager.notify_cancelar_carta(
            partida_id,
            jugador_id,
            manos,
            sets_actualizados,
            cantidad_descarte,
            ult_carta
            )

    except Exception as e:
        return {"error": str(e)}
    finally:
        pass

# para testear con curl:
# curl -X POST "http://localhost:8000/intercambiar-cartas?partida_id=PARTIDA&jugador_id=JUGADOR&objetivo_id=OBJETIVO&carta_id=CARTA"
@router.post("/intercambiar-cartas")    # Para Card Trade
async def intercambiar_cartas_entre_jugadores(partida_id: int, jugador_id: int, objetivo_id: int, carta_id: int):
    try:
        repo_cartas = CartaRepository()
        mensaje = efecto_intercambiar_carta(partida_id, jugador_id, objetivo_id, carta_id)
        contador_decrementar_contador(partida_id)
        contador = contador_obtener_contador(partida_id)

        if contador == 0:
            mano_jugador = jsonable_encoder(repo_cartas.obtener_cartas_en_mano_de_jugador(jugador_id, partida_id))
            mano_objetivo = jsonable_encoder(repo_cartas.obtener_cartas_en_mano_de_jugador(objetivo_id, partida_id))
            # Mandar WS, para actualizar mano jugador y mano del objetivo
            await manager.notify_card_trade(
                partida_id,
                jugador_id,
                mano_jugador,
                objetivo_id,
                mano_objetivo
            )

        return mensaje
    except Exception as e:
        return {"error": str(e)}
