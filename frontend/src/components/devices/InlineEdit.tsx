import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";

interface InlineEditProps {
  value: string;
  placeholder: string;
  onSave: (newValue: string) => void;
}

export default function InlineEdit({
  value,
  placeholder,
  onSave,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed !== value) {
      onSave(trimmed);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-40 px-2 py-0.5 bg-gray-800 border border-cyan-500 rounded text-sm text-gray-100 focus:outline-none"
        />
        <button
          onClick={handleSave}
          className="p-0.5 text-green-400 hover:text-green-300"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleCancel}
          className="p-0.5 text-red-400 hover:text-red-300"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 group">
      <span className="text-gray-100">{value || placeholder}</span>
      <button
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className="p-0.5 text-gray-600 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  );
}
