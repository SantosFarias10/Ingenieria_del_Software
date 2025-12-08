export default function AvatarPicker({ avatars = [], name = 'avatar', onChange }) {
  return (
    <div className="avatars">
      {avatars.map((a) => (
        <label key={a.value}>
          <input
            type="radio"
            name={name}
            value={a.value}
            onChange={onChange}
          />
          <img src={a.src} alt={a.alt} className="avatar-img" />
        </label>
      ))}
    </div>
  );
}
