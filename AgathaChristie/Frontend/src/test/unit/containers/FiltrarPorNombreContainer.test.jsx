import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FiltrarPorNombreContainer from '../../../container/FiltrarPorNombreContainer'

// Mock del componente visual
vi.mock('../../../components/FiltrarPorNombreVisual', () => ({
  default: ({ items, filterText, onFilterChange, loading, error }) => (
    <div data-testid="filtrar-visual">
      <input
        type="text"
        placeholder="Filtrar por nombre"
        value={filterText}
        onChange={onFilterChange}
        data-testid="filter-input"
      />
      {loading && <div>Cargando...</div>}
      {error && <div data-testid="error-message">{error}</div>}
      <div data-testid="items-list">
        {items.map((item) => (
          <div key={item.id} data-testid={`item-${item.id}`}>
            {item.nombre}
          </div>
        ))}
      </div>
    </div>
  )
}))

// Mock del servicio HTTP
vi.mock('../../../service/HttpService', () => ({
  filtrarPartidas: vi.fn()
}))

import { filtrarPartidas } from '../../../service/HttpService'

describe('FiltrarPorNombreContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===== RENDERIZADO INICIAL =====
  it('renderiza correctamente el componente', async () => {
    filtrarPartidas.mockResolvedValue([])
    render(<FiltrarPorNombreContainer items={[]} />)
    
    expect(screen.getByTestId('filtrar-visual')).toBeInTheDocument()
    expect(screen.getByTestId('filter-input')).toBeInTheDocument()
  })

  it('inicializa con un filtro vacío', async () => {
    filtrarPartidas.mockResolvedValue([])
    render(<FiltrarPorNombreContainer items={[]} />)
    
    const input = screen.getByTestId('filter-input')
    expect(input).toHaveValue('')
  })

  // ===== CARGA INICIAL DE PARTIDAS =====
  it('carga partidas al montar el componente', async () => {
    const mockPartidas = [
      { id: 1, nombre: 'Partida 1' },
      { id: 2, nombre: 'Partida 2' }
    ]
    filtrarPartidas.mockResolvedValue(mockPartidas)
    
    render(<FiltrarPorNombreContainer items={[]} />)
    
    await waitFor(() => {
      expect(filtrarPartidas).toHaveBeenCalledWith('')
      expect(screen.getByTestId('item-1')).toBeInTheDocument()
      expect(screen.getByTestId('item-2')).toBeInTheDocument()
    })
  })

  // ===== FILTRADO POR NOMBRE =====
  it('filtra partidas cuando el usuario escribe en el input', async () => {
    const user = userEvent.setup()
    const mockPartidas = [{ id: 1, nombre: 'Partida Test' }]
    filtrarPartidas.mockResolvedValue(mockPartidas)
    
    render(<FiltrarPorNombreContainer items={[]} />)
    
    const input = screen.getByTestId('filter-input')
    await user.type(input, 'Test')
    
    await waitFor(() => {
      expect(filtrarPartidas).toHaveBeenCalledWith('Test')
    })
  })

  it('actualiza la lista de partidas después del filtrado', async () => {
    const user = userEvent.setup()
    const mockPartidasIniciales = [
      { id: 1, nombre: 'Partida A' },
      { id: 2, nombre: 'Partida B' }
    ]
    const mockPartidasFiltradas = [
      { id: 1, nombre: 'Partida A' }
    ]
    
    filtrarPartidas.mockResolvedValueOnce(mockPartidasIniciales)
    render(<FiltrarPorNombreContainer items={[]} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('item-1')).toBeInTheDocument()
      expect(screen.getByTestId('item-2')).toBeInTheDocument()
    })
    
    filtrarPartidas.mockResolvedValueOnce(mockPartidasFiltradas)
    const input = screen.getByTestId('filter-input')
    await user.clear(input)
    await user.type(input, 'A')
    
    await waitFor(() => {
      expect(filtrarPartidas).toHaveBeenCalledWith('A')
      expect(screen.getByTestId('item-1')).toBeInTheDocument()
      expect(screen.queryByTestId('item-2')).not.toBeInTheDocument()
    })
  })

  // ===== MANEJO DE ERRORES =====
  it('muestra mensaje de error cuando falla la petición', async () => {
    filtrarPartidas.mockRejectedValue(new Error('Network error'))
    
    render(<FiltrarPorNombreContainer items={[]} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByText(/No se pudieron cargar las partidas filtradas/i)).toBeInTheDocument()
    })
  })

  it('limpia el error después de un filtrado exitoso', async () => {
    const user = userEvent.setup()
    filtrarPartidas.mockRejectedValueOnce(new Error('Network error'))
    
    render(<FiltrarPorNombreContainer items={[]} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })
    
    // Ahora resolvemos correctamente
    filtrarPartidas.mockResolvedValueOnce([{ id: 1, nombre: 'Partida 1' }])
    const input = screen.getByTestId('filter-input')
    await user.type(input, 'a')
    
    await waitFor(() => {
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
    })
  })

  // ===== CASOS LÍMITE =====
  it('maneja correctamente una lista vacía de partidas', async () => {
    filtrarPartidas.mockResolvedValue([])
    
    render(<FiltrarPorNombreContainer items={[]} />)
    
    await waitFor(() => {
      expect(filtrarPartidas).toHaveBeenCalled()
      const itemsList = screen.getByTestId('items-list')
      expect(itemsList.children).toHaveLength(0)
    })
  })

  it('permite borrar el filtro y volver a mostrar todas las partidas', async () => {
    const user = userEvent.setup()
    const mockTodasPartidas = [
      { id: 1, nombre: 'Partida A' },
      { id: 2, nombre: 'Partida B' }
    ]
    const mockPartidasFiltradas = [{ id: 1, nombre: 'Partida A' }]
    
    filtrarPartidas.mockResolvedValueOnce(mockTodasPartidas)
    render(<FiltrarPorNombreContainer items={[]} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('item-1')).toBeInTheDocument()
      expect(screen.getByTestId('item-2')).toBeInTheDocument()
    })
    
    // Filtrar
    filtrarPartidas.mockResolvedValueOnce(mockPartidasFiltradas)
    const input = screen.getByTestId('filter-input')
    await user.type(input, 'A')
    
    await waitFor(() => {
      expect(screen.getByTestId('item-1')).toBeInTheDocument()
      expect(screen.queryByTestId('item-2')).not.toBeInTheDocument()
    })
    
    // Borrar filtro
    filtrarPartidas.mockResolvedValueOnce(mockTodasPartidas)
    await user.clear(input)
    
    await waitFor(() => {
      expect(filtrarPartidas).toHaveBeenCalledWith('')
      expect(screen.getByTestId('item-1')).toBeInTheDocument()
      expect(screen.getByTestId('item-2')).toBeInTheDocument()
    })
  })

  // ===== EFECTO DEL FILTRO =====
  it('llama a filtrarPartidas cada vez que cambia el filterText', async () => {
    const user = userEvent.setup()
    filtrarPartidas.mockResolvedValue([])
    
    render(<FiltrarPorNombreContainer items={[]} />)
    
    await waitFor(() => {
      expect(filtrarPartidas).toHaveBeenCalledWith('')
    })
    
    const input = screen.getByTestId('filter-input')
    await user.type(input, 'abc')
    
    await waitFor(() => {
      // Se llama con '', 'a', 'ab', 'abc'
      expect(filtrarPartidas).toHaveBeenCalledWith('a')
      expect(filtrarPartidas).toHaveBeenCalledWith('ab')
      expect(filtrarPartidas).toHaveBeenCalledWith('abc')
    })
  })
})
