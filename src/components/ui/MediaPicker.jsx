import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

export default function MediaPicker({
  files = [],
  onChange,
  multiple = true,
  max = 6,
  label = 'Adicionar mídia',
  accept = 'image/jpeg,image/png,image/webp,image/gif',
}) {
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  function handlePick(event) {
    const picked = [...(event.target.files || [])];
    event.target.value = '';
    if (!picked.length) return;
    onChange?.(multiple ? [...files, ...picked].slice(0, max) : picked.slice(0, 1));
  }

  function remove(index) {
    onChange?.(files.filter((_, i) => i !== index));
  }

  return (
    <div className="media-picker">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handlePick}
      />
      <button type="button" className="media-picker__btn" onClick={() => inputRef.current?.click()}>
        <ImagePlus size={16} aria-hidden="true" />
        {label}
      </button>
      {previews.length ? (
        <ul className="media-picker__previews">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`}>
              <img src={previews[index]} alt="" />
              <button type="button" className="media-picker__remove" aria-label={`Remover ${file.name}`} onClick={() => remove(index)}>
                <X size={14} />
              </button>
              <span>{file.name}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
