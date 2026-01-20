import { useRef, useEffect, useState, useCallback } from 'react';

// ASCII characters from dark to light
const ASCII_CHARS = ' .:-=+*#%@';

interface AsciiCameraProps {
  width?: number;
  height?: number;
  onCapture?: (ascii: string) => void;
  showControls?: boolean;
}

export function AsciiCamera({
  width = 64,
  height = 48,
  onCapture,
  showControls = true,
}: AsciiCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [ascii, setAscii] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const animationRef = useRef<number>();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
        setError(null);
      }
    } catch (e) {
      setError('Could not access camera. Please allow camera permissions.');
      console.error('Camera error:', e);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const videoToAscii = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !streaming) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match our ASCII dimensions
    canvas.width = width;
    canvas.height = height;

    // Draw video frame to canvas (scaled down)
    ctx.drawImage(video, 0, 0, width, height);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    // Convert to ASCII
    let asciiStr = '';
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // Calculate brightness (0-255)
        const brightness = (r + g + b) / 3;

        // Map brightness to ASCII character
        const charIndex = Math.floor((brightness / 255) * (ASCII_CHARS.length - 1));
        asciiStr += ASCII_CHARS[charIndex];
      }
      asciiStr += '\n';
    }

    setAscii(asciiStr);

    // Continue animation loop
    animationRef.current = requestAnimationFrame(videoToAscii);
  }, [width, height, streaming]);

  useEffect(() => {
    if (streaming) {
      animationRef.current = requestAnimationFrame(videoToAscii);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [streaming, videoToAscii]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleCapture = () => {
    if (ascii && onCapture) {
      onCapture(ascii);
      // Stop camera immediately after capture
      stopCamera();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hidden video and canvas elements */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* ASCII display */}
      <div
        className="bg-black p-2 rounded font-mono text-green-400 overflow-hidden"
        style={{
          fontSize: '6px',
          lineHeight: '6px',
          whiteSpace: 'pre',
          letterSpacing: '2px',
        }}
      >
        {ascii || (
          <div
            className="flex items-center justify-center text-gray-500"
            style={{ width: width * 8, height: height * 6, fontSize: '12px' }}
          >
            {error || 'Camera not started'}
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex gap-2">
          {!streaming ? (
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-synth-accent hover:bg-orange-600 text-white rounded transition-colors"
            >
              Start Camera
            </button>
          ) : (
            <>
              <button
                onClick={stopCamera}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
              >
                Stop
              </button>
              <button
                onClick={handleCapture}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
              >
                Capture
              </button>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}

// Compact ASCII display for profile avatars
export function AsciiAvatar({ ascii, size = 'md' }: { ascii: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeStyles = {
    sm: { fontSize: '3px', lineHeight: '3px', letterSpacing: '1px' },
    md: { fontSize: '5px', lineHeight: '5px', letterSpacing: '1.5px' },
    lg: { fontSize: '7px', lineHeight: '7px', letterSpacing: '2px' },
  };

  return (
    <div
      className="bg-black p-1 rounded font-mono text-green-400"
      style={{
        ...sizeStyles[size],
        whiteSpace: 'pre',
        overflow: 'hidden',
      }}
    >
      {ascii}
    </div>
  );
}

// Encode ASCII art to a compact string for storage
export function encodeAsciiArt(ascii: string): string {
  // Simple RLE encoding for ASCII art
  let encoded = '';
  let currentChar = '';
  let count = 0;

  for (const char of ascii) {
    if (char === currentChar) {
      count++;
    } else {
      if (count > 0) {
        encoded += count > 3 ? `${count}${currentChar}` : currentChar.repeat(count);
      }
      currentChar = char;
      count = 1;
    }
  }
  if (count > 0) {
    encoded += count > 3 ? `${count}${currentChar}` : currentChar.repeat(count);
  }

  return btoa(encoded);
}

// Decode ASCII art from compact string
export function decodeAsciiArt(encoded: string): string {
  try {
    const decoded = atob(encoded);
    // Expand RLE encoding
    return decoded.replace(/(\d+)(.)/g, (_, count, char) => char.repeat(parseInt(count)));
  } catch {
    return encoded;
  }
}

// Preset ASCII art avatars - all sized ~8x5 chars max for consistent display
export const ASCII_PRESETS: { name: string; art: string }[] = [
  { name: 'Robot', art: ` .---.
|o_o|
|_^_|
/| |\\
 | |` },
  { name: 'Alien', art: `  /^\\
|o o|
| < |
 \\m/
 /|\\` },
  { name: 'Skull', art: ` .--.
/x  x\\
| __ |
 \\||/
  ||` },
  { name: 'Cat', art: ` /\\_/\\
( o.o )
 > ^ <
 /| |\\` },
  { name: 'Ghost', art: ` .-.
/o o\\
|   |
|^v^|
 \\/` },
  { name: '303', art: `_______
|3 0 3|
|o o o|
|=====|` },
  { name: 'DJ', art: `  __
 /oo\\
 |<>|
/|==|\\` },
  { name: 'Wave', art: `~-~-~
 \\/\\/
 /\\/\\
~-~-~` },
  { name: 'Pixel', art: `######
# ## #
######
# ## #` },
  { name: 'Anon', art: ` ___
/   \\
|o o|
\\===/` },
  { name: 'Glitch', art: `▓▒░▒▓
░▓▒▓░
▒░▓░▒
▓░▒░▓` },
  { name: 'Matrix', art: `01100
10011
01101
11010` },
  { name: 'Heart', art: ` . .
.:::.
':::'
 ':'` },
  { name: 'Music', art: ` d8b
d' 'b
88 88
'Y8P'` },
  { name: 'Acid', art: ` .-.
/o o\\
\\ v /
 '-'` },
  { name: 'Star', art: `  *
 /|\\
*-+-*
 \\|/` },
];

// Preset picker component
export function AsciiPresetPicker({
  onSelect,
}: {
  onSelect: (ascii: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2">
      {ASCII_PRESETS.map((preset) => (
        <button
          key={preset.name}
          onClick={() => onSelect(preset.art)}
          className="p-2 bg-black rounded hover:ring-2 hover:ring-synth-accent transition-all group"
          title={preset.name}
        >
          <div
            className="font-mono text-green-400 text-center overflow-hidden group-hover:text-green-300"
            style={{
              fontSize: '4px',
              lineHeight: '4px',
              whiteSpace: 'pre',
            }}
          >
            {preset.art}
          </div>
          <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-400">
            {preset.name}
          </div>
        </button>
      ))}
    </div>
  );
}
