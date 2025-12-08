import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalSeleccionarCarta from '../../../components/ModalSeleccionarCarta';

describe('ModalSeleccionarCarta', () => {
  const mockCartas = [
    { id: 1, idFrontend: 1, idBackend: 101 },
    { id: 2, idFrontend: 2, idBackend: 102 },
    { id: 3, idFrontend: 3, idBackend: 103 },
    { id: 4, idFrontend: 4, idBackend: 104 },
  ];

  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();
  });

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <ModalSeleccionarCarta
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        cartas={mockCartas}
        cantRequerida={2}
        titulo="Test"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza el modal con título y contador cuando isOpen es true', () => {
    render(
      <ModalSeleccionarCarta
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        cartas={mockCartas}
        cantRequerida={2}
        titulo="Seleccioná 2 cartas"
      />
    );
    
    expect(screen.getByText('Seleccioná 2 cartas')).toBeInTheDocument();
    expect(screen.getByText(/Seleccionadas : 0\/2/)).toBeInTheDocument();
  });

  it('selecciona y deselecciona cartas correctamente', () => {
    render(
      <ModalSeleccionarCarta
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        cartas={mockCartas}
        cantRequerida={2}
        titulo="Test"
      />
    );

    const cartas = screen.getAllByRole('img');
    
    // Seleccionar primera carta
    fireEvent.click(cartas[0].closest('div').parentElement);
    expect(screen.getByText(/Seleccionadas : 1\/2/)).toBeInTheDocument();
    
    // Seleccionar segunda carta
    fireEvent.click(cartas[1].closest('div').parentElement);
    expect(screen.getByText(/Seleccionadas : 2\/2/)).toBeInTheDocument();
    
    // Deseleccionar primera carta
    fireEvent.click(cartas[0].closest('div').parentElement);
    expect(screen.getByText(/Seleccionadas : 1\/2/)).toBeInTheDocument();
  });

  it('no permite seleccionar más cartas que cantRequerida', () => {
    render(
      <ModalSeleccionarCarta
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        cartas={mockCartas}
        cantRequerida={2}
        titulo="Test"
      />
    );

    const cartas = screen.getAllByRole('img');
    
    // Seleccionar 2 cartas
    fireEvent.click(cartas[0].closest('div').parentElement);
    fireEvent.click(cartas[1].closest('div').parentElement);
    expect(screen.getByText(/Seleccionadas : 2\/2/)).toBeInTheDocument();
    
    // Intentar seleccionar tercera carta
    fireEvent.click(cartas[2].closest('div').parentElement);
    expect(screen.getByText(/Seleccionadas : 2\/2/)).toBeInTheDocument(); // Sigue en 2
  });

  it('botón Confirmar solo se habilita con cantidad exacta', () => {
    render(
      <ModalSeleccionarCarta
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        cartas={mockCartas}
        cantRequerida={2}
        titulo="Test"
      />
    );

    const confirmarBtn = screen.getByText('Confirmar');
    const cartas = screen.getAllByRole('img');
    
    // Sin cartas: deshabilitado
    expect(confirmarBtn).toBeDisabled();
    
    // Con 1 carta: deshabilitado
    fireEvent.click(cartas[0].closest('div').parentElement);
    expect(confirmarBtn).toBeDisabled();
    
    // Con 2 cartas (exacto): habilitado
    fireEvent.click(cartas[1].closest('div').parentElement);
    expect(confirmarBtn).not.toBeDisabled();
  });

  it('llama a onConfirm solo con cantidad exacta y cierra modal', () => {
    const { rerender } = render(
      <ModalSeleccionarCarta
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        cartas={mockCartas}
        cantRequerida={2}
        titulo="Test"
      />
    );

    const cartas = screen.getAllByRole('img');
    
    // Seleccionar solo 1 carta e intentar confirmar
    fireEvent.click(cartas[0].closest('div').parentElement);
    const confirmarBtn = screen.getByText('Confirmar');
    fireEvent.click(confirmarBtn);
    expect(mockOnConfirm).not.toHaveBeenCalled();
    
    // Resetear mocks
    mockOnConfirm.mockClear();
    mockOnClose.mockClear();
    
    // Reabrir modal y seleccionar 2 cartas
    rerender(
      <ModalSeleccionarCarta
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        cartas={mockCartas}
        cantRequerida={2}
        titulo="Test"
      />
    );
    rerender(
      <ModalSeleccionarCarta
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        cartas={mockCartas}
        cantRequerida={2}
        titulo="Test"
      />
    );
    
    const cartasNuevas = screen.getAllByRole('img');
    fireEvent.click(cartasNuevas[0].closest('div').parentElement);
    fireEvent.click(cartasNuevas[1].closest('div').parentElement);
    
    const confirmarBtn2 = screen.getByText('Confirmar');
    fireEvent.click(confirmarBtn2);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).toHaveBeenCalledWith([mockCartas[0], mockCartas[1]]);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('llama a onClose al hacer click en Cancelar', () => {
    render(
      <ModalSeleccionarCarta
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        cartas={mockCartas}
        cantRequerida={2}
        titulo="Test"
      />
    );

    const cancelarBtn = screen.getByText('Cancelar');
    fireEvent.click(cancelarBtn);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('resetea selección cuando el modal se cierra y reabre', () => {
    const { rerender } = render(
      <ModalSeleccionarCarta
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        cartas={mockCartas}
        cantRequerida={2}
        titulo="Test"
      />
    );

    const cartas = screen.getAllByRole('img');
    
    // Seleccionar carta
    fireEvent.click(cartas[0].closest('div').parentElement);
    expect(screen.getByText(/Seleccionadas : 1\/2/)).toBeInTheDocument();
    
    // Cerrar modal
    rerender(
      <ModalSeleccionarCarta
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        cartas={mockCartas}
        cantRequerida={2}
        titulo="Test"
      />
    );
    
    // Reabrir modal
    rerender(
      <ModalSeleccionarCarta
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        cartas={mockCartas}
        cantRequerida={2}
        titulo="Test"
      />
    );
    
    // Verificar que se reseteo
    expect(screen.getByText(/Seleccionadas : 0\/2/)).toBeInTheDocument();
  });
});
