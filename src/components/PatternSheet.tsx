import { useState } from 'react';
import { Pattern303, Step, GateType, PatternBank, PatternSection, PatternNumber, NetworkType } from '../types/pattern';
import { useMint } from '../hooks/useMint';
import { useToken303 } from '../hooks/useToken303';
import { getMintFee, getTreasuryWallet } from '../lib/metaplex';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C'];
const BANKS: PatternBank[] = ['I', 'II', 'III', 'IV'];
const SECTIONS: PatternSection[] = ['A', 'B'];
const PATTERN_NUMBERS: PatternNumber[] = [1, 2, 3, 4, 5, 6, 7, 8];

// Compact engineering dial for synth parameters
// Standard pot rotation: 7 o'clock (min) to 5 o'clock (max), ~300° sweep
function MiniDial({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange?: (value: number) => void;
}) {
  const size = 48;
  const center = size / 2;
  const radius = 18;
  const tickRadius = radius + 4;

  // Standard pot: 7 o'clock (120°) to 5 o'clock (60°/420°), 300° sweep clockwise
  const startAngle = 120;
  const sweepAngle = 300;
  const angle = startAngle + (value / 100) * sweepAngle;
  const angleRad = (angle * Math.PI) / 180;
  const pointerLength = radius - 4;
  const pointerX = center + Math.cos(angleRad) * pointerLength;
  const pointerY = center + Math.sin(angleRad) * pointerLength;

  // Generate tick marks (11 ticks for 0, 10, 20, ... 100)
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const tickAngle = startAngle + (i / 10) * sweepAngle;
    const tickRad = (tickAngle * Math.PI) / 180;
    const innerR = radius + 1;
    const outerR = i % 5 === 0 ? tickRadius : tickRadius - 2; // Longer ticks at 0, 50, 100
    ticks.push({
      x1: center + Math.cos(tickRad) * innerR,
      y1: center + Math.sin(tickRad) * innerR,
      x2: center + Math.cos(tickRad) * outerR,
      y2: center + Math.sin(tickRad) * outerR,
      major: i % 5 === 0,
    });
  }

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onChange) return;
    e.preventDefault();
    const startY = e.clientY;
    const startValue = value;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY;
      const newValue = Math.max(0, Math.min(100, startValue + deltaY * 0.5));
      onChange(Math.round(newValue));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!onChange) return;
    e.preventDefault();
    const startY = e.touches[0].clientY;
    const startValue = value;

    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = startY - e.touches[0].clientY;
      const newValue = Math.max(0, Math.min(100, startValue + deltaY * 0.5));
      onChange(Math.round(newValue));
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible', cursor: onChange ? 'ns-resize' : 'default', touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Tick marks */}
        {ticks.map((tick, i) => (
          <line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="#666"
            strokeWidth={tick.major ? 1.5 : 0.75}
          />
        ))}
        {/* Knob body */}
        <circle cx={center} cy={center} r={radius} fill="white" stroke="#1a1a1a" strokeWidth="1.5" />
        {/* Inner ring */}
        <circle cx={center} cy={center} r={radius - 6} fill="none" stroke="#ccc" strokeWidth="0.5" />
        {/* Pointer */}
        <line x1={center} y1={center} x2={pointerX} y2={pointerY} stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
        {/* Center cap */}
        <circle cx={center} cy={center} r={2.5} fill="#1a1a1a" />
      </svg>
      <div style={{ fontSize: '7px', color: '#333', fontWeight: 'bold', marginTop: '2px' }}>{label}</div>
      <div style={{ fontSize: '9px', color: '#1a1a1a', fontFamily: 'monospace' }}>{value}</div>
    </div>
  );
}

