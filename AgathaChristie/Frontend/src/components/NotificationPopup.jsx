import { useState, useEffect } from 'react'
import '../styles/NotificationPopup.css'

const NotificationPopup = ({ message, type = 'info', duration = 2000, onClose }) => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (message) {
            setVisible(true)
            
            const timer = setTimeout(() => {
                setVisible(false)
                setTimeout(() => {
                    onClose?.()
                }, 300) // Espera a que termine la animacion xd
            }, duration)

            return () => clearTimeout(timer)
        }
    }, [message, duration, onClose])

    if (!message) return null

    return (
        <div className={`notification-popup ${visible ? 'visible' : ''} ${type}`} data-testid="notification-popup">
            <div className="notification-content">
                <span className="notification-message">{message}</span>
            </div>
        </div>
    )
}

export default NotificationPopup
