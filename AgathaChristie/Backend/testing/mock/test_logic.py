from re import M
import pytest
from unittest.mock import patch, MagicMock
from app.logic.logica_partida import  robar_carta
from app.logic.logica import * 
from app.logic.logica_efectos import *
from app.logic.logica_mazos import * 
class TestLogicaPartida:

    @patch('app.logic.logica.JugadorRepository')
    @patch('app.logic.logica.CartaRepository') 
    @patch('app.logic.logica.PartidaRepository')
    def test_repartir_secretos_a_jugadores_menos_de_5_jugadores(self, mock_partida_repo, mock_carta_repo, mock_jugador_repo):
        mock_partida_instance = MagicMock()
        mock_carta_instance = MagicMock()
        mock_jugador_instance = MagicMock()

        mock_partida_repo.return_value = mock_partida_instance
        mock_carta_repo.return_value = mock_carta_instance
        mock_jugador_repo.return_value = mock_jugador_instance

        mock_partida_instance.get_numero_de_jugadores.return_value = 4
        
        mock_jugador1 = MagicMock()
        mock_jugador1.id = 1
        mock_jugador2 = MagicMock()
        mock_jugador2.id = 2
        mock_jugador3 = MagicMock()
        mock_jugador3.id = 3
        mock_jugador4 = MagicMock()
        mock_jugador4.id = 4
        
        mock_jugador_instance.get_jugadores_by_partida.return_value = [
            mock_jugador1, mock_jugador2, mock_jugador3, mock_jugador4
        ]

        mock_carta_asesino = MagicMock()
        mock_carta_asesino.id = 201
        mock_carta_complice = MagicMock()
        mock_carta_complice.id = 202
        mock_carta_secreto1 = MagicMock()
        mock_carta_secreto1.id = 101
        mock_carta_secreto2 = MagicMock()
        mock_carta_secreto2.id = 102
        mock_carta_secreto3 = MagicMock()
        mock_carta_secreto3.id = 103

        cartas_secretas = [
            mock_carta_asesino, mock_carta_complice, 
            mock_carta_secreto1, mock_carta_secreto2, mock_carta_secreto3
        ]
        
        mock_carta_instance.get_secretos_by_partida.return_value = cartas_secretas
        mock_carta_instance.get_carta_de_asesino.return_value = mock_carta_asesino
        mock_carta_instance.get_carta_de_complice.return_value = mock_carta_complice

        mock_carta_instance.obtener_cartas_de_secreto_de_jugador.return_value = []

        with patch('random.choice') as mock_random_choice:
            mock_random_choice.side_effect = [
                mock_jugador1,  # Para elegir asesino
                mock_carta_secreto1, mock_carta_secreto2, mock_carta_secreto3
            ]

            repartir_secretos_a_jugadores(partida_id=1)

        mock_partida_instance.get_numero_de_jugadores.assert_called_once_with(1)
        mock_jugador_instance.get_jugadores_by_partida.assert_called_with(1)
        mock_carta_instance.get_secretos_by_partida.assert_called_once_with(1)
        mock_carta_instance.get_carta_de_asesino.assert_called_once_with(1)
        mock_carta_instance.get_carta_de_complice.assert_called_once_with(1)

        mock_carta_instance.agregar_a_jugador.assert_any_call(1, 201, 1)  # asesino
        
        complice_calls = [call for call in mock_carta_instance.agregar_a_jugador.call_args_list 
                         if call[0][1] == 202]  # id del cómplice
        assert len(complice_calls) == 0

    
    @patch('app.logic.logica.JugadorRepository')
    @patch('app.logic.logica.CartaRepository') 
    @patch('app.logic.logica.PartidaRepository')
    def test_repartir_secretos_a_jugadores_5_o_mas_jugadores(self, mock_partida_repo, mock_carta_repo, mock_jugador_repo):
        mock_partida_instance = MagicMock()
        mock_carta_instance = MagicMock()
        mock_jugador_instance = MagicMock()

        mock_partida_repo.return_value = mock_partida_instance
        mock_carta_repo.return_value = mock_carta_instance
        mock_jugador_repo.return_value = mock_jugador_instance

        # Mock de datos para 5 jugadores
        mock_partida_instance.get_numero_de_jugadores.return_value = 5
        
        # Mock de jugadores
        mock_jugador1 = MagicMock()
        mock_jugador1.id = 1
        mock_jugador2 = MagicMock()
        mock_jugador2.id = 2
        mock_jugador3 = MagicMock()
        mock_jugador3.id = 3
        mock_jugador4 = MagicMock()
        mock_jugador4.id = 4
        mock_jugador5 = MagicMock()
        mock_jugador5.id = 5
        
       
        mock_jugador_instance.get_jugadores_by_partida.return_value = [mock_jugador1, mock_jugador2, mock_jugador3, mock_jugador4, mock_jugador5]

        # Mock de cartas secretas
        mock_carta_asesino = MagicMock()
        mock_carta_asesino.id = 201
        mock_carta_complice = MagicMock()
        mock_carta_complice.id = 202
        
        mock_cartas_normales = [MagicMock() for _ in range(8)]
        for i, carta in enumerate(mock_cartas_normales):
            carta.id = 100 + i
        
        cartas_secretas_completas = [mock_carta_asesino, mock_carta_complice] + mock_cartas_normales
        
        mock_carta_instance.get_secretos_by_partida.return_value = cartas_secretas_completas
        mock_carta_instance.get_carta_de_asesino.return_value = mock_carta_asesino
        mock_carta_instance.get_carta_de_complice.return_value = mock_carta_complice

        # Mock de cartas por jugador
        mock_carta_instance.obtener_cartas_de_secreto_de_jugador.return_value = []

        with patch('random.choice') as mock_random_choice:
            mock_random_choice.side_effect = [
                mock_jugador1,  # asesino
                mock_jugador2,  # cómplice
                *mock_cartas_normales[:8]
            ]

            # Ejecutar la función - ahora no fallará porque MockList ignora remove()
            repartir_secretos_a_jugadores(partida_id=1)

        # Verificaciones
        mock_carta_instance.agregar_a_jugador.assert_any_call(1, 201, 1)  # asesino
        mock_carta_instance.agregar_a_jugador.assert_any_call(2, 202, 1)  # cómplice


    @patch('app.logic.logica.JugadorRepository')
    @patch('app.logic.logica.CartaRepository') 
    @patch('app.logic.logica.PartidaRepository')
    def test_repartir_secretos_sin_suficientes_cartas(self, mock_partida_repo, mock_carta_repo, mock_jugador_repo):
        # Mock de repositorios
        mock_partida_instance = MagicMock()
        mock_carta_instance = MagicMock()
        mock_jugador_instance = MagicMock()

        mock_partida_repo.return_value = mock_partida_instance
        mock_carta_repo.return_value = mock_carta_instance
        mock_jugador_repo.return_value = mock_jugador_instance

        # Mock de datos
        mock_partida_instance.get_numero_de_jugadores.return_value = 4
        
        # Mock de jugadores
        mock_jugadores = [MagicMock() for _ in range(4)]
        for i, jugador in enumerate(mock_jugadores):
            jugador.id = i + 1
        mock_jugador_instance.get_jugadores_by_partida.return_value = mock_jugadores

        # Mock de cartas - INCLUYENDO las especiales en la lista
        mock_carta_asesino = MagicMock()
        mock_carta_asesino.id = 201
        mock_carta_complice = MagicMock()
        mock_carta_complice.id = 202
        
        # Solo las cartas especiales, ninguna normal
        cartas_secretas = [mock_carta_asesino, mock_carta_complice]
        
        mock_carta_instance.get_secretos_by_partida.return_value = cartas_secretas
        mock_carta_instance.get_carta_de_asesino.return_value = mock_carta_asesino
        mock_carta_instance.get_carta_de_complice.return_value = mock_carta_complice

        # Mock de cartas por jugador
        mock_carta_instance.obtener_cartas_de_secreto_de_jugador.return_value = []

        with patch('random.choice') as mock_random_choice:
            mock_random_choice.return_value = mock_jugadores[0]  # asesino
            
            # Ejecutar la función (debería imprimir "No hay mas cartas disponibles.")
            with patch('builtins.print') as mock_print:
                repartir_secretos_a_jugadores(partida_id=1)
                mock_print.assert_called_with("No hay mas cartas disponibles.")


    
    @patch('app.logic.logica_partida.CartaRepository')
    @patch('app.logic.logica_partida.JugadorRepository')
    @patch('app.logic.logica_partida.MazoRepository')
    def test_robar_carta_exitoso(self, mock_mazo_repo_class, mock_jugador_repo_class, mock_carta_repo_class):
        mock_carta_repo = MagicMock()
        mock_jugador_repo = MagicMock()
        mock_mazo_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_mazo_repo_class.return_value = mock_mazo_repo

        # Configurar la carta robada con estado 3 (en mazo)
        mock_carta_robada = MagicMock()
        mock_carta_robada.id = 5
        mock_carta_robada.estado = 3  # ESTADO CORRECTO

        mock_carta_actualizada = MagicMock()
        mock_jugador = MagicMock()

        mock_mazo_repo.get_ultima_carta_id.return_value = 5
        
        # Configurar get_by_id para que retorne diferentes valores según la llamada
        mock_carta_repo.get_by_id.side_effect = [
            mock_carta_robada,    # Primera llamada: validar estado
            mock_carta_actualizada # Segunda llamada: retornar carta actualizada
        ]
        
        mock_jugador_repo.get_jugadores_by_partida.return_value = [mock_jugador]
        mock_jugador_repo.get_by_id.return_value = mock_jugador

        resultado = robar_carta(jugador_id=1, partida_id=10)

        # Verificar que get_by_id se llamó dos veces
        assert mock_carta_repo.get_by_id.call_count == 2
        mock_carta_repo.get_by_id.assert_any_call(5, 10)
        
        mock_mazo_repo.get_ultima_carta_id.assert_called_once_with(10)
        mock_mazo_repo.eliminar_carta_de_mazo_id.assert_called_once_with(10, 5)
        mock_carta_repo.agregar_a_jugador.assert_called_once_with(1, 5, 10)
        assert resultado == mock_carta_actualizada


    @patch('app.logic.logica_partida.CartaRepository')
    @patch('app.logic.logica_partida.JugadorRepository')
    @patch('app.logic.logica_partida.MazoRepository')
    def test_robar_carta_mazo_vacio(self, mock_mazo_repo_class, mock_jugador_repo_class, mock_carta_repo_class):
        mock_mazo_repo = MagicMock()
        mock_mazo_repo_class.return_value = mock_mazo_repo

        mock_mazo_repo.get_ultima_carta_id.side_effect = ValueError("El mazo esta vacio")

        with pytest.raises(ValueError, match="El mazo esta vacio"):
            robar_carta(jugador_id=1, partida_id=10)

    @patch('app.logic.logica_partida.CartaRepository')
    @patch('app.logic.logica_partida.JugadorRepository')
    @patch('app.logic.logica_partida.MazoRepository')
    def test_robar_carta_estado_incorrecto(self, mock_mazo_repo_class, mock_jugador_repo_class, mock_carta_repo_class):
        mock_carta_repo = MagicMock()
        mock_mazo_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        mock_mazo_repo_class.return_value = mock_mazo_repo

        mock_carta_robada = MagicMock()
        mock_carta_robada.id = 5
        mock_carta_robada.estado = 1

        mock_mazo_repo.get_ultima_carta_id.return_value = 5
        mock_carta_repo.get_by_id.return_value = mock_carta_robada

        with pytest.raises(ValueError, match="La carta no esta en el mazo"):
            robar_carta(jugador_id=1, partida_id=10)

    @patch('app.logic.logica_partida.CartaRepository')
    @patch('app.logic.logica_partida.JugadorRepository')
    @patch('app.logic.logica_partida.MazoRepository')
    def test_robar_carta_jugador_no_pertenece_partida(self, mock_mazo_repo_class, mock_jugador_repo_class, mock_carta_repo_class):
        mock_carta_repo = MagicMock()
        mock_jugador_repo = MagicMock()
        mock_mazo_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_mazo_repo_class.return_value = mock_mazo_repo

        mock_carta_robada = MagicMock()
        mock_carta_robada.id = 5
        mock_carta_robada.estado = 3

        mock_mazo_repo.get_ultima_carta_id.return_value = 5
        mock_carta_repo.get_by_id.return_value = mock_carta_robada
        mock_jugador_repo.get_by_id.return_value = MagicMock()
        mock_jugador_repo.get_jugadores_by_partida.return_value = [MagicMock()]

        with pytest.raises(ValueError, match="El jugador no pertenece a la partida 10"):
            robar_carta(jugador_id=1, partida_id=10)

    @patch('app.logic.logica_partida.CartaRepository')
    @patch('app.logic.logica_partida.JugadorRepository')
    @patch('app.logic.logica_partida.MazoRepository')
    def test_robar_carta_con_varias_cartas_en_mazo(self, mock_mazo_repo_class, mock_jugador_repo_class, mock_carta_repo_class):
        mock_carta_repo = MagicMock()
        mock_jugador_repo = MagicMock()
        mock_mazo_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_mazo_repo_class.return_value = mock_mazo_repo

        mismo_jugador = MagicMock()
        mock_jugador_repo.get_jugadores_by_partida.return_value = [mismo_jugador]
        mock_jugador_repo.get_by_id.return_value = mismo_jugador

        mock_mazo_repo.get_ultima_carta_id.return_value = 3
        mock_carta = MagicMock()
        mock_carta.id = 3
        mock_carta.id_front = 4
        mock_carta.nombre = "adwawd"
        mock_carta.categoria = "Event"
        mock_carta.jugador = None
        mock_carta.partida = 10
        mock_carta.estado = 3
        mock_carta_repo.get_by_id.return_value = mock_carta

        resultado = robar_carta(jugador_id=1, partida_id=10)

        mock_mazo_repo.get_ultima_carta_id.assert_called_once_with(10)
        mock_mazo_repo.eliminar_carta_de_mazo_id.assert_called_once_with(10, 3)
        mock_carta_repo.agregar_a_jugador.assert_called_once_with(1, 3, 10)

    @patch('app.logic.logica.descarte_agregar_carta_a_descarte')
    @patch('app.logic.logica.CartaRepository')
    @patch('app.logic.logica.PartidaRepository')
    @patch('app.logic.logica.TurnoRepository')
    def test_carta_descartar_carta_de_jugador_exitoso(self, mock_turno_repo_class, mock_partida_repo_class, mock_carta_repo_class, mock_descarte_agregar):
        # Mock de repositorios
        mock_partida_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_turno_repo = MagicMock()
        mock_partida_repo_class.return_value = mock_partida_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        mock_turno_repo_class.return_value = mock_turno_repo
        
        # Mock de partida existente
        mock_partida = MagicMock()
        mock_partida_repo.get_by_id.return_value = mock_partida
        
        # Mock de carta válida (en mano de jugador)
        mock_carta = MagicMock()
        mock_carta.id = 5
        mock_carta.jugador = 1
        mock_carta.estado = 1  # Estado "en mano"
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        # Ejecutar función
        resultado = carta_descartar_carta_de_jugador(carta_id=5, partida_id=10)
        
        # Verificaciones
        mock_partida_repo.get_by_id.assert_called_once_with(10)
        mock_carta_repo.get_by_id.assert_called_once_with(5, 10)
        mock_carta_repo.sacar_de_jugador.assert_called_once_with(5, 10)
        mock_carta_repo.cambiar_estado.assert_called_once_with(5, 10, 4)
        mock_descarte_agregar.assert_called_once_with(10, 5)
        assert resultado == {"message": "Carta 5 desasignada de jugador 1"}

    @patch('app.logic.logica.JugadorRepository')
    @patch('app.logic.logica.CartaRepository') 
    @patch('app.logic.logica.MazoRepository')
    @patch('app.logic.logica.PartidaRepository')
    def test_determinar_ganador_asesino_gana(self, mock_partida_repo_class, mock_mazo_repo_class, mock_carta_repo_class, mock_jugador_repo_class):
        mock_mazo_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_partida_repo = MagicMock()
        mock_jugador_repo = MagicMock()
        mock_mazo_repo_class.return_value = mock_mazo_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        mock_partida_repo_class.return_value = mock_partida_repo
        mock_jugador_repo_class.return_value = mock_jugador_repo

        mock_mazo_repo.get_ultima_carta_id.return_value = 5
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Special"
        mock_carta_repo.get_by_id.return_value = mock_carta

        mock_carta_asesino = MagicMock()
        mock_carta_asesino.jugador = 123 
        mock_carta_repo.get_carta_de_asesino.return_value = mock_carta_asesino
        
        mock_carta_complice = MagicMock()
        mock_carta_complice.jugador = 456
        mock_carta_repo.get_carta_de_complice.return_value = mock_carta_complice

        mock_partida = MagicMock()
        mock_partida.estado = False
        mock_partida_repo.get_by_id.return_value = mock_partida

        resultado = determinar_ganador(partida_id=1)
        
        mock_mazo_repo.get_ultima_carta_id.assert_called_once_with(1)
        mock_carta_repo.get_by_id.assert_called_once_with(5, 1)
        mock_partida_repo.terminar_partida.assert_called_once_with(1)
        mock_jugador_repo.sacar_jugadores_de_partida.assert_called_once_with(1)
        mock_partida_repo.eliminar_partida.assert_called_once_with(1)
        mock_partida_repo.get_by_id.assert_called_once_with(1)
        assert resultado == (False, 123, 456, 1)
        
    @patch('app.logic.logica.PartidaRepository')
    def test_carta_descartar_carta_partida_no_existe(self, mock_partida_repo_class):
        # Mock de repositorio
        mock_partida_repo = MagicMock()
        mock_partida_repo_class.return_value = mock_partida_repo
        
        # Mock de partida que no existe
        mock_partida_repo.get_by_id.return_value = None
        
        # Verificar que lanza excepción
        with pytest.raises(ValueError, match="La partida no existe"):
            carta_descartar_carta_de_jugador(carta_id=5, partida_id=10)

    @patch('app.logic.logica.CartaRepository')
    @patch('app.logic.logica.PartidaRepository')
    def test_carta_descartar_carta_sin_jugador(self, mock_partida_repo_class, mock_carta_repo_class):
        # Mock de repositorios
        mock_partida_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_partida_repo_class.return_value = mock_partida_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de partida existente
        mock_partida = MagicMock()
        mock_partida_repo.get_by_id.return_value = mock_partida
        
        # Mock de carta sin jugador asignado
        mock_carta = MagicMock()
        mock_carta.jugador = None
        mock_carta.estado = 3  # Estado diferente a 1
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        # Verificar que lanza excepción
        with pytest.raises(ValueError, match="La carta no esta asignada a ningun jugador o no esta en su mano"):
            carta_descartar_carta_de_jugador(carta_id=5, partida_id=10)

    @patch('app.logic.logica.CartaRepository')
    @patch('app.logic.logica.PartidaRepository')
    def test_carta_descartar_carta_estado_incorrecto(self, mock_partida_repo_class, mock_carta_repo_class):
        # Mock de repositorios
        mock_partida_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_partida_repo_class.return_value = mock_partida_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de partida existente
        mock_partida = MagicMock()
        mock_partida_repo.get_by_id.return_value = mock_partida
        
        # Mock de carta con jugador pero estado incorrecto
        mock_carta = MagicMock()
        mock_carta.jugador = 1
        mock_carta.estado = 2  # Estado diferente a 1 (no está en mano)
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        with pytest.raises(ValueError, match="La carta no esta asignada a ningun jugador o no esta en su mano"):
            carta_descartar_carta_de_jugador(carta_id=5, partida_id=10)




    @patch('app.logic.logica_mazos.DescarteRepository')
    def test_descarte_get_ultimas_N_cartas_mazo_suficiente(self, mock_mazo_repo_class):
        # Mock del repositorio
        mock_mazo_repo = MagicMock()
        mock_mazo_repo_class.return_value = mock_mazo_repo
        
        # Mock del mazo con 10 cartas
        mock_mazo = [MagicMock() for _ in range(10)]
        mock_mazo_repo.get_by_partida.return_value = mock_mazo
        
        # Ejecutar función
        resultado = descarte_get_ultimas_N_cartas(partida_id=1, cantidad=3)
        
        # Verificaciones
        mock_mazo_repo.get_by_partida.assert_called_once_with(1)
        assert resultado == mock_mazo[:3]  # Primeras 3 cartas
        assert len(resultado) == 3
    
    @patch('app.logic.logica.PartidaRepository')
    @patch('app.logic.logica.CartaRepository')  
    @patch('app.logic.logica.MazoRepository')  
    def test_determinar_ganador_otros_ganan(self, mock_mazo_repo_class, mock_carta_repo_class, mock_partida_repo_class):
        mock_mazo_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_partida_repo = MagicMock()
        mock_mazo_repo_class.return_value = mock_mazo_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        mock_partida_repo_class.return_value = mock_partida_repo
        
        mock_mazo_repo.get_ultima_carta_id.return_value = 8
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Event" 
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        mock_carta_asesino = MagicMock()
        mock_carta_asesino.jugador = 123
        mock_carta_asesino.estado = 0
        mock_carta_repo.get_carta_de_asesino.return_value = mock_carta_asesino

        mock_carta_complice = MagicMock()
        mock_carta_complice.jugador = 124
        mock_carta_complice.estado = 0
        mock_carta_repo.get_carta_de_complice.return_value = mock_carta_complice
        
        mock_partida = MagicMock()
        mock_partida.estado = False
        mock_partida_repo.get_by_id.return_value = mock_partida

        resultado = determinar_ganador(partida_id=1)
        
        mock_mazo_repo.get_ultima_carta_id.assert_called_once_with(1)
        mock_carta_repo.get_by_id.assert_called_once_with(8, 1)
        mock_partida_repo.terminar_partida.assert_called_once_with(1)
        mock_partida_repo.get_by_id.assert_called_once_with(1)
        assert resultado == (False, 123, 124, 0)

    @patch('app.logic.logica_efectos.CartaRepository')
    @patch('app.logic.logica.carta_intercambiar_set_entre_jugadores')
    def test_efecto_robar_set_de_jugador_exitoso(self, mock_intercambiar_set, mock_carta_repo_class):
        # Mock del repositorio
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de cartas del set
        mock_carta1 = MagicMock()
        mock_carta1.id = 101
        mock_carta1.set = 5
        mock_carta2 = MagicMock()
        mock_carta2.id = 102
        mock_carta2.set = 5
        mock_carta3 = MagicMock()
        mock_carta3.id = 103
        mock_carta3.set = 5
        
        cartas_mock = [mock_carta1, mock_carta2, mock_carta3]
        mock_carta_repo.get_cartas_by_set.return_value = cartas_mock
        
        # Ejecutar función
        efecto_robar_set_de_jugador(partida_id=1, jugador_id=2, set_id=5)
        
        # Verificaciones
        mock_carta_repo.get_cartas_by_set.assert_called_once_with(1, 5)
        mock_intercambiar_set.assert_called_once_with(2, [101, 102, 103])
    
    
    @patch('app.logic.logica_mazos.DraftRepository')
    @patch('app.logic.logica_mazos.CartaRepository')
    @patch('app.logic.logica_mazos.draft_rellenar_draft')
    def test_robar_carta_de_mazo_draft_exitoso(self, mock_draft_rellenar, mock_carta_repo_class, mock_draft_repo_class):
        # Mock de repositorios
        mock_draft_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_draft_repo_class.return_value = mock_draft_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de carta robada
        mock_carta_robada = MagicMock()
        mock_carta_robada.carta_id = 5
        mock_draft_repo.get_carta_por_posicion.return_value = mock_carta_robada
        
        # Ejecutar función
        resultado = robar_carta_de_mazo_draft(
            jugador_id=1, 
            partida_id=10, 
            posicion=2
        )
        
        # Verificaciones
        mock_draft_repo.get_carta_por_posicion.assert_called_once_with(10, 2)
        mock_carta_repo.agregar_a_jugador.assert_called_once_with(1, 5, 10)
        mock_draft_repo.eliminar_carta_de_draft_posicion.assert_called_once_with(10, 2)
        mock_draft_rellenar.assert_called_once_with(10)
        assert resultado == mock_carta_robada

    @patch('app.logic.logica_mazos.DraftRepository')
    @patch('app.logic.logica_mazos.CartaRepository')
    @patch('app.logic.logica_mazos.draft_rellenar_draft')
    def test_robar_carta_de_mazo_draft_con_diferentes_parametros(self, mock_draft_rellenar, mock_carta_repo_class, mock_draft_repo_class):
        # Mock de repositorios
        mock_draft_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_draft_repo_class.return_value = mock_draft_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de carta robada
        mock_carta_robada = MagicMock()
        mock_carta_robada.carta_id = 15
        mock_draft_repo.get_carta_por_posicion.return_value = mock_carta_robada
        
        # Ejecutar función con diferentes parámetros
        resultado = robar_carta_de_mazo_draft(
            jugador_id=3, 
            partida_id=5, 
            posicion=0
        )
        
        # Verificaciones
        mock_draft_repo.get_carta_por_posicion.assert_called_once_with(5, 0)
        mock_carta_repo.agregar_a_jugador.assert_called_once_with(3, 15, 5)
        mock_draft_repo.eliminar_carta_de_draft_posicion.assert_called_once_with(5, 0)
        mock_draft_rellenar.assert_called_once_with(5)
        assert resultado == mock_carta_robada   



    @patch('app.logic.logica_efectos.JugadorRepository')
    @patch('app.logic.logica_efectos.random')
    def test_efecto_victima_aleatoria_exitoso(self, mock_random, mock_jugador_repo_class):
        # Mock del repositorio
        mock_jugador_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        
        # Mock de jugadores no desgraciados
        mock_jugador1 = MagicMock()
        mock_jugador1.id = 1
        mock_jugador2 = MagicMock()
        mock_jugador2.id = 2
        mock_jugador3 = MagicMock()
        mock_jugador3.id = 3
        
        jugadores_mock = [mock_jugador1, mock_jugador2, mock_jugador3]
        mock_jugador_repo.get_jugadores_no_desgraciados_by_partida.return_value = jugadores_mock
        
        # Mock de random.choice para elegir un jugador específico
        mock_random.choice.return_value = mock_jugador2
        
        # Ejecutar función
        resultado = efecto_victima_aleatoria(partida_id=1)
        
        # Verificaciones
        mock_jugador_repo.get_jugadores_no_desgraciados_by_partida.assert_called_once_with(1)
        mock_random.choice.assert_called_once_with(jugadores_mock)
        assert resultado == 2  # ID del jugador elegido



    @patch('app.logic.logica_efectos.CartaRepository')
    @patch('app.logic.logica_efectos.check_desgracia')
    def test_efecto_ocultar_secreto_exitoso(self, mock_check_desgracia, mock_carta_repo_class):
        # Mock del repositorio
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de carta secreta visible (estado 0)
        mock_carta = MagicMock()
        mock_carta.categoria = "Secret"
        mock_carta.jugador = 1
        mock_carta.partida = 10
        mock_carta.estado = 0  # Visible
        
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        # Ejecutar función
        efecto_ocultar_secreto(partida_id=10, secreto_id=5)
        
        # Verificaciones
        mock_carta_repo.get_by_id.assert_called_once_with(5, 10)
        mock_carta_repo.cambiar_estado.assert_called_once_with(5, 10, 9)
        mock_check_desgracia.assert_called_once_with(1)

    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_ocultar_secreto_no_es_secreto(self, mock_carta_repo_class):
        # Mock del repositorio
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de carta que NO es secreto
        mock_carta = MagicMock()
        mock_carta.categoria = "Event"  # No es "Secret"
        mock_carta.jugador = 1
        mock_carta.partida = 10
        mock_carta.estado = 0
        
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        # Verificar que lanza excepción
        with pytest.raises(ValueError, match="La carta no es de tipo Secreto"):
            efecto_ocultar_secreto(partida_id=10, secreto_id=5)

    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_ocultar_secreto_sin_jugador(self, mock_carta_repo_class):
        # Mock del repositorio
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de carta secreta sin jugador
        mock_carta = MagicMock()
        mock_carta.categoria = "Secret"
        mock_carta.jugador = None  # Sin jugador
        mock_carta.partida = 10
        mock_carta.estado = 0
        
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        # Verificar que lanza excepción
        with pytest.raises(ValueError, match="El secreto no pertenece a ningun jugador"):
            efecto_ocultar_secreto(partida_id=10, secreto_id=5)

    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_ocultar_secreto_partida_diferente(self, mock_carta_repo_class):
        # Mock del repositorio
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de carta secreta de partida diferente
        mock_carta = MagicMock()
        mock_carta.categoria = "Secret"
        mock_carta.jugador = 1
        mock_carta.partida = 20  # Diferente a la partida solicitada (10)
        mock_carta.estado = 0
        
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        # Verificar que lanza excepción
        with pytest.raises(ValueError, match="La carta no pertenece a la partida"):
            efecto_ocultar_secreto(partida_id=10, secreto_id=5)

    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_ocultar_secreto_ya_oculto(self, mock_carta_repo_class):
        # Mock del repositorio
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de carta secreta ya oculta (estado 9)
        mock_carta = MagicMock()
        mock_carta.categoria = "Secret"
        mock_carta.jugador = 1
        mock_carta.partida = 10
        mock_carta.estado = 9  # Ya oculto
        
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        # Verificar que lanza excepción
        with pytest.raises(ValueError, match="El secreto ya esta oculto"):
            efecto_ocultar_secreto(partida_id=10, secreto_id=5)



    @patch('app.logic.logica_efectos.descarte_agregar_carta_a_descarte')
    @patch('app.logic.logica_efectos.CartaRepository')
    @patch('app.logic.logica_efectos.JugadorRepository')
    def test_efecto_descartar_not_so_fasts_exitoso(self, mock_jugador_repo_class, mock_carta_repo_class, mock_descarte_agregar):
        # Mock de repositorios
        mock_jugador_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de jugador en la partida correcta
        mock_jugador = MagicMock()
        mock_jugador.partida = 10
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        # Mock de cartas en mano (una es Instant)
        mock_carta_instant = MagicMock()
        mock_carta_instant.id = 101
        mock_carta_instant.categoria = "Instant"
        
        mock_carta_event = MagicMock()
        mock_carta_event.id = 102
        mock_carta_event.categoria = "Event"
        
        mock_carta_repo.obtener_cartas_en_mano_de_jugador.return_value = [mock_carta_instant, mock_carta_event]
        
        # Ejecutar función
        efecto_descartar_not_so_fasts(partida_id=10, jugador_id=1)
        
        # Verificaciones - solo debería descartar la carta Instant
        mock_jugador_repo.get_by_id.assert_called_once_with(1)
        mock_carta_repo.obtener_cartas_en_mano_de_jugador.assert_called_once_with(1, 10)
        mock_carta_repo.sacar_de_jugador.assert_called_once_with(101, 10)
        mock_carta_repo.cambiar_estado.assert_called_once_with(101, 10, 4)
        mock_descarte_agregar.assert_called_once_with(10, 101)

    @patch('app.logic.logica_efectos.JugadorRepository')
    def test_efecto_descartar_not_so_fasts_jugador_partida_diferente(self, mock_jugador_repo_class):
        # Mock del repositorio
        mock_jugador_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        
        # Mock de jugador en partida diferente
        mock_jugador = MagicMock()
        mock_jugador.partida = 20
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        # Verificar que lanza excepción
        with pytest.raises(ValueError, match="El jugador no pertenece a la partida"):
            efecto_descartar_not_so_fasts(partida_id=10, jugador_id=1)



    @patch('app.logic.logica_efectos.CartaRepository')
    @patch('app.logic.logica_efectos.TurnoRepository')
    def test_efecto_chancho_va_derecha(self, mock_turno_repo_class, mock_carta_repo_class):
        # Mock de repositorios
        mock_turno_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_turno_repo_class.return_value = mock_turno_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de turnos
        mock_turno1 = MagicMock()
        mock_turno1.jugador = 1
        mock_turno1.turno = 0
        
        mock_turno2 = MagicMock()
        mock_turno2.jugador = 2
        mock_turno2.turno = 1
        
        mock_turno3 = MagicMock()
        mock_turno3.jugador = 3
        mock_turno3.turno = 2
        
        mock_turno_repo.get_turnos_by_partida.return_value = [mock_turno1, mock_turno2, mock_turno3]
        mock_turno_repo.get_turno_by_id.return_value = mock_turno1  # Jugador 1, turno 0
        
        # Ejecutar función (dirección derecha: +1)
        efecto_chancho_va(partida_id=10, jugador_id=1, carta_id=101, direccion=1)
        
        # Verificaciones - debería mover la carta al jugador 2 (turno 1)
        mock_turno_repo.get_turnos_by_partida.assert_called_once_with(10)
        mock_turno_repo.get_turno_by_id.assert_called_once_with(10, 1)
        mock_carta_repo.agregar_a_jugador.assert_called_once_with(2, 101, 10)

    @patch('app.logic.logica_efectos.CartaRepository')
    @patch('app.logic.logica_efectos.TurnoRepository')
    def test_efecto_chancho_va_izquierda(self, mock_turno_repo_class, mock_carta_repo_class):
        # Mock de repositorios
        mock_turno_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_turno_repo_class.return_value = mock_turno_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de turnos
        mock_turno1 = MagicMock()
        mock_turno1.jugador = 1
        mock_turno1.turno = 0
        
        mock_turno2 = MagicMock()
        mock_turno2.jugador = 2
        mock_turno2.turno = 1
        
        mock_turno3 = MagicMock()
        mock_turno3.jugador = 3
        mock_turno3.turno = 2
        
        mock_turno_repo.get_turnos_by_partida.return_value = [mock_turno1, mock_turno2, mock_turno3]
        mock_turno_repo.get_turno_by_id.return_value = mock_turno2  # Jugador 2, turno 1
        
        # Ejecutar función (dirección izquierda: -1)
        efecto_chancho_va(partida_id=10, jugador_id=2, carta_id=101, direccion=-1)
        
        # Verificaciones - debería mover la carta al jugador 1 (turno 0)
        mock_carta_repo.agregar_a_jugador.assert_called_once_with(1, 101, 10)



    @patch('app.logic.logica_efectos.descarte_sacar_carta_por_id')
    @patch('app.logic.logica_efectos.CartaRepository')
    @patch('app.logic.logica_efectos.JugadorRepository')
    def test_efecto_roba_del_descarte_exitoso(self, mock_jugador_repo_class, mock_carta_repo_class, mock_descarte_sacar):
        # Mock de repositorios
        mock_jugador_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de jugador en la partida correcta
        mock_jugador = MagicMock()
        mock_jugador.partida = 10
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        # Mock de carta en descarte
        mock_carta = MagicMock()
        mock_carta.estado = 4  # En descarte
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        # Ejecutar función
        efecto_roba_del_descarte(partida_id=10, jugador_id=1, carta_id=101)
        
        # Verificaciones
        mock_jugador_repo.get_by_id.assert_called_once_with(1)
        mock_carta_repo.get_by_id.assert_called_once_with(101, 10)
        mock_carta_repo.agregar_a_jugador.assert_called_once_with(1, 101, 10)
        mock_descarte_sacar.assert_called_once_with(10, 101)

    @patch('app.logic.logica_efectos.JugadorRepository')
    def test_efecto_roba_del_descarte_jugador_partida_diferente(self, mock_jugador_repo_class):
        # Mock del repositorio
        mock_jugador_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        
        # Mock de jugador en partida diferente
        mock_jugador = MagicMock()
        mock_jugador.partida = 20
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        # Verificar que lanza excepción
        with pytest.raises(ValueError, match="El jugador no pertenece a la partida"):
            efecto_roba_del_descarte(partida_id=10, jugador_id=1, carta_id=101)

    @patch('app.logic.logica_efectos.CartaRepository')
    @patch('app.logic.logica_efectos.JugadorRepository')
    def test_efecto_roba_del_descarte_carta_no_en_descarte(self, mock_jugador_repo_class, mock_carta_repo_class):
        # Mock de repositorios
        mock_jugador_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de jugador en la partida correcta
        mock_jugador = MagicMock()
        mock_jugador.partida = 10
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        # Mock de carta NO en descarte
        mock_carta = MagicMock()
        mock_carta.estado = 1  # En mano, no en descarte
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        # Verificar que lanza excepción
        with pytest.raises(ValueError, match="La carta no esta en el descarte"):
            efecto_roba_del_descarte(partida_id=10, jugador_id=1, carta_id=101)


    @patch('app.logic.logica_efectos.check_desgracia')
    @patch('app.logic.logica_efectos.CartaRepository')
    @patch('app.logic.logica_efectos.JugadorRepository')
    def test_efecto_roba_secreto_exitoso(self, mock_jugador_repo_class, mock_carta_repo_class, mock_check_desgracia):
        # Mock de repositorios
        mock_jugador_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de jugador en la partida correcta
        mock_jugador = MagicMock()
        mock_jugador.partida = 10
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        # Mock de carta secreta revelada
        mock_carta = MagicMock()
        mock_carta.categoria = "Secret"
        mock_carta.partida = 10
        mock_carta.estado = 0  # Revelado
        mock_carta.jugador = 2  # Jugador anterior
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        # Ejecutar función
        efecto_roba_secreto(partida_id=10, secreto_id=101, jugador_id=1)
        
        # Verificaciones
        mock_jugador_repo.get_by_id.assert_called_once_with(1)
        mock_carta_repo.get_by_id.assert_called_once_with(101, 10)
        mock_carta_repo.agregar_a_jugador.assert_called_once_with(1, 101, 10)
        mock_carta_repo.cambiar_estado.assert_called_once_with(101, 10, 9)
        mock_check_desgracia.assert_any_call(1)  # Nuevo jugador
        mock_check_desgracia.assert_any_call(2)  # Jugador anterior

    @patch('app.logic.logica_efectos.JugadorRepository')
    def test_efecto_roba_secreto_jugador_partida_diferente(self, mock_jugador_repo_class):
        # Mock del repositorio
        mock_jugador_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        
        # Mock de jugador en partida diferente
        mock_jugador = MagicMock()
        mock_jugador.partida = 20
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        # Verificar que lanza excepción
        with pytest.raises(ValueError, match="El jugador no pertenece a la partida"):
            efecto_roba_secreto(partida_id=10, secreto_id=101, jugador_id=1)

    @patch('app.logic.logica_efectos.CartaRepository')
    @patch('app.logic.logica_efectos.JugadorRepository')
    def test_efecto_roba_secreto_no_es_secreto(self, mock_jugador_repo_class, mock_carta_repo_class):
        # Mock de repositorios
        mock_jugador_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de jugador en la partida correcta
        mock_jugador = MagicMock()
        mock_jugador.partida = 10
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        # Mock de carta que NO es secreto
        mock_carta = MagicMock()
        mock_carta.categoria = "Event"
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        # Verificar que lanza excepción
        with pytest.raises(ValueError, match="La carta no es de tipo Secreto"):
            efecto_roba_secreto(partida_id=10, secreto_id=101, jugador_id=1)

    @patch('app.logic.logica_efectos.CartaRepository')
    @patch('app.logic.logica_efectos.JugadorRepository')
    def test_efecto_roba_secreto_no_revelado(self, mock_jugador_repo_class, mock_carta_repo_class):
        # Mock de repositorios
        mock_jugador_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de jugador en la partida correcta
        mock_jugador = MagicMock()
        mock_jugador.partida = 10
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        # Mock de carta secreta NO revelada
        mock_carta = MagicMock()
        mock_carta.categoria = "Secret"
        mock_carta.partida = 10
        mock_carta.estado = 9  # Oculto, no revelado
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        # Verificar que lanza excepción
        with pytest.raises(ValueError, match="El secreto no esta revelado"):
            efecto_roba_secreto(partida_id=10, secreto_id=101, jugador_id=1)



    @patch('app.logic.logica_efectos.mazo_robar_ultima_carta_mazo')
    @patch('app.logic.logica_efectos.descarte_agregar_carta_a_descarte')
    @patch('app.logic.logica_efectos.mazo_get_ultimas_6_cartas')
    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_descartar_6_desde_mazo_exitoso(self, mock_carta_repo_class, mock_mazo_get, mock_descarte_agregar, mock_mazo_robar):
        # Mock de repositorio
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de 6 cartas del mazo
        mock_cartas = []
        for i in range(6):
            mock_carta = MagicMock()
            mock_carta.carta_id = 100 + i
            mock_cartas.append(mock_carta)
        
        mock_mazo_get.return_value = mock_cartas
        
        # Ejecutar función
        efecto_descartar_6_desde_mazo(partida_id=10)
        
        # Verificaciones - debería procesar las 6 cartas
        mock_mazo_get.assert_called_once_with(10)
        assert mock_carta_repo.cambiar_estado.call_count == 6
        assert mock_descarte_agregar.call_count == 6
        assert mock_mazo_robar.call_count == 6
        
        # Verificar que se llamó con los IDs correctos
        for i in range(6):
            mock_carta_repo.cambiar_estado.assert_any_call(100 + i, 10, 4)
            mock_descarte_agregar.assert_any_call(10, 100 + i)


    @patch('app.logic.logica.carta_intercambiar_set_entre_jugadores')
    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_robar_set_de_jugador_exitoso(self, mock_carta_repo_class, mock_intercambiar_set):
        # Mock del repositorio
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de cartas del set
        mock_carta1 = MagicMock()
        mock_carta1.id = 101
        mock_carta2 = MagicMock()
        mock_carta2.id = 102
        mock_carta3 = MagicMock()
        mock_carta3.id = 103
        
        mock_carta_repo.get_cartas_by_set.return_value = [mock_carta1, mock_carta2, mock_carta3]
        
        # Ejecutar función
        efecto_robar_set_de_jugador(partida_id=10, jugador_id=1, set_id=5)
        
        # Verificaciones
        mock_carta_repo.get_cartas_by_set.assert_called_once_with(10, 5)
        mock_intercambiar_set.assert_called_once_with(1, [101, 102, 103])



    @patch('app.logic.logica_efectos.descarte_sacar_ultima_carta_de_descarte')
    @patch('app.logic.logica_efectos.mazo_agregar_carta_a_mazo')
    @patch('app.logic.logica_efectos.descarte_get_ultimas_N_cartas')
    @patch('app.logic.logica_efectos.CartaRepository')
    @patch('app.logic.logica_efectos.shuffle')
    def test_efecto_recartar_descarte_a_mazo_n_exitoso(self, mock_shuffle, mock_carta_repo_class, mock_descarte_get, mock_mazo_agregar, mock_descarte_sacar):
        # Mock de repositorio
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Mock de cartas del descarte
        mock_cartas = []
        for i in range(3):
            mock_carta = MagicMock()
            mock_carta.carta_id = 100 + i
            mock_cartas.append(mock_carta)
        
        mock_descarte_get.return_value = mock_cartas
        
        # Ejecutar función
        efecto_recartar_descarte_a_mazo_n(partida_id=10, cantidad=3)
        
        # Verificaciones
        mock_descarte_get.assert_called_once_with(10, 3)
        mock_shuffle.assert_called_once_with(mock_cartas)
        assert mock_carta_repo.cambiar_estado.call_count == 3
        assert mock_mazo_agregar.call_count == 3
        assert mock_descarte_sacar.call_count == 3



    @patch('app.logic.logica_efectos.random')
    @patch('app.logic.logica_efectos.JugadorRepository')
    def test_efecto_victima_aleatoria_exitoso(self, mock_jugador_repo_class, mock_random):
        # Mock del repositorio
        mock_jugador_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        
        # Mock de jugadores no desgraciados
        mock_jugador1 = MagicMock()
        mock_jugador1.id = 1
        mock_jugador2 = MagicMock()
        mock_jugador2.id = 2
        mock_jugador3 = MagicMock()
        mock_jugador3.id = 3
        
        jugadores_mock = [mock_jugador1, mock_jugador2, mock_jugador3]
        mock_jugador_repo.get_jugadores_no_desgraciados_by_partida.return_value = jugadores_mock
        
        # Mock de random.choice para elegir un jugador específico
        mock_random.choice.return_value = mock_jugador2
        
        # Ejecutar función
        resultado = efecto_victima_aleatoria(partida_id=10)
        
        # Verificaciones
        mock_jugador_repo.get_jugadores_no_desgraciados_by_partida.assert_called_once_with(10)
        mock_random.choice.assert_called_once_with(jugadores_mock)
        assert resultado == 2  # ID del jugador elegido



    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_intercambiar_carta_exitoso(self, mock_carta_repo_class):
        # Mock del repositorio
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        # Ejecutar función
        resultado = efecto_intercambiar_carta(
            partida_id=10, 
            jugador_id=1, 
            objetivo_id=2, 
            carta_id=101
        )
        
        # Verificaciones
        mock_carta_repo.agregar_a_jugador.assert_called_once_with(2, 101, 10)
        assert resultado == {"message": "Carta 101 intercambiada a jugador 1, en partida 10"}


    @patch('app.logic.logica_efectos.CartaRepository')
    @patch('app.logic.logica_efectos.JugadorRepository')
    def test_efecto_devolver_set_a_mano_exitoso(self, mock_jugador_repo_class, mock_carta_repo_class):
        mock_jugador_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_jugador = MagicMock()
        mock_jugador.partida = 10
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        efecto_devolver_set_a_mano(partida_id=10, jugador_id=1, set_ids=[101, 102])
        
        mock_carta_repo.cambiar_estado.assert_any_call(101, 10, 1)
        mock_carta_repo.cambiar_estado.assert_any_call(102, 10, 1)

    @patch('app.logic.logica_efectos.JugadorRepository')
    def test_efecto_devolver_set_a_mano_jugador_partida_diferente(self, mock_jugador_repo_class):
        mock_jugador_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        
        mock_jugador = MagicMock()
        mock_jugador.partida = 20
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        with pytest.raises(ValueError, match="El jugador no pertenece a la partida"):
            efecto_devolver_set_a_mano(partida_id=10, jugador_id=1, set_ids=[101])

