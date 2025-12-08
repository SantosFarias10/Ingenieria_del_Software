from pydantic import BaseModel
from datetime import date
from typing import List, Optional, Tuple
from pony.orm import commit, db_session, select

from app.db.models import Jugador, Partida


class JugadorData(BaseModel):
    id: int
    nombre: str
    cumple: date
    avatar: Optional[str] = None
    desgraciado: bool = False
    partida: Optional[int] = None
    cartas: List[Tuple[int, int]] = []

    model_config = {"from_attributes":True}

class CreateJugadorData(BaseModel):
    nombre: str
    cumple: date
    avatar: Optional[str] = None

class JugadorRepository:
    @db_session
    def get_all(self) -> List[JugadorData]:
        jugadores = select(j for j in Jugador)
        return [JugadorData.model_validate(j.to_dict(with_collections=True)) for j in jugadores]

    @db_session
    def get_by_id(self, jugador_id: int) -> JugadorData:
        jugador = Jugador.get(id=jugador_id)
        if not jugador:
            raise ValueError("El jugador no existe")
        return JugadorData.model_validate(jugador.to_dict(with_collections=True))

    @db_session
    def create(self, jugador: CreateJugadorData) -> JugadorData:
        jugador_data = jugador.model_dump()
        new_jugador = Jugador(**jugador_data)
        return JugadorData.model_validate(new_jugador.to_dict())

    @db_session
    def salir_de_partida_by_id(self, jugador_id: int) -> None:
        for j in Jugador.select(id=jugador_id):
            j.partida = None

    @db_session
    def sacar_jugadores_de_partida(self, partida_id: int) -> None:
        for j in select(j for j in Jugador if j.partida.id == partida_id):
            j.partida = None

    @db_session
    def unir_jugador_a_partida(self, jugador_id: int, partida_id: int) -> None:
        jugador = Jugador.get(id=jugador_id)
        partida = Partida.get(id=partida_id)

        if not jugador:
            raise ValueError("El jugador no existe")
        if not partida:
            raise ValueError("La partida no existe")

        jugador.partida = partida
        commit()

    @db_session
    def get_jugadores_by_partida(self, partida_id: Optional[int]) -> List[JugadorData]:
        jugadores = select(j for j in Jugador if j.partida.id == partida_id)
        return [JugadorData.model_validate(j.to_dict(with_collections=True)) for j in jugadores]
    
    @db_session
    def set_desgraciado(self, jugador_id: int, desgraciado: bool) -> None:
        jugador = Jugador.get(id=jugador_id)
        if not jugador:
            raise ValueError("El jugador no existe")
        jugador.desgraciado = desgraciado
        commit()

    @db_session
    def get_jugadores_no_desgraciados_by_partida(self, partida_id: Optional[int]) -> List[JugadorData]:
        jugadores = select(j for j in Jugador if j.partida.id == partida_id and j.desgraciado == False)
        return [JugadorData.model_validate(j.to_dict(with_collections=True)) for j in jugadores]

    @db_session
    def ver_cartas_jugador(self, jugador_id: int) -> List[int]:
        jugador = Jugador.get(id=jugador_id)
        if not jugador:
            raise ValueError("El jugador no existe")
        return [c.id for c in jugador.cartas]
