import { Pattern303 } from '../types/pattern';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C'];

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateDial(cx: number, cy: number, value: number, label: string): string {
  const radius = 24;
  const angle = -135 + (value / 100) * 270;
  const angleRad = (angle * Math.PI) / 180;
  const pointerLength = radius - 6;
  const pointerX = cx + Math.cos(angleRad) * pointerLength;
  const pointerY = cy + Math.sin(angleRad) * pointerLength;

  let ticks = '';
  for (let i = 0; i <= 10; i++) {
    const tickAngle = -135 + (i / 10) * 270;
    const tickRad = (tickAngle * Math.PI) / 180;
    const innerR = i % 5 === 0 ? radius + 1 : radius + 2;
    const outerR = radius + 5;
    const x1 = cx + Math.cos(tickRad) * innerR;
    const y1 = cy + Math.sin(tickRad) * innerR;
    const x2 = cx + Math.cos(tickRad) * outerR;
    const y2 = cy + Math.sin(tickRad) * outerR;
    const strokeWidth = i % 5 === 0 ? 1.2 : 0.6;
    ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1a1a1a" stroke-width="${strokeWidth}"/>`;
  }

  return `
    <g>
      <!-- Label -->
      <text x="${cx}" y="${cy - 38}" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#1a1a1a">${label}</text>
      <!-- Dial background -->
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="white" stroke="#1a1a1a" stroke-width="1.5"/>
      <!-- Inner circle -->
      <circle cx="${cx}" cy="${cy}" r="${radius - 8}" fill="none" stroke="#1a1a1a" stroke-width="0.4" stroke-dasharray="1.5,1.5"/>
      <!-- Tick marks -->
      ${ticks}
      <!-- Pointer -->
      <line x1="${cx}" y1="${cy}" x2="${pointerX}" y2="${pointerY}" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
      <!-- Center dot -->
      <circle cx="${cx}" cy="${cy}" r="3" fill="#1a1a1a"/>
      <!-- Value -->
      <text x="${cx}" y="${cy + 45}" text-anchor="middle" font-family="'Courier New', monospace" font-size="9" font-weight="bold" fill="#1a1a1a">${value}</text>
    </g>
  `;
}