interface PatternSheetProps {
  pattern: Pattern303;
  onStepChange?: (stepIndex: number, updates: Partial<Step>) => void;
  onNameChange?: (name: string) => void;
  onBankChange?: (bank: PatternBank) => void;
  onSectionChange?: (section: PatternSection) => void;
  onPatternNumberChange?: (patternNumber: PatternNumber) => void;
  onEfxNotesChange?: (notes: string) => void;
  onTempoChange?: (tempo: number) => void;
  onWaveformChange?: (waveform: 'saw' | 'square') => void;
  onCutoffChange?: (value: number) => void;
  onResonanceChange?: (value: number) => void;
  onEnvModChange?: (value: number) => void;
  onDecayChange?: (value: number) => void;
  onAccentChange?: (value: number) => void;
  onRandomize?: () => void;
  onClear?: () => void;
  editable?: boolean;
  creatorDisplay?: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onStop?: () => void;
  network?: NetworkType;
}

export function PatternSheet({
  pattern,
  onStepChange,
  onNameChange,
  onBankChange,
  onSectionChange,
  onPatternNumberChange,
  onEfxNotesChange,
  onTempoChange,
  onWaveformChange,
  onCutoffChange,
  onResonanceChange,
  onEnvModChange,
  onDecayChange,
  onAccentChange,
  onRandomize,
  onClear,
  editable = false,
  creatorDisplay,
  isPlaying = false,
  onTogglePlay,
  onStop,
  network = 'devnet',
}: PatternSheetProps) {
  const { mint, reset, isMinting, mintResult, error: mintError, canMint } = useMint(pattern, network);
  const { isHolder } = useToken303(network);
  const [showMintResult, setShowMintResult] = useState(false);

  const regularMintFee = getMintFee();
  const treasuryWallet = getTreasuryWallet();
  const hasTreasury = !!treasuryWallet;
  const effectiveFee = isHolder ? 0 : regularMintFee;
  const feeDisplay = isHolder ? 'FREE' : `${effectiveFee} SOL`;

  const handleMint = async () => {
    await mint();
    setShowMintResult(true);
  };

  const handleDismissMintResult = () => {
    reset();
    setShowMintResult(false);
  };

  const cycleGate = (current: GateType | boolean): GateType => {
    if (typeof current === 'boolean') return current ? 'tie' : 'note';
    switch (current) {
      case 'note': return 'tie';
      case 'tie': return 'rest';
      case 'rest': return 'note';
      default: return 'note';
    }
  };

  const getGateSymbol = (gate: GateType | boolean): { symbol: string; active: boolean } => {
    if (typeof gate === 'boolean') return gate ? { symbol: '●', active: true } : { symbol: '○', active: false };
    switch (gate) {
      case 'note': return { symbol: '●', active: true };
      case 'tie': return { symbol: '—', active: true };
      case 'rest': return { symbol: '○', active: false };
      default: return { symbol: '●', active: true };
    }
  };

  // Check if step is a rest (hides other values)
  const isRest = (gate: GateType | boolean): boolean => {
    if (typeof gate === 'boolean') return !gate;
    return gate === 'rest';
  };

  return (
    <div
      className="mx-auto w-full max-w-4xl"
      style={{
        background: 'linear-gradient(135deg, #f5f5dc 0%, #f0ead6 50%, #e8e4c9 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 0 60px rgba(0,0,0,0.05)',
        borderRadius: '4px',
        padding: '12px',
        fontFamily: '"Courier New", Courier, monospace',
        position: 'relative',
      }}
    >
      {/* Paper texture overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          borderRadius: '4px',
        }}
      />

      {/* Header with Transport & Mint */}
      <div className="relative flex flex-wrap items-center justify-between gap-2 mb-3 pb-2" style={{ borderBottom: '2px solid #333' }}>
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-lg font-black" style={{ color: '#1a1a1a', fontFamily: 'Arial Black' }}>
            TB-303
          </span>
          {/* Bank/Section compact */}
          <div className="flex gap-0.5">
            {BANKS.map((bank) => (
              <button
                key={bank}
                onClick={() => editable && onBankChange?.(bank)}
                className={`w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs font-bold border transition-colors ${
                  pattern.bank === bank ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-400'
                } ${editable ? 'cursor-pointer hover:border-black' : ''}`}
                disabled={!editable}
              >
                {bank}
              </button>
            ))}
          </div>
          <div className="flex gap-0.5">
            {SECTIONS.map((section) => (
              <button
                key={section}
                onClick={() => editable && onSectionChange?.(section)}
                className={`w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs font-bold border transition-colors ${
                  pattern.section === section ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-400'
                } ${editable ? 'cursor-pointer hover:border-black' : ''}`}
                disabled={!editable}
              >
                {section}
              </button>
            ))}
          </div>
          <div className="flex gap-0.5">
            {PATTERN_NUMBERS.map((num) => (
              <button
                key={num}
                onClick={() => editable && onPatternNumberChange?.(num)}
                className={`w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs font-bold border transition-colors ${
                  pattern.patternNumber === num ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-400'
                } ${editable ? 'cursor-pointer hover:border-black' : ''}`}
                disabled={!editable}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Transport Controls */}
        {editable && (
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onTogglePlay}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                isPlaying ? 'bg-orange-500' : 'bg-green-600 hover:bg-green-500'
              }`}
            >
              {isPlaying ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>
            <button
              onClick={onStop}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-red-600 hover:bg-red-500 flex items-center justify-center"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
            </button>
            <button onClick={onRandomize} className="px-2 py-1 text-[10px] sm:text-xs bg-purple-600 hover:bg-purple-500 text-white rounded">
              Rand
            </button>
            <button onClick={onClear} className="px-2 py-1 text-[10px] sm:text-xs bg-gray-600 hover:bg-gray-500 text-white rounded">
              Clr
            </button>
            <button
              onClick={handleMint}
              disabled={!canMint || (!hasTreasury && !isHolder) || isMinting}
              className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded transition-colors ${
                canMint && (hasTreasury || isHolder)
                  ? isHolder
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-orange-500 hover:bg-orange-400 text-white'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {isMinting ? '...' : `Mint ${feeDisplay}`}
            </button>
          </div>
        )}
      </div>

      {/* Pattern Info Row */}
      <div className="relative flex flex-wrap gap-2 sm:gap-4 mb-2 text-[10px] sm:text-xs" style={{ color: '#333' }}>
        <div className="flex items-center gap-1">
          <span className="font-bold">NAME:</span>
          {editable ? (
            <input
              type="text"
              value={pattern.name}
              onChange={(e) => onNameChange?.(e.target.value)}
              className="bg-transparent outline-none w-24 sm:w-32"
              style={{ borderBottom: '1px solid #666', fontFamily: 'monospace' }}
              placeholder="Untitled"
            />
          ) : (
            <span>{pattern.name || 'Untitled'}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold">BY:</span>
          <span className="truncate max-w-[80px] sm:max-w-[120px]">{creatorDisplay || pattern.creator || '-'}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold">BPM:</span>
          {editable ? (
            <input
              type="number"
              value={pattern.tempo}
              onChange={(e) => onTempoChange?.(parseInt(e.target.value) || 120)}
              min={60}
              max={300}
              className="w-12 bg-white/50 text-center font-bold outline-none border border-gray-400 rounded"
              style={{ fontFamily: 'monospace' }}
            />
          ) : (
            <span className="font-bold">{pattern.tempo}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold">WAVE:</span>
          {editable ? (
            <select
              value={pattern.waveform}
              onChange={(e) => onWaveformChange?.(e.target.value as 'saw' | 'square')}
              className="bg-white/50 border border-gray-400 rounded px-1 outline-none font-bold"
              style={{ fontFamily: 'monospace' }}
            >
              <option value="saw">SAW</option>
              <option value="square">SQR</option>
            </select>
          ) : (
            <span className="font-bold">{pattern.waveform === 'saw' ? 'SAW' : 'SQR'}</span>
          )}
        </div>
      </div>

      {/* Synth Parameters - Compact Dials */}
      <div className="relative flex justify-around items-center py-2 mb-2" style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>
        <MiniDial label="CUT" value={pattern.cutoff} onChange={editable ? onCutoffChange : undefined} />
        <MiniDial label="RES" value={pattern.resonance} onChange={editable ? onResonanceChange : undefined} />
        <MiniDial label="ENV" value={pattern.envMod} onChange={editable ? onEnvModChange : undefined} />
        <MiniDial label="DEC" value={pattern.decay} onChange={editable ? onDecayChange : undefined} />
        <MiniDial label="ACC" value={pattern.accent} onChange={editable ? onAccentChange : undefined} />
      </div>

      {/* Pattern Grid - Responsive */}
      <div className="relative overflow-x-auto mb-2">
        <table className="w-full" style={{ borderCollapse: 'collapse', color: '#1a1a1a', fontSize: '9px' }}>
          <thead>
            <tr>
              <th className="text-left py-1 px-1 font-bold" style={{ borderBottom: '2px solid #333', width: '40px' }}>
                STEP
              </th>
              {pattern.steps.map((_, i) => (
                <th
                  key={i}
                  className="text-center py-1 px-0.5 font-bold"
                  style={{
                    borderBottom: '2px solid #333',
                    borderLeft: i % 4 === 0 ? '2px solid #333' : '1px solid #999',
                    minWidth: '20px',
                  }}
                >
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Note Row */}
            <tr>
              <td className="py-1 px-1 font-bold" style={{ borderBottom: '1px solid #999' }}>NOTE</td>
              {pattern.steps.map((step, i) => {
                const gateInfo = getGateSymbol(step.gate);
                const stepIsRest = isRest(step.gate);
                return (
                  <td
                    key={i}
                    className="text-center py-1 px-0.5"
                    style={{
                      borderBottom: '1px solid #999',
                      borderLeft: i % 4 === 0 ? '2px solid #333' : '1px solid #ccc',
                      backgroundColor: gateInfo.active ? 'rgba(0,0,0,0.05)' : 'transparent',
                    }}
                  >
                    {stepIsRest ? (
                      <span className="text-gray-300">·</span>
                    ) : editable ? (
                      <select
                        value={step.pitch}
                        onChange={(e) => onStepChange?.(i, { pitch: parseInt(e.target.value) })}
                        className="bg-transparent text-center w-full cursor-pointer outline-none font-bold p-0"
                        style={{ color: '#000', fontSize: '9px' }}
                      >
                        {NOTE_NAMES.map((note, idx) => (
                          <option key={idx} value={idx}>{note}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="font-bold">{NOTE_NAMES[step.pitch]}</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Octave Row */}
            <tr>
              <td className="py-1 px-1 font-bold" style={{ borderBottom: '1px solid #999' }}>OCT</td>
              {pattern.steps.map((step, i) => {
                const stepIsRest = isRest(step.gate);
                return (
                  <td
                    key={i}
                    className={`text-center py-1 px-0.5 ${editable && !stepIsRest ? 'cursor-pointer hover:bg-black/10' : ''}`}
                    style={{ borderBottom: '1px solid #999', borderLeft: i % 4 === 0 ? '2px solid #333' : '1px solid #ccc' }}
                    onClick={() => {
                      if (editable && !stepIsRest) {
                        const next = step.octave === 0 ? 1 : step.octave === 1 ? -1 : 0;
                        onStepChange?.(i, { octave: next as -1 | 0 | 1 });
                      }
                    }}
                  >
                    {stepIsRest ? (
                      <span className="text-gray-300">·</span>
                    ) : (
                      <span className={step.octave !== 0 ? 'font-bold' : 'text-gray-400'}>
                        {step.octave === 1 ? '▲' : step.octave === -1 ? '▼' : '—'}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Gate Row */}
            <tr>
              <td className="py-1 px-1 font-bold" style={{ borderBottom: '1px solid #999' }}>GATE</td>
              {pattern.steps.map((step, i) => {
                const gateInfo = getGateSymbol(step.gate);
                return (
                  <td
                    key={i}
                    className={`text-center py-1 px-0.5 ${editable ? 'cursor-pointer hover:bg-black/10' : ''}`}
                    style={{ borderBottom: '1px solid #999', borderLeft: i % 4 === 0 ? '2px solid #333' : '1px solid #ccc' }}
                    onClick={() => editable && onStepChange?.(i, { gate: cycleGate(step.gate) })}
                  >
                    <span className={gateInfo.active ? 'font-bold' : 'text-gray-400'}>{gateInfo.symbol}</span>
                  </td>
                );
              })}
            </tr>

            {/* Accent Row */}
            <tr>
              <td className="py-1 px-1 font-bold" style={{ borderBottom: '1px solid #999' }}>ACC</td>
              {pattern.steps.map((step, i) => {
                const stepIsRest = isRest(step.gate);
                return (
                  <td
                    key={i}
                    className={`text-center py-1 px-0.5 ${editable && !stepIsRest ? 'cursor-pointer hover:bg-black/10' : ''}`}
                    style={{ borderBottom: '1px solid #999', borderLeft: i % 4 === 0 ? '2px solid #333' : '1px solid #ccc' }}
                    onClick={() => editable && !stepIsRest && onStepChange?.(i, { accent: !step.accent })}
                  >
                    {stepIsRest ? (
                      <span className="text-gray-300">·</span>
                    ) : step.accent ? (
                      <span className="font-bold">▶</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Slide Row */}
            <tr>
              <td className="py-1 px-1 font-bold" style={{ borderBottom: '2px solid #333' }}>SLD</td>
              {pattern.steps.map((step, i) => {
                const stepIsRest = isRest(step.gate);
                return (
                  <td
                    key={i}
                    className={`text-center py-1 px-0.5 ${editable && !stepIsRest ? 'cursor-pointer hover:bg-black/10' : ''}`}
                    style={{ borderBottom: '2px solid #333', borderLeft: i % 4 === 0 ? '2px solid #333' : '1px solid #ccc' }}
                    onClick={() => editable && !stepIsRest && onStepChange?.(i, { slide: !step.slide })}
                  >
                    {stepIsRest ? (
                      <span className="text-gray-300">·</span>
                    ) : step.slide ? (
                      <span className="font-bold">⌒</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* EFX / Notes - Compact */}
      {editable && (
        <div className="relative mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[10px]" style={{ color: '#333' }}>EFX/NOTES:</span>
            <input
              type="text"
              value={pattern.efxNotes || ''}
              onChange={(e) => onEfxNotesChange?.(e.target.value)}
              placeholder="Add notes..."
              className="flex-1 bg-white/50 border border-gray-400 rounded px-2 py-1 text-[10px] outline-none"
              style={{ fontFamily: 'monospace', color: '#333' }}
            />
          </div>
        </div>
      )}

      {/* Legend - Very Compact */}
      {editable && (
        <div className="relative text-[8px] text-center" style={{ color: '#888' }}>
          Click to edit | Gate: ●=Note —=Tie ○=Rest | ▲▼=Octave | ▶=Accent | ⌒=Slide
        </div>
      )}

      {/* Footer */}
      <div className="relative mt-3 pt-2 text-center" style={{ borderTop: '1px solid #ccc' }}>
        <a
          href="https://github.com/mconstant/pattern303"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] font-mono hover:underline"
          style={{ color: '#666' }}
        >
          github.com/mconstant/pattern303
        </a>
      </div>

      {/* Mint Result Overlay */}
      {showMintResult && (mintResult || mintError) && (
        <div className="absolute inset-0 bg-black/80 rounded flex items-center justify-center p-4">
          <div className="bg-synth-panel rounded-lg p-4 max-w-sm w-full text-center">
            {mintResult ? (
              <>
                <div className="text-green-400 text-lg font-bold mb-2">Minted!</div>
                <div className="text-xs text-gray-400 mb-2 break-all">
                  {mintResult.mintAddress}
                </div>
                <a
                  href={mintResult.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-sm rounded mb-2"
                >
                  View on Explorer
                </a>
              </>
            ) : (
              <>
                <div className="text-red-400 text-lg font-bold mb-2">Error</div>
                <div className="text-xs text-gray-400 mb-2">{mintError}</div>
              </>
            )}
            <button
              onClick={handleDismissMintResult}
              className="px-4 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
