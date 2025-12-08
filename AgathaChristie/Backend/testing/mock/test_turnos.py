import pytest
from unittest.mock import patch, MagicMock
from datetime import date
from app.data_access.partida import PartidaRepository, CreatePartidaData
from app.data_access.turnos import TurnoRepository
from app.data_access.turnos import TurnoData

class TestTurnoRepository:
    def test_turno_terminar_turno(self):
        with patch('app.logic.logica_turnos.TurnoRepository') as mock_turno_repo:
            mock_turno_instance = MagicMock()
            mock_turno_instance.get_turnos_by_partida.return_value = [1, 2, 3]
            mock_turno_instance.get_id_jugador_actual.return_value = 2
            mock_turno_instance.avanzar_turno.return_value = None

            mock_turno_repo.return_value = mock_turno_instance

            from app.logic.logica_turnos import turno_terminar_turno

            nuevo_turno = turno_terminar_turno(1)

            mock_turno_instance.get_turnos_by_partida.assert_called_once_with(1)
            mock_turno_instance.avanzar_turno.assert_called_once_with(1)
            mock_turno_instance.get_id_jugador_actual.assert_called()

            assert mock_turno_instance.get_id_jugador_actual.call_count == 2
            assert nuevo_turno == 2

    @patch('app.data_access.turnos.select')
    @patch('app.data_access.turnos.TurnoData')
    def test_get_turnos_by_partida(self, mock_turno_data, mock_select):
        mock_turno1 = MagicMock()
        mock_turno2 = MagicMock()
        mock_turno1.to_dict.return_value = {'id': 1, 'partida': 1, 'activo': True}
        mock_turno2.to_dict.return_value = {'id': 2, 'partida': 1, 'activo': False}
        
        mock_select.return_value = [mock_turno1, mock_turno2]
        
        mock_validated_turno1 = MagicMock()
        mock_validated_turno2 = MagicMock()
        mock_turno_data.model_validate.side_effect = [mock_validated_turno1, mock_validated_turno2]

        repo = TurnoRepository()
        resultado = repo.get_turnos_by_partida(partida_id=1)

        mock_select.assert_called_once()
        assert mock_turno1.to_dict.call_count == 1
        assert mock_turno2.to_dict.call_count == 1
        assert mock_turno_data.model_validate.call_count == 2
        mock_turno_data.model_validate.assert_any_call({'id': 1, 'partida': 1, 'activo': True})
        mock_turno_data.model_validate.assert_any_call({'id': 2, 'partida': 1, 'activo': False})
        assert resultado == [mock_validated_turno1, mock_validated_turno2]

    @patch('app.data_access.turnos.commit')
    @patch('app.data_access.turnos.Turnos')
    def test_marcar_descarte_realizado(self, mock_turnos, mock_commit):
        mock_turno = MagicMock()
        mock_turnos.get.return_value = mock_turno

        repo = TurnoRepository()
        repo.marcar_descarte_realizado(partida_id=1)

        mock_turnos.get.assert_called_once_with(partida=1, activo=True)
        assert mock_turno.descarte_realizado == True
        mock_commit.assert_called_once()

    @patch('app.data_access.turnos.select')
    def test_get_turnos_by_partida_sin_turnos(self, mock_select):
        mock_select.return_value = []

        repo = TurnoRepository()
        resultado = repo.get_turnos_by_partida(partida_id=999)

        mock_select.assert_called_once()
        assert resultado == []

