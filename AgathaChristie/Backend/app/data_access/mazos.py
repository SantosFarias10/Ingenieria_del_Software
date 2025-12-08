from pydantic import BaseModel
from typing import List, Optional
from pony.orm import db_session, select, delete, desc

from app.db.models import Mazo, Descarte, Draft

class MazoData(BaseModel):
    partida_id: int
    carta_id: int
    orden: int

    model_config = {"from_attributes": True}

class DescarteData(BaseModel):
    partida_id: int
    carta_id: int
    id_front: Optional[int] = None  #Aca tambien toco emi
    orden: int

    model_config = {"from_attributes": True}

class DraftData(BaseModel):
    partida_id: int
    carta_id: int
    id_front: int  #Aca toco Ale
    posicion: int

class MazoRepository:
    @db_session
    def get_by_partida(self, partida_id: int) -> List[MazoData]:
        mazo = select(m for m in Mazo if m.partida_id == partida_id).order_by(desc(Mazo.orden))[:]
        return [MazoData.model_validate(m.to_dict()) for m in mazo]

    @db_session
    def agregar_carta_a_mazo(self, partida_id: int, carta_id: int, orden: int) -> None:
        Mazo(partida_id=partida_id, carta_id=carta_id, orden=orden)

    @db_session
    def eliminar_mazo_por_partida(self, partida_id: int) -> None:
        delete(m for m in Mazo if m.partida_id == partida_id)

    @db_session
    def eliminar_carta_de_mazo_id(self, partida_id: int, carta_id: int) -> None:
        delete(m for m in Mazo if m.partida_id == partida_id and m.carta_id == carta_id)
    
    @db_session
    def get_ultima_carta_id(self, partida_id: int) -> MazoData:
        carta = select(m for m in Mazo if m.partida_id == partida_id).order_by(desc(Mazo.orden)).first()
        if not carta:
            raise ValueError("El mazo esta vacio")
        return carta.carta_id
    
class DescarteRepository:
    
    @db_session
    def get_by_partida(self, partida_id: int) -> List[DescarteData]:
        from app.data_access.carta import CartaRepository
        
        descarte = select(d for d in Descarte if d.partida_id == partida_id).order_by(desc(Descarte.orden))[:]
        carta_repo = CartaRepository()
        
        result = []
        for d in descarte:
            try:
                # Obtener id_front de la carta para el frontend
                carta = carta_repo.get_by_id(d.carta_id, partida_id)
                id_front = carta.id_front
            except:
                # Fallback si no se encuentra la carta
                id_front = None
            
            result.append(DescarteData(
                partida_id=d.partida_id,
                carta_id=d.carta_id,
                id_front=id_front,
                orden=d.orden
            ))
        
        return result

    @db_session
    def agregar_carta_a_descarte(self, partida_id: int, carta_id: int, id_front: int, orden: int) -> None:
        Descarte(partida_id=partida_id, carta_id=carta_id, orden=orden)

    @db_session
    def eliminar_descarte_por_partida(self, partida_id: int) -> None:
        delete(d for d in Descarte if d.partida_id == partida_id)
    
    @db_session
    def eliminar_carta_de_descarte_id(self, partida_id: int, carta_id: int) -> None:
        delete(d for d in Descarte if d.partida_id == partida_id and d.carta_id == carta_id)
    
    @db_session
    def get_ultima_carta_id(self, partida_id: int) -> DescarteData:
        carta = select(d for d in Descarte if d.partida_id == partida_id).order_by(desc(Descarte.orden)).first()
        if not carta:
            raise ValueError("El descarte esta vacio")
        return DescarteData.model_validate(carta.to_dict()).carta_id
    
class DraftRepository:
    @db_session
    def get_by_partida(self, partida_id: int) -> List[DraftData]:
        draft = select(d for d in Draft if d.partida_id == partida_id).order_by(Draft.posicion)[:]
        return [DraftData.model_validate(d.to_dict()) for d in draft]

    @db_session
    def agregar_carta_a_draft(self, partida_id: int, carta_id: int, id_front: int, posicion: int) -> None:
        Draft(partida_id=partida_id, carta_id=carta_id, id_front=id_front, posicion=posicion)

    @db_session
    def eliminar_draft_por_partida(self, partida_id: int) -> None:
        delete(d for d in Draft if d.partida_id == partida_id)

    @db_session
    def eliminar_carta_de_draft_id(self, partida_id: int, carta_id: int) -> None:
        delete(d for d in Draft if d.partida_id == partida_id and d.carta_id == carta_id)
    
    @db_session
    def eliminar_carta_de_draft_posicion(self, partida_id: int, posicion: int) -> None:
        delete(d for d in Draft if d.partida_id == partida_id and d.posicion == posicion)

    @db_session
    def get_carta_por_posicion(self, partida_id: int, posicion: int) -> DraftData:
        carta = select(d for d in Draft if d.partida_id == partida_id and d.posicion == posicion).first()
        if not carta:
            raise ValueError("No hay carta en esa posicion")
        return DraftData.model_validate(carta.to_dict())
    
