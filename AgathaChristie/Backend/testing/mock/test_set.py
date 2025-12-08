from unittest.mock import patch, MagicMock
import pytest

from app.logic.logica_jugar_cartas import jugar_set_detective_jugado, Detectives, set_check_sets
from app.logic.logica_efectos import *
from app.logic.logica import carta_intercambiar_set_entre_jugadores


class TestDetectives:

    @patch('app.logic.logica_jugar_cartas.efecto_revelar_secreto')
    def test_caso_hercule_poirot_exitoso(self, mock_efectos):
        # Configurar el mock del repositorio de cartas
        mock_efectos_instance = MagicMock()
        mock_efectos.return_value = mock_efectos_instance

        # Configurar el comportamiento esperado del mock
        mock_efectos_instance.efecto_revelar_secreto.return_value = None
        

        # Datos de prueba
        partida_id = 1
        jugador_id = 2
        cartas_jugadas_id_front = [1, 1, 1]
        objetivo_id = 3

        # Crear instancia de Detectives
        repo_detectives = Detectives()

        # Llamar al método a probar
        resultado = repo_detectives.caso_hercule_poirot(partida_id, jugador_id, cartas_jugadas_id_front, objetivo_id)

        # Verificar que el resultado es el esperado
        assert resultado is None
    
    @patch('app.logic.logica_jugar_cartas.efecto_revelar_secreto')
    def test_caso_hercule_poirot_sin_cartas(self, mock_efectos):
        # Configurar el mock del repositorio de cartas
        mock_efectos_instance = MagicMock()
        mock_efectos.return_value = mock_efectos_instance

        # Configurar el comportamiento esperado del mock
        mock_efectos_instance.efecto_revelar_secreto.side_effect = ValueError("no hay suficientes detectives en el set")

        # Datos de prueba
        partida_id = 1
        jugador_id = 2
        cartas_jugadas_id_front = []  # Sin cartas jugadas
        objetivo_id = 3

        # Crear instancia de Detectives
        repo_detectives = Detectives()

        # Llamar al método a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            repo_detectives.caso_hercule_poirot(partida_id, jugador_id, cartas_jugadas_id_front, objetivo_id)

        assert str(exc_info.value) == "no hay suficientes detectives en el set"


    @patch('app.logic.logica_jugar_cartas.efecto_revelar_secreto')
    def test_caso_hercule_poirot_cartas_invalidas(self, mock_efectos):
        # Configurar el mock del repositorio de cartas
        mock_efectos_instance = MagicMock()
        mock_efectos.return_value = mock_efectos_instance

        # Configurar el comportamiento esperado del mock
        mock_efectos_instance.efecto_revelar_secreto.side_effect = ValueError("No se puede jugar un set de detectives distintos")

        # Datos de prueba
        partida_id = 1
        jugador_id = 2
        cartas_jugadas_id_front = [999]  # Carta inexistente
        objetivo_id = 3

        # Crear instancia de Detectives
        repo_detectives = Detectives()

        # Llamar al método a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            repo_detectives.caso_hercule_poirot(partida_id, jugador_id, cartas_jugadas_id_front, objetivo_id)

        assert str(exc_info.value) == "No se puede jugar un set de detectives distintos"

    @patch('app.logic.logica_jugar_cartas.efecto_revelar_secreto')
    def test_caso_hercule_poirot_no_suficientes_cartas(self, mock_efectos):
        # Configurar el mock del repositorio de cartas
        mock_efectos_instance = MagicMock()
        mock_efectos.return_value = mock_efectos_instance

        # Configurar el comportamiento esperado del mock
        mock_efectos_instance.efecto_revelar_secreto.side_effect = ValueError("no hay suficientes detectives en el set")

        # Datos de prueba
        partida_id = 1
        jugador_id = 2
        cartas_jugadas_id_front = [1, 1]  # Menos de las necesarias
        objetivo_id = 3

        # Crear instancia de Detectives
        repo_detectives = Detectives()

        # Llamar al método a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            repo_detectives.caso_hercule_poirot(partida_id, jugador_id, cartas_jugadas_id_front, objetivo_id)

        assert str(exc_info.value) == "no hay suficientes detectives en el set"

    @patch('app.logic.logica_jugar_cartas.efecto_revelar_secreto')
    def test_caso_miss_marple_exitoso(self, mock_efectos):
        # Configurar el mock del repositorio de cartas
        mock_efectos_instance = MagicMock()
        mock_efectos.return_value = mock_efectos_instance

        # Configurar el comportamiento esperado del mock
        mock_efectos_instance.efecto_revelar_secreto.return_value = None

        # Datos de prueba
        partida_id = 1
        jugador_id = 2
        cartas_jugadas_id_front = [2, 2, 2]
        objetivo_id = 4

        # Crear instancia de Detectives
        repo_detectives = Detectives()

        # Llamar al método a probar
        resultado = repo_detectives.caso_miss_marple(partida_id, jugador_id, cartas_jugadas_id_front, objetivo_id)

        # Verificar que el resultado es el esperado
        assert resultado is None

    @patch('app.logic.logica_jugar_cartas.efecto_revelar_secreto')
    def test_caso_miss_marple_sin_cartas(self, mock_efectos):
        # Configurar el mock del repositorio de cartas
        mock_efectos_instance = MagicMock()
        mock_efectos.return_value = mock_efectos_instance

        # Configurar el comportamiento esperado del mock
        mock_efectos_instance.efecto_revelar_secreto.side_effect = ValueError("no hay suficientes detectives en el set")

        # Datos de prueba
        partida_id = 1
        jugador_id = 2
        cartas_jugadas_id_front = []  # Sin cartas jugadas
        objetivo_id = 4

        # Crear instancia de Detectives
        repo_detectives = Detectives()

        # Llamar al método a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            repo_detectives.caso_miss_marple(partida_id, jugador_id, cartas_jugadas_id_front, objetivo_id)

        assert str(exc_info.value) == "no hay suficientes detectives en el set"

    @patch('app.logic.logica_jugar_cartas.efecto_revelar_secreto')
    def test_caso_miss_marple_cartas_invalidas(self, mock_efectos):
        # Configurar el mock del repositorio de cartas
        mock_efectos_instance = MagicMock()
        mock_efectos.return_value = mock_efectos_instance

        # Configurar el comportamiento esperado del mock
        mock_efectos_instance.efecto_revelar_secreto.side_effect = ValueError("No se puede jugar un set de detectives distintos")

        # Datos de prueba
        partida_id = 1
        jugador_id = 2
        cartas_jugadas_id_front = [999]  # Carta inexistente
        objetivo_id = 4

        # Crear instancia de Detectives
        repo_detectives = Detectives()

        # Llamar al método a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            repo_detectives.caso_miss_marple(partida_id, jugador_id, cartas_jugadas_id_front, objetivo_id)

        assert str(exc_info.value) == "No se puede jugar un set de detectives distintos"

    @patch('app.logic.logica_jugar_cartas.efecto_revelar_secreto')
    def test_caso_miss_marple_no_suficientes_cartas(self, mock_efectos):
        # Configurar el mock del repositorio de cartas
        mock_efectos_instance = MagicMock()
        mock_efectos.return_value = mock_efectos_instance

        # Configurar el comportamiento esperado del mock
        mock_efectos_instance.efecto_revelar_secreto.side_effect = ValueError("no hay suficientes detectives en el set")

        # Datos de prueba
        partida_id = 1
        jugador_id = 2
        cartas_jugadas_id_front = [2, 2]  # Menos de las necesarias
        objetivo_id = 4

        # Crear instancia de Detectives
        repo_detectives = Detectives()

        # Llamar al método a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            repo_detectives.caso_miss_marple(partida_id, jugador_id, cartas_jugadas_id_front, objetivo_id)

        assert str(exc_info.value) == "no hay suficientes detectives en el set"

    
    @patch('app.logic.logica_jugar_cartas.efecto_ocultar_secreto')
    def test_caso_parker_pyne_exitoso(self, mock_efectos):
        # Configurar el mock del repositorio de cartas
        mock_efectos_instance = MagicMock()
        mock_efectos.return_value = mock_efectos_instance

        # Configurar el comportamiento esperado del mock
        mock_efectos_instance.efecto_ocultar_secreto.return_value = None

        # Datos de prueba
        partida_id = 1
        jugador_id = 2
        cartas_jugadas_id_front = [4, 4, 4]
        objetivo_id = 6

        # Crear instancia de Detectives
        repo_detectives = Detectives()

        # Llamar al método a probar
        resultado = repo_detectives.caso_parker_pyne(partida_id, jugador_id, cartas_jugadas_id_front, objetivo_id)

        # Verificar que el resultado es el esperado
        assert resultado is None

    @patch('app.logic.logica_jugar_cartas.efecto_ocultar_secreto')
    def test_caso_parker_pyne_sin_cartas(self, mock_efectos):
        # Configurar el mock del repositorio de cartas
        mock_efectos_instance = MagicMock()
        mock_efectos.return_value = mock_efectos_instance

        # Configurar el comportamiento esperado del mock
        mock_efectos_instance.efecto_ocultar_secreto.side_effect = ValueError("no hay suficientes detectives en el set")

        # Datos de prueba
        partida_id = 1
        jugador_id = 2
        cartas_jugadas_id_front = []  # Sin cartas jugadas
        objetivo_id = 6

        # Crear instancia de Detectives
        repo_detectives = Detectives()

        # Llamar al método a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            repo_detectives.caso_parker_pyne(partida_id, jugador_id, cartas_jugadas_id_front, objetivo_id)

        assert str(exc_info.value) == "no hay suficientes detectives en el set"

    @patch('app.logic.logica_jugar_cartas.efecto_ocultar_secreto')
    def test_caso_parker_pyne_cartas_invalidas(self, mock_efectos):
        # Configurar el mock del repositorio de cartas
        mock_efectos_instance = MagicMock()
        mock_efectos.return_value = mock_efectos_instance

        # Configurar el comportamiento esperado del mock
        mock_efectos_instance.efecto_ocultar_secreto.side_effect = ValueError("No se puede jugar un set de detectives distintos")

        # Datos de prueba
        partida_id = 1
        jugador_id = 2
        cartas_jugadas_id_front = [999]  # Carta inexistente
        objetivo_id = 6

        # Crear instancia de Detectives
        repo_detectives = Detectives()

        # Llamar al método a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            repo_detectives.caso_parker_pyne(partida_id, jugador_id, cartas_jugadas_id_front, objetivo_id)

        assert str(exc_info.value) == "No se puede jugar un set de detectives distintos"

    @patch('app.logic.logica_jugar_cartas.efecto_ocultar_secreto')
    def test_caso_parker_pyne_no_suficientes_cartas(self, mock_efectos):
        # Configurar el mock del repositorio de cartas
        mock_efectos_instance = MagicMock()
        mock_efectos.return_value = mock_efectos_instance

        # Configurar el comportamiento esperado del mock
        mock_efectos_instance.efecto_ocultar_secreto.side_effect = ValueError("no hay suficientes detectives en el set")

        # Datos de prueba
        partida_id = 1
        jugador_id = 2
        cartas_jugadas_id_front = [4]  # Menos de las necesarias
        objetivo_id = 6

        # Crear instancia de Detectives
        repo_detectives = Detectives()

        # Llamar al método a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            repo_detectives.caso_parker_pyne(partida_id, jugador_id, cartas_jugadas_id_front, objetivo_id)

        assert str(exc_info.value) == "no hay suficientes detectives en el set"


