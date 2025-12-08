import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Title from '../components/Title/Title'
import PlayerForm from '../components/Form/Form'
import Button from '../components/Button/Button'
import AvatarPicker from '../components/AvatarPicker/AvatarPicker'
import { createPlayer } from '../service/HttpService'
import { saveUser } from '../service/LocalStorage'
import '../styles/CrearJugador.css'
import { getAvatars } from '../service/playerService'

export default function CrearJugadorContainer() {
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [error, setError] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('')
  const navigate = useNavigate()

  const avatars = getAvatars()

  // manejar el envío del formulario
  async function onSubmit(e) {
    // evitar que el formulario recargue la página
    e.preventDefault()
    setError('')

    const validar = name.trim()
    if (!validar) {
      setError('El nombre es obligatorio')
      return
    }

    if (!birthdate) {
      setError('La fecha de nacimiento es obligatoria')
      return
    }

    const today = new Date()
    const dob = new Date(birthdate)
    if (isNaN(dob.getTime())) {
      setError('Fecha de nacimiento inválida')
      return
    }

    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--
    }

    let maxAge = today.getFullYear() - 1925
    const mMax = today.getMonth() - 0
    if (mMax < 0 || (mMax === 0 && today.getDate() < 1)) {
      maxAge--
    }

    if (age > maxAge) {
      setError(`La fecha de nacimiento no puede ser anterior a 1900`)
      return
    }

    if (age < 13) {
      setError('Debes tener al menos 13 años para crear un jugador')
      return
    }

    if (!selectedAvatar) {
      setError('Selecciona un avatar')
      return
    }

    const playerData = { name: validar, birthdate, avatar: selectedAvatar }
    
    try {
      const created = await createPlayer(playerData)
      console.log('Jugador creado:', created)
      try {
        // Persistir jugador localmente para sesiones y flujos posteriores
        saveUser({ id: created.id ?? created._id ?? created.playerId, nombre: created.name ?? created.nombre ?? playerData.name, avatar: created.avatar ?? playerData.avatar })
      } catch (err) {
        // No bloqueamos el flujo si el almacenamiento falla
        console.warn('No se pudo guardar el usuario en localStorage', err)
      }

      // Redirigir a la página Home después de crear el jugador
      navigate('/home')
    } catch (err) {
      console.error('Error creando jugador:', err)
      setError('Ocurrió un error al crear el jugador. Intenta nuevamente.')
    }
  }

  return (
    <>
      <Title 
        variant="crear-jugador"
        title={`Agatha Christie's - Death on the Cards`} 
        subtitle="Crear Jugador" 
      />

      <PlayerForm onSubmit={onSubmit}>
        <p>Ingresar Nombre del Jugador</p>
        <input
          className="nombre"
          type="text"
          placeholder="Nombre"
          maxLength={50}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />

        <p>Ingrese su Fecha de Nacimiento</p>
        <input
          className="fecha-nacimiento"
          type="date"
          placeholder="Fecha de Nacimiento"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
        />
        <br />

        <p>Seleccione un Avatar</p>
        <AvatarPicker
          avatars={avatars}
          onChange={(e) => setSelectedAvatar(e.target.value)}
        />
        {error && <p className="error-message">{error}</p>}
        <Button className="boton" type="submit">Crear</Button>
      </PlayerForm>

      <div>
        <p className='parrafo'>Copyright - Wolovers</p>
      </div>
    </>
  )
}
