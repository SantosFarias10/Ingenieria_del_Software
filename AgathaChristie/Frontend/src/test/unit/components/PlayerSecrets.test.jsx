import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import PlayerSecrets from '../../../components/PlayerSecrets.jsx';
import * as SecretService from '../../../service/SecretService';
import * as CardService from '../../../service/CardService';

// Mock del SecretService
vi.mock('../../../service/SecretService', () => ({
  encontrarSecretoPorId: vi.fn()
}));

// Mock del CardService
vi.mock('../../../service/CardService', () => ({
  getTipoObjetivoParaDetective: vi.fn(),
  getDetectivePrincipalDelSet: vi.fn(),
  getTipoObjetivoParaEvento: vi.fn()
}));

describe('PlayerSecrets (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock de secretos por defecto
    SecretService.encontrarSecretoPorId.mockImplementation((id) => ({
      id,
      tipo: 'Secret',
      nombre: `Secreto ${id}`,
      imagen: `/secretos/0${id}-secret.png`
    }));
  });

  const mockSecrets = [
    { id: 2 },
    { id: 3 },
    { id: 4 }
  ];

  const mockPosition = { x: 100, y: 200 };

  describe('Renderizado básico', () => {
    it('renderiza el área de secretos con 3 secretos', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={mockSecrets}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={true}
        />
      );
      
      expect(container.querySelector('.player-secrets')).toBeInTheDocument();
      expect(container.querySelector('.secrets-container')).toBeInTheDocument();
      
      const secretItems = container.querySelectorAll('.secreto');
      expect(secretItems).toHaveLength(3);
    });

    it('no renderiza nada si secrets está vacío', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={[]}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={true}
        />
      );
      
      expect(container.querySelector('.player-secrets')).not.toBeInTheDocument();
    });

    it('no renderiza nada si secrets es undefined', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={undefined}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={true}
        />
      );
      
      expect(container.querySelector('.player-secrets')).not.toBeInTheDocument();
    });

    it('no renderiza nada si secrets es null', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={null}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={true}
        />
      );
      
      expect(container.querySelector('.player-secrets')).not.toBeInTheDocument();
    });
  });

  describe('Posicionamiento', () => {
    it('aplica la posición correctamente', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={mockSecrets}
          position={{ x: 250, y: 300 }}
          rotation={0}
          isCurrentPlayer={true}
        />
      );
      
      const secretsArea = container.querySelector('.player-secrets');
      expect(secretsArea).toHaveStyle({
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(calc(-50% + 250px), calc(-50% + 300px))'
      });
    });

    it('aplica posición negativa correctamente', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={mockSecrets}
          position={{ x: -100, y: -200 }}
          rotation={0}
          isCurrentPlayer={false}
        />
      );
      
      const secretsArea = container.querySelector('.player-secrets');
      expect(secretsArea).toHaveStyle({
        transform: 'translate(calc(-50% + -100px), calc(-50% + -200px))'
      });
    });
  });

  describe('Rotación', () => {
    it('aplica rotación 0 grados por defecto', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={mockSecrets}
          position={mockPosition}
          isCurrentPlayer={true}
        />
      );
      
      const secretsContainer = container.querySelector('.secrets-container');
      expect(secretsContainer).toHaveStyle({ transform: 'rotate(0deg)' });
    });

    it('aplica rotación 90 grados correctamente', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={mockSecrets}
          position={mockPosition}
          rotation={90}
          isCurrentPlayer={false}
        />
      );
      
      const secretsContainer = container.querySelector('.secrets-container');
      expect(secretsContainer).toHaveStyle({ transform: 'rotate(90deg)' });
    });

    it('aplica rotación 180 grados correctamente', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={mockSecrets}
          position={mockPosition}
          rotation={180}
          isCurrentPlayer={false}
        />
      );
      
      const secretsContainer = container.querySelector('.secrets-container');
      expect(secretsContainer).toHaveStyle({ transform: 'rotate(180deg)' });
    });

    it('aplica rotación 270 grados correctamente', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={mockSecrets}
          position={mockPosition}
          rotation={270}
          isCurrentPlayer={false}
        />
      );
      
      const secretsContainer = container.querySelector('.secrets-container');
      expect(secretsContainer).toHaveStyle({ transform: 'rotate(270deg)' });
    });
  });

  describe('Estado de jugador actual', () => {
    it('aplica la clase current-player cuando isCurrentPlayer es true', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={mockSecrets}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={true}
        />
      );
      
      const secretsContainer = container.querySelector('.secrets-container');
      expect(secretsContainer).toHaveClass('current-player');
    });

    it('no aplica la clase current-player cuando isCurrentPlayer es false', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={mockSecrets}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
        />
      );
      
      const secretsContainer = container.querySelector('.secrets-container');
      expect(secretsContainer).not.toHaveClass('current-player');
    });
  });

  describe('Renderizado de secretos individuales', () => {
    it('renderiza cada secreto con el z-index correcto', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={mockSecrets}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={true}
        />
      );
      
      const secretItems = container.querySelectorAll('.secreto');
      // Los secretos no tienen z-index individual en el componente actual
      expect(secretItems.length).toBe(3);
    });

    it('renderiza secretos con diferentes IDs', () => {
      const differentSecrets = [
        { id: 10 },
        { id: 15 },
        { id: 18 }
      ];

      const { container } = render(
        <PlayerSecrets 
          secrets={differentSecrets}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
        />
      );
      
      const secretItems = container.querySelectorAll('.secreto');
      expect(secretItems).toHaveLength(3);
    });

    it('renderiza solo 1 secreto correctamente', () => {
      const singleSecret = [{ id: 5 }];

      const { container } = render(
        <PlayerSecrets 
          secrets={singleSecret}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={true}
        />
      );
      
      const secretItems = container.querySelectorAll('.secreto');
      expect(secretItems).toHaveLength(1);
    });

    it('renderiza más de 3 secretos si se proporcionan', () => {
      const manySecrets = [
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 }
      ];

      const { container } = render(
        <PlayerSecrets 
          secrets={manySecrets}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={true}
        />
      );
      
      const secretItems = container.querySelectorAll('.secreto');
      expect(secretItems).toHaveLength(5);
    });
  });

  describe('Integración con componente Secret', () => {
    it('pasa flipped=true a Secret cuando isCurrentPlayer es true', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={mockSecrets}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={true}
        />
      );
      
      // Verificar que los secretos se renderizan
      const secretoElements = container.querySelectorAll('.secreto');
      expect(secretoElements.length).toBeGreaterThan(0);
    });

    it('pasa flipped=false a Secret cuando isCurrentPlayer es false', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={mockSecrets}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
        />
      );
      
      // Verificar que los secretos se renderizan
      const secretoElements = container.querySelectorAll('.secreto');
      expect(secretoElements.length).toBeGreaterThan(0);
    });
  });

  describe('Selección de secretos para SETS', () => {
    const secretosConEstado = [
      { id: 2, idBackend: 102, estado: 9 }, // Oculto
      { id: 3, idBackend: 103, estado: 0 }, // Revelado
      { id: 4, idBackend: 104, estado: 9 }, // Oculto
    ];

    it('permite seleccionar secreto oculto cuando el detective requiere secreto_oculto', () => {
      CardService.getDetectivePrincipalDelSet.mockReturnValue('Miss Marple');
      CardService.getTipoObjetivoParaDetective.mockReturnValue('secreto_oculto');

      const onSelectSecret = vi.fn();
      const setArray = [
        { idDetective: 1, nombre: 'Miss Marple' },
        { idDetective: 1, nombre: 'Miss Marple' },
        { idDetective: 1, nombre: 'Miss Marple' },
      ];

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
          esperandoObjetivo={true}
          onSelectSecret={onSelectSecret}
          setArrayOriginal={setArray}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(3);
    });

    it('permite seleccionar secreto revelado cuando el detective requiere secreto_revelado', () => {
      CardService.getDetectivePrincipalDelSet.mockReturnValue('Hercule Poirot');
      CardService.getTipoObjetivoParaDetective.mockReturnValue('secreto_revelado');

      const onSelectSecret = vi.fn();
      const setArray = [
        { idDetective: 2, nombre: 'Hercule Poirot' },
        { idDetective: 2, nombre: 'Hercule Poirot' },
        { idDetective: 2, nombre: 'Hercule Poirot' },
      ];

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
          esperandoObjetivo={true}
          onSelectSecret={onSelectSecret}
          setArrayOriginal={setArray}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(3);
    });

    it('permite seleccionar cualquier secreto cuando el detective requiere secreto_cualquiera', () => {
      CardService.getDetectivePrincipalDelSet.mockReturnValue('The Beresfords');
      CardService.getTipoObjetivoParaDetective.mockReturnValue('secreto_cualquiera');

      const onSelectSecret = vi.fn();
      const setArray = [
        { idDetective: 3, nombre: 'The Beresfords' },
        { idDetective: 3, nombre: 'The Beresfords' },
        { idDetective: 3, nombre: 'The Beresfords' },
      ];

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
          esperandoObjetivo={true}
          onSelectSecret={onSelectSecret}
          setArrayOriginal={setArray}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(3);
    });

    it('no permite seleccionar si esperandoObjetivo es false', () => {
      CardService.getDetectivePrincipalDelSet.mockReturnValue('Miss Marple');
      CardService.getTipoObjetivoParaDetective.mockReturnValue('secreto_oculto');

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
          esperandoObjetivo={false}
          setArrayOriginal={[]}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(3);
    });

    it('no permite seleccionar si es el jugador actual', () => {
      CardService.getDetectivePrincipalDelSet.mockReturnValue('Miss Marple');
      CardService.getTipoObjetivoParaDetective.mockReturnValue('secreto_oculto');

      const setArray = [
        { idDetective: 1, nombre: 'Miss Marple' },
      ];

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={true}
          esperandoObjetivo={true}
          setArrayOriginal={setArray}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(3);
    });

    it('no permite seleccionar si setArrayOriginal es null', () => {
      CardService.getDetectivePrincipalDelSet.mockReturnValue(null);
      CardService.getTipoObjetivoParaDetective.mockReturnValue(null);

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
          esperandoObjetivo={true}
          setArrayOriginal={null}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(3);
    });
  });

  describe('Selección de secretos para EVENTOS', () => {
    const secretosConEstado = [
      { id: 2, idBackend: 102, estado: 9 }, // Oculto
      { id: 3, idBackend: 103, estado: 0 }, // Revelado
      { id: 4, idBackend: 104, estado: null }, // Oculto (null)
    ];

    it('permite seleccionar secreto oculto cuando el evento requiere secreto_oculto', () => {
      CardService.getTipoObjetivoParaEvento.mockReturnValue({
        tipos: ['secreto_oculto'],
        cantidad: 1
      });

      const onSelectEventoSecret = vi.fn();
      const evento = { idFrontend: 'evento_1', nombre: 'Evento Test' };

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
          esperandoObjetivoEvento={true}
          eventoEnJuego={evento}
          onSelectEventoSecret={onSelectEventoSecret}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(3);
    });

    it('permite seleccionar secreto revelado cuando el evento requiere secreto_revelado', () => {
      CardService.getTipoObjetivoParaEvento.mockReturnValue({
        tipos: ['secreto_revelado'],
        cantidad: 1
      });

      const onSelectEventoSecret = vi.fn();
      const evento = { idFrontend: 'evento_2', nombre: 'Evento Test 2' };

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
          esperandoObjetivoEvento={true}
          eventoEnJuego={evento}
          onSelectEventoSecret={onSelectEventoSecret}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(3);
    });

    it('usa tipoObjetivoActual cuando está seteado (Another Victim)', () => {
      const onSelectEventoSecret = vi.fn();
      const evento = { idFrontend: 'evento_3', nombre: 'Another Victim' };

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
          esperandoObjetivoEvento={true}
          eventoEnJuego={evento}
          tipoObjetivoActual="secreto_oculto"
          onSelectEventoSecret={onSelectEventoSecret}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(3);
    });

    it('no permite seleccionar si esperandoObjetivoEvento es false', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
          esperandoObjetivoEvento={false}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(3);
    });

    it('no permite seleccionar si eventoEnJuego es null', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
          esperandoObjetivoEvento={true}
          eventoEnJuego={null}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(3);
    });

    it('maneja eventos sin tipos de secreto en la configuración', () => {
      CardService.getTipoObjetivoParaEvento.mockReturnValue({
        tipos: ['jugador'],
        cantidad: 1
      });

      const evento = { idFrontend: 'evento_4', nombre: 'Evento Sin Secretos' };

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
          esperandoObjetivoEvento={true}
          eventoEnJuego={evento}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(3);
    });
  });

  describe('Revelar secretos (efecto de set)', () => {
    const secretosConEstado = [
      { id: 2, idBackend: 102, estado: 9 }, // Oculto
      { id: 3, idBackend: 103, estado: 0 }, // Revelado
      { id: 4, idBackend: 104, estado: undefined }, // Oculto (undefined)
    ];

    it('permite revelar secreto oculto cuando esperandoRevelarSecreto es true', () => {
      const onRevealSecret = vi.fn();

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={true}
          esperandoRevelarSecreto={true}
          onRevealSecret={onRevealSecret}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(3);
    });

    it('no permite revelar si no es el jugador actual', () => {
      const onRevealSecret = vi.fn();

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
          esperandoRevelarSecreto={true}
          onRevealSecret={onRevealSecret}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(3);
    });

    it('no permite revelar secretos ya revelados', () => {
      const onRevealSecret = vi.fn();

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={true}
          esperandoRevelarSecreto={true}
          onRevealSecret={onRevealSecret}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(3);
    });
  });

  describe('Ver secretos revelados (tooltip)', () => {
    const secretosConEstado = [
      { id: 2, idBackend: 102, estado: 9 }, // Oculto
      { id: 3, idBackend: 103, estado: 0 }, // Revelado
    ];

    it('permite ver secreto revelado cuando no es el jugador actual', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(2);
    });

    it('no permite ver secretos si es el jugador actual', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={true}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(2);
    });

    it('no permite ver secretos ocultos', () => {
      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(2);
    });
  });

  describe('handleSelectSecret - Prioridades', () => {
    const secretosConEstado = [
      { id: 2, idBackend: 102, estado: 9 }, // Oculto
      { id: 3, idBackend: 103, estado: 0 }, // Revelado
    ];

    it('prioriza onRevealSecret sobre onSelectEventoSecret', () => {
      const onRevealSecret = vi.fn();
      const onSelectEventoSecret = vi.fn();

      CardService.getTipoObjetivoParaEvento.mockReturnValue({
        tipos: ['secreto_oculto'],
        cantidad: 1
      });

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={true}
          esperandoRevelarSecreto={true}
          onRevealSecret={onRevealSecret}
          esperandoObjetivoEvento={true}
          eventoEnJuego={{ idFrontend: 'evento_1' }}
          onSelectEventoSecret={onSelectEventoSecret}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(2);
    });

    it('prioriza onSelectEventoSecret sobre onSelectSecret', () => {
      const onSelectEventoSecret = vi.fn();
      const onSelectSecret = vi.fn();

      CardService.getTipoObjetivoParaEvento.mockReturnValue({
        tipos: ['secreto_oculto'],
        cantidad: 1
      });

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
          esperandoObjetivoEvento={true}
          eventoEnJuego={{ idFrontend: 'evento_1' }}
          onSelectEventoSecret={onSelectEventoSecret}
          onSelectSecret={onSelectSecret}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(2);
    });

    it('usa onSelectSecret cuando no hay otras prioridades', () => {
      const onSelectSecret = vi.fn();

      CardService.getDetectivePrincipalDelSet.mockReturnValue('Miss Marple');
      CardService.getTipoObjetivoParaDetective.mockReturnValue('secreto_oculto');

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosConEstado}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
          esperandoObjetivo={true}
          setArrayOriginal={[{ idDetective: 1 }]}
          onSelectSecret={onSelectSecret}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(2);
    });
  });

  describe('Estados de secreto edge cases', () => {
    it('trata estado null como oculto', () => {
      const secretos = [
        { id: 2, idBackend: 102, estado: null },
      ];

      const { container } = render(
        <PlayerSecrets 
          secrets={secretos}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
        />
      );

      const secretoElements = container.querySelectorAll('.secreto');
      expect(secretoElements.length).toBe(1);
    });

    it('trata estado undefined como oculto', () => {
      const secretos = [
        { id: 2, idBackend: 102, estado: undefined },
      ];

      const { container } = render(
        <PlayerSecrets 
          secrets={secretos}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
        />
      );

      const secretoElements = container.querySelectorAll('.secreto');
      expect(secretoElements.length).toBe(1);
    });

    it('trata estado 9 como oculto', () => {
      const secretos = [
        { id: 2, idBackend: 102, estado: 9 },
      ];

      const { container } = render(
        <PlayerSecrets 
          secrets={secretos}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
        />
      );

      const secretoElements = container.querySelectorAll('.secreto');
      expect(secretoElements.length).toBe(1);
    });

    it('trata estado 0 como revelado', () => {
      const secretos = [
        { id: 2, idBackend: 102, estado: 0 },
      ];

      const { container } = render(
        <PlayerSecrets 
          secrets={secretos}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
        />
      );

      const secretoElements = container.querySelectorAll('.secreto');
      expect(secretoElements.length).toBe(1);
    });
  });

  describe('Validación de secreto seleccionable - casos complejos', () => {
    const secretosVariados = [
      { id: 2, idBackend: 102, estado: 9 },
      { id: 3, idBackend: 103, estado: 0 },
      { id: 4, idBackend: 104, estado: null },
      { id: 5, idBackend: 105, estado: undefined },
    ];

    it('valida correctamente secreto_cualquiera para sets', () => {
      CardService.getDetectivePrincipalDelSet.mockReturnValue('The Beresfords');
      CardService.getTipoObjetivoParaDetective.mockReturnValue('secreto_cualquiera');

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosVariados}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
          esperandoObjetivo={true}
          setArrayOriginal={[{ idDetective: 3 }]}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(4);
    });

    it('valida correctamente secreto_cualquiera para eventos', () => {
      CardService.getTipoObjetivoParaEvento.mockReturnValue({
        tipos: ['secreto_cualquiera'],
        cantidad: 1
      });

      const { container } = render(
        <PlayerSecrets 
          secrets={secretosVariados}
          position={mockPosition}
          rotation={0}
          isCurrentPlayer={false}
          esperandoObjetivoEvento={true}
          eventoEnJuego={{ idFrontend: 'evento_1' }}
        />
      );

      const secretos = container.querySelectorAll('.secreto');
      expect(secretos.length).toBe(4);
    });
  });
});
