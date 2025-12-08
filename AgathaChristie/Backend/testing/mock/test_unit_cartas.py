from pony.orm.core import PartialCommitException
import pytest
from unittest.mock import patch, MagicMock
from app.data_access.carta import CartaRepository, cargar_cartas

class TestCarta:

    def test_get_all(self):
        with patch('app.data_access.carta.select') as mock_select:
            mock_carta1 = MagicMock()
            mock_carta1.to_dict.return_value = {
                "id": 1, "nombre": "palta", "categoria": "Secret", "jugador": None, "partida": 1, "id_front": 1
            }
            mock_carta2 = MagicMock()
            mock_carta2.to_dict.return_value = {
                "id": 2, "nombre": "banana", "categoria": "Event", "jugador": 1, "partida": 1, "id_front": 1
            }


            mock_select.return_value = [mock_carta1, mock_carta2]

            repo = CartaRepository()
            resultado = repo.get_all(1)

            mock_carta1.to_dict.assert_called_once()
            mock_carta2.to_dict.assert_called_once()
            assert len(resultado) == 2
            assert resultado[0].id == 1
            assert resultado[0].nombre == "palta"
            assert resultado[0].categoria == "Secret"
            assert resultado[0].jugador == None
            assert resultado[0].partida == 1
            assert resultado[1].id == 2
            assert resultado[1].nombre == "banana"
            assert resultado[1].categoria == "Event"
            assert resultado[1].jugador == 1
            assert resultado[1].partida == 1

    def test_get_by_id_found(self):
        with patch('app.data_access.carta.Carta') as mock_carta_class:
            mock_carta = MagicMock()
            mock_carta.to_dict.return_value = {
                "id": 1, "nombre": "Dragón", "categoria": "Secret", "jugador": None, "partida": 4, "id_front": 1
            }

            mock_carta_class.get.return_value = mock_carta

            repo = CartaRepository()
            resultado = repo.get_by_id(1, 4)

            mock_carta_class.get.assert_called_once_with(id=1, partida=4)
            mock_carta.to_dict.assert_called_once_with(with_collections=True)
            assert resultado.id == 1
            assert resultado.nombre == "Dragón"
            assert resultado.categoria == "Secret"
            assert resultado.jugador == None
            assert resultado.partida == 4

    def test_get_by_id_not_found(self):
        with patch('app.data_access.carta.Carta') as mock_carta_class:
            mock_carta_class.get.return_value = None

            repo = CartaRepository()

            with pytest.raises(ValueError, match="La carta no existe"):
                repo.get_by_id(999, 1)

            mock_carta_class.get.assert_called_once_with(id=999, partida=1)


    def test_agregar_a_jugador(self):
        with patch('app.data_access.carta.Carta') as mock_carta_class, \
             patch('app.data_access.carta.Jugador') as mock_jugador_class, \
             patch('app.data_access.carta.commit') as mock_commit, \
             patch('app.data_access.carta.Partida') as mock_partida_class:
            
            mock_carta = MagicMock()
            mock_carta.to_dict.return_value = {
                "id": 1, "nombre": "Dragón", "categoria": "Secret", "jugador": None, "partida": 4, "id_front": 1
            }
            mock_jugador = MagicMock()
            mock_jugador.cartas = MagicMock()
            mock_jugador.cartas.add = MagicMock()

            mock_partida = MagicMock()
            
            mock_carta_class.get.return_value = mock_carta
            mock_jugador_class.get.return_value = mock_jugador
            mock_partida_class.get.return_value = mock_partida

            repo = CartaRepository()
            repo.agregar_a_jugador(jugador_id=1, carta_id=2, partida_id=4)
            
            mock_partida_class.get.assert_called_once_with(id=4)
            mock_carta_class.get.assert_called_once_with(id=2, partida=4)
            mock_jugador_class.get.assert_called_once_with(id=1)
            mock_commit.assert_called_once()


    def test_sacar_de_jugador(self):
        with patch('app.data_access.carta.Carta') as mock_carta_class, \
             patch('app.data_access.carta.commit') as mock_commit:

            mock_carta = MagicMock()
            mock_carta.to_dict.return_value = {
                "id": 1, "nombre": "Dragón", "categoria": "Secret", "jugador": None, "partida": 4, "id_front": 1
            }
            mock_carta_class.get.return_value = mock_carta

            repo = CartaRepository()
            repo.sacar_de_jugador(carta_id=1, partida_id=4)

            mock_carta_class.get.assert_called_once_with(id=1, partida=4)
            assert mock_carta.jugador is None
            mock_commit.assert_called_once() 

    def test_cargar_cartas_when_db_empty(self):
        with patch('app.data_access.carta.select') as mock_select, \
            patch('app.data_access.carta.Carta') as mock_carta:

            mock_query = MagicMock()
            mock_query.first.return_value = None
            mock_select.return_value = mock_query

            result = cargar_cartas(1)

            assert result is True
            assert mock_carta.call_count == 80

    def test_get_secretos_by_partida(self):
        with patch('app.data_access.carta.select') as mock_select:

            mock_carta1 = MagicMock()
            mock_carta1.to_dict.return_value = {
                "id": 1, "nombre": "Dragón Secreto", "categoria": "Secret", "jugador": None, "partida": 1, "id_front": 1
            }
            mock_carta2 = MagicMock()
            mock_carta2.to_dict.return_value = {
                "id": 2, "nombre": "Hechizo Oculto", "categoria": "Secret", "jugador": 2, "partida": 1, "id_front": 1
            }
            mock_carta3 = MagicMock()
            mock_carta3.to_dict.return_value = {
                "id": 3, "nombre": "Carta Normal", "categoria": "Event", "jugador": None, "partida": 1, "id_front": 1  # No es Secret
            }

            mock_select.return_value = [mock_carta1, mock_carta2]

            repo = CartaRepository()
            resultado = repo.get_secretos_by_partida(partida_id=1)

            mock_select.assert_called_once()

            assert len(resultado) == 2
            assert resultado[0].id == 1
            assert resultado[0].nombre == "Dragón Secreto"
            assert resultado[0].categoria == "Secret"
            assert resultado[0].partida == 1
            assert resultado[1].id == 2
            assert resultado[1].nombre == "Hechizo Oculto"
            assert resultado[1].categoria == "Secret"
            assert resultado[1].partida == 1


    def test_get_cartas_de_efecto(self):
        with patch('app.data_access.carta.select') as mock_select:
            # Mock de las cartas de efecto (no Secret)
            mock_carta1 = MagicMock()
            mock_carta1.to_dict.return_value = {
                "id": 1, "nombre": "Evento Especial", "categoria": "Event", "jugador": None, "partida": 1, "id_front": 1
            }
            mock_carta2 = MagicMock()
            mock_carta2.to_dict.return_value = {
                "id": 2, "nombre": "Objeto Mágico", "categoria": "Object", "jugador": 2, "partida": 1, "id_front": 1
            }
            mock_carta3 = MagicMock()
            mock_carta3.to_dict.return_value = {
                "id": 3, "nombre": "Carta Secreta", "categoria": "Secret", "jugador": None, "partida": 1, "id_front": 1  # No debería aparecer
            }

            # Solo devolvemos las cartas que NO son Secret
            mock_select.return_value = [mock_carta1, mock_carta2]

            repo = CartaRepository()
            resultado = repo.get_cartas_de_efecto(partida_id=1)

            # Verificar que se llamó a select
            mock_select.assert_called_once()

            # Verificar los resultados
            assert len(resultado) == 2

            # Primera carta (Event)
            assert resultado[0].id == 1
            assert resultado[0].nombre == "Evento Especial"
            assert resultado[0].categoria == "Event"
            assert resultado[0].partida == 1

            # Segunda carta (Object)
            assert resultado[1].id == 2
            assert resultado[1].nombre == "Objeto Mágico"
            assert resultado[1].categoria == "Object"
            assert resultado[1].partida == 1

            # Verificar que se llamó to_dict() sin parámetros
            mock_carta1.to_dict.assert_called_once_with()
            mock_carta2.to_dict.assert_called_once_with()

    def test_get_cartas_de_efecto_empty(self):
        with patch('app.data_access.carta.select') as mock_select:
            # Simular que no hay cartas de efecto en la partida
            mock_select.return_value = []

            repo = CartaRepository()
            resultado = repo.get_cartas_de_efecto(partida_id=999)

            mock_select.assert_called_once()
            assert len(resultado) == 0
            assert resultado == []

    def test_get_cartas_de_efecto_only_secrets(self):
        with patch('app.data_access.carta.select') as mock_select:
            # Simular que solo hay cartas Secret (no deberían aparecer)
            mock_carta_secret1 = MagicMock()
            mock_carta_secret1.to_dict.return_value = {
                "id": 1, "nombre": "Secreto 1", "categoria": "Secret", "jugador": None, "partida": 1, "id_front": 1
            }
            mock_carta_secret2 = MagicMock()
            mock_carta_secret2.to_dict.return_value = {
                "id": 2, "nombre": "Secreto 2", "categoria": "Secret", "jugador": 1, "partida": 1, "id_front": 1
            }

            # Aunque en la realidad PonyORM filtraría esto, simulamos que select devuelve vacío
            mock_select.return_value = []

            repo = CartaRepository()
            resultado = repo.get_cartas_de_efecto(partida_id=1)

            mock_select.assert_called_once()
            assert len(resultado) == 0
            assert resultado == []

    def test_get_carta_de_asesino_found(self):
        with patch('app.data_access.carta.Carta') as mock_carta_class:
            mock_carta = MagicMock()
            mock_carta.to_dict.return_value = {
                "id": 1, "nombre": "You're the Murderer!!", "categoria": "Secret", "jugador": None, "partida": 1, "id_front": 1
            }

            mock_carta_class.get.return_value = mock_carta

            repo = CartaRepository()
            resultado = repo.get_carta_de_asesino(partida_id=1)

            mock_carta_class.get.assert_called_once_with(nombre="You're the Murderer!!", partida=1)
            mock_carta.to_dict.assert_called_once_with()
            assert resultado.id == 1
            assert resultado.nombre == "You're the Murderer!!"
            assert resultado.categoria == "Secret"
            assert resultado.partida == 1

    def test_get_carta_de_asesino_not_found(self):
        with patch('app.data_access.carta.Carta') as mock_carta_class:
            mock_carta_class.get.return_value = None

            repo = CartaRepository()

            with pytest.raises(ValueError, match="No hay asesino"):
                repo.get_carta_de_asesino(partida_id=999)

            mock_carta_class.get.assert_called_once_with(nombre="You're the Murderer!!", partida=999)

    def test_get_carta_de_complice_found(self):
        with patch('app.data_access.carta.Carta') as mock_carta_class:
            mock_carta = MagicMock()
            mock_carta.to_dict.return_value = {
                "id": 2, "nombre": "You're the Accomplice!", "categoria": "Secret", "jugador": None, "partida": 1, "id_front": 1
            }

            mock_carta_class.get.return_value = mock_carta

            repo = CartaRepository()
            resultado = repo.get_carta_de_complice(partida_id=1)

            mock_carta_class.get.assert_called_once_with(nombre="You're the Accomplice!", partida=1)
            mock_carta.to_dict.assert_called_once_with()
            assert resultado.id == 2
            assert resultado.nombre == "You're the Accomplice!"
            assert resultado.categoria == "Secret"
            assert resultado.partida == 1

    def test_get_carta_de_complice_not_found(self):
        with patch('app.data_access.carta.Carta') as mock_carta_class:
            mock_carta_class.get.return_value = None

            repo = CartaRepository()

            with pytest.raises(ValueError, match="No hay complice"):
                repo.get_carta_de_complice(partida_id=999)

            mock_carta_class.get.assert_called_once_with(nombre="You're the Accomplice!", partida=999)

    def test_get_cartas_de_partida(self):
        with patch('app.data_access.carta.select') as mock_select:
            # Mock de cartas de una partida
            mock_carta1 = MagicMock()
            mock_carta1.to_dict.return_value = {
                "id": 1, "nombre": "Carta 1", "categoria": "Secret", "jugador": None, "partida": 1, "id_front": 1
            }
            mock_carta2 = MagicMock()
            mock_carta2.to_dict.return_value = {
                "id": 2, "nombre": "Carta 2", "categoria": "Event", "jugador": 1, "partida": 1, "id_front": 1
            }

            mock_select.return_value = [mock_carta1, mock_carta2]

            repo = CartaRepository()
            resultado = repo.get_cartas_de_partida(partida_id=1)

            mock_select.assert_called_once()
            assert len(resultado) == 2
            assert resultado[0].id == 1
            assert resultado[0].partida == 1
            assert resultado[1].id == 2
            assert resultado[1].partida == 1
            mock_carta1.to_dict.assert_called_once_with()
            mock_carta2.to_dict.assert_called_once_with()

    def test_get_cartas_de_partida_empty(self):
        with patch('app.data_access.carta.select') as mock_select:
            mock_select.return_value = []

            repo = CartaRepository()
            resultado = repo.get_cartas_de_partida(partida_id=999)

            mock_select.assert_called_once()
            assert len(resultado) == 0
            assert resultado == []

    def test_eliminar_cartas_de_partida_success(self):
        with patch('app.data_access.carta.delete') as mock_delete, \
             patch('app.data_access.carta.Partida') as mock_partida_class:
            #mock_partida = MagicMock(id=1)
            #mock_partida_class.get.return_value = mock_partida
            mock_delete.return_value = 5  # Simular que se eliminaron 5 cartas

            repo = CartaRepository()
            repo.eliminar_cartas_de_partida(partida_id=1)

            mock_delete.assert_called_once()

    def test_eliminar_cartas_de_partida_no_cartas(self):
        with patch('app.data_access.carta.delete') as mock_delete, \
             patch('app.data_access.carta.Partida') as mock_partida_class:
            mock_delete.return_value = 0  # Simular que no había cartas para eliminar

            repo = CartaRepository()

            with pytest.raises(ValueError, match="No hay cartas para eliminar en esta partida"):
                repo.eliminar_cartas_de_partida(partida_id=999)

            mock_delete.assert_called_once()

    def test_obtener_cartas_de_secreto_de_jugador(self):
        with patch('app.data_access.carta.select') as mock_select:
            # Mock de cartas Secret de un jugador
            mock_carta1 = MagicMock()
            mock_carta1.to_dict.return_value = {
                "id": 1, "nombre": "Secreto 1", "categoria": "Secret", "jugador": 1, "partida": 1, "id_front": 1
            }
            mock_carta2 = MagicMock()
            mock_carta2.to_dict.return_value = {
                "id": 2, "nombre": "Secreto 2", "categoria": "Secret", "jugador": 1, "partida": 1, "id_front": 1
            }
            mock_carta3 = MagicMock()
            mock_carta3.to_dict.return_value = {
                "id": 3, "nombre": "Evento", "categoria": "Event", "jugador": 1, "partida": 1, "id_front": 1  # No debería aparecer
            }

            mock_select.return_value = [mock_carta1, mock_carta2]

            repo = CartaRepository()
            resultado = repo.obtener_cartas_de_secreto_de_jugador(jugador_id=1, partida_id=1)

            mock_select.assert_called_once()
            assert len(resultado) == 2
            assert all(carta.categoria == "Secret" for carta in resultado)
            assert all(carta.jugador == 1 for carta in resultado)
            assert resultado[0].id == 1
            assert resultado[1].id == 2
            mock_carta1.to_dict.assert_called_once_with()
            mock_carta2.to_dict.assert_called_once_with()

    def test_obtener_cartas_de_secreto_de_jugador_empty(self):
        with patch('app.data_access.carta.select') as mock_select:
            mock_select.return_value = []

            repo = CartaRepository()
            resultado = repo.obtener_cartas_de_secreto_de_jugador(jugador_id=999, partida_id=1)

            mock_select.assert_called_once()
            assert len(resultado) == 0
            assert resultado == []

    def test_obtener_cartas_de_efecto_de_jugador(self):
        with patch('app.data_access.carta.select') as mock_select:
            # Mock de cartas de efecto (no Secret) de un jugador
            mock_carta1 = MagicMock()
            mock_carta1.to_dict.return_value = {
                "id": 1, "nombre": "Evento", "categoria": "Event", "jugador": 1, "partida": 1, "id_front": 1
            }
            mock_carta2 = MagicMock()
            mock_carta2.to_dict.return_value = {
                "id": 2, "nombre": "Objeto", "categoria": "Object", "jugador": 1, "partida": 1, "id_front": 1
            }
            mock_carta3 = MagicMock()
            mock_carta3.to_dict.return_value = {
                "id": 3, "nombre": "Secreto", "categoria": "Secret", "jugador": 1, "partida": 1, "id_front": 1  # No debería aparecer
            }

            mock_select.return_value = [mock_carta1, mock_carta2]

            repo = CartaRepository()
            resultado = repo.obtener_cartas_de_efecto_de_jugador(jugador_id=1, partida_id=1)

            mock_select.assert_called_once()
            assert len(resultado) == 2
            assert all(carta.categoria != "Secret" for carta in resultado)
            assert all(carta.jugador == 1 for carta in resultado)
            assert resultado[0].id == 1
            assert resultado[0].categoria == "Event"
            assert resultado[1].id == 2
            assert resultado[1].categoria == "Object"
            mock_carta1.to_dict.assert_called_once_with()
            mock_carta2.to_dict.assert_called_once_with()

    def test_obtener_cartas_de_efecto_de_jugador_empty(self):
        with patch('app.data_access.carta.select') as mock_select:
            mock_select.return_value = []

            repo = CartaRepository()
            resultado = repo.obtener_cartas_de_efecto_de_jugador(jugador_id=999, partida_id=1)

            mock_select.assert_called_once()
            assert len(resultado) == 0
            assert resultado == []
    
    def test_get_cartas_by_set(self):
        with patch('app.data_access.carta.select') as mock_select:
           
            mock_carta1 = MagicMock()
            mock_carta1.to_dict.return_value = {
                "id": 1, "nombre": "Evento", "categoria": "Detective", "jugador": 1, "partida": 1, "id_front": 1, "set": 1
            }
            mock_carta2 = MagicMock()
            mock_carta2.to_dict.return_value = {
                "id": 2, "nombre": "Objeto", "categoria": "Detective", "jugador": 1, "partida": 1, "id_front": 1, "set": 1
            }
            mock_carta3 = MagicMock()
            mock_carta3.to_dict.return_value = {
                "id": 3, "nombre": "Secreto", "categoria": "Detective", "jugador": 1, "partida": 1, "id_front": 1, "set": 1  
            }
            
            mock_select.return_value = [mock_carta1, mock_carta2, mock_carta3]
            repo = CartaRepository()
            resultado = repo.get_cartas_by_set(1, 1)

            mock_select.assert_called_once()
            assert len(resultado) == 3

