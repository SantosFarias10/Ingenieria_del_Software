import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import FiltrarPorNombreVisual from '../../../components/FiltrarPorNombreVisual.jsx';

describe('FiltrarPorNombreVisual (unit)', () => {
  const items = [
    { id: 1, nombre: 'Partida Uno' },
    { id: 2, nombre: 'Partida Dos' },
    { id: 3, nombre: 'Otra Partida' }
  ];

  it('renderiza el input y la lista de partidas', () => {
    render(<FiltrarPorNombreVisual filterText="" items={items} onFilterChange={() => {}} />);
    expect(screen.getByPlaceholderText(/Filtrar partida por nombre/i)).toBeInTheDocument();
    expect(screen.getByText('Partida Uno')).toBeInTheDocument();
    expect(screen.getByText('Partida Dos')).toBeInTheDocument();
    expect(screen.getByText('Otra Partida')).toBeInTheDocument();
  });

  it('muestra mensaje de error si hay error', () => {
    render(<FiltrarPorNombreVisual filterText="" items={items} error="Error de filtro" onFilterChange={() => {}} />);
    expect(screen.getByText(/Error de filtro/)).toBeInTheDocument();
  });

  it('llama a onFilterChange cuando se escribe en el input', async () => {
    const onFilterChange = vi.fn();
    const user = userEvent.setup();
    render(<FiltrarPorNombreVisual filterText="" items={items} onFilterChange={onFilterChange} />);
    const input = screen.getByPlaceholderText(/Filtrar partida por nombre/i);
    await user.type(input, 'Partida');
    expect(onFilterChange).toHaveBeenCalled();
  });

  it('muestra mensaje de loading si loading=true', () => {
    render(<FiltrarPorNombreVisual filterText="" items={items} loading={true} onFilterChange={() => {}} />);
    expect(screen.getByText(/Cargando partidas/)).toBeInTheDocument();
  });
});
