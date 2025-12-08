from pony.orm import Required, Optional, PrimaryKey, Set
from datetime import date
from app.db.database import db


class Jugador(db.Entity):
    _table_ = "jugador"

    id          = PrimaryKey(int, auto=True)
    nombre      = Required(str)
    cumple      = Required(date)
    avatar      = Optional(str)
    desgraciado = Required(bool, default=False)    # Desgraciado Socialmente (juega Overwatch 2 o Jurassic World Evolution 3)
    partida     = Optional('Partida', reverse='jugadores')
    cartas      = Set('Carta', reverse='jugador')

class Partida(db.Entity):
    _table_ = "partida"

    id            = PrimaryKey(int, auto=True)
    creador       = Required(int)
    nombre        = Required(str)
    estado        = Required(bool)
    min_jugadores = Required(int)
    max_jugadores = Required(int)
    jugadores     = Set('Jugador', reverse='partida')

class Carta(db.Entity):
    _table_ = "carta"

    id        = Required(int, auto=True)
    id_front  = Required(int)
    nombre    = Required(str)
    categoria = Required(str)
    partida   = Required(int)   # id de partida a la que pertenece la carta
    jugador   = Optional('Jugador', reverse='cartas')
    estado    = Optional(int) 
    # estado: 9: secreto oculto, 0: secreto revelado, 1: en mano, 2: en mesa, 3: mazo, 4: descarte, 5: fuera de juego
    # 6: draft_1, 7: draft_2, 8: draft_3
    set       = Optional(int)   # Es si pertenece o no a un set. set: NULL: no esta en ningun set

    PrimaryKey(partida, id)     # Clave primaria compuesta

class Turnos(db.Entity):
    _table_ = "turnos"

    partida            = Required(int)
    jugador            = Required(int)
    turno              = Required(int)
    activo             = Required(bool)
    tiene_accion       = Required(bool) # Si jugo una accion
    descarte_realizado = Required(bool) # Si ya realizo un descarte (de su mano, no al mazo) para poder pasar de turno

class Descarte(db.Entity):
    _table_ = "descarte"

    partida_id      = Required(int)
    carta_id        = Required(int) # Id_back
    orden           = Required(int) # Puesto de la carta en el mazo de descarte donde 1 es la de mas abajo

class Mazo(db.Entity):
    _table_ = "mazo"

    partida_id      = Required(int)
    carta_id        = Required(int) # Id_back
    orden           = Required(int) # Puesto de la carta en el mazo donde 1 es la de mas abajo

class Draft(db.Entity):
    _table_ = "draft"

    partida_id      = Required(int)
    carta_id        = Required(int) # Id_back
    id_front        = Required(int) # Id_front
    posicion        = Required(int) # 0, 1 o 2 segun la posicion del draft.

class Contador(db.Entity):
    _table_ = "contador"

    partida         = Required(int)
    confirmaciones  = Required(int, default = 0)