export function patternToSvg(pattern: Pattern303): string {
  const width = 900;
  const height = 520;
  const padding = 30;
  const tableStartY = 120;
  const rowHeight = 28;
  const colWidth = 42;
  const labelColWidth = 70;

  // Paper colors
  const paperBg = '#f5f5dc';
  const paperDark = '#e8e4c9';

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <!-- Paper gradient -->
    <linearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${paperBg}"/>
      <stop offset="50%" style="stop-color:#f0ead6"/>
      <stop offset="100%" style="stop-color:${paperDark}"/>
    </linearGradient>
    <!-- Paper texture filter -->
    <filter id="paperTexture" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise"/>
      <feDiffuseLighting in="noise" lighting-color="white" surfaceScale="2" result="diffLight">
        <feDistantLight azimuth="45" elevation="60"/>
      </feDiffuseLighting>
      <feBlend in="SourceGraphic" in2="diffLight" mode="multiply"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#paperGrad)"/>

  <!-- Subtle paper texture overlay -->
  <rect width="${width}" height="${height}" fill="url(#paperGrad)" opacity="0.3" filter="url(#paperTexture)"/>

  <!-- Header -->
  <g>
    <text x="${width / 2}" y="35" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="20" font-weight="bold" fill="#1a1a1a" letter-spacing="3">TB-303 PATTERN SHEET</text>
    <text x="${width / 2}" y="52" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#444">BASS LINE SYNTHESIZER</text>
    <line x1="${padding}" y1="62" x2="${width - padding}" y2="62" stroke="#333" stroke-width="2"/>
  </g>

  <!-- Pattern Info -->
  <g font-family="'Courier New', monospace" font-size="10" fill="#333">
    <text x="${padding}" y="82"><tspan font-weight="bold">PATTERN NAME:</tspan> <tspan text-decoration="underline">${escapeXml(pattern.name || 'Untitled')}</tspan></text>
    <text x="${padding + 280}" y="82"><tspan font-weight="bold">CREATED BY:</tspan> <tspan text-decoration="underline">${escapeXml(pattern.creator || 'Anonymous')}</tspan></text>
    <text x="${padding}" y="100"><tspan font-weight="bold">TEMPO:</tspan> <tspan text-decoration="underline">${pattern.tempo} BPM</tspan></text>
    <text x="${padding + 280}" y="100"><tspan font-weight="bold">WAVEFORM:</tspan> <tspan text-decoration="underline">${pattern.waveform === 'saw' ? 'SAWTOOTH' : 'SQUARE'}</tspan></text>
  </g>

  <!-- Pattern Grid Table -->
  <g font-family="'Courier New', monospace" font-size="9">
    <!-- Header row -->
    <rect x="${padding}" y="${tableStartY}" width="${labelColWidth}" height="${rowHeight}" fill="none" stroke="#333" stroke-width="1.5"/>
    <text x="${padding + 8}" y="${tableStartY + 18}" font-weight="bold" fill="#1a1a1a">STEP</text>`;

  // Step number headers
  for (let i = 0; i < 16; i++) {
    const x = padding + labelColWidth + i * colWidth;
    const borderWidth = i % 4 === 0 ? 1.5 : 0.75;
    const borderColor = i % 4 === 0 ? '#333' : '#999';
    svg += `
    <rect x="${x}" y="${tableStartY}" width="${colWidth}" height="${rowHeight}" fill="none" stroke="${borderColor}" stroke-width="${borderWidth}"/>
    <text x="${x + colWidth / 2}" y="${tableStartY + 18}" text-anchor="middle" font-weight="bold" fill="#1a1a1a">${i + 1}</text>`;
  }

  // Data rows
  const rows = [
    { label: 'NOTE', getValue: (step: typeof pattern.steps[0]) => NOTE_NAMES[step.pitch], isBold: (step: typeof pattern.steps[0]) => step.gate },
    { label: 'OCTAVE', getValue: (step: typeof pattern.steps[0]) => step.octave === 1 ? '▲' : step.octave === -1 ? '▼' : '—', isBold: (step: typeof pattern.steps[0]) => step.octave !== 0 },
    { label: 'GATE', getValue: (step: typeof pattern.steps[0]) => step.gate ? '●' : '○', isBold: (step: typeof pattern.steps[0]) => step.gate },
    { label: 'ACCENT', getValue: (step: typeof pattern.steps[0]) => step.accent ? '▶' : '—', isBold: (step: typeof pattern.steps[0]) => step.accent },
    { label: 'SLIDE', getValue: (step: typeof pattern.steps[0]) => step.slide ? '⌒' : '—', isBold: (step: typeof pattern.steps[0]) => step.slide },
  ];

  rows.forEach((row, rowIdx) => {
    const y = tableStartY + (rowIdx + 1) * rowHeight;
    const isLastRow = rowIdx === rows.length - 1;
    const rowBorderWidth = isLastRow ? 1.5 : 0.75;

    svg += `
    <rect x="${padding}" y="${y}" width="${labelColWidth}" height="${rowHeight}" fill="none" stroke="#333" stroke-width="${rowBorderWidth}"/>
    <text x="${padding + 8}" y="${y + 18}" font-weight="bold" fill="#1a1a1a">${row.label}</text>`;

    for (let i = 0; i < 16; i++) {
      const x = padding + labelColWidth + i * colWidth;
      const step = pattern.steps[i];
      const value = row.getValue(step);
      const bold = row.isBold(step);
      const borderWidth = i % 4 === 0 ? 1.5 : 0.75;
      const borderColor = i % 4 === 0 ? '#333' : '#ccc';
      const bgColor = row.label === 'NOTE' && step.gate ? 'rgba(0,0,0,0.05)' : 'transparent';
      const textColor = bold ? '#1a1a1a' : '#999';

      svg += `
    <rect x="${x}" y="${y}" width="${colWidth}" height="${rowHeight}" fill="${bgColor}" stroke="${borderColor}" stroke-width="${isLastRow ? 1.5 : borderWidth}"/>
    <text x="${x + colWidth / 2}" y="${y + 18}" text-anchor="middle" fill="${textColor}" ${bold ? 'font-weight="bold"' : ''}>${escapeXml(value)}</text>`;
    }
  });

  svg += `
  </g>

  <!-- Synth Parameters Dials -->
  <g>
    <line x1="${padding}" y1="${tableStartY + 6 * rowHeight + 15}" x2="${width - padding}" y2="${tableStartY + 6 * rowHeight + 15}" stroke="#999" stroke-width="1"/>`;

  const dialY = tableStartY + 6 * rowHeight + 75;
  const dialSpacing = (width - padding * 2) / 5;
  const dials = [
    { label: 'CUTOFF', value: pattern.cutoff },
    { label: 'RESONANCE', value: pattern.resonance },
    { label: 'ENV MOD', value: pattern.envMod },
    { label: 'DECAY', value: pattern.decay },
    { label: 'ACCENT', value: pattern.accent },
  ];

  dials.forEach((dial, i) => {
    const cx = padding + dialSpacing / 2 + i * dialSpacing;
    svg += generateDial(cx, dialY, dial.value, dial.label);
  });

  svg += `
  </g>

  <!-- Footer -->
  <g font-family="'Courier New', monospace" font-size="8" fill="#666">
    <line x1="${padding}" y1="${height - 35}" x2="${width - padding}" y2="${height - 35}" stroke="#999" stroke-width="0.5"/>
    <text x="${width - padding}" y="${height - 20}" text-anchor="end">PATTERN 303 NFT</text>
  </g>

</svg>`;

  return svg;
}

export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

// Compact SVG for on-chain storage (much smaller file size)
export function patternToCompactSvg(pattern: Pattern303): string {
  const w = 400;
  const h = 200;

  // Build step visualization as a simple grid
  let steps = '';
  for (let i = 0; i < 16; i++) {
    const step = pattern.steps[i];
    const x = 20 + i * 23;
    const noteY = 80 - step.pitch * 4;

    if (step.gate) {
      const color = step.accent ? '#f60' : '#0a0';
      steps += `<rect x="${x}" y="${noteY}" width="20" height="${16 + step.pitch * 2}" fill="${color}" rx="2"/>`;
      if (step.octave === 1) steps += `<text x="${x + 10}" y="${noteY + 10}" text-anchor="middle" fill="#fff" font-size="8">+</text>`;
      if (step.octave === -1) steps += `<text x="${x + 10}" y="${noteY + 10}" text-anchor="middle" fill="#fff" font-size="8">-</text>`;
    } else {
      steps += `<rect x="${x}" y="70" width="20" height="4" fill="#444" rx="1"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#f5f5dc"/><text x="${w/2}" y="25" text-anchor="middle" font-family="monospace" font-size="14" font-weight="bold" fill="#1a1a1a">TB-303: ${escapeXml(pattern.name.slice(0, 20))}</text><text x="${w/2}" y="42" text-anchor="middle" font-family="monospace" font-size="10" fill="#666">by ${escapeXml((pattern.creator || 'Anonymous').slice(0, 20))} | ${pattern.tempo}BPM</text><g transform="translate(0,50)">${steps}</g><text x="20" y="${h-15}" font-family="monospace" font-size="8" fill="#888">Cut:${pattern.cutoff} Res:${pattern.resonance} Env:${pattern.envMod} Dec:${pattern.decay}</text></svg>`;
}
