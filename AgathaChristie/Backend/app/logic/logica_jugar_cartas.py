from app.data_access import partida
from app.data_access.carta import CartaRepository, CartaData
from app.data_access.jugador import JugadorRepository, JugadorData
from app.data_access.mazos import MazoRepository, DescarteRepository, DraftRepository
from app.data_access.partida import PartidaRepository
from app.logic.logica_efectos import *
from app.websocket.connection_manager import manager
from fastapi.encoders import jsonable_encoder


def set_check_sets(partida_id: int, jugador_id: int):
    repo_cartas = CartaRepository()
    mano_jugador = repo_cartas.obtener_cartas_en_mano_de_jugador(jugador_id, partida_id)
    id_fronts_mano = [carta.id_front for carta in mano_jugador]
    sets_disponibles = []
    detectives_min_3 = [1,2]  # Hercule Poirot, Miss Marple
    detectives_min_2 = [3,4,5,6,7]
    # sin harley quin
    for detective in detectives_min_3:
        set_det = []
        if id_fronts_mano.count(detective) >= 3:
            set_det = [detective, detective, detective]
            sets_disponibles.append(set_det)
    for detective in detectives_min_2:
        set_det = []
        if id_fronts_mano.count(detective) >= 2:
            set_det = [detective, detective]
            sets_disponibles.append(set_det)
    # con 1 harley quin
    if id_fronts_mano.count(8) >= 1:
        for detective in detectives_min_3:
            set_det = []
            if id_fronts_mano.count(detective) >= 2:
                set_det = [detective, detective, 8]
                sets_disponibles.append(set_det)
        for detective in detectives_min_2:
            set_det = []
            if id_fronts_mano.count(detective) >= 1:
                set_det = [detective, 8]
                sets_disponibles.append(set_det)
    # con 2 harley quin
    if id_fronts_mano.count(8) >= 2:
        for detective in detectives_min_3:
            set_det = []
            if id_fronts_mano.count(detective) >= 1:
                set_det = [detective, 8, 8]
                sets_disponibles.append(set_det)
    # casos tommy y tuppence
    if 6 in id_fronts_mano and 7 in id_fronts_mano:
        set_det = [6,7]
        sets_disponibles.append(set_det)
    return sets_disponibles

def jugar_evento_jugado(partida_id: int, jugador_id: int, carta_id: int, objetivo_id: int = None, objetivo2_id: int = None):
    # repositorios
    repo_eventos = Eventos()
    repo_carta = CartaRepository()
    
    try:
        # Se analiza que carta se jugo
        carta = repo_carta.get_by_id(carta_id, partida_id)
        if carta.categoria != "Event":
            raise ValueError("La carta no es de tipo Evento")
        match carta.id_front:
            case 10:
                # Cards off the table
                repo_eventos.caso_cards_off_the_table(partida_id, carta_id, objetivo_id)
                return 0
            case 11:
                # Another Victim
                webso = repo_eventos.caso_another_victim(partida_id, jugador_id, carta_id, objetivo_id, objetivo2_id) #objetivo_id es el set
                return [1, webso]
                #from app.logic.logica import sets_de_partida
                #await manager.notify_todos_los_sets_actualizados(partida_id, sets_de_partida(partida_id))
            case 12:
                # Dead card folly
                repo_eventos.caso_dead_card_folly(partida_id)
                return 2
            case 13:
                # Look into the ashes
                repo_eventos.caso_look_into_the_ashes(partida_id, carta_id, jugador_id, objetivo_id)
                return 3
            case 14:
                # Card trade
                repo_eventos.caso_card_trade(partida_id)
                return 4
            case 15:
                # And then there was one more...
                repo_eventos.caso_and_then_there_was_one_more(partida_id, carta_id, objetivo_id, objetivo2_id)
                return 5
            case 16:
                # Delay the murderer's escape!
                repo_eventos.caso_delay_the_murderers_escape(partida_id, objetivo_id)
                return 6
            case 17:
                # Early train to paddington
                repo_eventos.caso_early_train_to_paddington(partida_id, carta_id)
                return 7
            case 18:
                # Point your suspicions
                victima_id = repo_eventos.caso_point_your_suspicions(partida_id)
                return [8, victima_id]
            case _:
                raise ValueError("La carta no es un evento")

        # Se devuelve codigo de exito o fallo
    except Exception as e:
        raise e
    finally:
        pass

