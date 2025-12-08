import pytest
from unittest.mock import patch, MagicMock
from app.logic.logica_partida import  robar_carta
from app.logic.logica import * 
from app.logic.logica_efectos import *
from app.logic.logica_mazos import * 
from app.logic.logica_jugar_cartas import *


class TestJugarEventoJugado:

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    @patch('app.logic.logica_jugar_cartas.Eventos')
    def test_jugar_evento_jugado_cards_off_the_table(self, mock_eventos_class, mock_carta_repo_class):
        mock_eventos = MagicMock()
        mock_carta_repo = MagicMock()
        mock_eventos_class.return_value = mock_eventos
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Event"
        mock_carta.id_front = 10
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        resultado = jugar_evento_jugado(partida_id=10, jugador_id=1, carta_id=101, objetivo_id=5)
        
        mock_eventos.caso_cards_off_the_table.assert_called_once_with(10, 101, 5)
        assert resultado == 0

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    @patch('app.logic.logica_jugar_cartas.Eventos')
    def test_jugar_evento_jugado_another_victim(self, mock_eventos_class, mock_carta_repo_class):
        mock_eventos = MagicMock()
        mock_carta_repo = MagicMock()
        mock_eventos_class.return_value = mock_eventos
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Event"
        mock_carta.id_front = 11
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        mock_eventos.caso_another_victim.return_value = "websocket_data"
        
        resultado = jugar_evento_jugado(partida_id=10, jugador_id=1, carta_id=101, objetivo_id=5, objetivo2_id=6)
        
        mock_eventos.caso_another_victim.assert_called_once_with(10, 1, 101, 5, 6)
        assert resultado == [1, "websocket_data"]

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    @patch('app.logic.logica_jugar_cartas.Eventos')
    def test_jugar_evento_jugado_dead_card_folly(self, mock_eventos_class, mock_carta_repo_class):
        mock_eventos = MagicMock()
        mock_carta_repo = MagicMock()
        mock_eventos_class.return_value = mock_eventos
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Event"
        mock_carta.id_front = 12
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        resultado = jugar_evento_jugado(partida_id=10, jugador_id=1, carta_id=101)
        
        mock_eventos.caso_dead_card_folly.assert_called_once_with(10)
        assert resultado == 2

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    @patch('app.logic.logica_jugar_cartas.Eventos')
    def test_jugar_evento_jugado_look_into_the_ashes(self, mock_eventos_class, mock_carta_repo_class):
        mock_eventos = MagicMock()
        mock_carta_repo = MagicMock()
        mock_eventos_class.return_value = mock_eventos
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Event"
        mock_carta.id_front = 13
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        resultado = jugar_evento_jugado(partida_id=10, jugador_id=1, carta_id=101, objetivo_id=5)
        
        mock_eventos.caso_look_into_the_ashes.assert_called_once_with(10, 101, 1, 5)
        assert resultado == 3

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    @patch('app.logic.logica_jugar_cartas.Eventos')
    def test_jugar_evento_jugado_card_trade(self, mock_eventos_class, mock_carta_repo_class):
        mock_eventos = MagicMock()
        mock_carta_repo = MagicMock()
        mock_eventos_class.return_value = mock_eventos
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Event"
        mock_carta.id_front = 14
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        resultado = jugar_evento_jugado(partida_id=10, jugador_id=1, carta_id=101)
        
        mock_eventos.caso_card_trade.assert_called_once_with(10)
        assert resultado == 4

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    @patch('app.logic.logica_jugar_cartas.Eventos')
    def test_jugar_evento_jugado_and_then_there_was_one_more(self, mock_eventos_class, mock_carta_repo_class):
        mock_eventos = MagicMock()
        mock_carta_repo = MagicMock()
        mock_eventos_class.return_value = mock_eventos
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Event"
        mock_carta.id_front = 15
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        resultado = jugar_evento_jugado(partida_id=10, jugador_id=1, carta_id=101, objetivo_id=5, objetivo2_id=6)
        
        mock_eventos.caso_and_then_there_was_one_more.assert_called_once_with(10, 101, 5, 6)
        assert resultado == 5

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    @patch('app.logic.logica_jugar_cartas.Eventos')
    def test_jugar_evento_jugado_delay_the_murderers_escape(self, mock_eventos_class, mock_carta_repo_class):
        mock_eventos = MagicMock()
        mock_carta_repo = MagicMock()
        mock_eventos_class.return_value = mock_eventos
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Event"
        mock_carta.id_front = 16
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        resultado = jugar_evento_jugado(partida_id=10, jugador_id=1, carta_id=101, objetivo_id=5)
        
        mock_eventos.caso_delay_the_murderers_escape.assert_called_once_with(10, 5)
        assert resultado == 6

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    @patch('app.logic.logica_jugar_cartas.Eventos')
    def test_jugar_evento_jugado_early_train_to_paddington(self, mock_eventos_class, mock_carta_repo_class):
        mock_eventos = MagicMock()
        mock_carta_repo = MagicMock()
        mock_eventos_class.return_value = mock_eventos
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Event"
        mock_carta.id_front = 17
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        resultado = jugar_evento_jugado(partida_id=10, jugador_id=1, carta_id=101)
        
        mock_eventos.caso_early_train_to_paddington.assert_called_once_with(10, 101)
        assert resultado == 7

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    @patch('app.logic.logica_jugar_cartas.Eventos')
    def test_jugar_evento_jugado_point_your_suspicions(self, mock_eventos_class, mock_carta_repo_class):
        mock_eventos = MagicMock()
        mock_carta_repo = MagicMock()
        mock_eventos_class.return_value = mock_eventos
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Event"
        mock_carta.id_front = 18
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        mock_eventos.caso_point_your_suspicions.return_value = 3
        
        resultado = jugar_evento_jugado(partida_id=10, jugador_id=1, carta_id=101)
        
        mock_eventos.caso_point_your_suspicions.assert_called_once_with(10)
        assert resultado == [8, 3]

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    def test_jugar_evento_jugado_no_es_evento(self, mock_carta_repo_class):
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Detective"  # No es Event
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        with pytest.raises(ValueError, match="La carta no es de tipo Evento"):
            jugar_evento_jugado(partida_id=10, jugador_id=1, carta_id=101)

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    def test_jugar_evento_jugado_evento_no_reconocido(self, mock_carta_repo_class):
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Event"
        mock_carta.id_front = 99  # ID no reconocido
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        with pytest.raises(ValueError, match="La carta no es un evento"):
            jugar_evento_jugado(partida_id=10, jugador_id=1, carta_id=101)


    @patch('app.logic.logica_jugar_cartas.efecto_descartar_not_so_fasts')
    def test_caso_cards_off_the_table(self, mock_efecto):
        eventos = Eventos()
        
        eventos.caso_cards_off_the_table(partida_id=10, carta_id=101, jugador_objetivo_id=1)
        
        mock_efecto.assert_called_once_with(10, 1)

    @patch('app.logic.logica_jugar_cartas.jugar_set_detective_jugado')
    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    @patch('app.logic.logica_jugar_cartas.efecto_robar_set_de_jugador')
    def test_caso_another_victim(self, mock_robar_set, mock_carta_repo_class, mock_jugar_set):
        eventos = Eventos()
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta1 = MagicMock()
        mock_carta1.id = 101
        mock_carta2 = MagicMock()
        mock_carta2.id = 102
        
        mock_carta_repo.get_cartas_by_set.return_value = [mock_carta1, mock_carta2]
        mock_jugar_set.return_value = "websocket_data"
        
        resultado = eventos.caso_another_victim(
            partida_id=10, 
            jugador_id=1, 
            carta_id=101, 
            set_id=5, 
            objetivo2_id=2
        )
        
        mock_robar_set.assert_called_once_with(10, 1, 5)
        mock_carta_repo.get_cartas_by_set.assert_called_once_with(10, 5)
        mock_jugar_set.assert_called_once_with(10, 1, [101, 102], 2)
        assert resultado == "websocket_data"

    @patch('app.logic.logica_jugar_cartas.contador_iniciar_contador')
    @patch('app.logic.logica_jugar_cartas.PartidaRepository')
    def test_caso_dead_card_folly(self, mock_partida_repo_class, mock_contador):
        eventos = Eventos()
        mock_partida_repo = MagicMock()
        mock_partida_repo_class.return_value = mock_partida_repo
        
        mock_partida_repo.get_numero_de_jugadores.return_value = 4
        
        eventos.caso_dead_card_folly(partida_id=10)
        
        mock_partida_repo.get_numero_de_jugadores.assert_called_once_with(10)
        mock_contador.assert_called_once_with(10, 4)

    @patch('app.logic.logica_jugar_cartas.efecto_roba_del_descarte')
    def test_caso_look_into_the_ashes(self, mock_efecto):
        eventos = Eventos()
        
        eventos.caso_look_into_the_ashes(
            partida_id=10, 
            carta_id=101, 
            jugador_id=1, 
            carta_objetivo_id=201
        )
        
        mock_efecto.assert_called_once_with(10, 1, 201)

    @patch('app.logic.logica_jugar_cartas.contador_iniciar_contador')
    def test_caso_card_trade(self, mock_contador):
        eventos = Eventos()
        
        eventos.caso_card_trade(partida_id=10)
        
        mock_contador.assert_called_once_with(10, 2)

    @patch('app.logic.logica_jugar_cartas.efecto_roba_secreto')
    def test_caso_and_then_there_was_one_more(self, mock_efecto):
        eventos = Eventos()
        
        eventos.caso_and_then_there_was_one_more(
            partida_id=10, 
            carta_id=101, 
            secreto_objetivo_id=201, 
            jugador_objetivo_id=1
        )
        
        mock_efecto.assert_called_once_with(10, 201, 1)

    @patch('app.logic.logica_jugar_cartas.efecto_recartar_descarte_a_mazo_n')
    def test_caso_delay_the_murderers_escape(self, mock_efecto):
        eventos = Eventos()
        
        eventos.caso_delay_the_murderers_escape(partida_id=10, cantidad=3)
        
        mock_efecto.assert_called_once_with(10, 3)

    @patch('app.logic.logica_jugar_cartas.efecto_descartar_6_desde_mazo')
    def test_caso_early_train_to_paddington(self, mock_efecto):
        eventos = Eventos()
        
        eventos.caso_early_train_to_paddington(partida_id=10, carta_id=101)
        
        mock_efecto.assert_called_once_with(10)

    @patch('app.logic.logica_jugar_cartas.efecto_victima_aleatoria')
    def test_caso_point_your_suspicions(self, mock_efecto):
        eventos = Eventos()
        
        mock_efecto.return_value = 3
        
        resultado = eventos.caso_point_your_suspicions(partida_id=10)
        
        mock_efecto.assert_called_once_with(10)
        assert resultado == 3

