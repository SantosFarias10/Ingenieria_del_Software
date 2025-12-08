from app.data_access.carta import CartaRepository
from app.data_access.jugador import JugadorRepository, JugadorData
from app.data_access.mazos import MazoRepository, DescarteRepository, DraftRepository
from app.data_access.partida import PartidaRepository
from app.data_access.turnos import TurnoRepository
from app.data_access.contador import ContadorRepository
from app.logic.logica_mazos import *
from random import shuffle


def check_desgracia(jugador_id: int):
    repo_jugador = JugadorRepository()
    repo_partida = PartidaRepository()

    jugador = repo_jugador.get_by_id(jugador_id)
    if jugador is None:
        raise ValueError(f"El jugador {jugador_id} no existe")

    partida = repo_partida.get_by_id(jugador.partida)
    if partida is None:
        raise ValueError(f"La partida {partida.id} no existe")
    if jugador not in repo_jugador.get_jugadores_by_partida(partida.id):
        raise ValueError(f"El jugador {jugador_id} no pertenece a la partida {partida.id}")

    from app.logic.logica import carta_consultar_secretos_de_jugador
    secretos_jugador = carta_consultar_secretos_de_jugador(jugador_id, partida.id)
    secretos_revelados = [secreto for secreto in secretos_jugador if secreto.estado == 0]
    if (len(secretos_revelados) >= len(secretos_jugador)):
        repo_jugador.set_desgraciado(jugador_id, True)
    else :
        repo_jugador.set_desgraciado(jugador_id, False)

    return jugador.desgraciado

def efecto_revelar_secreto(partida_id: int, secreto_id: int):
    repo_carta = CartaRepository()
    carta = repo_carta.get_by_id(secreto_id, partida_id)
    # Verificar que la carta es de tipo Secreto
    if carta.categoria != "Secret":
        raise ValueError("La carta no es de tipo Secreto")
    # Verificar que el secreto pertenezca al algun jugador
    if carta.jugador is None:
        raise ValueError("El secreto no pertenece a ningun jugador")
    # Verificar que el secreto pertenezca a la misma partida
    if carta.partida != partida_id:
        raise ValueError("La carta no pertenece a la partida")
    # Verificar que el secreto este oculto
    if carta.estado == 9:
        repo_carta.cambiar_estado(secreto_id, partida_id, 0)
        check_desgracia(carta.jugador)
        if secreto_id == 18: # si es el asesino, gana 
            pass
# TODO GANA EL ASESINO ACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
    else:
        raise ValueError("El secreto ya esta revelado")

def efecto_mover_secreto(partida_id: int, secreto_id: int, nuevo_jugador_id: int):
    repo_carta = CartaRepository()
    repo_jugador = JugadorRepository()
    carta = repo_carta.get_by_id(secreto_id, partida_id)
    nuevo_jugador = repo_jugador.get_by_id(nuevo_jugador_id)
    # Verificar que la carta es de tipo Secreto
    if carta.categoria != "Secret":
        raise ValueError("La carta no es de tipo Secreto")
    # Verificar que el secreto pertenezca al algun jugador
    if carta.jugador is None:
        raise ValueError("El secreto no pertenece a ningun jugador")
    # Verificar que el secreto pertenezca a la misma partida
    if carta.partida != partida_id:
        raise ValueError("La carta no pertenece a la partida")
    # Verificar que el nuevo jugador este en la misma partida
    if nuevo_jugador.partida != partida_id:
        raise ValueError("El nuevo jugador no pertenece a la misma partida")
    # Verificar que el secreto este visible
    if carta.estado == 9:
        raise ValueError("El secreto esta oculto y no se puede mover")
    # Lógica para mover el secreto al nuevo jugador
    
    repo_carta.agregar_a_jugador(nuevo_jugador_id, secreto_id, partida_id)
    repo_carta.cambiar_estado(secreto_id, partida_id, 9)
    check_desgracia(nuevo_jugador_id)   # Saca al nuevo en caso de estar en desgracia
    check_desgracia(carta.jugador)      # Saca/pone al gaga de/en desgracia

def efecto_ocultar_secreto(partida_id: int, secreto_id: int):
    repo_carta = CartaRepository()
    carta = repo_carta.get_by_id(secreto_id, partida_id)
    # Verificar que la carta es de tipo Secreto
    if carta.categoria != "Secret":
        raise ValueError("La carta no es de tipo Secreto")
    # Verificar que el secreto pertenezca al algun jugador
    if carta.jugador is None:
        raise ValueError("El secreto no pertenece a ningun jugador")
    # Verificar que el secreto pertenezca a la misma partida
    if carta.partida != partida_id:
        raise ValueError("La carta no pertenece a la partida")
    # Verificar que el secreto este visible
    if carta.estado == 0:
        repo_carta.cambiar_estado(secreto_id, partida_id, 9)
        check_desgracia(carta.jugador)
    else:
        raise ValueError("El secreto ya esta oculto")