class TestEfectos:

    @patch('app.logic.logica_efectos.CartaRepository')
    @patch('app.logic.logica_efectos.check_desgracia')
    def test_efecto_revelar_secreto(self, mock_check_desgracia, mock_carta_repo):
        # Configurar el mock del repositorio de cartas
        mock_carta_repo_instance = MagicMock()
        mock_desgracia_instance = MagicMock()

        mock_carta_repo.return_value = mock_carta_repo_instance
        mock_check_desgracia.return_value = mock_desgracia_instance

        carta1 = MagicMock()
        carta1.id = 1
        carta1.categoria = 'Secret'
        carta1.estado = 9
        carta1.partida = 1

        # Configurar el comportamiento esperado del mock
        mock_desgracia_instance.return_value = False
        mock_carta_repo_instance.get_by_id.return_value = carta1
        mock_carta_repo_instance.cambiar_estado.return_value = 9

        # Datos de prueba
        partida_id = 1
        jugador_id = 2
        objetivo_id = 3

        resultado = efecto_revelar_secreto(partida_id, objetivo_id)

        

        # Verificar que el resultado es el esperado
        assert resultado is None

    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_revelar_secreto_carta_no_encontrada(self, mock_carta_repo):
        # Configurar el mock del repositorio de cartas
        mock_carta_repo_instance = MagicMock()
        mock_carta_repo.return_value = mock_carta_repo_instance

        # Configurar el comportamiento esperado del mock
        mock_carta_repo_instance.get_by_id.side_effect = ValueError("Carta no encontrada")

        # Datos de prueba
        partida_id = 1
        objetivo_id = 999  # Carta inexistente

        # Llamar a la función a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            efecto_revelar_secreto(partida_id, objetivo_id)

        assert str(exc_info.value) == "Carta no encontrada"

    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_revelar_secreto_carta_no_es_secreto(self, mock_carta_repo):
        # Configurar el mock del repositorio de cartas
        mock_carta_repo_instance = MagicMock()
        mock_carta_repo.return_value = mock_carta_repo_instance

        carta1 = MagicMock()
        carta1.id = 1
        carta1.categoria = 'NotSecret'  # Categoría inválida
        carta1.estado = None
        carta1.partida = 1

        # Configurar el comportamiento esperado del mock
        mock_carta_repo_instance.get_by_id.return_value = carta1

        # Datos de prueba
        partida_id = 1
        objetivo_id = 3

        # Llamar a la función a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            efecto_revelar_secreto(partida_id, objetivo_id)

        assert str(exc_info.value) == "La carta no es de tipo Secreto"

    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_revelar_secreto_carta_ya_revelada(self, mock_carta_repo):
        # Configurar el mock del repositorio de cartas
        mock_carta_repo_instance = MagicMock()
        mock_carta_repo.return_value = mock_carta_repo_instance

        carta1 = MagicMock()
        carta1.id = 1
        carta1.categoria = 'Secret'
        carta1.estado = 'Revealed'  # Estado ya revelado
        carta1.partida = 1

        # Configurar el comportamiento esperado del mock
        mock_carta_repo_instance.get_by_id.return_value = carta1

        # Datos de prueba
        partida_id = 1
        objetivo_id = 3

        # Llamar a la función a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            efecto_revelar_secreto(partida_id, objetivo_id)

        assert str(exc_info.value) == "El secreto ya esta revelado"

    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_revelar_secreto_partida_incorrecta(self, mock_carta_repo):
        # Configurar el mock del repositorio de cartas
        mock_carta_repo_instance = MagicMock()
        mock_carta_repo.return_value = mock_carta_repo_instance

        carta1 = MagicMock()
        carta1.id = 1
        carta1.categoria = 'Secret'
        carta1.estado = None
        carta1.partida = 2  # Partida incorrecta

        # Configurar el comportamiento esperado del mock
        mock_carta_repo_instance.get_by_id.return_value = carta1

        # Datos de prueba
        partida_id = 1  # Partida diferente
        objetivo_id = 3

        # Llamar a la función a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            efecto_revelar_secreto(partida_id, objetivo_id)

        assert str(exc_info.value) == "La carta no pertenece a la partida"

    @patch('app.logic.logica_efectos.JugadorRepository')
    @patch('app.logic.logica_efectos.CartaRepository')
    @patch('app.logic.logica_efectos.check_desgracia')
    def test_efecto_mover_secreto_exitoso(self, mock_check_desgracia, mock_carta_repo, mock_jugador_repo):
        # Configurar el mock del repositorio de cartas
        mock_carta_repo_instance = MagicMock()
        mock_jugador_repo_instance = MagicMock()
        mock_desgracia_instance = MagicMock()

        mock_carta_repo.return_value = mock_carta_repo_instance
        mock_jugador_repo.return_value = mock_jugador_repo_instance
        mock_check_desgracia.return_value = mock_desgracia_instance

        carta1 = MagicMock()
        carta1.id = 1
        carta1.categoria = 'Secret'
        carta1.estado = 'Revealed'
        carta1.partida = 1

        jugador1 = MagicMock()
        jugador1.id = 4
        jugador1.partida = 1

        # Configurar el comportamiento esperado del mock
        mock_desgracia_instance.return_value = False
        mock_carta_repo_instance.get_by_id.return_value = carta1
        mock_carta_repo_instance.cambiar_estado.return_value = None
        mock_jugador_repo_instance.get_by_id.return_value = jugador1

        # Datos de prueba
        partida_id = 1
        objetivo_id = 3
        nuevo_jugador_id = 4

        resultado = efecto_mover_secreto(partida_id, objetivo_id, nuevo_jugador_id)

        # Verificar que el resultado es el esperado
        assert resultado is None

    @patch('app.logic.logica_efectos.JugadorRepository')
    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_mover_secreto_carta_no_encontrada(self, mock_carta_repo, mock_jugador_repo):
        # Configurar el mock del repositorio de cartas
        mock_carta_repo_instance = MagicMock()
        mock_jugador_repo_instance = MagicMock()
        mock_carta_repo.return_value = mock_carta_repo_instance
        mock_jugador_repo.return_value = mock_jugador_repo_instance


        carta1 = MagicMock()
        carta1.id = 1
        carta1.categoria = 'Secret'
        carta1.estado = 'Revealed'
        carta1.partida = 1
        carta1.jugador = None  

        jugador1 = MagicMock()
        jugador1.id = 4
        jugador1.partida = 1

        # Configurar el comportamiento esperado del mock
        mock_carta_repo_instance.get_by_id.return_value = carta1
        mock_carta_repo_instance.cambiar_estado.return_value = None
        mock_jugador_repo_instance.get_by_id.return_value = jugador1


        # Datos de prueba
        partida_id = 1
        objetivo_id = 999  # Carta inexistente
        nuevo_jugador_id = 4

        # Llamar a la función a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            efecto_mover_secreto(partida_id, objetivo_id, nuevo_jugador_id)

        assert str(exc_info.value) == "El secreto no pertenece a ningun jugador"

    @patch('app.logic.logica_efectos.JugadorRepository')
    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_mover_secreto_carta_no_es_secreto(self, mock_carta_repo, mock_jugador_repo):
        # Configurar el mock del repositorio de cartas
        mock_carta_repo_instance = MagicMock()
        mock_jugador_repo_instance = MagicMock()
        mock_carta_repo.return_value = mock_carta_repo_instance
        mock_jugador_repo.return_value = mock_jugador_repo_instance


        carta1 = MagicMock()
        carta1.id = 1
        carta1.categoria = 'Detective'
        carta1.estado = 'Revealed'
        carta1.partida = 1

        jugador1 = MagicMock()
        jugador1.id = 4
        jugador1.partida = 1

        # Configurar el comportamiento esperado del mock
        mock_carta_repo_instance.get_by_id.return_value = carta1
        mock_carta_repo_instance.cambiar_estado.return_value = None
        mock_jugador_repo_instance.get_by_id.return_value = jugador1

        # Configurar el comportamiento esperado del mock
        mock_carta_repo_instance.get_by_id.return_value = carta1

        # Datos de prueba
        partida_id = 1
        objetivo_id = 3
        nuevo_jugador_id = 4

        # Llamar a la función a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            efecto_mover_secreto(partida_id, objetivo_id, nuevo_jugador_id)

        assert str(exc_info.value) == "La carta no es de tipo Secreto"

    @patch('app.logic.logica_efectos.JugadorRepository')
    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_mover_secreto_carta_no_revelada(self, mock_carta_repo, mock_jugador_repo):
        # Configurar el mock del repositorio de cartas
        mock_carta_repo_instance = MagicMock()
        mock_jugador_repo_instance = MagicMock()
        mock_carta_repo.return_value = mock_carta_repo_instance
        mock_jugador_repo.return_value = mock_jugador_repo_instance


        carta1 = MagicMock()
        carta1.id = 1
        carta1.categoria = 'Secret'
        carta1.estado = 9
        carta1.partida = 1

        jugador1 = MagicMock()
        jugador1.id = 4
        jugador1.partida = 1

        # Configurar el comportamiento esperado del mock
        mock_carta_repo_instance.get_by_id.return_value = carta1
        mock_carta_repo_instance.cambiar_estado.return_value = 9
        mock_jugador_repo_instance.get_by_id.return_value = jugador1


        # Configurar el comportamiento esperado del mock
        mock_carta_repo_instance.get_by_id.return_value = carta1

        # Datos de prueba
        partida_id = 1
        objetivo_id = 3
        nuevo_jugador_id = 4

        # Llamar a la función a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            efecto_mover_secreto(partida_id, objetivo_id, nuevo_jugador_id)

        assert str(exc_info.value) == "El secreto esta oculto y no se puede mover"

    @patch('app.logic.logica_efectos.JugadorRepository')
    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_mover_secreto_partida_incorrecta(self, mock_carta_repo, mock_jugador_repo):
        # Configurar el mock del repositorio de cartas
        mock_carta_repo_instance = MagicMock()
        mock_jugador_repo_instance = MagicMock()
        mock_carta_repo.return_value = mock_carta_repo_instance
        mock_jugador_repo.return_value = mock_jugador_repo_instance


        carta1 = MagicMock()
        carta1.id = 1
        carta1.categoria = 'Secret'
        carta1.estado = 'Revealed'
        carta1.partida = 1

        jugador1 = MagicMock()
        jugador1.id = 4
        jugador1.partida = 2

        # Configurar el comportamiento esperado del mock
        mock_carta_repo_instance.get_by_id.return_value = carta1
        mock_carta_repo_instance.cambiar_estado.return_value = None
        mock_jugador_repo_instance.get_by_id.return_value = jugador1

        # Configurar el comportamiento esperado del mock
        mock_carta_repo_instance.get_by_id.return_value = carta1

        # Datos de prueba
        partida_id = 1  # Partida diferente
        objetivo_id = 3
        nuevo_jugador_id = 4

        # Llamar a la función a probar y verificar que lanza la excepción esperada
        with pytest.raises(ValueError) as exc_info:
            efecto_mover_secreto(partida_id, objetivo_id, nuevo_jugador_id)

        assert str(exc_info.value) == "El nuevo jugador no pertenece a la misma partida"

