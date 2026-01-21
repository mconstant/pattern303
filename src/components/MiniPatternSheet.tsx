import { Pattern303, GateType } from '../types/pattern';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C'];

interface MiniPatternSheetProps {
  pattern: Pattern303;
  showTitle?: boolean;
}

function isGateActive(gate: GateType | boolean): boolean {
  if (typeof gate === 'boolean') return gate;
  return gate === 'note' || gate === 'tie';
}

function getGateSymbol(gate: GateType | boolean): string {
  if (typeof gate === 'boolean') return gate ? '●' : '○';
  switch (gate) {
    case 'note': return '●';
    case 'tie': return '—';
    case 'rest': return '○';
    default: return '●';
  }
}

export function MiniPatternSheet({ pattern, showTitle = true }: MiniPatternSheetProps) {
  return (
    <div
      className="w-full"
      style={{
        background: 'linear-gradient(135deg, #f5f5dc 0%, #f0ead6 50%, #e8e4c9 100%)',
        borderRadius: '3px',
        padding: '6px',
        fontFamily: '"Courier New", Courier, monospace',
        position: 'relative',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }}
    >
      {/* Paper texture */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          borderRadius: '3px',
        }}
      />

      {/* Header */}
      {showTitle && (
        <div
          className="relative flex items-center justify-between mb-1 pb-1"
          style={{ borderBottom: '1px solid #999' }}
        >
          <div className="flex items-center gap-1">
            <span style={{ fontSize: '7px', fontWeight: 'bold', color: '#1a1a1a', fontFamily: 'Arial Black' }}>
              TB-303
            </span>
            {pattern.bank && pattern.section && (
              <span style={{ fontSize: '6px', color: '#666', fontWeight: 'bold' }}>
                {pattern.bank}-{pattern.section}
              </span>
            )}
          </div>
          <div style={{ fontSize: '6px', color: '#666' }}>
            {pattern.tempo}bpm • {pattern.waveform === 'saw' ? 'SAW' : 'SQR'}
          </div>
        </div>
      )}

      {/* Pattern Name */}
      <div
        className="relative text-center truncate mb-1"
        style={{ fontSize: '7px', fontWeight: 'bold', color: '#333' }}
      >
        {pattern.name || 'Untitled'}
      </div>

      {/* Mini Grid - Table format like real sheet */}
      <div className="relative overflow-hidden">
        <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: '5px', color: '#333' }}>
          <thead>
            <tr>
              <th style={{ width: '16px', borderBottom: '1px solid #666', textAlign: 'left', padding: '1px' }}></th>
              {pattern.steps.map((_, i) => (
                <th
                  key={i}
                  style={{
                    borderBottom: '1px solid #666',
                    borderLeft: i % 4 === 0 ? '1px solid #666' : 'none',
                    textAlign: 'center',
                    padding: '0',
                    minWidth: '8px',
                  }}
                >
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Note row */}
            <tr>
              <td style={{ fontSize: '4px', fontWeight: 'bold', padding: '1px' }}>N</td>
              {pattern.steps.map((step, i) => {
                const active = isGateActive(step.gate);
                return (
                  <td
                    key={i}
                    style={{
                      textAlign: 'center',
                      borderLeft: i % 4 === 0 ? '1px solid #999' : 'none',
                      backgroundColor: active ? 'rgba(0,0,0,0.05)' : 'transparent',
                      padding: '0',
                      color: active ? '#000' : '#aaa',
                      fontWeight: active ? 'bold' : 'normal',
                    }}
                  >
                    {NOTE_NAMES[step.pitch]}
                  </td>
                );
              })}
            </tr>
            {/* Octave row */}
            <tr>
              <td style={{ fontSize: '4px', fontWeight: 'bold', padding: '1px' }}>O</td>
              {pattern.steps.map((step, i) => (
                <td
                  key={i}
                  style={{
                    textAlign: 'center',
                    borderLeft: i % 4 === 0 ? '1px solid #999' : 'none',
                    padding: '0',
                    color: step.octave !== 0 ? '#000' : '#ccc',
                  }}
                >
                  {step.octave === 1 ? '▲' : step.octave === -1 ? '▼' : '—'}
                </td>
              ))}
            </tr>
            {/* Gate row */}
            <tr>
              <td style={{ fontSize: '4px', fontWeight: 'bold', padding: '1px' }}>G</td>
              {pattern.steps.map((step, i) => {
                const active = isGateActive(step.gate);
                return (
                  <td
                    key={i}
                    style={{
                      textAlign: 'center',
                      borderLeft: i % 4 === 0 ? '1px solid #999' : 'none',
                      padding: '0',
                      color: active ? '#000' : '#ccc',
                    }}
                  >
                    {getGateSymbol(step.gate)}
                  </td>
                );
              })}
            </tr>
            {/* Accent row */}
            <tr>
              <td style={{ fontSize: '4px', fontWeight: 'bold', padding: '1px' }}>A</td>
              {pattern.steps.map((step, i) => (
                <td
                  key={i}
                  style={{
                    textAlign: 'center',
                    borderLeft: i % 4 === 0 ? '1px solid #999' : 'none',
                    padding: '0',
                    color: step.accent ? '#c45500' : '#ccc',
                  }}
                >
                  {step.accent ? '▶' : '—'}
                </td>
              ))}
            </tr>
            {/* Slide row */}
            <tr>
              <td style={{ fontSize: '4px', fontWeight: 'bold', padding: '1px', borderBottom: '1px solid #666' }}>S</td>
              {pattern.steps.map((step, i) => (
                <td
                  key={i}
                  style={{
                    textAlign: 'center',
                    borderLeft: i % 4 === 0 ? '1px solid #999' : 'none',
                    borderBottom: '1px solid #666',
                    padding: '0',
                    color: step.slide ? '#000' : '#ccc',
                  }}
                >
                  {step.slide ? '⌒' : '—'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mini Knob Indicators */}
      <div
        className="relative flex justify-between mt-1 pt-1"
        style={{ borderTop: '1px solid #ccc', color: '#666', fontSize: '4px' }}
      >
        <span>C:{pattern.cutoff}</span>
        <span>R:{pattern.resonance}</span>
        <span>E:{pattern.envMod}</span>
        <span>D:{pattern.decay}</span>
        <span>A:{pattern.accent}</span>
      </div>

      {/* Creator */}
      {pattern.creator && (
        <div className="relative text-center mt-1" style={{ fontSize: '5px', color: '#888' }}>
          by {pattern.creator}
        </div>
      )}
    </div>
  );
}
