from app.data_access import carta
from app.data_access.mazos import MazoRepository, DescarteRepository, DraftRepository
from app.data_access.carta import CartaRepository
from pony.orm import db_session
import random

# -------------------------------------------------------------------------------------------------
# -------------------------------------------- Mazo -----------------------------------------------
# -------------------------------------------------------------------------------------------------
def mazos_get_mazo_by_partida(partida_id: int):
    repo_mazo = MazoRepository()
    mazo = repo_mazo.get_by_partida(partida_id)
    return mazo

def mazo_iniciar_mazo(partida_id: int):
    repo_mazo = MazoRepository()
    repo_cartas = CartaRepository() 
    mazo = repo_mazo.get_by_partida(partida_id)
    if mazo:
        raise ValueError("El mazo ya fue iniciado")
    cartas = repo_cartas.get_cartas_de_efecto(partida_id)
    random.shuffle(cartas)
    carta_escape = repo_cartas.get_murderer_escapes(partida_id)
    repo_mazo.agregar_carta_a_mazo(partida_id, carta_escape.id, 0)
    i = 1
    for carta in cartas:
        repo_mazo.agregar_carta_a_mazo(partida_id, carta.id, i)
        i+=1
    mazo = repo_mazo.get_by_partida(partida_id)
    return mazo

def mazo_robar_ultima_carta_mazo(partida_id: int):
    repo_mazo = MazoRepository()
    carta_id = repo_mazo.get_ultima_carta_id(partida_id)
    repo_mazo.eliminar_carta_de_mazo_id(partida_id, carta_id)
    return carta_id

def mazo_robar_by_id(partida_id: int, carta_id: int):
    repo_mazo = MazoRepository()
    repo_mazo.eliminar_carta_de_mazo_id(partida_id, carta_id)
    return carta_id

def mazo_agregar_carta_a_mazo(partida_id: int, carta_id: int):
    repo_mazo = MazoRepository()
    mazo = repo_mazo.get_by_partida(partida_id)
    orden = 1
    if mazo:
        orden = mazo[0].orden + 1
    repo_mazo.agregar_carta_a_mazo(partida_id, carta_id, orden)
    return

def mazo_get_ultimas_6_cartas(partida_id: int):
    repo_mazo = MazoRepository()
    mazo = repo_mazo.get_by_partida(partida_id)
    if len(mazo) < 6:
        return mazo
    return mazo[:6]

# -----------------------------------------------------------------------------------------------------
# -------------------------------------------- Descarte -----------------------------------------------
# -----------------------------------------------------------------------------------------------------

def descarte_get_descarte_by_partida(partida_id: int):
    repo_descarte = DescarteRepository()
    descarte = repo_descarte.get_by_partida(partida_id)
    return descarte

def descarte_agregar_carta_a_descarte(partida_id: int, carta_id: int):
    repo_descarte = DescarteRepository()
    descarte = repo_descarte.get_by_partida(partida_id)
    orden = 1
    if descarte:
        orden = descarte[0].orden + 1
    repo_descarte.agregar_carta_a_descarte(partida_id, carta_id, None, orden)
    return

def descarte_sacar_carta_por_id(partida_id: int, carta_id: int):
    repo_descarte = DescarteRepository()
    repo_descarte.eliminar_carta_de_descarte_id(partida_id, carta_id)
    return

def descarte_get_ultimas_N_cartas(partida_id: int, cantidad: int):
    repo_descarte = DescarteRepository()
    mazo = repo_descarte.get_by_partida(partida_id)
    if len(mazo) < cantidad:
        return mazo
    return mazo[:cantidad]

def descarte_sacar_ultima_carta_de_descarte(partida_id: int):
    repo_descarte = DescarteRepository()
    carta_id = repo_descarte.get_ultima_carta_id(partida_id)
    repo_descarte.eliminar_carta_de_descarte_id(partida_id, carta_id)
    return carta_id

# --------------------------------------------------------------------------------------------------
# -------------------------------------------- Draft -----------------------------------------------
# --------------------------------------------------------------------------------------------------

def draft_get_draft_by_partida(partida_id: int):
    repo_draft = DraftRepository()
    draft = repo_draft.get_by_partida(partida_id)
    return draft

def draft_rellenar_draft(partida_id: int):
    repo_cartas = CartaRepository()
    repo_mazo = MazoRepository()
    repo_draft = DraftRepository()
    mazo = repo_mazo.get_by_partida(partida_id)
    if not mazo:
        raise ValueError("El mazo no fue iniciado")
    draft = repo_draft.get_by_partida(partida_id)
    if len(draft) == 3:
        raise ValueError("Ya hay un draft completo")
    posiciones_llenas = []
    for d in draft:
        if d.posicion not in posiciones_llenas:
            posiciones_llenas.append(d.posicion)
    posiciones_objetivo = [pos for pos in [0, 1, 2] if pos not in posiciones_llenas]

    for pos in posiciones_objetivo:
        carta_arriba = repo_mazo.get_ultima_carta_id(partida_id)
        id_front = repo_cartas.get_by_id(carta_arriba, partida_id).id_front
        repo_draft.agregar_carta_a_draft(partida_id, carta_arriba, id_front, pos)
        repo_cartas.cambiar_estado(carta_arriba, partida_id, pos + 6) # 6, 7, 8 son los estados de draft
        repo_mazo.eliminar_carta_de_mazo_id(partida_id, carta_arriba)
    draft = repo_draft.get_by_partida(partida_id)
    return draft

def draft_iniciar_draft(partida_id: int):
    repo_draft = DraftRepository()
    draft = repo_draft.get_by_partida(partida_id)
    if draft:
        raise ValueError("El draft ya fue iniciado")
    draft = draft_rellenar_draft(partida_id)
    return draft

def robar_carta_de_mazo_draft(jugador_id: int, partida_id: int, posicion: int):
    repo_draft = DraftRepository()
    repo_cartas = CartaRepository()
    
    carta_robada = repo_draft.get_carta_por_posicion(partida_id, posicion)
    
    if not carta_robada:
        raise ValueError(f"No hay ninguna carta en la posicion {posicion}")
    
    repo_cartas.agregar_a_jugador(jugador_id, carta_robada.carta_id, partida_id)
    repo_draft.eliminar_carta_de_draft_posicion(partida_id, posicion)
    
    try:
        draft_rellenar_draft(partida_id)
    except ValueError as e:
        pass
    
    return carta_robada
    
