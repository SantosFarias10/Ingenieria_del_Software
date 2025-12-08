from pydantic import BaseModel
from pony.orm import commit, db_session, select
from app.db.models import Contador


class ContadorData(BaseModel):
    partida: int
    confirmaciones: int

class ContadorRepository:
    @db_session
    def get_by_partida(self, partida_id: int):
        confi = Contador.get(partida=partida_id)
        return confi.confirmaciones
    
    @db_session
    def set_contador(self, partida_id: int, cant: int):
        confi = Contador.get(partida=partida_id)
        if confi.confirmaciones == 0 and cant > 1:
            confi.confirmaciones = cant
            commit()
        else:
            raise ValueError("Minima cantidad para contador es 2")

    @db_session
    def decrementar_contador(self, partida_id: int):
        confi = Contador.get(partida=partida_id)
        if confi.confirmaciones > 0:
            confi.confirmaciones = confi.confirmaciones - 1
            commit()
        else:
            raise ValueError("El contador ya esta en cero")
    
    @db_session
    def iniciar_contador(self, partida_id: int):
        Contador(partida=partida_id, confirmaciones=0)
        commit()
