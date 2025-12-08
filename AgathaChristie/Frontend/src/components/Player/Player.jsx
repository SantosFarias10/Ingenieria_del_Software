export default function Player({ name, avatar, className, onClick }) {
    return (
        <div
            className={className}
            data-name={name}
            data-avatar={avatar}
        >
            <img 
                src={avatar} 
                alt={name} 
                onClick={onClick}
            />
            <p>
                {name}
            </p>
        </div>
    )
}