def jugar_set_detective_jugado(partida_id: int, jugador_id: int, cartas_jugadas_id: list[int], objetivo_id: int):
    # repositorios
    repo_detectives = Detectives()
    repo_cartas = CartaRepository()

    cartas_jugadas_id_front = []

    for carta in cartas_jugadas_id:
        cartas_jugadas_id_front.append(repo_cartas.get_by_id(carta, partida_id).id_front)

    try:
        if len(cartas_jugadas_id_front) == 0:
            raise ValueError("No se jugaron cartas")
        carta_id_front = 8
        for id_front in cartas_jugadas_id_front:
            if id_front != 8 and id_front != 9:
                carta_id_front = id_front
                break
        
        # y vemos que detective es
        # return 1: para los casos donde ya se sabe 
        match carta_id_front:
            case 1: # Hercule Poirot
                repo_detectives.caso_hercule_poirot(partida_id, jugador_id, cartas_jugadas_id_front, objetivo_id)
                return 1
            case 2: # Miss Marple
                repo_detectives.caso_miss_marple(partida_id, jugador_id, cartas_jugadas_id_front, objetivo_id)
                return 1
            case 3: # Mr Satterthwaite
                return 2
            case 4: # Parker Pyne
                repo_detectives.caso_parker_pyne(partida_id, jugador_id, cartas_jugadas_id_front, objetivo_id)
                return 1
            case 5: # Lady Eileen 'Bundle' Brent
                return 2
            case 6: # Tommy Beresford
                return 2
            case 7: # Tuppence Beresford
                return 2
            case 8: # Harley Quin Wildcard
                raise ValueError("Harley Quin no puede ser un set de detectives por si solo")
            case 9: # Adriane Oliver
                raise ValueError("Adriane Oliver no puede iniciar un set de detectives")
            case _:
                raise ValueError("La carta no es un detective")

        # Se devuelve codigo de exito o fallo
    except Exception as e:
        raise e
    finally:
        pass

class Eventos:
    def caso_cards_off_the_table(self, partida_id: int, carta_id: int, jugador_objetivo_id: int): 
        try:
            efecto_descartar_not_so_fasts(partida_id, jugador_objetivo_id)
        except Exception as e:
            raise e
        finally:
            pass

    def caso_another_victim(self, partida_id: int, jugador_id: int, carta_id: int, set_id: int, objetivo2_id: int):
        try:
            efecto_robar_set_de_jugador(partida_id, jugador_id, set_id)
            # Ejecutar accion del set
            repo_cartas = CartaRepository()
            cartas_set = repo_cartas.get_cartas_by_set(partida_id, set_id)
            cartas_set_id = []
            for carta in cartas_set:
                cartas_set_id.append(carta.id)
            webso = jugar_set_detective_jugado(partida_id, jugador_id, cartas_set_id, objetivo2_id)
            return webso
        except Exception as e:
            raise e
        finally:
            pass

    def caso_dead_card_folly(self, partida_id: int):
        try:
            # mandar WS a todos los jugadores con la instruccion de elegir una carta de su mano para pasar al siguiente jugador
            # y la direccion objetivo.
            # A la carta la enviaran por ENDPOINT con partida_id, jugador_id, carta_id y direccion.
            cantidad_jugadores = PartidaRepository().get_numero_de_jugadores(partida_id)
            contador_iniciar_contador(partida_id, cantidad_jugadores)
            pass
        except Exception as e:
            raise e
        finally:
            pass

    def caso_look_into_the_ashes(self, partida_id: int, carta_id: int, jugador_id: int, carta_objetivo_id: int):
        try:
            efecto_roba_del_descarte(partida_id, jugador_id, carta_objetivo_id)
        except Exception as e:
            raise e
        finally:
            pass

    def caso_card_trade(self, partida_id):
        try:
            # mandar ws al jugador elegido y al jugador que juega la carta para que elijan una carta de su mano para intercambiar
            contador_iniciar_contador(partida_id, 2)
            pass
        except Exception as e:
            raise e
        finally:
            pass

    def caso_and_then_there_was_one_more(self, partida_id: int, carta_id, secreto_objetivo_id: int, jugador_objetivo_id: int):
        try:
            efecto_roba_secreto(partida_id, secreto_objetivo_id, jugador_objetivo_id)
        except Exception as e:
            raise e
        finally:
            pass

    def caso_delay_the_murderers_escape(self, partida_id, cantidad):
        try:
            efecto_recartar_descarte_a_mazo_n(partida_id, cantidad)
        except Exception as e:
            raise e
        finally:
            pass

    def caso_early_train_to_paddington(self, partida_id: int, carta_id: int):
        try:
            efecto_descartar_6_desde_mazo(partida_id)
        except Exception as e:
            raise e
        finally:
            pass

    def caso_point_your_suspicions(self, partida_id: int):
        try:
            victima_id = efecto_victima_aleatoria(partida_id)
            return victima_id
        except Exception as e:
            raise e
        finally:
            pass