class TestCheckSets:
    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    def test_check_sets(self, mock_carta_repo):

        mock_carta_repo_instance = MagicMock()
        mock_carta_repo.return_value = mock_carta_repo_instance

        carta1 = MagicMock()
        carta1.id_front = 1
        carta2 = MagicMock()
        carta2.id_front = 1
        carta3 = MagicMock()
        carta3.id_front = 1
        carta4 = MagicMock()
        carta4.id_front = 3
        carta5 = MagicMock()
        carta5.id_front = 8
        carta6 = MagicMock()
        carta6.id_front = 8

        partida_id = 1
        jugador_id = 2

        mock_carta_repo_instance.obtener_cartas_en_mano_de_jugador.return_value = [
            carta1, carta2, carta3, carta4, carta5, carta6
        ]

        resultado = set_check_sets(partida_id, jugador_id)
        assert resultado == [ [1,1,1], [1,1,8], [3,8], [1,8,8] ]
    
    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    def test_check_sets_beresford(self, mock_carta_repo):

        mock_carta_repo_instance = MagicMock()
        mock_carta_repo.return_value = mock_carta_repo_instance

        carta1 = MagicMock()
        carta1.id_front = 6
        carta2 = MagicMock()
        carta2.id_front = 6
        carta3 = MagicMock()
        carta3.id_front = 7
        carta4 = MagicMock()
        carta4.id_front = 7
        carta5 = MagicMock()
        carta5.id_front = 8
        carta6 = MagicMock()
        carta6.id_front = 8

        partida_id = 1
        jugador_id = 2

        mock_carta_repo_instance.obtener_cartas_en_mano_de_jugador.return_value = [
            carta1, carta2, carta3, carta4, carta5, carta6
        ]

        resultado = set_check_sets(partida_id, jugador_id)
        assert resultado == [ [6,6], [7,7], [6,8], [7,8], [6,7] ]


    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    @patch('app.logic.logica_jugar_cartas.Detectives')
    def test_jugar_set_detective_hercule_poirot(self, mock_detectives_class, mock_carta_repo_class):
        mock_detectives = MagicMock()
        mock_carta_repo = MagicMock()
        mock_detectives_class.return_value = mock_detectives
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de cartas con Hercule Poirot (id_front=1)
        mock_carta1 = MagicMock()
        mock_carta1.id_front = 1
        mock_carta2 = MagicMock()
        mock_carta2.id_front = 1
        mock_carta3 = MagicMock()
        mock_carta3.id_front = 1
        
        mock_carta_repo.get_by_id.side_effect = [mock_carta1, mock_carta2, mock_carta3]
        
        resultado = jugar_set_detective_jugado(
            partida_id=10, 
            jugador_id=1, 
            cartas_jugadas_id=[101, 102, 103], 
            objetivo_id=5
        )
        
        mock_detectives.caso_hercule_poirot.assert_called_once_with(10, 1, [1, 1, 1], 5)
        assert resultado == 1

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    @patch('app.logic.logica_jugar_cartas.Detectives')
    def test_jugar_set_detective_miss_marple(self, mock_detectives_class, mock_carta_repo_class):
        mock_detectives = MagicMock()
        mock_carta_repo = MagicMock()
        mock_detectives_class.return_value = mock_detectives
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de cartas con Miss Marple (id_front=2)
        mock_carta1 = MagicMock()
        mock_carta1.id_front = 2
        mock_carta2 = MagicMock()
        mock_carta2.id_front = 2
        mock_carta3 = MagicMock()
        mock_carta3.id_front = 2
        
        mock_carta_repo.get_by_id.side_effect = [mock_carta1, mock_carta2, mock_carta3]
        
        resultado = jugar_set_detective_jugado(
            partida_id=10, 
            jugador_id=1, 
            cartas_jugadas_id=[101, 102, 103], 
            objetivo_id=5
        )
        
        mock_detectives.caso_miss_marple.assert_called_once_with(10, 1, [2, 2, 2], 5)
        assert resultado == 1

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    @patch('app.logic.logica_jugar_cartas.Detectives')
    def test_jugar_set_detective_parker_pyne(self, mock_detectives_class, mock_carta_repo_class):
        mock_detectives = MagicMock()
        mock_carta_repo = MagicMock()
        mock_detectives_class.return_value = mock_detectives
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de cartas con Parker Pyne (id_front=4)
        mock_carta1 = MagicMock()
        mock_carta1.id_front = 4
        mock_carta2 = MagicMock()
        mock_carta2.id_front = 4
        
        mock_carta_repo.get_by_id.side_effect = [mock_carta1, mock_carta2]
        
        resultado = jugar_set_detective_jugado(
            partida_id=10, 
            jugador_id=1, 
            cartas_jugadas_id=[101, 102], 
            objetivo_id=5
        )
        
        mock_detectives.caso_parker_pyne.assert_called_once_with(10, 1, [4, 4], 5)
        assert resultado == 1

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    def test_jugar_set_detective_mr_satterthwaite(self, mock_carta_repo_class):
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de cartas con Mr Satterthwaite (id_front=3)
        mock_carta1 = MagicMock()
        mock_carta1.id_front = 3
        mock_carta2 = MagicMock()
        mock_carta2.id_front = 3
        
        mock_carta_repo.get_by_id.side_effect = [mock_carta1, mock_carta2]
        
        resultado = jugar_set_detective_jugado(
            partida_id=10, 
            jugador_id=1, 
            cartas_jugadas_id=[101, 102], 
            objetivo_id=5
        )
        
        assert resultado == 2

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    def test_jugar_set_detective_bundle_brent(self, mock_carta_repo_class):
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de cartas con Bundle Brent (id_front=5)
        mock_carta1 = MagicMock()
        mock_carta1.id_front = 5
        mock_carta2 = MagicMock()
        mock_carta2.id_front = 5
        
        mock_carta_repo.get_by_id.side_effect = [mock_carta1, mock_carta2]
        
        resultado = jugar_set_detective_jugado(
            partida_id=10, 
            jugador_id=1, 
            cartas_jugadas_id=[101, 102], 
            objetivo_id=5
        )
        
        assert resultado == 2

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    def test_jugar_set_detective_tommy_beresford(self, mock_carta_repo_class):
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de cartas con Tommy Beresford (id_front=6)
        mock_carta1 = MagicMock()
        mock_carta1.id_front = 6
        mock_carta2 = MagicMock()
        mock_carta2.id_front = 6
        
        mock_carta_repo.get_by_id.side_effect = [mock_carta1, mock_carta2]
        
        resultado = jugar_set_detective_jugado(
            partida_id=10, 
            jugador_id=1, 
            cartas_jugadas_id=[101, 102], 
            objetivo_id=5
        )
        
        assert resultado == 2

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    def test_jugar_set_detective_tuppence_beresford(self, mock_carta_repo_class):
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de cartas con Tuppence Beresford (id_front=7)
        mock_carta1 = MagicMock()
        mock_carta1.id_front = 7
        mock_carta2 = MagicMock()
        mock_carta2.id_front = 7
        
        mock_carta_repo.get_by_id.side_effect = [mock_carta1, mock_carta2]
        
        resultado = jugar_set_detective_jugado(
            partida_id=10, 
            jugador_id=1, 
            cartas_jugadas_id=[101, 102], 
            objetivo_id=5
        )
        
        assert resultado == 2



    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    def test_jugar_set_detective_no_cartas(self, mock_carta_repo_class):
        with pytest.raises(ValueError, match="No se jugaron cartas"):
            jugar_set_detective_jugado(
                partida_id=10, 
                jugador_id=1, 
                cartas_jugadas_id=[], 
                objetivo_id=5
            )

    @patch('app.logic.logica_jugar_cartas.CartaRepository')
    def test_jugar_set_detective_no_reconocido(self, mock_carta_repo_class):
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de carta con ID no reconocido
        mock_carta1 = MagicMock()
        mock_carta1.id_front = 99
        
        mock_carta_repo.get_by_id.return_value = mock_carta1
        
        with pytest.raises(ValueError, match="La carta no es un detective"):
            jugar_set_detective_jugado(
                partida_id=10, 
                jugador_id=1, 
                cartas_jugadas_id=[101], 
                objetivo_id=5
            )
