from pony.orm import db_session
from collections import defaultdict
from app.data_access import carta
from app.data_access.partida import PartidaRepository, CreatePartidaData
from app.data_access.jugador import JugadorRepository, CreateJugadorData
from app.data_access.carta import CartaRepository, cargar_cartas
from app.data_access.turnos import TurnoRepository, cargar_turnos
from app.data_access.contador import ContadorRepository
from app.logic.logica_mazos import *
from app.logic.logica_jugar_cartas import Eventos
from datetime import date
import random

# -------------------------------------------------------------------------------------------------
# -------------------------------------------- Cartas --------------------------------------------
# ------------------------------------------------------------------------------------------------

def carta_asignar_carta_a_jugador(jugador_id: int, carta_id: int):
    # Encontramos al jugador
    repo_jugadores = JugadorRepository()
    jugador = repo_jugadores.get_by_id(jugador_id)
    # Encontramos el id de la partida con el jugador (por ahora solo puede participar de una partida)
    partida_id = jugador.partida
    if jugador.partida is None:
        raise ValueError("El jugador no esta en una partida")
    # Encontramos la carta
    repo_cartas = CartaRepository()
    carta = repo_cartas.get_by_id(carta_id, partida_id)
    # Verificamos que el jugador no pueda tener mas de 6 cartas no secreto
    if carta.categoria != "Secret" and len(repo_cartas.obtener_cartas_en_mano_de_jugador(jugador_id, partida_id)) >= 6:
        raise ValueError("El jugador ya tiene 6 cartas asignadas")
    # Agregamos la carta al jugador
    repo_cartas.agregar_a_jugador(jugador_id, carta_id, partida_id)
    repo_cartas.cambiar_estado(carta_id, partida_id, 1)
    return {"message": f"Carta {carta_id} asignada a jugador {jugador_id}, en partida {partida_id}"}

def carta_agregar_detective_a_set(partida_id: int, jugador_id: int, carta_id: int, set_id: int):
    repo_jugadores = JugadorRepository()
    repo_cartas = CartaRepository()

    # Busco al jugador
    jugador = repo_jugadores.get_by_id(jugador_id)
    # Busco la carta de detective a agregar
    carta = repo_cartas.get_by_id(carta_id, partida_id)
    # Busco el set especifico, lo uso para verificar que existe el set al que estoy por agregar el detective
    try:
        cartas_del_set = repo_cartas.get_cartas_by_set(partida_id, set_id)
        set = cartas_del_set[0].set     # Siempre deberia existir, sino saltaria el error de que no existe set dentro del data access
        dueño_set = cartas_del_set[0].jugador    # Esto por lo de Adriane Oliver
    except ValueError:
        raise ValueError
    
    # Verifico que el jugador pertenezca a la partida y la carta a agregar sea detective
    if partida_id != jugador.partida:
        raise ValueError("El jugador no esta en esta partida")
    if carta.categoria != "Detective":
        raise ValueError("No se puede agregar una carta que no es detective a un set de detectives")
    if not set:
        raise ValueError("No existe el set")   # Recheckeo de onda
    
    repo_cartas.agregar_carta_a_set(partida_id, carta_id, dueño_set, set)  # Agrego la carta al set
    cartas_del_set = repo_cartas.get_cartas_by_set(partida_id, set_id)  # Busco el set completo
    return cartas_del_set  # Retorno el set completo para poder ejecutar su accion

def sets_de_partida(partida_id: int):
    repo_jugadores = JugadorRepository()
    repo_cartas = CartaRepository()

    jugadores = repo_jugadores.get_jugadores_by_partida(partida_id)
    resultado = {}

    for jugador in jugadores:
        try:
            cartas = repo_cartas.get_all_sets(jugador.id, partida_id)  # List[CartaData]
        except ValueError:
            # Jugador sin sets
            resultado[jugador.id] = {}
            continue

        sets_jugador = defaultdict(list)
        for c in cartas:
            if c.set is None:
                continue
            sets_jugador[c.set].append(c.model_dump())
        resultado[jugador.id] = sets_jugador

    return resultado

