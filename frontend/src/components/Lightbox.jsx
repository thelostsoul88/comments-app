export default function Lightbox({ src, onClose }) {
  if (!src) return null;
  return (
    <div className="lb-backdrop" onClick={onClose}>
      <img
        className="lb-img"
        src={src}
        onClick={(e) => e.stopPropagation()}
        alt="preview"
      />
    </div>
  );
}
