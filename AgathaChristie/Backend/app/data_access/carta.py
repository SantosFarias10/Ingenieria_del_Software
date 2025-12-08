from pydantic import BaseModel
from typing import List, Optional
from pony.orm import db_session, select, commit, delete

from app.db.models import Jugador, Carta, Partida


def cargar_cartas(partida_id: int) -> bool:
    # Carga las cartas a la db
    conjunto_cartas = [
        ("Murderer escapes!", "Special", 1, 0),
        ("You're the Accomplice!", "Secret", 1, 19),
        ("You're the Murderer!!", "Secret", 1, 18),
        ("Es solo un pescado", "Secret", 1, 2),
        ("No sabe usar Git", "Secret", 1, 3),
        ("Tiene depresion", "Secret", 1, 4),
        ("Le tiene miedo a la mujer", "Secret", 1, 5),
        ("Le tiene miedo a las mujeres", "Secret", 1, 6),
        ("Es fumador", "Secret", 1, 7),
        ("Juega al LOL", "Secret", 1, 8),
        ("Es de Salsipuedes", "Secret", 1, 9),
        ("Le falta un Riñon", "Secret", 1, 10),
        ("Es de Neuquen", "Secret", 1, 11),
        ("Es de la Calera", "Secret", 1, 12),
        ("Es de España", "Secret", 1, 13),
        ("Es de Villa Allende", "Secret", 1, 14),
        ("Es Migajero", "Secret", 1, 15),
        ("Es Ludopata", "Secret", 1, 16),
        ("Le gustan las flequilludas", "Secret", 1, 17),
        ("Harley Quin Wildcard", "Detective", 4, 8),
        ("Adriane Oliver", "Detective", 3, 9),
        ("Miss Marple", "Detective", 3, 2),
        ("Parker Pyne", "Detective", 3, 4),
        ("Tommy Beresford", "Detective", 2, 6),
        ("Lady Eileen 'Bundle' Brent", "Detective", 3, 5),
        ("Tuppence Beresford", "Detective", 2, 7),
        ("Hercule Poirot", "Detective", 3, 1),
        ("Mr Satterthwaite", "Detective", 2, 3),
        ("Not so fast", "Instant", 10, 19),
        ("Blackmailed", "Deviuos", 1, 20),
        ("Social Faux Pas", "Deviuos", 3, 21),
        ("Delay the murderer's espace!", "Event", 3, 16),
        ("Point your suspicions", "Event", 3, 18),
        ("Dead card folly", "Event", 3, 12),
        ("Another Victim", "Event", 2, 11),
        ("Look into the ashes", "Event", 3, 13),
        ("Card trade", "Event", 3, 14),
        ("And then there was one more...", "Event", 2, 15),
        ("Early train to paddington", "Event", 2, 17),
        ("Cards off the table", "Event", 1, 10),
    ]
    with db_session:
        # if select(c for c in Carta).first():
        #     return False
        i = 1
        for nombre, categoria, cantidad, id_front in conjunto_cartas:
            for _ in range(cantidad):
                Carta(id=i, nombre=nombre, categoria=categoria, partida=partida_id, id_front=id_front, estado=(9 if categoria=="Secret" else 3))
                i+=1
        return True

class CartaData(BaseModel):
    id: int
    id_front: int
    nombre: str
    categoria: str
    jugador: Optional[int] = None
    partida: int
    estado: Optional[int] = None
    set: Optional[int] = None

    model_config = {"from_attributes": True}

class CreateCartaData(BaseModel):
    nombre: str
    categoria: str
    jugador: Optional[int] = None
    partida: int