def carta_intercambiar_set_entre_jugadores(jugador_id: int, cartas_jugadas_id: list[int]):
    # Encontramos al jugador
    repo_jugadores = JugadorRepository()
    jugador = repo_jugadores.get_by_id(jugador_id)

    # Encontramos el id de la partida con el jugador (por ahora solo puede participar de una partida)
    partida_id = jugador.partida
    if jugador.partida is None:
        raise ValueError("El jugador no esta en una partida")

    # Intercambiar las cartas del set manteniendo su estado de "jugado"
    repo_cartas = CartaRepository()
    for carta_id in cartas_jugadas_id:
        # Usar función específica que mantiene estado y set ID
        repo_cartas.intercambiar_set_a_jugador(jugador_id, carta_id, partida_id)
    
    return {"message": f"Set intercambiado: {len(cartas_jugadas_id)} cartas asignadas a jugador {jugador_id}, en partida {partida_id}"}

def repartir_secretos_a_jugadores(partida_id: int) -> None:
    repo_jugador = JugadorRepository()
    repo_cartas = CartaRepository()
    repo_partida = PartidaRepository()

    num_jugadores = repo_partida.get_numero_de_jugadores(partida_id)
    jugadores = repo_jugador.get_jugadores_by_partida(partida_id)
    cartas_de_partida = repo_cartas.get_secretos_by_partida(partida_id)

    carta_asesino = repo_cartas.get_carta_de_asesino(partida_id)
    asesino = random.choice(jugadores)
    repo_cartas.agregar_a_jugador(asesino.id, carta_asesino.id, partida_id)
    carta_complice = repo_cartas.get_carta_de_complice(partida_id)

    if num_jugadores >= 5:
        jugadores_sin_asesino = [j for j in jugadores if j.id != asesino.id]
        complice = random.choice(jugadores_sin_asesino)
        repo_cartas.agregar_a_jugador(complice.id, carta_complice.id, partida_id)

    cartas_de_partida.remove(carta_asesino)

    cartas_de_partida.remove(carta_complice)

    for jugador in jugadores:
        while (len(repo_cartas.obtener_cartas_de_secreto_de_jugador(jugador.id, partida_id)) < 3):
            if cartas_de_partida:
                carta_random = random.choice(cartas_de_partida)

                repo_cartas.agregar_a_jugador(jugador.id, carta_random.id, partida_id)
                repo_cartas.cambiar_estado(carta_random.id, partida_id, 9)
                cartas_de_partida.remove(carta_random)
            else: 
                print("No hay mas cartas disponibles.")
                break

@db_session
def cartas_jugar_en_mesa(partida_id: int, jugador_id: int, carta_id: int, set: int):
    repo_cartas = CartaRepository()
    carta = repo_cartas.get_by_id(carta_id, partida_id)
    if carta.jugador != jugador_id:
        raise ValueError("La carta no pertenece al jugador")
    if carta.estado != 1:
        raise ValueError("La carta no esta en la mano del jugador")
    repo_cartas.set_set(partida_id, carta_id, set)
    repo_cartas.cambiar_estado(carta_id, partida_id, 2)

@db_session
def repartir_cartas_iniciales(partida_id: int) -> None:
    repo_jugador = JugadorRepository()
    repo_cartas = CartaRepository()
    repo_partida = PartidaRepository()
    repo_mazo = MazoRepository()

    jugadores = repo_jugador.get_jugadores_by_partida(partida_id)
    cartas_not_so_fast = repo_cartas.obtener_not_so_fast(partida_id)

    for jugador in jugadores:
        carta_asignar_carta_a_jugador(jugador.id, cartas_not_so_fast[0].id)
        repo_mazo.eliminar_carta_de_mazo_id(partida_id, cartas_not_so_fast[0].id)
        cartas_not_so_fast.pop(0)
    
    resto_cartas = mazos_get_mazo_by_partida(partida_id)

    for jugador in jugadores:
        while (len(repo_cartas.obtener_cartas_en_mano_de_jugador(jugador.id, partida_id)) < 6):
            if resto_cartas:
                carta_arriba_id = mazo_robar_ultima_carta_mazo(partida_id)

                carta_asignar_carta_a_jugador(jugador.id, carta_arriba_id)
                resto_cartas = mazos_get_mazo_by_partida(partida_id)
            else: 
                print("No hay mas cartas disponibles.")
                break

