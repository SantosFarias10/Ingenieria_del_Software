// import { useState } from 'react'
import Title from '../components/Title/Title'
import Button from '../components/Button/Button'
import { useNavigate } from 'react-router-dom'
import '../styles/HomeContainer.css'

export default function HomeContainer() {

    const navigate = useNavigate()

    return (
        <>
            <Title 
                variant="home"
                title={`Agatha Christie's - Death on the Cards`} 
            />
            <div
                className='home-container'
            >
                <h2 
                    className='subtitle-home'
                >   
                    Home
                </h2>
                <Button 
                    onClick={() => navigate('/crear-partida')}
                >
                    Crear Partida
                </Button>
                <Button 
                    onClick={() => navigate('/listar-partidas')}
                >
                    Unirse a Partida
                </Button>
            </div>
        </>
    )
}