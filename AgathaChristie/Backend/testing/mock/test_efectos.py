from unittest.mock import patch, MagicMock
import pytest

from app.logic.logica_efectos import check_desgracia


class TestEfectos:
    @patch('app.logic.logica_efectos.JugadorRepository')
    @patch('app.logic.logica_efectos.PartidaRepository')
    @patch('app.logic.logica.carta_consultar_secretos_de_jugador')
    def test_jugador_check_desgracia(self, carta_consultar_secretos_mock, partida_repo_mock, jugador_repo_mock):
        # Configurar los repos mock
        mock_partida_repo = MagicMock()
        mock_jugador_repo = MagicMock()

        jugador_repo_mock.return_value = mock_jugador_repo
        partida_repo_mock.return_value = mock_partida_repo

        # Datos de partida y jugador
        mock_partida = MagicMock()
        mock_partida.id = 10
        mock_partida.jugadores = [1]

        mock_jugador = MagicMock()
        mock_jugador.id = 1
        mock_jugador.partida = 10
        mock_jugador.desgraciado = False  # estado inicial

        mock_secreto = MagicMock()
        mock_secreto.estado = 0  # revelado
        mock_secreto.jugador = 1

        # Retornos
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        mock_partida_repo.get_by_id.return_value = mock_partida
        mock_jugador_repo.get_jugadores_by_partida.return_value = [mock_jugador]

        # La funcion devuelve directamente la lista de secretos
        carta_consultar_secretos_mock.return_value = [mock_secreto]

        # Hacer que set_desgraciado actualice el estado del mock_jugador
        def _set_desgraciado(j_id, valor):
            assert j_id == 1
            mock_jugador.desgraciado = valor
        mock_jugador_repo.set_desgraciado.side_effect = _set_desgraciado

        # Ejecutar
        result = check_desgracia(1)

        # Asserts
        mock_jugador_repo.get_jugadores_by_partida.assert_called_once_with(10)
        mock_jugador_repo.get_by_id.assert_called_once_with(1)
        mock_partida_repo.get_by_id.assert_called_once_with(10)
        carta_consultar_secretos_mock.assert_called_once()
        mock_jugador_repo.set_desgraciado.assert_called_once_with(1, True)

        assert result is True
        assert mock_jugador.desgraciado is True
