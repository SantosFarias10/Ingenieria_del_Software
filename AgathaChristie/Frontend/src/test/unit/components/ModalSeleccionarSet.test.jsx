import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalSeleccionarSet from '../../../components/ModalSeleccionarSet';

// Mock del componente Card
vi.mock('../../../components/Card', () => ({
  default: ({ id, flipped }) => (
    <div data-testid={`card-${id}`} data-flipped={flipped}>
      Card {id}
    </div>
  )
}));

describe('ModalSeleccionarSet', () => {
  const mockSets = [
    [1, 2, 3, 4], // Set Detective
    [5, 6, 7, 8], // Otro set
    [9, 10, 11, 12], // Otro set
  ];

  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();
  });

  // ===== RENDERIZADO BÁSICO =====
  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <ModalSeleccionarSet
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza el modal con título cuando isOpen es true', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Selecciona un set"
      />
    );
    
    expect(screen.getByText('Selecciona un set')).toBeInTheDocument();
  });

  it('muestra la cantidad de sets disponibles', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );
    
    expect(screen.getByText('3 sets disponibles')).toBeInTheDocument();
  });

  it('usa título por defecto cuando no se proporciona', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
      />
    );
    
    expect(screen.getByText('Selecciona un set')).toBeInTheDocument();
  });

  // ===== RENDERIZADO DE SETS =====
  it('renderiza todos los sets con sus cartas', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );
    
    // Verificar que se renderizan los 3 sets
    expect(screen.getByText('Set #1 (4 cartas)')).toBeInTheDocument();
    expect(screen.getByText('Set #2 (4 cartas)')).toBeInTheDocument();
    expect(screen.getByText('Set #3 (4 cartas)')).toBeInTheDocument();
  });

  it('renderiza las cartas de cada set', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );
    
    // Verificar que las cartas del primer set están presentes
    expect(screen.getByTestId('card-1')).toBeInTheDocument();
    expect(screen.getByTestId('card-2')).toBeInTheDocument();
    expect(screen.getByTestId('card-3')).toBeInTheDocument();
    expect(screen.getByTestId('card-4')).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay sets disponibles', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={[]}
        titulo="Test"
      />
    );
    
    expect(screen.getByText('No hay sets disponibles')).toBeInTheDocument();
  });

  it('maneja array vacío de sets correctamente', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={[]}
        titulo="Test"
      />
    );
    
    expect(screen.getByText('0 sets disponibles')).toBeInTheDocument();
  });

  // ===== SELECCIÓN DE SETS =====
  it('selecciona un set al hacer click', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );
    
    const setRows = screen.getAllByText(/Set #/);
    fireEvent.click(setRows[0].parentElement);
    
    // Verificar que el botón confirmar se habilita
    const confirmarBtn = screen.getByText('Confirmar Set');
    expect(confirmarBtn).not.toBeDisabled();
  });

  it('permite cambiar de selección', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );
    
    const setRows = screen.getAllByText(/Set #/);
    
    // Seleccionar primer set
    fireEvent.click(setRows[0].parentElement);
    
    // Seleccionar segundo set
    fireEvent.click(setRows[1].parentElement);
    
    // El botón confirmar debe seguir habilitado
    const confirmarBtn = screen.getByText('Confirmar Set');
    expect(confirmarBtn).not.toBeDisabled();
  });

  it('aplica clase "seleccionada" al set seleccionado', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );
    
    const setRows = screen.getAllByText(/Set #/);
    const firstSetRow = setRows[0].parentElement;
    
    // Verificar que no tiene clase seleccionada
    expect(firstSetRow).not.toHaveClass('seleccionada');
    
    // Seleccionar set
    fireEvent.click(firstSetRow);
    
    // Verificar que ahora tiene la clase
    expect(firstSetRow).toHaveClass('seleccionada');
  });

  // ===== BOTÓN CONFIRMAR =====
  it('botón Confirmar está deshabilitado sin selección', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );
    
    const confirmarBtn = screen.getByText('Confirmar Set');
    expect(confirmarBtn).toBeDisabled();
  });

  it('botón Confirmar se habilita al seleccionar un set', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );
    
    const setRows = screen.getAllByText(/Set #/);
    fireEvent.click(setRows[0].parentElement);
    
    const confirmarBtn = screen.getByText('Confirmar Set');
    expect(confirmarBtn).not.toBeDisabled();
  });

  it('llama a onConfirm con el set seleccionado y su índice', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );
    
    const setRows = screen.getAllByText(/Set #/);
    fireEvent.click(setRows[1].parentElement); // Seleccionar segundo set (índice 1)
    
    const confirmarBtn = screen.getByText('Confirmar Set');
    fireEvent.click(confirmarBtn);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).toHaveBeenCalledWith([5, 6, 7, 8], 1);
  });

  it('no llama a onConfirm si no hay set seleccionado', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );
    
    const confirmarBtn = screen.getByText('Confirmar Set');
    // El botón está deshabilitado, pero intentamos click por si acaso
    fireEvent.click(confirmarBtn);
    
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  // ===== BOTÓN CANCELAR =====
  it('llama a onClose al hacer click en Cancelar', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );

    const cancelarBtn = screen.getByText('Cancelar');
    fireEvent.click(cancelarBtn);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('cierra el modal al hacer click en el overlay', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );

    const overlay = screen.getByText('Test').closest('.modal-overlay');
    fireEvent.click(overlay);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('no cierra el modal al hacer click en el contenido', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );

    const modalContent = screen.getByText('Test').closest('.modal-content');
    fireEvent.click(modalContent);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // ===== RESETEO DE SELECCIÓN =====
  it('resetea selección cuando el modal se cierra', () => {
    const { rerender } = render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );

    const setRows = screen.getAllByText(/Set #/);
    
    // Seleccionar set
    fireEvent.click(setRows[0].parentElement);
    let confirmarBtn = screen.getByText('Confirmar Set');
    expect(confirmarBtn).not.toBeDisabled();
    
    // Cerrar modal
    rerender(
      <ModalSeleccionarSet
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );
    
    // Reabrir modal
    rerender(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );
    
    // Verificar que se reseteo (botón deshabilitado)
    confirmarBtn = screen.getByText('Confirmar Set');
    expect(confirmarBtn).toBeDisabled();
  });

  // ===== NORMALIZACIÓN DE DATOS =====
  it('normaliza sets con números', () => {
    const setsNumericos = [[1, 2, 3, 4]];
    
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={setsNumericos}
        titulo="Test"
      />
    );
    
    const setRows = screen.getAllByText(/Set #/);
    fireEvent.click(setRows[0].parentElement);
    
    const confirmarBtn = screen.getByText('Confirmar Set');
    fireEvent.click(confirmarBtn);
    
    expect(mockOnConfirm).toHaveBeenCalledWith([1, 2, 3, 4], 0);
  });

  it('normaliza sets con strings numéricos', () => {
    const setsStrings = [['1', '2', '3', '4']];
    
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={setsStrings}
        titulo="Test"
      />
    );
    
    const setRows = screen.getAllByText(/Set #/);
    fireEvent.click(setRows[0].parentElement);
    
    const confirmarBtn = screen.getByText('Confirmar Set');
    fireEvent.click(confirmarBtn);
    
    expect(mockOnConfirm).toHaveBeenCalledWith([1, 2, 3, 4], 0);
  });

  it('normaliza sets con objetos (id_front)', () => {
    const setsObjetos = [[
      { id_front: 1, id: 101 },
      { id_front: 2, id: 102 },
      { id_front: 3, id: 103 },
      { id_front: 4, id: 104 }
    ]];
    
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={setsObjetos}
        titulo="Test"
      />
    );
    
    const setRows = screen.getAllByText(/Set #/);
    fireEvent.click(setRows[0].parentElement);
    
    const confirmarBtn = screen.getByText('Confirmar Set');
    fireEvent.click(confirmarBtn);
    
    expect(mockOnConfirm).toHaveBeenCalledWith([1, 2, 3, 4], 0);
  });

  it('normaliza sets con objetos (id)', () => {
    const setsObjetos = [[
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 }
    ]];
    
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={setsObjetos}
        titulo="Test"
      />
    );
    
    const setRows = screen.getAllByText(/Set #/);
    fireEvent.click(setRows[0].parentElement);
    
    const confirmarBtn = screen.getByText('Confirmar Set');
    fireEvent.click(confirmarBtn);
    
    expect(mockOnConfirm).toHaveBeenCalledWith([1, 2, 3, 4], 0);
  });

  it('normaliza sets con objetos (idFrontend)', () => {
    const setsObjetos = [[
      { idFrontend: 1 },
      { idFrontend: 2 },
      { idFrontend: 3 },
      { idFrontend: 4 }
    ]];
    
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={setsObjetos}
        titulo="Test"
      />
    );
    
    const setRows = screen.getAllByText(/Set #/);
    fireEvent.click(setRows[0].parentElement);
    
    const confirmarBtn = screen.getByText('Confirmar Set');
    fireEvent.click(confirmarBtn);
    
    expect(mockOnConfirm).toHaveBeenCalledWith([1, 2, 3, 4], 0);
  });

  it('normaliza sets con objetos (idFront)', () => {
    const setsObjetos = [[
      { idFront: 1 },
      { idFront: 2 },
      { idFront: 3 },
      { idFront: 4 }
    ]];
    
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={setsObjetos}
        titulo="Test"
      />
    );
    
    const setRows = screen.getAllByText(/Set #/);
    fireEvent.click(setRows[0].parentElement);
    
    const confirmarBtn = screen.getByText('Confirmar Set');
    fireEvent.click(confirmarBtn);
    
    expect(mockOnConfirm).toHaveBeenCalledWith([1, 2, 3, 4], 0);
  });

  it('filtra valores no numéricos', () => {
    const setsConInvalidos = [[1, 'abc', 2, null, 3, undefined, 4]];
    
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={setsConInvalidos}
        titulo="Test"
      />
    );
    
    const setRows = screen.getAllByText(/Set #/);
    fireEvent.click(setRows[0].parentElement);
    
    const confirmarBtn = screen.getByText('Confirmar Set');
    fireEvent.click(confirmarBtn);
    
    // Solo debe incluir los valores numéricos válidos
    expect(mockOnConfirm).toHaveBeenCalledWith([1, 2, 3, 4], 0);
  });

  it('maneja sets con diferentes tamaños', () => {
    const setsDiferentes = [
      [1, 2, 3],
      [4, 5, 6, 7, 8],
      [9, 10]
    ];
    
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={setsDiferentes}
        titulo="Test"
      />
    );
    
    expect(screen.getByText('Set #1 (3 cartas)')).toBeInTheDocument();
    expect(screen.getByText('Set #2 (5 cartas)')).toBeInTheDocument();
    expect(screen.getByText('Set #3 (2 cartas)')).toBeInTheDocument();
  });

  // ===== CASOS LÍMITE =====
  it('maneja sets como undefined con valor por defecto', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        titulo="Test"
      />
    );
    
    expect(screen.getByText('0 sets disponibles')).toBeInTheDocument();
    expect(screen.getByText('No hay sets disponibles')).toBeInTheDocument();
  });

  it('maneja sets no array correctamente', () => {
    const setInvalido = [null, undefined, 'not-an-array', 123];
    
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={setInvalido}
        titulo="Test"
      />
    );
    
    // Debe renderizar 4 sets vacíos
    expect(screen.getByText('4 sets disponibles')).toBeInTheDocument();
  });

  it('renderiza cartas con flipped=true', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );
    
    const card = screen.getByTestId('card-1');
    expect(card).toHaveAttribute('data-flipped', 'true');
  });

  it('permite seleccionar cualquier set de la lista', () => {
    render(
      <ModalSeleccionarSet
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        sets={mockSets}
        titulo="Test"
      />
    );
    
    const setRows = screen.getAllByText(/Set #/);
    
    // Seleccionar tercer set
    fireEvent.click(setRows[2].parentElement);
    
    const confirmarBtn = screen.getByText('Confirmar Set');
    fireEvent.click(confirmarBtn);
    
    expect(mockOnConfirm).toHaveBeenCalledWith([9, 10, 11, 12], 2);
  });
});
