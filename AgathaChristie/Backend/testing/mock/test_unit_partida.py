import pytest
from unittest.mock import patch, MagicMock
from datetime import date
from app.data_access.partida import PartidaRepository, CreatePartidaData

class TestPartidaRepository:

    def test_get_all(self):
        with patch('app.data_access.partida.Partida') as mock_partida_class:
            mock_partida1 = MagicMock()
            mock_partida1.to_dict.return_value = {
                "id": 1, "creador": 1, "nombre": "Partida 1", "estado": False, "max_jugadores": 4,
                "min_jugadores": 3, "jugadores": [1, 2]
            }
            
            mock_partida2 = MagicMock()
            mock_partida2.to_dict.return_value = {
                "id": 2, "creador": 2, "nombre": "Partida 2", "estado": True, "max_jugadores": 4,
                "min_jugadores": 3, "jugadores": [3]
            }
            
            mock_partida_class.select.return_value = [mock_partida1, mock_partida2]

            repo = PartidaRepository()
            resultado = repo.get_all()

            mock_partida_class.select.assert_called_once()
            assert len(resultado) == 2
            assert resultado[0].id == 1
            assert resultado[0].nombre == "Partida 1"
            assert resultado[0].estado == False
            assert resultado[0].jugadores == [1, 2]
            assert resultado[1].id == 2
            assert resultado[1].estado == True

    def test_get_no_iniciadas(self):
        with patch('app.data_access.partida.select') as mock_select:
            mock_partida1 = MagicMock()
            mock_partida1.to_dict.return_value = {
                "id": 1, "creador": 1, "nombre": "Partida No Iniciada", "estado": False, "max_jugadores": 4,
                "min_jugadores": 3, "jugadores": []
            }
            
            mock_select.return_value = [mock_partida1]

            repo = PartidaRepository()
            resultado = repo.get_no_iniciadas()

            mock_select.assert_called_once()
            assert len(resultado) == 1
            assert resultado[0].estado == False
            assert resultado[0].nombre == "Partida No Iniciada"

    def test_get_by_id_existente(self):
        with patch('app.data_access.partida.Partida') as mock_partida_class:
            mock_partida = MagicMock()
            mock_partida.to_dict.return_value = {
                "id": 1, "creador": 1, "nombre": "Test Partida", "estado": False, "max_jugadores": 4,
                "min_jugadores": 3, "jugadores": [1, 2, 3]
            }
            mock_partida_class.get.return_value = mock_partida

            repo = PartidaRepository()
            resultado = repo.get_by_id(1)

            mock_partida_class.get.assert_called_once_with(id=1)
            mock_partida.to_dict.assert_called_once_with(with_collections=True)
            assert resultado.id == 1
            assert resultado.nombre == "Test Partida"
            assert resultado.jugadores == [1, 2, 3]

    def test_get_by_id_no_existente(self):
        with patch('app.data_access.partida.Partida') as mock_partida_class:
            mock_partida_class.get.return_value = None

            repo = PartidaRepository()
            
            with pytest.raises(ValueError, match="La partida no existe"):
                repo.get_by_id(999)

    def test_get_by_name(self):
        with patch('app.data_access.partida.select') as mock_select:
            mock_partida1 = MagicMock()
            mock_partida1.to_dict.return_value = {
                "id": 1, "creador": 1, "nombre": "Partida de Brandon", "estado": False, "max_jugadores": 4,
                "min_jugadores": 3, "jugadores": []
            }
            
            mock_partida2 = MagicMock()
            mock_partida2.to_dict.return_value = {
                "id": 2, "creador": 2, "nombre": "Otra partida de Brandon", "estado": True, "max_jugadores": 4,
                "min_jugadores": 3, "jugadores": []
            }
            
            mock_select.return_value = [mock_partida1, mock_partida2]

            repo = PartidaRepository()
            resultado = repo.get_by_name("Brandon")

            mock_select.assert_called_once()
            assert len(resultado) == 2
            assert all("Brandon" in p.nombre for p in resultado)

    def test_get_by_name_sin_resultados(self):
        with patch('app.data_access.partida.select') as mock_select:
            mock_select.return_value = []

            repo = PartidaRepository()
            resultado = repo.get_by_name("NoExiste")

            assert len(resultado) == 0

    def test_create_partida(self):
        with patch('app.data_access.partida.Partida') as mock_partida_class:
            mock_nueva_partida = MagicMock()
            mock_nueva_partida.to_dict.return_value = {
                "id": 1, "creador": 1, "nombre": "Nueva Partida", "estado": False, "max_jugadores": 4,
                "min_jugadores": 3, "jugadores": []
            }
            mock_partida_class.return_value = mock_nueva_partida

            repo = PartidaRepository()
            partida_data = CreatePartidaData(
                creador=1,
                nombre="Nueva Partida",
                estado=False,
                max_jugadores=4,
                min_jugadores=3,
                jugadores=[]
            )
            
            resultado = repo.create(partida_data)

            mock_partida_class.assert_called_once_with(
                creador=1,
                nombre="Nueva Partida", 
                estado=False,
                max_jugadores=4,
                min_jugadores=3,
                jugadores=[]
            )
            assert resultado.nombre == "Nueva Partida"
            assert resultado.creador == 1

    def test_eliminar_partida_existente(self):
        with patch('app.data_access.partida.delete') as mock_delete:
            mock_delete.return_value = 1  # Se eliminó 1 partida

            repo = PartidaRepository()
            repo.eliminar_partida(1)

            mock_delete.assert_called_once()

    def test_eliminar_partida_no_existente(self):
        with patch('app.data_access.partida.delete') as mock_delete:
            mock_delete.return_value = 0  # No se eliminó ninguna partida

            repo = PartidaRepository()
            
            with pytest.raises(ValueError, match="La partida no existe"):
                repo.eliminar_partida(999)

    def test_iniciar_partida_existente(self):
        with patch('app.data_access.partida.Partida') as mock_partida_class:
            mock_partida = MagicMock()
            mock_partida.estado = False  # Estado inicial
            # Mockear las propiedades necesarias para la validación
            mock_partida.min_jugadores = 3
            mock_partida.jugadores = [1, 2, 3]  # Lista con 3 jugadores para pasar la validación
            
            mock_partida_class.get.return_value = mock_partida

            repo = PartidaRepository()
            repo.iniciar_partida(1)

            mock_partida_class.get.assert_called_once_with(id=1)
            assert mock_partida.estado == True  # Debería cambiar a True

    def test_iniciar_partida_no_existente(self):
        with patch('app.data_access.partida.Partida') as mock_partida_class:
            mock_partida_class.get.return_value = None

            repo = PartidaRepository()
            
            with pytest.raises(ValueError, match="La partida no existe"):
                repo.iniciar_partida(999)

    def test_terminar_partida_existente(self):
        with patch('app.data_access.partida.Partida') as mock_partida_class:
            mock_partida = MagicMock()
            mock_partida.estado = True  # Estado inicial (iniciada)
            mock_partida_class.get.return_value = mock_partida

            repo = PartidaRepository()
            repo.terminar_partida(1)

            mock_partida_class.get.assert_called_once_with(id=1)
            assert mock_partida.estado == False  # Debería cambiar a False

    def test_terminar_partida_no_existente(self):
        with patch('app.data_access.partida.Partida') as mock_partida_class:
            mock_partida_class.get.return_value = None

            repo = PartidaRepository()
            
            with pytest.raises(ValueError, match="La partida no existe"):
                repo.terminar_partida(999)


    def test_get_numero_de_jugadores(self):
        with patch('app.data_access.partida.select') as mock_select:
            # Mock de jugadores en una partida
            mock_jugador1 = MagicMock()
            mock_jugador2 = MagicMock()
            mock_jugador3 = MagicMock()
            
            mock_select.return_value = [mock_jugador1, mock_jugador2, mock_jugador3]

            repo = PartidaRepository()
            resultado = repo.get_numero_de_jugadores(partida_id=1)

            mock_select.assert_called_once()
            assert resultado == 3

    def test_get_numero_de_jugadores_empty(self):
        with patch('app.data_access.partida.select') as mock_select:
            # Simular partida sin jugadores
            mock_select.return_value = []

            repo = PartidaRepository()
            resultado = repo.get_numero_de_jugadores(partida_id=999)

            mock_select.assert_called_once()
            assert resultado == 0
