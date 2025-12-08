from app.db.models import Jugador
from fastapi import WebSocket
from typing import Dict, List, Tuple
from fastapi.encoders import jsonable_encoder


class ConnectionManager:
    """
    Gestor centralizado de conexiones WebSocket para partidas.
    Mantiene un diccionario de conexiones activas agrupadas por partida_id.
    """

    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, partida_id: int):
        """
        Acepta y registra una nueva conexión WebSocket para una partida.

        Args:
            websocket: Conexión WebSocket del cliente
            partida_id: ID de la partida a la que se conecta
        """
        await websocket.accept()
        if partida_id not in self.active_connections:
            self.active_connections[partida_id] = []
        self.active_connections[partida_id].append(websocket)

    async def disconnect(self, websocket: WebSocket, partida_id: int):
        """
        Desconecta y elimina un WebSocket de la lista de conexiones activas.
        Si no quedan conexiones para esa partida, elimina la entrada del diccionario.

        Args:
            websocket: Conexión WebSocket a desconectar
            partida_id: ID de la partida de la conexión
        """
        if partida_id in self.active_connections:
            if websocket in self.active_connections[partida_id]:
                self.active_connections[partida_id].remove(websocket)
                await websocket.close()
            if not self.active_connections[partida_id]:
                del self.active_connections[partida_id]

    async def send_event(self, partida_id: int, event_type: str, payload: dict):
        """
        Envía un evento a todos los clientes conectados a una partida.
        Si una conexión falla, la desconecta automáticamente.

        Args:
            partida_id: ID de la partida cuyos clientes recibirán el evento
            event_type: Tipo de evento (ej: "player_joined", "turno_cambiado")
            payload: Datos del evento a enviar
        """
        if partida_id not in self.active_connections:
            return

        message = {"type": event_type, "payload": payload}

        for connection in list(self.active_connections[partida_id]):
            try:
                await connection.send_json(message)
            except Exception as e:
                await self.disconnect(connection, partida_id)


    async def notify_generico(self, partida_id: int, jugador_id: int):
        """
        descripcion del evento
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="nombre del evento",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
            }
        )

    async def notify_player_joined(self, partida_id: int, jugador: dict):
        """
        Notifica a todos los jugadores que un nuevo jugador se unió a la partida.

        Args:
            partida_id: ID de la partida
            jugador: Diccionario con los datos del jugador que se unió
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="player_joined",
            payload={"partidaId": partida_id, "jugador": jugador}
        )

    async def notify_player_left(self, partida_id: int, jugador: dict):
        """
        Notifica a todos los jugadores que un jugador salió de la partida.

        Args:
            partida_id: ID de la partida
            jugador: Diccionario con los datos del jugador que salió
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="player_left",
            payload={"partidaId": partida_id, "jugador": jugador}
        )

    async def notify_partida_iniciada_completa(self, partida_id: int, partida_iniciada: bool):
        """
        Envía el estado completo de la partida cuando se inicia.
        Se usa cuando la partida pasa de lobby a juego activo.
        Todos los jugadores conectados reciben: jugadores, mazoRegular, mazoDescarte, turnoActual, etc.

        Args:
            partida_id: ID de la partida que se inició
            estado_completo: Diccionario con el estado completo (jugadores, mazo, turno, etc.)
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="game_started",
            payload={"partidaId": partida_id, "partidaIniciada": partida_iniciada}
        )

    async def notify_estado_partida(self, partida_id: int, estado_completo: dict):
        """
        Envía el estado completo de la partida cuando un cliente se conecta al WebSocket.
        Útil para que el cliente tenga el contexto completo inmediatamente o para reconexiones.

        Args:
            partida_id: ID de la partida
            estado: Diccionario con el estado (jugadores, mazoRegular, mazoDescarte, turnoActual, etc.)
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="game_state",
            payload={"partidaId": partida_id, **estado_completo}
        )

    async def broadcast_players_update(self, partida_id: int, jugadores: list):
        """
        Envía la lista actualizada de jugadores a todos los conectados.
        Se usa cuando hay cambios en la lista (alguien se une o sale).

        Args:
            partida_id: ID de la partida
            jugadores: Lista completa de jugadores actualizada
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="players_update",
            payload={"partidaId": partida_id, "jugadores": jugadores}
        )

    async def notify_sets_actualizados(self, partida_id: int, jugador_id: int, cartas_jugadas_id: list):
        """
        Deprecado, se usa el que actualiza todos los sets, notify_todos_los_sets_actualizados
        Notifica que set de un jugador cambió.
        set: lista de cartas actualizadas del jugador
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="set_actualizados",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "set": cartas_jugadas_id
            }
        )

    async def notify_todos_los_sets_actualizados(self, partida_id: int, sets: dict):
        """
        Notifica el estado de TODOS los sets de la partida.
        sets: dict con la forma { jugadorId: { setId: [ {carta...}, ... ] } }
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="todos_los_sets_actualizados",
            payload={
                "partidaId": partida_id,
                "sets": sets
            }
        )

    async def notify_objetivo_mano_sets(self, partida_id: int, jugador_id: int, objetivo_id: int, sets: dict, cartas_en_mano: list, cartas_jugadas: dict):
        """
        Notifica el objetivo, la mano del jugador actualizada y los sets actualados 
        sets: dict con la forma { jugadorId: { setId: [ {carta...}, ... ] } }
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="jugador_elegido_para_revelar_secreto_y_partida_actualizada",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "objetivoId": objetivo_id,
                "sets": sets,
                "mano_jugador": cartas_en_mano,
                "cartas_jugadas": cartas_jugadas
            }
        )

    async def notify_mazo_actualizado(self, partida_id: int, cantidad_cartas: int):
        """
        Notifica que el mazo regular cambió (se robó una carta).
        cantidad_cartas: número de cartas restantes en el mazo
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="mazo_actualizado",
            payload={
                "partidaId": partida_id,
                "cantidadCartas": cantidad_cartas
            }
        )

    async def notify_carta_descartada(self, partida_id: int, carta: dict, jugador_id: int):
        """
        Deprecado, se usa notify_procesar_descarte.
        Notifica que se descartó una carta.
        carta: diccionario con datos de la carta descartada
        jugador_id: ID del jugador que descartó
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="carta_descartada",
            payload={
                "partidaId": partida_id,
                "carta": carta,
                "jugadorId": jugador_id
            }
        )

    async def notify_turno_cambiado(self, partida_id: int, jugador_id: int, jugador_nombre: str):
        """
        Notifica que cambió el turno.
        jugador_id: ID del jugador que tiene el turno ahora
        jugador_nombre: Nombre del jugador (para mostrar en UI)
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="turno_cambiado",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "jugadorNombre": jugador_nombre
            }
        )

    async def notify_descarte_actualizado(self, partida_id: int, cantidad: int, ult_carta: dict):
        """
        Deprecado, se usa notify_procesar_descarte.
        Notifica que el mazo de descarte ha sido actualizado.
        descarte: lista de cartas en el mazo de descarte
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="descarte_actualizado",
            payload={
                "partidaId": partida_id,
                "carta": ult_carta,
                "cantidadCartas": cantidad
            }
        )

    async def notify_ganador(self, partida_id: int, asesino_id: int, complice_id: int, ganoperdio: int, estado: bool):
        """
        Notifica si ganó el asesino, si perdió el asesino o si no gano nadie
        se envia una tupla con (id_asesino, 1 o 0) 1 si ganó el asesino, 0 si perdió
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="ganador",
            payload={
                "partidaId": partida_id,
                "asesino": asesino_id,
                "complice": complice_id,
                "ganador": ganoperdio,
                "estado": estado
            }
        )

    async def notify_procesar_descarte(self, partida_id: int, jugador_id: int, cartas_back: list, cartas_front: list, cantidad: int, ult_carta: dict):
        """
        Al descartar una carta se actualiza tanto la mano del jugador que descarto como el mazo de
        descarte
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="procesar_descarte",
            payload={
            "partidaId": partida_id,
            "jugadorId": jugador_id,
            "cartasFront": cartas_front,
            "cartas": cartas_back,
            "carta": ult_carta,
            "cantidadCartas": cantidad
            }
        )

    async def notify_set_jugado(self, partida_id: int, jugador_id: int, cartas_jugadas: list, cartas_en_mano: list):
        """
        Deprecado, se usa notify_todos_los_sets_actualizados.
        Notifica que un jugador jugó un set de cartas.
        cartas_jugadas: lista de cartas jugadas por el jugador
        objetivo_id: ID del objetivo asociado al set jugado
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="set_jugado",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "cartasJugadas": cartas_jugadas,
                "cartasEnMano": cartas_en_mano
            }
        )

    async def notify_cards_off_the_table(self, partida_id: int, jugador_id: int, mano_jugador: list, victima_id: int, mano_victima: list, cantidad_descarte: int, ult_carta: dict):
        """
        Notifica que un jugador jugó "Cards off the table".
        Enviamos la mano del jugador y de la victima.
        Enviamos el mazo de descarte actualizado.
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="evento_cards_off_the_table",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "manoJugador": mano_jugador,
                "victimaId": victima_id,
                "manoVictima": mano_victima,
                "ultCarta": ult_carta,
                "cantidadDescarte": cantidad_descarte
            }
        )

    async def notify_another_victim_caso1(self, partida_id: int, jugador_id: int, sets: dict, secreto: dict, cantidad_descarte: int, ult_carta: dict):
        """
        Notifica que un jugador jugó "another victim".
        Enviamos los sets actualizados de todos los jugadores.
            sets: dict con la forma { jugadorId: { setId: [ {carta...}, ... ] } }
        Enviamos el mazo de descarte actualizado.
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="evento_another_victim_caso1",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "sets": sets,
                "secreto": secreto,
                "ultCarta": ult_carta,
                "cantidadDescarte": cantidad_descarte
            }
        )

    async def notify_another_victim_caso2(self, partida_id: int, jugador_id: int, sets: dict, victima_id: int, cantidad_descarte: int, ult_carta: dict):
        """
        Notifica que un jugador jugó "another victim".
        Enviamos los sets actualizados de todos los jugadores.
            sets: dict con la forma { jugadorId: { setId: [ {carta...}, ... ] } }
        Enviamos el mazo de descarte actualizado.
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="evento_another_victim_caso2",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "sets": sets,
                "victimaId": victima_id,
                "ultCarta": ult_carta,
                "cantidadDescarte": cantidad_descarte
            }
        )
    async def notify_prep_dead_card_folly(self, partida_id: int, jugador_id: int, direccion: int, cantidad_descarte: int, ult_carta: dict):
        """
        Notifica que se jugó un dead card folly pero antes de procesarlo.
        Enviamos la direccion del chanchito.
        Enviamos el mazo de descarte actualizado.
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="prep_dead_card_folly",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "direccion": direccion,
                "ultCarta": ult_carta,
                "cantidadDescarte": cantidad_descarte
            }
        )

    async def notify_dead_card_folly(self, partida_id: int, cartas_mano_all: dict):
        """
        Notifica que un jugador jugó "dead card folly".
        Enviamos la mano de todos los jugadores actualizadas.
            De forma de { jugadorId: [ {carta1}, {carta2}, ... ] }
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="evento_dead_card_folly",
            payload={
                "partidaId": partida_id,
                "manosActualizadas": cartas_mano_all
            }
        )

    async def notify_look_into_ashes(self, partida_id: int, jugador_id: int, cartas_mano: list, cantidad_descarte: int, ult_carta: dict):
        """
        Notifica que un jugador jugó "Look into the ashes".
        Enviamos la mano del jugador.
        Enviamos el mazo de descarte actualizado.
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="evento_look_into_ashes",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "cartas": cartas_mano,
                "ultCarta": ult_carta,
                "cantidadDescarte": cantidad_descarte
            }
        )

    async def notify_prep_card_trade(self, partida_id: int, jugador_id: int, victima_id: int, cantidad_descarte: int, ult_carta: dict):
        """
        Notifica que se jugó un card trade pero antes de procesarlo.
        Enviamos el jugador victima
        Enviamos el mazo de descarte actualizado.
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="prep_card_trade",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "victimaId": victima_id,
                "ultCarta": ult_carta,
                "cantidadDescarte": cantidad_descarte
            }
        )
        
    async def notify_card_trade(self, partida_id: int, jugador_id: int, mano_jugador: list, victima_id: int, mano_victima: list):
        """
        Notifica que un jugador jugó "Card trade".
        Enviamos la mano del jugador y de la victima.
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="evento_card_trade",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "manoJugador": mano_jugador,
                "victimaId": victima_id,
                "manoVictima": mano_victima,
            }
        )

    async def notify_and_then_one_more(self, partida_id: int, jugador_id: int, secretos: dict, cantidad_descarte: int, ult_carta: dict):
        """
        Notifica que un jugador jugó "And then there was one more...".
        Enviamos los secretos de la partida de forma dict
        { jugadorId: [ {secreto1}, {secreto2}, ... ] }
        Enviamos el mazo de descarte actualizado.
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="evento_and_then_one_more",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "secretos": secretos,
                "ultCarta": ult_carta,
                "cantidadDescarte": cantidad_descarte
            }
        )

    async def notify_delay_escape(self, partida_id: int, jugador_id: int, cantidad_mazo: int, cantidad_descarte: int, ult_carta: dict):
        """
        Notifica que un jugador jugó "Delay the murderer's escape!".
        Enviamos el mazo de descarte, el mazo comun, y las cantidades.

        """
        await self.send_event(
            partida_id=partida_id,
            event_type="evento_delay_escape",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "cantidadMazo": cantidad_mazo,
                "cantidadDescarte": cantidad_descarte,
                "ultCarta": ult_carta
            }
        )

    async def notify_early_train(self, partida_id: int, jugador_id: int, cantidad_mazo: int, cantidad_descarte: int, ult_carta: dict):
        """
        descripcion del evento
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="evento_early_train",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "cantidadMazo": cantidad_mazo,
                "cantidadDescarte": cantidad_descarte,
                "ultCarta": ult_carta
            }
        )

    async def notify_prep_point_sus(self, partida_id: int, jugador_id: int, victima_id: int, cantidad_descarte: int, ult_carta: dict, cartas_en_mano: dict):
        """
        Notifica que se jugó un point your suspicions pero antes de procesarlo.
        Enviamos el jugador victima
        Enviamos el mazo de descarte actualizado.
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="prep_point_your_suspicions",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "victimaId": victima_id,
                "cantidadDescarte": cantidad_descarte,
                "ultCarta": ult_carta,
                "cartas_en_mano": cartas_en_mano
            }
        )

    async def notify_point_sus(self, partida_id: int, jugador_id: int, victima_id: int, secretos_victima: list, cantidad_descarte: int, ult_carta: dict):
        """
        Deprecado, usar notify_prep_point_sus. Porque la funcionalidad se hace en 
        endpoint /revelar-secreto-propio, y este llama al notify_secreto_modificado y notify_secreto_modificado.
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="evento_point_your_suspicions",
            payload={
                "partidaId": partida_id,
                "victimaId": victima_id,
                "secretosVictima": secretos_victima,
            }
        )

    async def notify_carta_por_jugar(self, partida_id: int, jugador_id: int, carta: dict, objetivo_id: int, objetivo2_id: int):
        """
        Notifica que un jugador está por jugar una carta.
        carta_id: ID de la carta que se va a jugar
        objetivo_id: ID del objetivo asociado a la carta
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="carta_por_jugar",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "carta": carta,
                "objetivoId": objetivo_id,
                "objetivo2Id": objetivo2_id
            }
        )

    async def notify_set_por_jugar(self, partida_id: int, jugador_id: int, set_id: int, cartas_jugadas: list, cartas_en_mano: list, objetivo_id: int):
        """
        Notifica que un jugador está por jugar un set de cartas.
        cartas_jugadas: lista de cartas que se van a jugar
        objetivo_id: ID del objetivo asociado al set
        """

        await self.send_event(
            partida_id=partida_id,
            event_type="set_por_jugar",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "setId": set_id,
                "cartasJugadas": cartas_jugadas,
                "cartasMano": cartas_en_mano,
                "objetivoId": objetivo_id
            }
        )
    
    async def notify_detective_por_agregar(self, partida_id: int, jugador_id: int, objetivo_id: int, carta_id: int, set_id: int):
        await self.send_event(
            partida_id=partida_id,
            event_type="detective_por_agregar",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "objetivoId": objetivo_id,
                "detectiveId": carta_id,
                "setId": set_id
            }
        )

    async def notify_secreto_modificado(self, partida_id: int, secreto: dict):
        """
        Notifica que un jugador reveló u ocultó un secreto.
        secreto: diccionario con los datos del secreto revelado
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="secreto_modificado",
            payload={
                "partidaId": partida_id,
                "secreto": secreto
            }
        )

    async def notify_secreto_y_manos(self, partida_id: int, jugador_id: int, objetivo_id: int, cartas_en_mano: list, sets: dict, secreto: dict):
        """
        Notifica que un secreto fue modificado, y actualiza los sets, mano y secretos.
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="secreto_modificado_y_partida_actualizada",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "objetivoId": objetivo_id,
                "mano_jugador": cartas_en_mano,
                "sets_actualizados": sets,
                "secreto": secreto
            }
        )
    
    async def notify_jugador_elegido_para_revelar_secreto(self, partida_id: int, jugador_id: int, cartas_jugadas: list):
        """
        Notifica que un jugador fue elegido para revelar un secreto.
        jugador_id: ID del jugador elegido
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="jugador_elegido_para_revelar_secreto",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "cartasJugadas": cartas_jugadas
            }
        )
    
    async def notify_draft_actualizado(self, partida_id: int, cantidad: int, draft: list):
        """
        Notifica que un jugador robó una carta del mazo draft
        """

        await self.send_event(
            partida_id=partida_id,
            event_type="draft_actualizado",
            payload={
                "partidaId": partida_id,
                "cantidad": cantidad,
                "draft": draft
            }
        )
    
    async def notify_cancelar_carta(self, partida_id: int, jugador_id: int, manos: dict, sets_actualizados: dict, cantidad_descarte: int, ult_carta: dict):
        """
        Notifica que un jugador uso NSF para cancelar una carta o set.
        allCartasMano es todas las manos de los ugadores
        setsActualizados es todos los sets de los jugadores
        y se manda el descarte actuaizado
        """
        await self.send_event(
            partida_id=partida_id,
            event_type="usar_NSF",
            payload={
                "partidaId": partida_id,
                "jugadorId": jugador_id,
                "allCartasMano": manos,
                "setsActualizados": sets_actualizados,
                "cantidadDescarte": cantidad_descarte,
                "ultCarta": ult_carta
            }
        )

manager = ConnectionManager()
