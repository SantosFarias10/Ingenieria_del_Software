from pydantic import BaseModel
from typing import List
from pony.orm import db_session, select, commit

from app.data_access.turnos_auxiliar import orden_turnos
from app.db.models import Turnos


def cargar_turnos(partida_id: int) -> List[Turnos]:
    turnos = orden_turnos(partida_id)
    with db_session:
        for id in turnos:
            Turnos(partida=partida_id, jugador=id, turno=turnos.index(id), activo=(turnos.index(id) == 0), tiene_accion=(turnos.index(id) == 0), descarte_realizado=False)

class TurnoData(BaseModel):
    partida: int
    jugador: int
    turno: int
    activo: bool
    tiene_accion: bool
    descarte_realizado: bool

    model_config = {"from_attributes": True}

class TurnoRepository:
    @db_session
    def get_id_jugador_actual(self, partida_id: int) -> int:
        turno = select(t for t in Turnos if t.partida == partida_id and t.activo).first()
        if not turno:
            raise ValueError("No hay un jugador con el turno activo")
        return turno.jugador

    @db_session
    def get_turnos_by_partida(self, partida_id: int) -> List[TurnoData]:
        turnos = select(t for t in Turnos if t.partida == partida_id)
        return [TurnoData.model_validate(t.to_dict()) for t in turnos]

    @db_session
    def get_turno_by_id(self, partida_id: int, jugador_id: int) -> TurnoData:
        turno = Turnos.get(partida=partida_id, jugador=jugador_id)
        if not turno:
            raise ValueError("No se encontro el turno para el jugador en la partida")
        return TurnoData.model_validate(turno.to_dict())

    @db_session
    def marcar_descarte_realizado(self, partida_id: int) -> None:
        turno = Turnos.get(partida=partida_id, activo=True)
        turno.descarte_realizado = True
        commit()

    @db_session
    def avanzar_turno(self, partida_id: int) -> None:
        turnos = select(t for t in Turnos if t.partida == partida_id)[:]
        if not turnos:
            raise ValueError("No hay turnos para esta partida")

        turno_actual = next((t for t in turnos if t.activo), None)
        if not turno_actual:
            raise ValueError("No hay un jugador con el turno activo")

        #if turno_actual.tiene_accion == True:
        #    raise ValueError("El jugador actual todavia no jugo su accion")

        if turno_actual.descarte_realizado == False:
            raise ValueError("El jugador actual todavia no realizo su descarte")
        
        turno_actual.activo = False
        siguiente_turno = (turno_actual.turno + 1) % len(turnos)
        turnos[siguiente_turno].activo = True
        turnos[siguiente_turno].tiene_accion = True
        turno_actual.descarte_realizado = False
        commit()