def efecto_devolver_set_a_mano(partida_id: int, jugador_id: int, set_ids: list[int]):
    repo_jugador = JugadorRepository()
    repo_carta = CartaRepository()
    jugador = repo_jugador.get_by_id(jugador_id)
    # Verificar que el jugador este en la partida
    if jugador.partida != partida_id:
        raise ValueError("El jugador no pertenece a la partida")
    # Devolvemos a la mano las cartas del set
    for carta_id in set_ids:
        repo_carta.cambiar_estado(carta_id, partida_id, 1)

def efecto_revelar_secreto_propio(partida_id: int, jugador_id: int, secreto_id: int):
    repo_carta = CartaRepository()
    carta = repo_carta.get_by_id(secreto_id, partida_id)
    # Verificar que la carta es de tipo Secreto
    if carta.categoria != "Secret":
        raise ValueError("La carta no es de tipo Secreto")
    # Verificar que el secreto pertenezca a la misma partida
    if carta.partida != partida_id:
        raise ValueError("La carta no pertenece a la partida")
    # Verificar que el secreto pertenezca al jugador
    if carta.jugador != jugador_id:
        raise ValueError("El secreto no le pertenece al jugador")
    # Verificar que el secreto este oculto
    if carta.estado == 9:
        repo_carta.cambiar_estado(secreto_id, partida_id, 0)
        check_desgracia(jugador_id)
    else:
        raise ValueError("El secreto ya esta revelado")


# ------------------------------------------------------------------------------------------------
# --------------------------------------- efectos eventos ----------------------------------------
# ------------------------------------------------------------------------------------------------


def efecto_descartar_not_so_fasts(partida_id: int, jugador_id: int):
    repo_carta = CartaRepository()
    repo_jugador = JugadorRepository()
    jugador = repo_jugador.get_by_id(jugador_id)
    # Verificar que el jugador este en la partida
    if jugador.partida != partida_id:
        raise ValueError("El jugador no pertenece a la partida")
    # Obtener cartas Not So Fast! en mano del jugador
    cartas_mano = repo_carta.obtener_cartas_en_mano_de_jugador(jugador_id, partida_id)
    for carta in cartas_mano:
        if carta.categoria == "Instant":
            # Descartar la carta Not So Fast!
            repo_carta.sacar_de_jugador(carta.id, partida_id)
            repo_carta.cambiar_estado(carta.id, partida_id, 4)
            descarte_agregar_carta_a_descarte(partida_id, carta.id)

def efecto_chancho_va(partida_id: int, jugador_id, carta_id, direccion: int): # direccion 1 es derecha, -1 es izquierda
    repo_turno = TurnoRepository()
    repo_carta = CartaRepository()
    turnos = repo_turno.get_turnos_by_partida(partida_id)
    turno_jugador = repo_turno.get_turno_by_id(partida_id, jugador_id).turno

    # next_jugador_id cuyo turno es jugador_id(turno) +- direccion
    next_jugador_id = turnos[(turno_jugador + direccion) % len(turnos)].jugador
    # Mover la carta al siguiente jugador
    repo_carta.agregar_a_jugador(next_jugador_id, carta_id, partida_id)

def efecto_roba_del_descarte(partida_id: int, jugador_id: int, carta_id: int):
    repo_carta = CartaRepository()
    repo_jugador = JugadorRepository()
    jugador = repo_jugador.get_by_id(jugador_id)
    # Verificar que el jugador este en la partida
    if jugador.partida != partida_id:
        raise ValueError("El jugador no pertenece a la partida")
    # Verificar que la carta este en el descarte
    carta = repo_carta.get_by_id(carta_id, partida_id)
    if carta.estado != 4:
        raise ValueError("La carta no esta en el descarte")
    # Mover la carta al jugador
    repo_carta.agregar_a_jugador(jugador_id, carta_id, partida_id)
    descarte_sacar_carta_por_id(partida_id, carta_id)

def efecto_roba_secreto(partida_id: int, secreto_id: int, jugador_id: int):
    repo_carta = CartaRepository()
    repo_jugador = JugadorRepository()
    jugador = repo_jugador.get_by_id(jugador_id)
    # Verificar que el jugador este en la partida
    if jugador.partida != partida_id:
        raise ValueError("El jugador no pertenece a la partida")
    # Verificar que la carta es de tipo Secreto
    carta = repo_carta.get_by_id(secreto_id, partida_id)
    if carta.categoria != "Secret":
        raise ValueError("La carta no es de tipo Secreto")
    # Verificar que el secreto pertenezca a la misma partida
    if carta.partida != partida_id:
        raise ValueError("La carta no pertenece a la partida")
    # Verificar que el secreto este revelado
    if carta.estado != 0:
        raise ValueError("El secreto no esta revelado")
    # Cambiar de propietario de secreto y darlo vuelta (ocultarlo)
    repo_carta.agregar_a_jugador(jugador_id, secreto_id, partida_id)
    repo_carta.cambiar_estado(secreto_id, partida_id, 9)
    check_desgracia(jugador_id) # Del nuevo
    check_desgracia(carta.jugador) # Del viejo

