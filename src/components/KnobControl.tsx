import { useCallback, useRef, useState } from 'react';

interface KnobControlProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function KnobControl({ label, value, min = 0, max = 100, onChange }: KnobControlProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  const normalizedValue = (value - min) / (max - min);
  const rotation = -135 + normalizedValue * 270; // -135 to 135 degrees

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = value;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startYRef.current - e.clientY;
      const sensitivity = (max - min) / 100;
      const newValue = Math.max(min, Math.min(max, startValueRef.current + deltaY * sensitivity));
      onChange(Math.round(newValue));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [value, min, max, onChange]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        className={`
          w-12 h-12 rounded-full cursor-pointer select-none
          bg-gradient-to-b from-synth-knob to-gray-700
          border-2 border-gray-600
          shadow-lg
          flex items-center justify-center
          ${isDragging ? 'ring-2 ring-synth-accent' : ''}
        `}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Knob indicator line */}
        <div className="absolute w-1 h-4 bg-synth-accent rounded-full -translate-y-2" />
      </div>
      <span className="text-xs text-synth-silver uppercase tracking-wider">{label}</span>
      <span className="text-xs text-synth-accent font-bold">{value}</span>
    </div>
  );
}
