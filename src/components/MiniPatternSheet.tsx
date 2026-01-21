import { Pattern303, GateType } from '../types/pattern';

interface MiniPatternSheetProps {
  pattern: Pattern303;
  showTitle?: boolean;
}

// Helper to check if gate is active (handles legacy boolean values)
function isGateActive(gate: GateType | boolean): boolean {
  if (typeof gate === 'boolean') return gate;
  return gate === 'note' || gate === 'tie';
}

// Helper to check if it's a tie
function isTie(gate: GateType | boolean): boolean {
  if (typeof gate === 'boolean') return false;
  return gate === 'tie';
}

export function MiniPatternSheet({ pattern, showTitle = true }: MiniPatternSheetProps) {
  return (
    <div
      className="w-full"
      style={{
        background: 'linear-gradient(135deg, #f5f5dc 0%, #f0ead6 50%, #e8e4c9 100%)',
        borderRadius: '4px',
        padding: '8px',
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '6px',
      }}
    >
      {/* Header */}
      {showTitle && (
        <div className="text-center mb-1 pb-1" style={{ borderBottom: '1px solid #999', color: '#333' }}>
          <div className="flex justify-center items-center gap-2">
            <span style={{ fontSize: '8px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
              TB-303
            </span>
            {pattern.bank && pattern.section && (
              <span style={{ fontSize: '6px', color: '#666' }}>
                {pattern.bank}-{pattern.section}
              </span>
            )}
          </div>
          <div style={{ fontSize: '5px', color: '#666' }}>
            {pattern.name || 'Untitled'}
          </div>
        </div>
      )}

      {/* Mini Grid */}
      <div className="flex gap-px">
        {pattern.steps.map((step, i) => {
          const active = isGateActive(step.gate);
          const tie = isTie(step.gate);
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center"
              style={{
                backgroundColor: active ? 'rgba(0,0,0,0.1)' : 'transparent',
                borderLeft: i % 4 === 0 ? '1px solid #666' : 'none',
                padding: '1px',
                minWidth: '4px',
              }}
            >
              {/* Note bar - height represents pitch */}
              <div
                style={{
                  width: '100%',
                  height: `${4 + step.pitch * 1.5}px`,
                  backgroundColor: active
                    ? (step.accent ? '#c45500' : (tie ? '#666' : '#333'))
                    : '#ddd',
                  borderRadius: '1px',
                  marginBottom: '1px',
                  borderTop: tie ? '2px dashed #999' : 'none',
                }}
              />
              {/* Slide indicator */}
              {step.slide && (
                <div style={{ fontSize: '4px', color: '#666' }}>~</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mini Knob Indicators */}
      <div
        className="flex justify-between mt-1 pt-1"
        style={{ borderTop: '1px solid #ccc', color: '#666' }}
      >
        <span style={{ fontSize: '4px' }}>C:{pattern.cutoff}</span>
        <span style={{ fontSize: '4px' }}>R:{pattern.resonance}</span>
        <span style={{ fontSize: '4px' }}>E:{pattern.envMod}</span>
        <span style={{ fontSize: '4px' }}>D:{pattern.decay}</span>
      </div>

      {/* Footer */}
      <div
        className="flex justify-between mt-1"
        style={{ color: '#999', fontSize: '4px' }}
      >
        <span>{pattern.tempo} BPM</span>
        <span>{pattern.waveform === 'saw' ? 'SAW' : 'SQR'}</span>
      </div>
    </div>
  );
}