class TestEfectoRevelarSecretoPropio:

    @patch('app.logic.logica_efectos.check_desgracia')
    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_revelar_secreto_propio_exitoso(self, mock_carta_repo_class, mock_check_desgracia):
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Secret"
        mock_carta.partida = 10
        mock_carta.jugador = 1
        mock_carta.estado = 9
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        efecto_revelar_secreto_propio(partida_id=10, jugador_id=1, secreto_id=5)
        
        mock_carta_repo.cambiar_estado.assert_called_once_with(5, 10, 0)
        mock_check_desgracia.assert_called_once_with(1)

    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_revelar_secreto_propio_no_es_secreto(self, mock_carta_repo_class):
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Event"
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        with pytest.raises(ValueError, match="La carta no es de tipo Secreto"):
            efecto_revelar_secreto_propio(partida_id=10, jugador_id=1, secreto_id=5)

    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_revelar_secreto_propio_partida_diferente(self, mock_carta_repo_class):
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Secret"
        mock_carta.partida = 20
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        with pytest.raises(ValueError, match="La carta no pertenece a la partida"):
            efecto_revelar_secreto_propio(partida_id=10, jugador_id=1, secreto_id=5)

    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_revelar_secreto_propio_no_pertenece_jugador(self, mock_carta_repo_class):
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Secret"
        mock_carta.partida = 10
        mock_carta.jugador = 2
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        with pytest.raises(ValueError, match="El secreto no le pertenece al jugador"):
            efecto_revelar_secreto_propio(partida_id=10, jugador_id=1, secreto_id=5)

    @patch('app.logic.logica_efectos.CartaRepository')
    def test_efecto_revelar_secreto_propio_ya_revelado(self, mock_carta_repo_class):
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Secret"
        mock_carta.partida = 10
        mock_carta.jugador = 1
        mock_carta.estado = 0
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        with pytest.raises(ValueError, match="El secreto ya esta revelado"):
            efecto_revelar_secreto_propio(partida_id=10, jugador_id=1, secreto_id=5)


    @patch('app.logic.logica.CartaRepository')
    @patch('app.logic.logica.JugadorRepository')
    def test_carta_agregar_detective_a_set_exitoso(self, mock_jugador_repo_class, mock_carta_repo_class):
        mock_jugador_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_jugador = MagicMock()
        mock_jugador.partida = 10
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Detective"
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        # Crear mocks para las cartas del set
        mock_carta_set1 = MagicMock()
        mock_carta_set1.set = 5
        mock_carta_set1.jugador = 2
        
        mock_carta_set2 = MagicMock()
        mock_carta_set2.set = 5
        mock_carta_set2.jugador = 2
        
        # Configurar side_effect para diferentes llamadas
        mock_carta_repo.get_cartas_by_set.side_effect = [
            [mock_carta_set1],  # Primera llamada: verificación del set
            [mock_carta_set1, mock_carta_set2]  # Segunda llamada: set completo después de agregar
        ]
        
        resultado = carta_agregar_detective_a_set(partida_id=10, jugador_id=1, carta_id=101, set_id=5)
        
        mock_carta_repo.agregar_carta_a_set.assert_called_once_with(10, 101, 2, 5)
        assert resultado == [mock_carta_set1, mock_carta_set2]

    @patch('app.logic.logica.CartaRepository')
    @patch('app.logic.logica.JugadorRepository')
    def test_carta_agregar_detective_a_set_jugador_partida_diferente(self, mock_jugador_repo_class, mock_carta_repo_class):
        mock_jugador_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        
        mock_jugador = MagicMock()
        mock_jugador.partida = 20
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        with pytest.raises(ValueError, match="El jugador no esta en esta partida"):
            carta_agregar_detective_a_set(partida_id=10, jugador_id=1, carta_id=101, set_id=5)

    @patch('app.logic.logica.CartaRepository')
    @patch('app.logic.logica.JugadorRepository')
    def test_carta_agregar_detective_a_set_no_es_detective(self, mock_jugador_repo_class, mock_carta_repo_class):
        mock_jugador_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_jugador = MagicMock()
        mock_jugador.partida = 10
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        mock_carta = MagicMock()
        mock_carta.categoria = "Event"
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        with pytest.raises(ValueError, match="No se puede agregar una carta que no es detective a un set de detectives"):
            carta_agregar_detective_a_set(partida_id=10, jugador_id=1, carta_id=101, set_id=5)

    @patch('app.logic.logica.CartaRepository')
    @patch('app.logic.logica.JugadorRepository')
    def test_sets_de_partida(self, mock_jugador_repo_class, mock_carta_repo_class):
        mock_jugador_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_jugador1 = MagicMock()
        mock_jugador1.id = 1
        mock_jugador2 = MagicMock()
        mock_jugador2.id = 2
        
        mock_jugador_repo.get_jugadores_by_partida.return_value = [mock_jugador1, mock_jugador2]
        
        mock_carta1 = MagicMock()
        mock_carta1.set = 5
        mock_carta1.model_dump.return_value = {"id": 101}
        
        mock_carta_repo.get_all_sets.side_effect = [[mock_carta1], []]
        
        resultado = sets_de_partida(partida_id=10)
        
        assert 1 in resultado
        assert 2 in resultado
        assert resultado[2] == {}

    @patch('app.logic.logica.CartaRepository')
    @patch('app.logic.logica.JugadorRepository')
    def test_carta_intercambiar_set_entre_jugadores_exitoso(self, mock_jugador_repo_class, mock_carta_repo_class):
        mock_jugador_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_jugador = MagicMock()
        mock_jugador.partida = 10
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        resultado = carta_intercambiar_set_entre_jugadores(jugador_id=1, cartas_jugadas_id=[101, 102, 103])
        
        assert mock_carta_repo.intercambiar_set_a_jugador.call_count == 3
        assert "Set intercambiado" in resultado["message"]

    @patch('app.logic.logica.JugadorRepository')
    def test_carta_intercambiar_set_entre_jugadores_sin_partida(self, mock_jugador_repo_class):
        mock_jugador_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        
        mock_jugador = MagicMock()
        mock_jugador.partida = None
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        with pytest.raises(ValueError, match="El jugador no esta en una partida"):
            carta_intercambiar_set_entre_jugadores(jugador_id=1, cartas_jugadas_id=[101, 102])

    @patch('app.logic.logica.random')
    @patch('app.logic.logica.PartidaRepository')
    @patch('app.logic.logica.CartaRepository')
    @patch('app.logic.logica.JugadorRepository')
    def test_repartir_secretos_a_jugadores_menos_5(self, mock_jugador_repo_class, mock_carta_repo_class, mock_partida_repo_class, mock_random):
        mock_jugador_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_partida_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        mock_partida_repo_class.return_value = mock_partida_repo
        
        mock_partida_repo.get_numero_de_jugadores.return_value = 4
        
        mock_jugador1 = MagicMock()
        mock_jugador1.id = 1
        mock_jugador2 = MagicMock()
        mock_jugador2.id = 2
        
        mock_jugador_repo.get_jugadores_by_partida.return_value = [mock_jugador1, mock_jugador2]
        
        mock_carta_asesino = MagicMock()
        mock_carta_asesino.id = 201
        mock_carta_complice = MagicMock()
        mock_carta_complice.id = 202
        mock_carta_secreto = MagicMock()
        mock_carta_secreto.id = 101
        
        mock_carta_repo.get_secretos_by_partida.return_value = [mock_carta_asesino, mock_carta_complice, mock_carta_secreto]
        mock_carta_repo.get_carta_de_asesino.return_value = mock_carta_asesino
        mock_carta_repo.get_carta_de_complice.return_value = mock_carta_complice
        mock_carta_repo.obtener_cartas_de_secreto_de_jugador.return_value = []
        
        mock_random.choice.side_effect = [mock_jugador1, mock_carta_secreto]
        
        repartir_secretos_a_jugadores(partida_id=10)
        
        mock_carta_repo.agregar_a_jugador.assert_any_call(1, 201, 10)

    @patch('app.logic.logica.random')
    @patch('app.logic.logica.PartidaRepository')
    @patch('app.logic.logica.CartaRepository')
    @patch('app.logic.logica.JugadorRepository')
    def test_repartir_secretos_a_jugadores_5_o_mas(self, mock_jugador_repo_class, mock_carta_repo_class, mock_partida_repo_class, mock_random):
        mock_jugador_repo = MagicMock()
        mock_carta_repo = MagicMock()
        mock_partida_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_carta_repo_class.return_value = mock_carta_repo
        mock_partida_repo_class.return_value = mock_partida_repo
        
        mock_partida_repo.get_numero_de_jugadores.return_value = 5
        
        mock_jugador1 = MagicMock()
        mock_jugador1.id = 1
        mock_jugador2 = MagicMock()
        mock_jugador2.id = 2
        mock_jugador3 = MagicMock()
        mock_jugador3.id = 3
        
        mock_jugador_repo.get_jugadores_by_partida.return_value = [mock_jugador1, mock_jugador2, mock_jugador3]
        
        mock_carta_asesino = MagicMock()
        mock_carta_asesino.id = 201
        mock_carta_complice = MagicMock()
        mock_carta_complice.id = 202
        mock_carta_secreto = MagicMock()
        mock_carta_secreto.id = 101
        
        mock_carta_repo.get_secretos_by_partida.return_value = [mock_carta_asesino, mock_carta_complice, mock_carta_secreto]
        mock_carta_repo.get_carta_de_asesino.return_value = mock_carta_asesino
        mock_carta_repo.get_carta_de_complice.return_value = mock_carta_complice
        mock_carta_repo.obtener_cartas_de_secreto_de_jugador.return_value = []
        
        mock_random.choice.side_effect = [mock_jugador1, mock_jugador2, mock_carta_secreto]
        
        repartir_secretos_a_jugadores(partida_id=10)
        
        mock_carta_repo.agregar_a_jugador.assert_any_call(1, 201, 10)
        mock_carta_repo.agregar_a_jugador.assert_any_call(2, 202, 10)

    @patch('app.logic.logica.db_session')
    @patch('app.logic.logica.CartaRepository')
    def test_cartas_jugar_en_mesa_exitoso(self, mock_carta_repo_class, mock_db_session):
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.jugador = 1
        mock_carta.estado = 1
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        cartas_jugar_en_mesa(partida_id=10, jugador_id=1, carta_id=101, set=5)
        
        mock_carta_repo.set_set.assert_called_once_with(10, 101, 5)
        mock_carta_repo.cambiar_estado.assert_called_once_with(101, 10, 2)

    @patch('app.logic.logica.db_session')
    @patch('app.logic.logica.CartaRepository')
    def test_cartas_jugar_en_mesa_no_pertenece_jugador(self, mock_carta_repo_class, mock_db_session):
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.jugador = 2  # Diferente al jugador_id=1
        mock_carta.estado = 1
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        with pytest.raises(ValueError, match="La carta no pertenece al jugador"):
            cartas_jugar_en_mesa(partida_id=10, jugador_id=1, carta_id=101, set=5)

    @patch('app.logic.logica.db_session')
    @patch('app.logic.logica.CartaRepository')
    def test_cartas_jugar_en_mesa_no_en_mano(self, mock_carta_repo_class, mock_db_session):
        mock_carta_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        
        mock_carta = MagicMock()
        mock_carta.jugador = 1
        mock_carta.estado = 2  # No está en mano (estado 1)
        mock_carta_repo.get_by_id.return_value = mock_carta
        
        with pytest.raises(ValueError, match="La carta no esta en la mano del jugador"):
            cartas_jugar_en_mesa(partida_id=10, jugador_id=1, carta_id=101, set=5)


    @patch('app.logic.logica.PartidaRepository')
    @patch('app.logic.logica.JugadorRepository')
    @patch('app.logic.logica.CartaRepository')
    def test_carta_consultar_secretos_de_jugador_exitoso(self, mock_carta_repo_class, mock_jugador_repo_class, mock_partida_repo_class):
        mock_carta_repo = MagicMock()
        mock_jugador_repo = MagicMock()
        mock_partida_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_partida_repo_class.return_value = mock_partida_repo
        
        mock_jugador = MagicMock()
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        mock_partida = MagicMock()
        mock_partida_repo.get_by_id.return_value = mock_partida
        
        mock_jugador_repo.get_jugadores_by_partida.return_value = [mock_jugador]
        
        mock_secretos = ["secreto1", "secreto2"]
        mock_carta_repo.obtener_cartas_de_secreto_de_jugador.return_value = mock_secretos
        
        resultado = carta_consultar_secretos_de_jugador(jugador_id=1, partida_id=10)
        
        assert resultado == mock_secretos

    @patch('app.logic.logica.JugadorRepository')
    def test_carta_consultar_secretos_de_jugador_no_existe(self, mock_jugador_repo_class):
        mock_jugador_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        
        mock_jugador_repo.get_by_id.return_value = None
        
        with pytest.raises(ValueError, match="El jugador 1 no existe"):
            carta_consultar_secretos_de_jugador(jugador_id=1, partida_id=10)

    @patch('app.logic.logica.PartidaRepository')
    @patch('app.logic.logica.JugadorRepository')
    def test_carta_consultar_secretos_de_jugador_partida_no_existe(self, mock_jugador_repo_class, mock_partida_repo_class):
        mock_jugador_repo = MagicMock()
        mock_partida_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_partida_repo_class.return_value = mock_partida_repo
        
        mock_jugador = MagicMock()
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        mock_partida_repo.get_by_id.return_value = None
        
        with pytest.raises(ValueError, match="La partida 10 no existe"):
            carta_consultar_secretos_de_jugador(jugador_id=1, partida_id=10)

    @patch('app.logic.logica.PartidaRepository')
    @patch('app.logic.logica.JugadorRepository')
    def test_carta_consultar_secretos_de_jugador_no_pertenece_partida(self, mock_jugador_repo_class, mock_partida_repo_class):
        mock_jugador_repo = MagicMock()
        mock_partida_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_partida_repo_class.return_value = mock_partida_repo
        
        mock_jugador = MagicMock()
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        mock_partida = MagicMock()
        mock_partida_repo.get_by_id.return_value = mock_partida
        
        mock_jugador_repo.get_jugadores_by_partida.return_value = []  # Jugador no está en la partida
        
        with pytest.raises(ValueError, match="El jugador 1 no pertenece a la partida 10"):
            carta_consultar_secretos_de_jugador(jugador_id=1, partida_id=10)

    @patch('app.logic.logica.PartidaRepository')
    @patch('app.logic.logica.JugadorRepository')
    @patch('app.logic.logica.CartaRepository')
    def test_carta_consultar_not_so_fast_exitoso(self, mock_carta_repo_class, mock_jugador_repo_class, mock_partida_repo_class):
        mock_carta_repo = MagicMock()
        mock_jugador_repo = MagicMock()
        mock_partida_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_partida_repo_class.return_value = mock_partida_repo
        
        mock_jugador = MagicMock()
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        mock_partida = MagicMock()
        mock_partida_repo.get_by_id.return_value = mock_partida
        
        mock_jugador_repo.get_jugadores_by_partida.return_value = [mock_jugador]
        
        mock_carta_instant = MagicMock()
        mock_carta_instant.categoria = "Instant"
        mock_carta_event = MagicMock()
        mock_carta_event.categoria = "Event"
        mock_carta_detective = MagicMock()
        mock_carta_detective.categoria = "Detective"
        
        mock_carta_repo.obtener_cartas_en_mano_de_jugador.return_value = [
            mock_carta_instant, mock_carta_event, mock_carta_detective, mock_carta_instant
        ]
        
        resultado = carta_consultar_not_so_fast(jugador_id=1, partida_id=10)
        
        assert resultado == 2  # 2 cartas Instant

    @patch('app.logic.logica.PartidaRepository')
    @patch('app.logic.logica.JugadorRepository')
    @patch('app.logic.logica.CartaRepository')
    def test_carta_consultar_not_so_fast_sin_nsf(self, mock_carta_repo_class, mock_jugador_repo_class, mock_partida_repo_class):
        mock_carta_repo = MagicMock()
        mock_jugador_repo = MagicMock()
        mock_partida_repo = MagicMock()
        mock_carta_repo_class.return_value = mock_carta_repo
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_partida_repo_class.return_value = mock_partida_repo
        
        mock_jugador = MagicMock()
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        mock_partida = MagicMock()
        mock_partida_repo.get_by_id.return_value = mock_partida
        
        mock_jugador_repo.get_jugadores_by_partida.return_value = [mock_jugador]
        
        mock_carta_event = MagicMock()
        mock_carta_event.categoria = "Event"
        mock_carta_detective = MagicMock()
        mock_carta_detective.categoria = "Detective"
        
        mock_carta_repo.obtener_cartas_en_mano_de_jugador.return_value = [
            mock_carta_event, mock_carta_detective
        ]
        
        resultado = carta_consultar_not_so_fast(jugador_id=1, partida_id=10)
        
        assert resultado == 0  # 0 cartas Instant

    @patch('app.logic.logica.JugadorRepository')
    def test_carta_consultar_not_so_fast_jugador_no_existe(self, mock_jugador_repo_class):
        mock_jugador_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        
        mock_jugador_repo.get_by_id.return_value = None
        
        with pytest.raises(ValueError, match="El jugador 1 no existe"):
            carta_consultar_not_so_fast(jugador_id=1, partida_id=10)

    @patch('app.logic.logica.PartidaRepository')
    @patch('app.logic.logica.JugadorRepository')
    def test_carta_consultar_not_so_fast_partida_no_existe(self, mock_jugador_repo_class, mock_partida_repo_class):
        mock_jugador_repo = MagicMock()
        mock_partida_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_partida_repo_class.return_value = mock_partida_repo
        
        mock_jugador = MagicMock()
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        mock_partida_repo.get_by_id.return_value = None
        
        with pytest.raises(ValueError, match="La partida 10 no existe"):
            carta_consultar_not_so_fast(jugador_id=1, partida_id=10)

    @patch('app.logic.logica.PartidaRepository')
    @patch('app.logic.logica.JugadorRepository')
    def test_carta_consultar_not_so_fast_no_pertenece_partida(self, mock_jugador_repo_class, mock_partida_repo_class):
        mock_jugador_repo = MagicMock()
        mock_partida_repo = MagicMock()
        mock_jugador_repo_class.return_value = mock_jugador_repo
        mock_partida_repo_class.return_value = mock_partida_repo
        
        mock_jugador = MagicMock()
        mock_jugador_repo.get_by_id.return_value = mock_jugador
        
        mock_partida = MagicMock()
        mock_partida_repo.get_by_id.return_value = mock_partida
        
        mock_jugador_repo.get_jugadores_by_partida.return_value = []  # Jugador no está en la partida
        
        with pytest.raises(ValueError, match="El jugador 1 no pertenece a la partida 10"):
            carta_consultar_not_so_fast(jugador_id=1, partida_id=10)
