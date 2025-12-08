import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccionesTurnoContainer from '../../../container/AccionesTurnoContainer'

describe('AccionesTurnoContainer', () => {
    let mockProps

    beforeEach(() => {
        mockProps = {
            esMiTurno: true,
            faseActual: 'DESCARTAR',
            onFaseChange: vi.fn(),
            onTerminarTurno: vi.fn().mockResolvedValue(),
            onDescartar: vi.fn().mockResolvedValue(),
            cartasSeleccionadas: []
        }
        vi.spyOn(window, 'alert').mockImplementation(() => {})
    })

    // ===== RENDERIZADO CONDICIONAL =====
    it('muestra mensaje cuando no es mi turno', () => {
        render(<AccionesTurnoContainer {...mockProps} esMiTurno={false} />)
        expect(screen.getByText(/No es tu turno/i)).toBeInTheDocument()
    })

    it('muestra instrucción en fase DESCARTAR', () => {
        render(<AccionesTurnoContainer {...mockProps} faseActual="DESCARTAR" />)
        expect(screen.getByRole('button', { name: /Descartar/i })).toBeInTheDocument()
        // El componente no tiene texto de instrucción en fase DESCARTAR, solo el botón
    })

    it('muestra botón terminar en fase FINALIZAR', () => {
        render(<AccionesTurnoContainer {...mockProps} faseActual="FINALIZAR" />)
        expect(screen.getByText(/Terminar Turno/i)).toBeInTheDocument()
    })

    // ===== FLUJO DESCARTAR =====
    it('ejecuta descartar cartas cuando hay cartas seleccionadas', async () => {
        const user = userEvent.setup()
        const cartasSeleccionadas = [
            { idBackend: 1, nombre: 'Carta 1' },
            { idBackend: 2, nombre: 'Carta 2' }
        ]
        render(<AccionesTurnoContainer 
            {...mockProps} 
            faseActual="DESCARTAR" 
            cartasSeleccionadas={cartasSeleccionadas}
        />)
        
        await user.click(screen.getByRole('button', { name: /Descartar \(2\)/i }))
        
        await waitFor(() => {
            expect(mockProps.onDescartar).toHaveBeenCalledTimes(1)
        })
    })

    it('no ejecuta descartar cuando no hay cartas seleccionadas', async () => {
        const user = userEvent.setup()
        render(<AccionesTurnoContainer {...mockProps} faseActual="DESCARTAR" cartasSeleccionadas={[]} />)
        
        const botonDescartar = screen.getByRole('button', { name: /Descartar/i })
        expect(botonDescartar).toBeDisabled()
    })

    // ===== FLUJO TERMINAR TURNO =====
    it('ejecuta terminar turno', async () => {
        const user = userEvent.setup()
        render(<AccionesTurnoContainer {...mockProps} faseActual="FINALIZAR" />)
        
        await user.click(screen.getByText(/Terminar Turno/i))
        
        await waitFor(() => {
            expect(mockProps.onTerminarTurno).toHaveBeenCalledTimes(1)
        })
    })

    // ===== MANEJO DE ERRORES =====
    it('maneja error al terminar turno', async () => {
        const user = userEvent.setup()
        mockProps.onTerminarTurno = vi.fn().mockRejectedValue(new Error('Error de red'))
        render(<AccionesTurnoContainer {...mockProps} faseActual="FINALIZAR" />)
        
        await user.click(screen.getByText(/Terminar Turno/i))
        
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('No se pudo terminar el turno.')
        })
    })
})
