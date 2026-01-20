import { NetworkType } from '../types/pattern';

interface NetworkSelectorProps {
  network: NetworkType;
  onChange: (network: NetworkType) => void;
}

export function NetworkSelector({ network, onChange }: NetworkSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 uppercase">Network:</span>
      <select
        value={network}
        onChange={(e) => onChange(e.target.value as NetworkType)}
        className="bg-synth-dark text-synth-silver text-sm px-3 py-1 rounded border border-gray-600 focus:border-synth-accent outline-none"
      >
        <option value="devnet">Devnet</option>
        <option value="mainnet-beta">Mainnet</option>
      </select>
      {network === 'devnet' && (
        <span className="text-xs text-yellow-500">(Test Network)</span>
      )}
    </div>
  );
}