class CartaRepository:
    @db_session
    def get_all(self, partida_id: int) -> List[CartaData]:
        cartas = select(c for c in Carta if c.partida == partida_id)
        return [CartaData.model_validate(c.to_dict()) for c in cartas]

    @db_session
    def get_by_id(self, carta_id: int, partida_id: int) -> CartaData:
        carta = Carta.get(id=carta_id, partida=partida_id)
        if not carta:
            raise ValueError("La carta no existe, id invalido")
        return CartaData.model_validate(carta.to_dict(with_collections=True))

    @db_session
    def set_set(self, partida_id: int, carta_id: int, set_set_set: int):
        carta = Carta.get(id=carta_id, partida=partida_id)
        carta.set = set_set_set
        commit()

    @db_session
    def get_all_sets(self, jugador_id: int, partida_id: int) -> List[CartaData]:
        cartas = select(c for c in Carta if c.jugador.id == jugador_id and c.partida == partida_id and c.set is not None)
        if not cartas:
            raise ValueError("No existen sets")
        return [CartaData.model_validate(c.to_dict()) for c in cartas]

    @db_session
    def get_cartas_by_set(self, partida_id: int, set_id: int):
        cartas = select(c for c in Carta if c.set == set_id and c.partida == partida_id)
        if not cartas:
            raise ValueError("No hay cartas en ese set")
        return [CartaData.model_validate(c.to_dict()) for c in cartas]

    @db_session
    def crear_set(self, partida_id: int) -> int:
        # Buscar el num max de set que ya tenga la partida
        max_set = select(c.set for c in Carta if c.partida == partida_id and c.set is not None).max()

        if max_set is None:
            nuevo_set = 1
        else:
            nuevo_set = max_set + 1

        return nuevo_set

    @db_session
    def get_secretos_by_partida(self, partida_id: int) -> List[CartaData]:
        cartas = select(c for c in Carta if c.categoria == "Secret" and c.partida == partida_id)
        return [CartaData.model_validate(c.to_dict()) for c in cartas]

    @db_session
    def get_cartas_de_efecto(self, partida_id: int) -> List[CartaData]:
        cartas = select(c for c in Carta if c.categoria != "Secret" and c.categoria != "Special" and c.partida == partida_id)
        return [CartaData.model_validate(c.to_dict()) for c in cartas]

    @db_session
    def get_carta_de_asesino(self, partida_id: int) -> CartaData:
        carta = Carta.get(nombre="You're the Murderer!!", partida=partida_id)
        if not carta:
            raise ValueError("No hay asesino")
        return CartaData.model_validate(carta.to_dict())

    @db_session
    def get_carta_de_complice(self, partida_id: int) -> CartaData:
        carta = Carta.get(nombre="You're the Accomplice!", partida=partida_id)
        if not carta:
            raise ValueError("No hay complice")
        return CartaData.model_validate(carta.to_dict())

    @db_session
    def get_murderer_escapes(self, partida_id: int) -> CartaData:
        carta = Carta.get(partida=partida_id, categoria="Special")
        if not carta:
            raise ValueError("No hay carta del escape del asesino")
        return CartaData.model_validate(carta.to_dict())

    @db_session
    def cambiar_estado(self, carta_id: int, partida_id: int, nuevo_estado: int) -> None:
        carta = Carta.get(id=carta_id, partida=partida_id)
        if not carta:
            raise ValueError("La carta no existe")
        carta.estado = nuevo_estado
        commit()

    @db_session
    def agregar_carta_a_set(self, partida_id: int, carta_id: int, jugador_id: int, set_id: int):
        carta = Carta.get(id=carta_id, partida=partida_id)
        partida = Partida.get(id=partida_id)
        jugador = Jugador.get(id=jugador_id)
        if not carta:
            raise ValueError("La carta no existe")
        if not partida:
            raise ValueError("La partida no existe")
        if not jugador:
            raise ValueError("El jugador no existe")
        carta.set = set_id
        carta.jugador = jugador
        carta.estado = 2    # Le pongo el estado en mesa, esto nose si siempre es asi
        commit()

    @db_session
    def agregar_a_jugador(self, jugador_id: int, carta_id: int, partida_id: int) -> None:
        carta = Carta.get(id=carta_id, partida=partida_id)
        if not carta:
            raise ValueError("La carta no existe")
        jugador = Jugador.get(id=jugador_id)
        if not jugador:
            raise ValueError("El jugador no existe")
        partida = Partida.get(id=partida_id)
        if not partida:
            raise ValueError("La partida no existe")
        carta.jugador = jugador
        if carta.categoria == "Secret":
            carta.estado = 9
        else:
            carta.estado = 1
        commit()

    @db_session
    def intercambiar_set_a_jugador(self, jugador_id: int, carta_id: int, partida_id: int) -> None:
        carta = Carta.get(id=carta_id, partida=partida_id)
        if not carta:
            raise ValueError("La carta no existe")
        jugador = Jugador.get(id=jugador_id)
        if not jugador:
            raise ValueError("El jugador no existe")
        partida = Partida.get(id=partida_id)
        if not partida:
            raise ValueError("La partida no existe")
        
        carta.jugador = jugador
        commit()

    @db_session
    def sacar_de_jugador(self, carta_id: int, partida_id: int) -> None:
        carta = Carta.get(id=carta_id, partida=partida_id)
        if not carta:
            raise ValueError("La carta no existe")
        carta.jugador = None
        commit()

    @db_session
    def get_cartas_de_partida(self, partida_id: int) -> List[CartaData]:
        cartas = select(c for c in Carta if c.partida == partida_id)
        return [CartaData.model_validate(c.to_dict()) for c in cartas]

    @db_session
    def eliminar_cartas_de_partida(self, partida_id: int) -> None:
        partida = Partida.get(id=partida_id)
        if not partida:
            raise ValueError("La partida no existe")
        deleted_count = delete(c for c in Carta if c.partida == partida_id)
        if deleted_count == 0:
            raise ValueError("No hay cartas para eliminar en esta partida")

    @db_session
    def obtener_cartas_de_secreto_de_jugador(self, jugador_id: int, partida_id: int) -> List[CartaData]:
        cartas = select(c for c in Carta if c.jugador.id == jugador_id and c.categoria == "Secret" and c.partida == partida_id)
        return [CartaData.model_validate(c.to_dict()) for c in cartas]

    @db_session
    def obtener_cartas_de_efecto_de_jugador(self, jugador_id: int, partida_id: int) -> List[CartaData]:
        cartas = select(c for c in Carta if c.jugador.id == jugador_id and c.categoria != "Secret" and c.partida == partida_id)
        return [CartaData.model_validate(c.to_dict()) for c in cartas]

    @db_session
    def obtener_cartas_en_mano_de_jugador(self, jugador_id: int, partida_id: int) -> List[CartaData]:
        cartas = select(c for c in Carta if c.jugador.id == jugador_id and c.estado == 1 and c.partida == partida_id and c.categoria != "Secret")
        return [CartaData.model_validate(c.to_dict()) for c in cartas]

    @db_session
    def obtener_cartas_en_mesa_de_jugador(self, jugador_id: int, partida_id: int) -> List[CartaData]:
        cartas = select(c for c in Carta if c.jugador.id == jugador_id and c.estado == 2 and c.partida == partida_id)
        return [CartaData.model_validate(c.to_dict()) for c in cartas]

    @db_session
    def obtener_cartas_en_mazo(self, partida_id: int) -> List[CartaData]:
        partida = Partida.get(id=partida_id)
        if not partida:
            raise ValueError(f"La partida {partida_id} no existe")
        cartas = select(c for c in Carta if c.estado == 3 and c.partida == partida_id)
        return [CartaData.model_validate(c.to_dict()) for c in cartas]

    @db_session
    def obtener_cartas_en_descarte(self, partida_id: int) -> List[CartaData]:
        cartas = select(c for c in Carta if c.estado == 4 and c.partida == partida_id)
        return [CartaData.model_validate(c.to_dict()) for c in cartas]

    @db_session
    def obtener_cartas_en_draft(self, partida_id: int) -> List[CartaData]:
        cartas = select(c for c in Carta if c.estado >= 6 and c.estado <= 8 and c.partida == partida_id)
        return [CartaData.model_validate(c.to_dict()) for c in cartas]

    @db_session
    def obtener_not_so_fast(self, partida_id: int) -> List[CartaData]:
        cartas = select(c for c in Carta if c.categoria == "Instant" and c.partida == partida_id)
        return [CartaData.model_validate(c.to_dict()) for c in cartas]