def carta_descartar_carta_de_jugador(carta_id: int, partida_id: int):
    # Encontramos la partida
    repo_partida = PartidaRepository()
    partida = repo_partida.get_by_id(partida_id)
    if partida is None:
        raise ValueError("La partida no existe")
    
    # Encontramos la carta
    repo_cartas = CartaRepository()
    carta = repo_cartas.get_by_id(carta_id, partida_id)
    if carta.jugador is None or carta.estado != 1:
        raise ValueError("La carta no esta asignada a ningun jugador o no esta en su mano")
    
    # Sacamos la carta del jugador
    repo_cartas.sacar_de_jugador(carta_id, partida_id)
    # Y marcamos como que ya puede pasar de turno
    TurnoRepository().marcar_descarte_realizado(partida_id)

    # Caso especial early train to paddington
    if carta.id_front == 17:
        Eventos().caso_early_train_to_paddington(partida_id, carta_id)
        return {"message": f"Carta {carta_id} desasignada de jugador {carta.jugador} y jugado evento especial"}

    # Pasamos el estado de la carta a descartada
    repo_cartas.cambiar_estado(carta_id, partida_id, 4)
    descarte_agregar_carta_a_descarte(partida_id, carta_id)
    return {"message": f"Carta {carta_id} desasignada de jugador {carta.jugador}"}

def carta_consultar_secretos_de_jugador(jugador_id: int, partida_id: int):
    repo_carta = CartaRepository()
    repo_jugador = JugadorRepository()
    repo_partida = PartidaRepository()
    jugador = repo_jugador.get_by_id(jugador_id)
    if jugador is None:
        raise ValueError(f"El jugador {jugador_id} no existe")
    partida = repo_partida.get_by_id(partida_id)
    if partida is None:
        raise ValueError(f"La partida {partida_id} no existe")
    if jugador not in repo_jugador.get_jugadores_by_partida(partida_id):
        raise ValueError(f"El jugador {jugador_id} no pertenece a la partida {partida_id}")
    secretos = repo_carta.obtener_cartas_de_secreto_de_jugador(jugador_id, partida_id)
    return secretos

def carta_consultar_not_so_fast(jugador_id: int, partida_id: int):
    repo_carta = CartaRepository()
    repo_jugador = JugadorRepository()
    repo_partida = PartidaRepository()
    jugador = repo_jugador.get_by_id(jugador_id)
    if jugador is None:
        raise ValueError(f"El jugador {jugador_id} no existe")
    partida = repo_partida.get_by_id(partida_id)
    if partida is None:
        raise ValueError(f"La partida {partida_id} no existe")
    if jugador not in repo_jugador.get_jugadores_by_partida(partida_id):
        raise ValueError(f"El jugador {jugador_id} no pertenece a la partida {partida_id}")
    
    cartas_mano = repo_carta.obtener_cartas_en_mano_de_jugador(jugador_id, partida_id)
    cantidad_nsf = 0
    for carta in cartas_mano:
        if carta.categoria == "Instant":
            cantidad_nsf+=1
    return cantidad_nsf

# -------------------------------------------------------------------------------------------------
# -------------------------------------------- Jugador --------------------------------------------
# -------------------------------------------------------------------------------------------------

def jugador_listar_jugadores():
    repo = JugadorRepository()
    lista_de_jugadores = repo.get_all()
    return lista_de_jugadores

def jugador_unirse_a_partida(partida_id: int, jugador_id: int):
    repo = JugadorRepository()
    if repo.get_by_id(jugador_id).partida is not None:
        raise ValueError("El jugador ya esta en una partida")
    repo_partida = PartidaRepository()
    partida = repo_partida.get_by_id(partida_id)
    if partida.max_jugadores <= len(partida.jugadores):
        raise ValueError("Partida llena")
    repo.unir_jugador_a_partida(jugador_id, partida_id)
    return {"message": "Jugador unido a la partida"}

def jugador_crear_jugador(nombre: str, cumple: date, avatar: str):
    repo = JugadorRepository()
    datos_jugador = CreateJugadorData(nombre=nombre, cumple=cumple, avatar=avatar)
    nuevo_jugador = repo.create(datos_jugador)
    return nuevo_jugador

