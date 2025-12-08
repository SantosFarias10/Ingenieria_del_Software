from unittest.mock import patch, MagicMock
import pytest
from datetime import date

from app.data_access.jugador import JugadorRepository, CreateJugadorData

class TestJugadorRepository:

    def test_get_all(self):
        with patch('app.data_access.jugador.select') as mock_select:
            
            mock_jugador1 = MagicMock()
            mock_jugador1.to_dict.return_value = {
                "id": 1, 
                "nombre": "Uno", 
                "cumple": date(2005, 12, 8), 
                "avatar": "avatar re copado",
                "partida": None
            }
            
            mock_jugador2 = MagicMock()
            mock_jugador2.to_dict.return_value = {
                "id": 2, 
                "nombre": "Dos", 
                "cumple": date(2004, 11, 2), 
                "avatar": "avatar medio pelo",
                "partida": 3
            }
            
            
            mock_select.return_value = [mock_jugador1, mock_jugador2]

            repo = JugadorRepository()
            resultado = repo.get_all()
            
            mock_select.assert_called_once()
            mock_jugador1.to_dict.assert_called_once()
            mock_jugador2.to_dict.assert_called_once()


            assert len(resultado) == 2
            assert resultado[0].id == 1
            assert resultado[0].nombre == "Uno"
            assert resultado[0].cumple == date(2005, 12, 8)
            assert resultado[0].partida is None
            
            assert resultado[1].partida == 3
            assert resultado[1].nombre == "Dos"
    
    
    def test_get_by_id_existente(self):
        with patch('app.data_access.jugador.Jugador') as mock_jugador_class:
            mock_jugador = MagicMock()
            mock_jugador.to_dict.return_value = {
                "id": 1,
                "nombre": "Ponch",
                "cumple": date(2003, 12, 29),
                "avatar": "avatar1",
                "partida": None
            }
            mock_jugador_class.get.return_value = mock_jugador

            repo = JugadorRepository()
            resultado = repo.get_by_id(1)

            mock_jugador_class.get.assert_called_once_with(id=1)
            mock_jugador.to_dict.assert_called_once()
            assert resultado.nombre == "Ponch"
    
    def test_get_by_id_no_existente(self):
        with patch('app.data_access.jugador.Jugador') as mock_jugador_class:
            mock_jugador_class.get.return_value = None

            repo = JugadorRepository()
            
            with pytest.raises(ValueError, match="El jugador no existe"):
                repo.get_by_id(999)
            
    def test_create_jugador(self):
        with patch('app.data_access.jugador.Jugador') as mock_jugador_class:
            mock_nuevo_jugador = MagicMock()
            mock_nuevo_jugador.to_dict.return_value = {
                "id": 4,
                "nombre": "Nuevo",
                "cumple": date(2000, 1, 1),
                "avatar": "nuevo_avatar",
                "partida": None
            }
            mock_jugador_class.return_value = mock_nuevo_jugador

            repo = JugadorRepository()
            jugador_data = CreateJugadorData(
                nombre="Nuevo",
                cumple=date(2000, 1, 1),
                avatar="nuevo_avatar"
            )
            
            resultado = repo.create(jugador_data)

            mock_jugador_class.assert_called_once_with(
                nombre="Nuevo",
                cumple=date(2000, 1, 1),
                avatar="nuevo_avatar"
            )
            assert resultado.nombre == "Nuevo"

    def test_unir_jugador_a_partida(self):
        with patch('app.data_access.jugador.Jugador') as mock_jugador_class, \
             patch('app.data_access.jugador.Partida') as mock_partida_class, \
             patch('app.data_access.jugador.commit') as mock_commit:
            
            mock_jugador = MagicMock()
            mock_partida = MagicMock()
            
            mock_jugador_class.get.return_value = mock_jugador
            mock_partida_class.get.return_value = mock_partida

            repo = JugadorRepository()
            repo.unir_jugador_a_partida(1, 2)

            # Verificaciones
            mock_jugador_class.get.assert_called_once_with(id=1)
            mock_partida_class.get.assert_called_once_with(id=2)
            assert mock_jugador.partida == mock_partida
            mock_commit.assert_called_once()

    def test_get_jugadores_by_partida(self):
        with patch('app.data_access.jugador.select') as mock_select:
            mock_jugador1 = MagicMock()
            mock_jugador1.to_dict.return_value = {
                "id": 2, "nombre": "Ale", "cumple": date(2002, 7, 25),
                "avatar": "avatar2", "partida": 1
            }
            
            mock_jugador2 = MagicMock()
            mock_jugador2.to_dict.return_value = {
                "id": 3, "nombre": "Brandon", "cumple": date(2005, 2, 15),
                "avatar": None, "partida": 1
            }
            
            mock_select.return_value = [mock_jugador1, mock_jugador2]

            repo = JugadorRepository()
            resultado = repo.get_jugadores_by_partida(1)

            assert len(resultado) == 2
            assert all(j.partida == 1 for j in resultado)
            assert resultado[0].nombre == "Ale"
            assert resultado[1].nombre == "Brandon"
    
    
    def test_salir_de_partida_by_id_existente(self):
        with patch('app.data_access.jugador.Jugador') as mock_jugador_class:
            
            mock_jugador = MagicMock()
            mock_jugador.partida = 1  # Tiene una partida asignada
            
            mock_jugador_class.select.return_value = [mock_jugador]
            
            repo = JugadorRepository()
            repo.salir_de_partida_by_id(1)
            
            mock_jugador_class.select.assert_called_once_with(id=1)
            assert mock_jugador.partida is None

    def test_unir_jugador_a_partida_jugador_no_existe(self):
        with patch('app.data_access.jugador.Jugador') as mock_jugador_class, \
             patch('app.data_access.jugador.Partida') as mock_partida_class, \
             patch('app.data_access.jugador.commit') as mock_commit:
            
            mock_jugador_class.get.return_value = None
            mock_partida_class.get.return_value = MagicMock()
            
            repo = JugadorRepository()
            
            with pytest.raises(ValueError) as exc_info:
                repo.unir_jugador_a_partida(999, 1)
            
            assert "El jugador no existe" in str(exc_info.value)
            
            mock_jugador_class.get.assert_called_once_with(id=999)
            mock_partida_class.get.assert_called_once_with(id=1)
            mock_commit.assert_not_called()

    def test_unir_jugador_a_partida_partida_no_existe(self):
        with patch('app.data_access.jugador.Jugador') as mock_jugador_class, \
             patch('app.data_access.jugador.Partida') as mock_partida_class, \
             patch('app.data_access.jugador.commit') as mock_commit:
            
            mock_jugador_class.get.return_value = MagicMock()
            mock_partida_class.get.return_value = None
            
            repo = JugadorRepository()
            
            with pytest.raises(ValueError) as exc_info:
                repo.unir_jugador_a_partida(1, 999)
            
            assert "La partida no existe" in str(exc_info.value)
            
            mock_jugador_class.get.assert_called_once_with(id=1)
            mock_partida_class.get.assert_called_once_with(id=999)
            mock_commit.assert_not_called()


    def test_get_jugadores_no_desgraciados_by_partida(self):
        with patch('app.data_access.jugador.select') as mock_select:
            # Mock de jugadores no desgraciados
            mock_jugador1 = MagicMock()
            mock_jugador1.to_dict.return_value = {
                "id": 1, 
                "nombre": "Jugador1", 
                "cumple": date(2000, 1, 1),
                "avatar": "avatar1",
                "desgraciado": False,
                "partida": 1
            }
            
            mock_jugador2 = MagicMock()
            mock_jugador2.to_dict.return_value = {
                "id": 2, 
                "nombre": "Jugador2", 
                "cumple": date(2001, 2, 2),
                "avatar": "avatar2",
                "desgraciado": False,
                "partida": 1
            }
            
            # Mock de un jugador desgraciado (no debería aparecer en los resultados)
            mock_jugador_desgraciado = MagicMock()
            mock_jugador_desgraciado.to_dict.return_value = {
                "id": 3, 
                "nombre": "JugadorDesgraciado", 
                "cumple": date(2002, 3, 3),
                "avatar": "avatar3",
                "desgraciado": True,
                "partida": 1
            }

            # Solo devolvemos los jugadores no desgraciados
            mock_select.return_value = [mock_jugador1, mock_jugador2]

            repo = JugadorRepository()
            resultado = repo.get_jugadores_no_desgraciados_by_partida(partida_id=1)

            # Verificar que se llamó a select con los parámetros correctos
            mock_select.assert_called_once()
            
            # Verificar los resultados
            assert len(resultado) == 2
            assert resultado[0].id == 1
            assert resultado[0].nombre == "Jugador1"
            assert resultado[0].desgraciado == False
            assert resultado[1].id == 2
            assert resultado[1].nombre == "Jugador2"
            assert resultado[1].desgraciado == False

            # Verificar que se llamó to_dict() con with_collections=True
            mock_jugador1.to_dict.assert_called_once_with(with_collections=True)
            mock_jugador2.to_dict.assert_called_once_with(with_collections=True)
