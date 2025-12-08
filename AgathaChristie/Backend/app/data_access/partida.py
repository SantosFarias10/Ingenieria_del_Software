from pydantic import BaseModel
from typing import List
from pony.orm import db_session, select, delete

from app.db.models import Partida, Jugador

class PartidaData(BaseModel):
    id: int
    creador: int
    nombre: str
    estado: bool
    min_jugadores: int
    max_jugadores: int
    jugadores: List[int] = []

class CreatePartidaData(BaseModel):
    creador: int
    nombre: str
    estado: bool
    min_jugadores: int
    max_jugadores: int
    jugadores: List[int] = []

class PartidaRepository:
    @db_session
    def get_all(self) -> List[PartidaData]:
        partidas = Partida.select()
        return [PartidaData.model_validate(p.to_dict(with_collections=True)) for p in partidas]

    @db_session
    def get_no_iniciadas(self) -> List[PartidaData]:
        partidas = select(p for p in Partida if p.estado == False)
        return [PartidaData.model_validate(p.to_dict(with_collections=True)) for p in partidas]

    @db_session
    def get_by_id(self, partida_id: int | None) -> PartidaData:
        partida = Partida.get(id=partida_id)
        if not partida:
            raise ValueError("La partida no existe")
        partida_dict = partida.to_dict(with_collections=True)
        return PartidaData.model_validate(partida_dict)

    @db_session
    def get_by_name(self, name: str) -> List[PartidaData]:
        partidas = select(p for p in Partida if name in p.nombre)
        return [PartidaData.model_validate(p.to_dict(with_collections=True)) for p in partidas]

    @db_session 
    def get_numero_de_jugadores(self, partida_id: int) -> int:
        jugadores = select(j for j in Jugador if j.partida.id == partida_id)
        return len(jugadores)

    @db_session
    def create(self, partida: CreatePartidaData) -> PartidaData:
        partida_data = partida.model_dump()
        if partida.min_jugadores > partida.max_jugadores:
            raise ValueError("Minimo mayor al maximo")
        new_partida = Partida(**partida_data)
        return PartidaData.model_validate(new_partida.to_dict())
     
    @db_session
    def eliminar_partida(self, partida_id: int | None) -> None:
        deleted_count = delete(p for p in Partida if p.id == partida_id)
        if deleted_count == 0:
            raise ValueError("La partida no existe")

    @db_session
    def iniciar_partida(self, partida_id: int) -> None:
        partida = Partida.get(id=partida_id)
        if not partida:
            raise ValueError("La partida no existe")
        if partida.min_jugadores > len(partida.jugadores):
            raise ValueError("No se alcanzó la cantidad minima de jugadores")
        partida.estado = True

    @db_session
    def terminar_partida(self, partida_id: int) -> None:
        partida = Partida.get(id=partida_id)
        if not partida:
            raise ValueError("La partida no existe")
        partida.estado = False