class Detectives:
    def caso_hercule_poirot(self, partida_id: int, jugador_id: int, cartas_jugadas_id_front: list, objetivo_id: int):
        try:
            #verificamos que todas las cartas sean de poirot o harley quin
            for carta_id in cartas_jugadas_id_front:
                if carta_id not in [1, 8, 9]:
                    raise ValueError("No se puede jugar un set de detectives distintos") 
            
            # veridicamos que sean suficientes detectives para el set
            if len(cartas_jugadas_id_front) < 3:
                raise ValueError("no hay suficientes detectives en el set")
            
            # aplicamos el efecto
            efecto_revelar_secreto(partida_id, objetivo_id)
        except Exception as e:
            raise e

    def caso_miss_marple(self, partida_id: int, jugador_id: int, cartas_jugadas_id_front: list, objetivo_id: int):
        try:
            #verificamos que todas las cartas sean del detective o harley quin
            for carta_id in cartas_jugadas_id_front:
                if carta_id not in [2, 8, 9]:
                    raise ValueError("No se puede jugar un set de detectives distintos") 
            
            # veridicamos que sean suficientes detectives para el set
            if len(cartas_jugadas_id_front) < 3:
                raise ValueError("no hay suficientes detectives en el set")
            
            # aplicamos el efecto
            efecto_revelar_secreto(partida_id, objetivo_id)          
        except Exception as e:
            raise e

    def caso_parker_pyne(self, partida_id: int, jugador_id: int, cartas_jugadas_id_front: list, objetivo_id: int):
        try:
            #verificamos que todas las cartas sean del detective o harley quin
            for carta_id in cartas_jugadas_id_front:
                if carta_id not in [4, 8, 9]:
                    raise ValueError("No se puede jugar un set de detectives distintos") 
            
            # veridicamos que sean suficientes detectives para el set
            if len(cartas_jugadas_id_front) < 2:
                raise ValueError("no hay suficientes detectives en el set")
            
            # aplicamos el efecto
            efecto_ocultar_secreto(partida_id, objetivo_id)
        except Exception as e:
            raise e

    # Detectives que no nos sirven
    # def caso_lady_eileen_bundle_brent(self, partida_id: int, jugador_id: int, cartas_jugadas_id_front: list, objetivo_id: int):
    #     try:
    #         #verificamos que todas las cartas sean del detective o harley quin
    #         for carta_id in cartas_jugadas_id_front:
    #             if carta_id not in [5, 8]:
    #                 raise ValueError("No se puede jugar un set de detectives distintos") 
    #         # veridicamos que sean suficientes detectives para el set
    #         if len(cartas_jugadas_id_front) < 2:
    #             raise ValueError("no hay suficientes detectives en el set")
    #         # aplicamos el efecto
    #         efecto_jugador_elige_revelar_secreto(partida_id, objetivo_id)
    #         # TODO --------------------------------------------------------------------------------------------------------------
    #         # si fue countereado devolver las cartas a la mano
    #         # efecto_devolver_set_a_mano(partida_id, jugador_id, cartas_jugadas_id_front)
    #     except Exception as e:
    #         raise e
    # def caso_tommy_beresford(self, partida_id: int, jugador_id: int, cartas_jugadas_id_front: list, objetivo_id: int):
    #     try:
    #         #verificamos que todas las cartas sean del detective o su hermana o harley quin
    #         for carta_id in cartas_jugadas_id_front:
    #             if carta_id not in [6, 7, 8]:
    #                 raise ValueError("No se puede jugar un set de detectives distintos") 
    #         # veridicamos que sean suficientes detectives para el set
    #         if len(cartas_jugadas_id_front) < 2:
    #             raise ValueError("no hay suficientes detectives en el set")
    #         # aplicamos el efecto
    #         efecto_jugador_elige_revelar_secreto(partida_id, objetivo_id)
    #         # TODO --------------------------------------------------------------------------------------------------------------
    #         # si se jugo con la hermana no se pueden cancelar
    #     except Exception as e:
    #         raise e
    # def caso_tuppence_beresford(self, partida_id: int, jugador_id: int, cartas_jugadas_id_front: list, objetivo_id: int):
    #     try:
    #         #verificamos que todas las cartas sean del detective o su hermano o harley quin
    #         for carta_id in cartas_jugadas_id_front:
    #             if carta_id not in [7, 6, 8]:
    #                 raise ValueError("No se puede jugar un set de detectives distintos") 
    #         # veridicamos que sean suficientes detectives para el set
    #         if len(cartas_jugadas_id_front) < 2:
    #             raise ValueError("no hay suficientes detectives en el set")
    #         # aplicamos el efecto
    #         efecto_jugador_elige_revelar_secreto(partida_id, objetivo_id)
    #         # TODO --------------------------------------------------------------------------------------------------------------
    #         # si se jugo con  el hermano no se pueden cancelar
    #     except Exception as e:
    #         raise e

