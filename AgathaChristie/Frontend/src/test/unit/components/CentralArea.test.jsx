import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import CentralArea from '../../../components/CentralArea.jsx';

// Mock de los componentes hijos
vi.mock('../../../components/MazoRegular', () => ({
  default: ({ cantidadCartas, onRobarCarta, estaActivo }) => (
    <div data-testid="mazo-regular" data-cantidad={cantidadCartas} data-activo={String(estaActivo)}>
      MazoRegular Mock
    </div>
  )
}));

vi.mock('../../../components/MazoDescarte', () => ({
  default: ({ cartasDescarte, cantidadCartasDescarte }) => (
    <div data-testid="mazo-descarte" data-cartas-count={cartasDescarte?.length || 0}>
      MazoDescarte Mock
    </div>
  )
}));

vi.mock('../../../components/MazoEvento', () => ({
  default: ({ cartaEvento, onClick, disabled }) => (
    <div 
      data-testid="mazo-evento" 
      data-tiene-carta={String(!!cartaEvento)} 
      data-disabled={String(disabled)}
      onClick={disabled ? undefined : onClick}
    >
      MazoEvento Mock
    </div>
  )
}));

describe('CentralArea (unit)', () => {
  const mockOnRobarCarta = vi.fn();
  const mockOnJugarEvento = vi.fn();
  const mockCartasDescarte = [
    { id: 99, tipo: 'sospechoso', valor: 'Sr. Green', imagen: '/cartas/sospechoso3.jpg' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===== RENDERIZADO BÁSICO =====
  it('renderiza el área central con los tres mazos', () => {
    const { container } = render(
      <CentralArea 
        cantidadCartasMazo={42}
        cartasDescarte={mockCartasDescarte}
        onRobarCarta={mockOnRobarCarta}
        estaActivo={true}
        cartaEventoSeleccionada={null}
        cartasSeleccionadas={[]}
        onJugarEvento={mockOnJugarEvento}
      />
    );
    
    expect(container.querySelector('.central-area')).toBeInTheDocument();
    expect(container.querySelector('.decks-container')).toBeInTheDocument();
  });

  it('renderiza MazoRegular con props correctas', () => {
    const { getByTestId } = render(
      <CentralArea 
        cantidadCartasMazo={30}
        cartasDescarte={mockCartasDescarte}
        onRobarCarta={mockOnRobarCarta}
        estaActivo={true}
        cartaEventoSeleccionada={null}
        cartasSeleccionadas={[]}
        onJugarEvento={mockOnJugarEvento}
      />
    );
    
    const mazoRegular = getByTestId('mazo-regular');
    expect(mazoRegular).toBeInTheDocument();
    expect(mazoRegular).toHaveAttribute('data-cantidad', '30');
    expect(mazoRegular).toHaveAttribute('data-activo', 'true');
  });

  it('renderiza MazoDescarte con props correctas', () => {
    const { getByTestId } = render(
      <CentralArea 
        cantidadCartasMazo={20}
        cartasDescarte={mockCartasDescarte}
        onRobarCarta={mockOnRobarCarta}
        estaActivo={false}
        cartaEventoSeleccionada={null}
        cartasSeleccionadas={[]}
        onJugarEvento={mockOnJugarEvento}
      />
    );
    
    const mazoDescarte = getByTestId('mazo-descarte');
    expect(mazoDescarte).toBeInTheDocument();
    expect(mazoDescarte).toHaveAttribute('data-cartas-count', '1');
  });

  it('renderiza MazoEvento con props correctas', () => {
    const { getByTestId } = render(
      <CentralArea 
        cantidadCartasMazo={20}
        cartasDescarte={mockCartasDescarte}
        onRobarCarta={mockOnRobarCarta}
        estaActivo={false}
        cartaEventoSeleccionada={null}
        cartasSeleccionadas={[]}
        onJugarEvento={mockOnJugarEvento}
      />
    );
    
    const mazoEvento = getByTestId('mazo-evento');
    expect(mazoEvento).toBeInTheDocument();
    expect(mazoEvento).toHaveAttribute('data-tiene-carta', 'false');
  });

  it('renderiza correctamente con mazo vacío', () => {
    const { container } = render(
      <CentralArea 
        cantidadCartasMazo={0}
        cartasDescarte={[]}
        onRobarCarta={mockOnRobarCarta}
        estaActivo={false}
        cartaEventoSeleccionada={null}
        cartasSeleccionadas={[]}
        onJugarEvento={mockOnJugarEvento}
      />
    );
    
    const centralArea = container.querySelector('.central-area');
    expect(centralArea).toBeInTheDocument();
  });

  // ===== LÓGICA DE EVENTOS =====
  it('MazoEvento está disabled cuando no hay eventos seleccionados', () => {
    const { getByTestId } = render(
      <CentralArea 
        cantidadCartasMazo={20}
        cartasDescarte={mockCartasDescarte}
        onRobarCarta={mockOnRobarCarta}
        estaActivo={true}
        cartaEventoSeleccionada={null}
        cartasSeleccionadas={[]}
        onJugarEvento={mockOnJugarEvento}
      />
    );
    
    const mazoEvento = getByTestId('mazo-evento');
    expect(mazoEvento).toHaveAttribute('data-disabled', 'true');
  });

  it('MazoEvento está habilitado cuando hay carta de evento seleccionada (idFrontend >= 10)', () => {
    const cartasConEvento = [
      { idFrontend: 1, idBackend: 100 }, // Detective
      { idFrontend: 15, idBackend: 101 }  // Evento
    ];
    
    const { getByTestId } = render(
      <CentralArea 
        cantidadCartasMazo={20}
        cartasDescarte={mockCartasDescarte}
        onRobarCarta={mockOnRobarCarta}
        estaActivo={true}
        cartaEventoSeleccionada={null}
        cartasSeleccionadas={cartasConEvento}
        onJugarEvento={mockOnJugarEvento}
      />
    );
    
    const mazoEvento = getByTestId('mazo-evento');
    expect(mazoEvento).toHaveAttribute('data-disabled', 'false');
  });

  it('MazoEvento está disabled cuando solo hay detectives seleccionados (idFrontend < 10)', () => {
    const cartasSoloDetectives = [
      { idFrontend: 1, idBackend: 100 },
      { idFrontend: 5, idBackend: 101 },
      { idFrontend: 9, idBackend: 102 }
    ];
    
    const { getByTestId } = render(
      <CentralArea 
        cantidadCartasMazo={20}
        cartasDescarte={mockCartasDescarte}
        onRobarCarta={mockOnRobarCarta}
        estaActivo={true}
        cartaEventoSeleccionada={null}
        cartasSeleccionadas={cartasSoloDetectives}
        onJugarEvento={mockOnJugarEvento}
      />
    );
    
    const mazoEvento = getByTestId('mazo-evento');
    expect(mazoEvento).toHaveAttribute('data-disabled', 'true');
  });

  it('MazoEvento está habilitado cuando hay cartaEventoSeleccionada', () => {
    const carta = { idFrontend: 15, idBackend: 200 };
    
    const { getByTestId } = render(
      <CentralArea 
        cantidadCartasMazo={20}
        cartasDescarte={mockCartasDescarte}
        onRobarCarta={mockOnRobarCarta}
        estaActivo={true}
        cartaEventoSeleccionada={carta}
        cartasSeleccionadas={[]}
        onJugarEvento={mockOnJugarEvento}
      />
    );
    
    const mazoEvento = getByTestId('mazo-evento');
    expect(mazoEvento).toHaveAttribute('data-disabled', 'false');
    expect(mazoEvento).toHaveAttribute('data-tiene-carta', 'true');
  });

  it('MazoEvento funciona con múltiples eventos seleccionados', () => {
    const cartasVariasEventos = [
      { idFrontend: 10, idBackend: 100 },
      { idFrontend: 15, idBackend: 101 },
      { idFrontend: 18, idBackend: 102 }
    ];
    
    const { getByTestId } = render(
      <CentralArea 
        cantidadCartasMazo={20}
        cartasDescarte={mockCartasDescarte}
        onRobarCarta={mockOnRobarCarta}
        estaActivo={true}
        cartaEventoSeleccionada={null}
        cartasSeleccionadas={cartasVariasEventos}
        onJugarEvento={mockOnJugarEvento}
      />
    );
    
    const mazoEvento = getByTestId('mazo-evento');
    expect(mazoEvento).toHaveAttribute('data-disabled', 'false');
  });

  it('MazoEvento detecta correctamente evento en el límite (idFrontend=10)', () => {
    const cartasConEventoLimite = [{ idFrontend: 10, idBackend: 100 }];
    
    const { getByTestId } = render(
      <CentralArea 
        cantidadCartasMazo={20}
        cartasDescarte={mockCartasDescarte}
        onRobarCarta={mockOnRobarCarta}
        estaActivo={true}
        cartaEventoSeleccionada={null}
        cartasSeleccionadas={cartasConEventoLimite}
        onJugarEvento={mockOnJugarEvento}
      />
    );
    
    const mazoEvento = getByTestId('mazo-evento');
    expect(mazoEvento).toHaveAttribute('data-disabled', 'false');
  });

  it('MazoEvento detecta correctamente evento en el límite (idFrontend=18)', () => {
    const cartasConEventoLimite = [{ idFrontend: 18, idBackend: 100 }];
    
    const { getByTestId } = render(
      <CentralArea 
        cantidadCartasMazo={20}
        cartasDescarte={mockCartasDescarte}
        onRobarCarta={mockOnRobarCarta}
        estaActivo={true}
        cartaEventoSeleccionada={null}
        cartasSeleccionadas={cartasConEventoLimite}
        onJugarEvento={mockOnJugarEvento}
      />
    );
    
    const mazoEvento = getByTestId('mazo-evento');
    expect(mazoEvento).toHaveAttribute('data-disabled', 'false');
  });

  it('MazoEvento está disabled con idFrontend=19 (fuera de rango)', () => {
    const cartasFueraRango = [{ idFrontend: 19, idBackend: 100 }];
    
    const { getByTestId } = render(
      <CentralArea 
        cantidadCartasMazo={20}
        cartasDescarte={mockCartasDescarte}
        onRobarCarta={mockOnRobarCarta}
        estaActivo={true}
        cartaEventoSeleccionada={null}
        cartasSeleccionadas={cartasFueraRango}
        onJugarEvento={mockOnJugarEvento}
      />
    );
    
    const mazoEvento = getByTestId('mazo-evento');
    expect(mazoEvento).toHaveAttribute('data-disabled', 'true');
  });

  // ===== MANEJO DE VALORES UNDEFINED =====
  it('maneja cartasSeleccionadas undefined sin errores', () => {
    const { getByTestId } = render(
      <CentralArea 
        cantidadCartasMazo={20}
        cartasDescarte={mockCartasDescarte}
        onRobarCarta={mockOnRobarCarta}
        estaActivo={true}
        cartaEventoSeleccionada={null}
        cartasSeleccionadas={undefined}
        onJugarEvento={mockOnJugarEvento}
      />
    );
    
    const mazoEvento = getByTestId('mazo-evento');
    expect(mazoEvento).toHaveAttribute('data-disabled', 'true');
  });

  it('maneja cartasSeleccionadas no proporcionadas sin errores', () => {
    const { getByTestId } = render(
      <CentralArea 
        cantidadCartasMazo={20}
        cartasDescarte={mockCartasDescarte}
        onRobarCarta={mockOnRobarCarta}
        estaActivo={true}
        cartaEventoSeleccionada={null}
        onJugarEvento={mockOnJugarEvento}
      />
    );
    
    const mazoEvento = getByTestId('mazo-evento');
    expect(mazoEvento).toHaveAttribute('data-disabled', 'true');
  });

  // ===== INTEGRACIÓN DE PROPS =====
  it('pasa todas las props correctamente a los tres mazos', () => {
    const cartaEvento = { idFrontend: 15, idBackend: 200 };
    const { getByTestId } = render(
      <CentralArea 
        cantidadCartasMazo={42}
        cartasDescarte={mockCartasDescarte}
        onRobarCarta={mockOnRobarCarta}
        estaActivo={true}
        cartaEventoSeleccionada={cartaEvento}
        cartasSeleccionadas={[]}
        onJugarEvento={mockOnJugarEvento}
      />
    );
    
    expect(getByTestId('mazo-regular')).toHaveAttribute('data-cantidad', '42');
    expect(getByTestId('mazo-descarte')).toHaveAttribute('data-cartas-count', '1');
    expect(getByTestId('mazo-evento')).toHaveAttribute('data-tiene-carta', 'true');
  });
});
