from fastapi.encoders import jsonable_encoder
from app.data_access.jugador import JugadorRepository
from app.data_access.carta import CartaRepository
from app.data_access.turnos import TurnoRepository
from app.data_access.mazos import MazoRepository, DescarteRepository, DraftRepository


def construir_estado_partida(partida_id: int) -> dict:
    """
    Construye el estado completo de una partida para enviar por WebSocket.
    
    Esta función recopila toda la información necesaria para que el frontend
    pueda mostrar el estado actual del juego: jugadores, cartas, turnos.
    
    Reutilizable para:
    - estado_inicial: Cuando un cliente se conecta al WebSocket
    - partida_iniciada_completa: Cuando la partida comienza
    
    Args:
        partida_id: ID de la partida de la cual construir el estado
    
    Returns:
        dict con la estructura:
        {
            "jugadores": [lista de jugadores con sus cartas],
            "mazoRegular": {"cantidad": número de cartas sin asignar},
            "mazoDescarte": [lista de cartas descartadas],
            "turnoActual": ID del jugador con el turno activo (o None)
        }
    """
    repo_jugador = JugadorRepository()
    repo_carta = CartaRepository()
    repo_turno = TurnoRepository()
    repo_mazo = MazoRepository()
    # 1. Obtener jugadores con sus cartas
    # Cada jugador incluye: id, nombre, avatar, partida, cartas (lista de IDs)
    jugadores = repo_jugador.get_jugadores_by_partida(partida_id)
    jugadores_data = jsonable_encoder([j for j in jugadores])
    
    # 2. Calcular cantidad de cartas en el mazo regular
    # El mazo regular son todas las cartas que NO están asignadas a ningún jugador
    todas_cartas = repo_carta.get_cartas_de_efecto(partida_id)
    cartas_mazo = repo_mazo.get_by_partida(partida_id)
    #cartas_sin_jugador = [c for c in todas_cartas if c.jugador is None]
    cantidad_mazo_regular = len(cartas_mazo)
    print(jugadores_data)    
    # 3. Obtener el jugador que tiene el turno actual
    # Si no hay turno activo (partida en lobby), retorna None
    try:
        jugador_turno_actual = repo_turno.get_id_jugador_actual(partida_id)
    except ValueError:
        # No hay turno activo (la partida no ha iniciado o no hay turnos cargados)
        jugador_turno_actual = None

    # 4. Secretos por jugador
    secretos_por_jugador = {}
    for jugador in jugadores:
        secretos = repo_carta.obtener_cartas_de_secreto_de_jugador(jugador.id, partida_id)

        secretos_info = []
        for secreto in secretos:
            secreto_dict = {
                "id_front": secreto.id_front,
                "id": secreto.id,
                "partida": secreto.partida,
                "estado": secreto.estado
            }
            secretos_info.append(secreto_dict)

        secretos_por_jugador[jugador.id] = secretos_info
    
    eventos_por_jugador = {}
    for jugador in jugadores:
        eventos = repo_carta.obtener_cartas_de_efecto_de_jugador(jugador.id, partida_id)

        eventos_info = []
        for evento in eventos:
            evento_dict = {
                "id_front": evento.id_front,
                "id": evento.id,
                "partida": partida_id
            }
            eventos_info.append(evento_dict)
        eventos_por_jugador[jugador.id] = eventos_info
    
    # 5. Sets jugados por cada jugador (cartas en mesa con numero de set)
    sets_por_jugador = {}
    for jugador in jugadores:
        cartas_en_mesa = repo_carta.obtener_cartas_en_mesa_de_jugador(jugador.id, partida_id)
        
        # Agrupar cartas por numero de set
        sets_agrupados = {}
        for carta in cartas_en_mesa:
            if carta.set is not None:  
                if carta.set not in sets_agrupados:
                    sets_agrupados[carta.set] = []
                carta_dict = {
                    "id_front": carta.id_front,
                    "id": carta.id,
                    "partida": partida_id,
                    "set": carta.set
                }
                sets_agrupados[carta.set].append(carta_dict)
        
        # Convertir a lista de sets
        sets_por_jugador[jugador.id] = list(sets_agrupados.values())
    
    turno_repo = TurnoRepository()
    turnos = jsonable_encoder(turno_repo.get_turnos_by_partida(partida_id))
    print(turnos)
    repo_descarte = DescarteRepository()
    draft_repo = DraftRepository()
    descarte_data = jsonable_encoder(repo_descarte.get_by_partida(partida_id))
    draft_data = jsonable_encoder(draft_repo.get_by_partida(partida_id))
    # 6. Construir y retornar el estado completo
    return {
        "jugadores": jugadores_data,
        "mazoRegular": {"cantidad": cantidad_mazo_regular},
        "mazoDescarte": descarte_data,
        "mazoDraft": draft_data,
        "turnoActual": jugador_turno_actual,
        "secretos": secretos_por_jugador,
        "eventos": eventos_por_jugador,
        "setsJugados": sets_por_jugador,
        "turnos": turnos
    }