def efecto_descartar_6_desde_mazo(partida_id):
    repo_carta = CartaRepository()
    ult_6 = mazo_get_ultimas_6_cartas(partida_id)
    for carta in ult_6:
        repo_carta.cambiar_estado(carta.carta_id, partida_id, 4)
        descarte_agregar_carta_a_descarte(partida_id, carta.carta_id)
        mazo_robar_ultima_carta_mazo(partida_id)

def efecto_robar_set_de_jugador(partida_id: int, jugador_id: int, set_id: int):
    repo_carta = CartaRepository()
    cartas = repo_carta.get_cartas_by_set(partida_id, set_id)
    cartas_id = []
    print(cartas)
    for carta in cartas:
        cartas_id.append(carta.id)
    # Uso los ids porque asi esta hecho el intercambiar_set
    from app.logic.logica import carta_intercambiar_set_entre_jugadores
    carta_intercambiar_set_entre_jugadores(jugador_id, cartas_id)

# ------------------------------------------------------------------------------------------------
# -------------------------------------- NOT SO FAST YOU FIEND -----------------------------------
# ------------------------------------------------------------------------------------------------

def efecto_not_so_fast(partida_id: int, jugador_id: int, notsofast_id: int, objetivo_id: int, es_set: bool):
    try:
        repo_carta = CartaRepository()
        # if el es lady elieen como set, vuelve a la mano
        if es_set:
            set_completo = repo_carta.get_cartas_by_set(partida_id, objetivo_id)

            # verificamos de que set se trata esta
            for carta in set_completo:
                if repo_carta.get_by_id(carta.id, partida_id).id_front == 8: # si es quinn lo ignoramos
                    continue
                else: # si es no quinn entocens vemos cual es
                    carta_primera = carta
                    break

            carta_front = repo_carta.get_by_id(carta_primera.id, partida_id).id_front
            if carta_front == 5:  # lady eileen
                efecto_devolver_set_a_mano(partida_id, jugador_id, objetivo_id)
            # endif de eileen
            # si es otro set:
            else:
                # descartamos el set completito
                for carta in set_completo:
                    repo_carta.sacar_de_jugador(carta.id, partida_id)
                    repo_carta.cambiar_estado(carta.id, partida_id, 4)
                    descarte_agregar_carta_a_descarte(partida_id, carta.id)
        # si es carta de evento
        else:
            repo_carta.sacar_de_jugador(objetivo_id, partida_id)
            repo_carta.cambiar_estado(objetivo_id, partida_id, 4)
            descarte_agregar_carta_a_descarte(partida_id, objetivo_id)


    except Exception as e:
        raise e

def efecto_recartar_descarte_a_mazo_n(partida_id: int, cantidad: int):
    repo_carta = CartaRepository()
    ultimas = descarte_get_ultimas_N_cartas(partida_id, cantidad)
    shuffle(ultimas)
    for carta in ultimas:
        repo_carta.cambiar_estado(carta.carta_id, partida_id, 3)
        mazo_agregar_carta_a_mazo(partida_id, carta.carta_id)
        descarte_sacar_ultima_carta_de_descarte(partida_id)

def efecto_victima_aleatoria(partida_id: int):
    repo_jugador = JugadorRepository()
    jugadores = repo_jugador.get_jugadores_no_desgraciados_by_partida(partida_id)
    victima = random.choice(jugadores)
    return victima.id

def efecto_intercambiar_carta(partida_id: int, jugador_id: int, objetivo_id: int, carta_id: int):
    # Encontramos carta
    repo_cartas = CartaRepository()
    # Agregamos la carta al jugador
    repo_cartas.agregar_a_jugador(objetivo_id, carta_id, partida_id)
    return {"message": f"Carta {carta_id} intercambiada a jugador {jugador_id}, en partida {partida_id}"}

# ------------------------------------------------------------------------------------------------
# ------------------------------------------- contador -------------------------------------------
# ------------------------------------------------------------------------------------------------

def contador_iniciar_contador(partida_id: int, cant: int):
    repo_contador = ContadorRepository()
    try:
        repo_contador.set_contador(partida_id, cant)
    except Exception as e:
        raise e

def contador_decrementar_contador(partida_id):
    repo_contador = ContadorRepository()
    try:
        repo_contador.decrementar_contador(partida_id)
    except Exception as e:
        raise e
    
def contador_obtener_contador(partida_id: int):
    repo_contador = ContadorRepository()
    try:
        return repo_contador.get_by_partida(partida_id)
    except Exception as e:
        raise e