def jugador_salir_de_partida(jugador_id: int):
    repo_jugador = JugadorRepository()
    repo_partida = PartidaRepository()
    repo_cartas = CartaRepository()
    partida_id = repo_jugador.get_by_id(jugador_id).partida
    if repo_partida.get_by_id(partida_id).creador == jugador_id:
        ## Expulsar jugadores y eliminar partida
        for j in repo_jugador.get_jugadores_by_partida(partida_id):
            repo_jugador.salir_de_partida_by_id(j.id)
        repo_cartas.eliminar_cartas_de_partida(partida_id)
        repo_partida.eliminar_partida(partida_id)
        return {"message": "Partida eliminada porque el creador salió de la partida"}
    repo_jugador.salir_de_partida_by_id(jugador_id)
    return {"message": "Jugador salido de la partida"}

def jugador_get_jugadores_de_partida(partida_id: int):
    repo = JugadorRepository()
    jugadores = repo.get_jugadores_by_partida(partida_id)
    return jugadores

def jugador_obtener_datos_jugador(jugador_id: int):
    repo_jugadores = JugadorRepository()
    datos_jugador = repo_jugadores.get_by_id(jugador_id)
    return datos_jugador

# -------------------------------------------------------------------------------------------------
# -------------------------------------------- Partida --------------------------------------------
# -------------------------------------------------------------------------------------------------

def partida_listar_partidas(filtro_nombre: str = None):
    repo = PartidaRepository()
    if filtro_nombre:
        lista_de_partidas = repo.get_by_name(filtro_nombre)
    else:
        lista_de_partidas = repo.get_all()
    return lista_de_partidas

def partida_iniciar_partida(partida_id: int):
    repo = PartidaRepository()
    repo_contador = ContadorRepository()
    if repo.get_by_id(partida_id).estado == True:
        raise ValueError("La partida ya está iniciada")
    repo.iniciar_partida(partida_id)
    mazo_iniciar_mazo(partida_id)
    repartir_cartas_iniciales(partida_id)
    repartir_secretos_a_jugadores(partida_id)
    cargar_turnos(partida_id)
    draft_iniciar_draft(partida_id)
    repo_contador.iniciar_contador(partida_id)
    return(repo.get_by_id(partida_id))

def partida_crear_partida(nombre: str, creador: int, max_jugadores: int, min_jugadores: int):
    repo_jugador = JugadorRepository()
    datos_jugador = repo_jugador.get_by_id(creador) # verifica que el creador exista
    if datos_jugador.partida is not None:
        raise ValueError("El creador ya está en una partida")
    repo = PartidaRepository()
    datos_partida = CreatePartidaData(creador=creador, nombre=nombre, estado=False, max_jugadores=max_jugadores, min_jugadores=min_jugadores)
    nueva_partida = repo.create(datos_partida)
    repo_jugador.unir_jugador_a_partida(creador, nueva_partida.id)
    cargar_cartas(nueva_partida.id)
    return nueva_partida

def partida_eliminar_partida(partida_id: int):
    repo = PartidaRepository()
    repo_cartas = CartaRepository()
    repo_cartas.eliminar_cartas_de_partida(partida_id)
    repo.eliminar_partida(partida_id)
    return {"message": f"Partida {partida_id} eliminada"}

def partida_obtener_detalles_partida(partida_id: int):
    repo = PartidaRepository()
    partida = repo.get_by_id(partida_id)
    return partida

def determinar_ganador(partida_id: int):
    repo_mazo = MazoRepository()
    repo_cartas = CartaRepository()
    repo_partida = PartidaRepository()
    repo_jugadores = JugadorRepository()
    carta_sig_id = repo_mazo.get_ultima_carta_id(partida_id)
    carta_sig = repo_cartas.get_by_id(carta_sig_id, partida_id)
    carta_asesino = repo_cartas.get_carta_de_asesino(partida_id)
    carta_complice = repo_cartas.get_carta_de_complice(partida_id)
    asesino_id = carta_asesino.jugador
    complice_id = carta_complice.jugador
    if carta_sig.categoria == "Special":
        repo_partida.terminar_partida(partida_id)
        partida = repo_partida.get_by_id(partida_id)
        final = (partida.estado, asesino_id, complice_id, 1) # asesino ganó
        repo_jugadores.sacar_jugadores_de_partida(partida_id)
        repo_partida.eliminar_partida(partida_id)
        return final
    else: 
        if carta_asesino.estado == 0:
            repo_partida.terminar_partida(partida_id)
            partida = repo_partida.get_by_id(partida_id)
            final = (partida.estado, asesino_id, complice_id, 0) # asesino perdió
            return final
        else:
            raise ValueError("No ganó nadie")

