from fastapi import APIRouter

from app.websocket.connection_manager import manager

from app.logic.logica import *
from app.logic.logica_mazos import *

router = APIRouter()

@router.get("/mazo/{partida_id}")
async def get_mazo_by_partida(partida_id: int):
    try:
        return mazos_get_mazo_by_partida(partida_id)
    except Exception as e:
        return {"error": str(e)}

@router.get("/descarte/{partida_id}")
async def get_descarte_by_partida(partida_id: int):
    try:
        return descarte_get_descarte_by_partida(partida_id)
    except Exception as e:
        return {"error": str(e)}

@router.get("/draft/{partida_id}")
async def get_draft_by_partida(partida_id: int):
    try:
        return draft_get_draft_by_partida(partida_id)
    except Exception as e:
        return {"error": str(e)}

@router.get("/mazo/ultimas6/{partida_id}")
async def get_ultimas_6_cartas_mazo(partida_id: int):
    try:
        return mazo_get_ultimas_6_cartas(partida_id)
    except Exception as e:
        return {"error": str(e)}

@router.get("/descarte/ultimasN/{partida_id}/{n}")
async def get_ultimas_n_cartas_descarte(partida_id: int, n: int):
    try:
        return descarte_get_ultimas_N_cartas(partida_id, n)
    except Exception as e:
        return {"error": str(e)}