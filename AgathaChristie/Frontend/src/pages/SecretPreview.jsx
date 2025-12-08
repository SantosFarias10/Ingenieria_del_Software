import React from 'react'
import Secret from '../components/Secret'
import { todosLosSecretos } from '../service/SecretService'

const SecretPreview = () => {

  return (
    <div style={{
      padding: '40px',
      backgroundColor: '#1a1a1a',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'white', marginBottom: '30px' }}>
        Vista Previa de Secretos
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '24px',
        maxWidth: '1400px'
      }}>
        {todosLosSecretos.map(sec => (
          <div key={sec.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Secret id={sec.id} sePuedeVoltearse={true} />
            <span style={{ color: '#ddd', fontSize: 12, textAlign: 'center' }}>{sec.nombre}</span>
          </div>
        ))}
      </div>

      <h2 style={{ color: 'white', marginTop: '40px', marginBottom: '20px' }}>
        Con diferentes estados
      </h2>

      <div style={{
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        alignItems: 'flex-start'
      }}>
        <div>
          <p style={{ color: 'white', marginBottom: '10px' }}>Volteada (flipped)</p>
          <Secret id={2} flipped={true} sePuedeVoltearse={true} />
        </div>

        <div>
          <p style={{ color: 'white', marginBottom: '10px' }}>Normal (sin voltear)</p>
          <Secret id={2} flipped={false} sePuedeVoltearse={true} />
        </div>

        <div>
          <p style={{ color: 'white', marginBottom: '10px' }}>No puede voltearse</p>
          <Secret id={2} flipped={true} sePuedeVoltearse={false} />
        </div>
      </div>
    </div>
  )
}

export default SecretPreview
