import React from 'react';

/*
 * HexagramDrawing — disegna un esagramma a 6 linee yin/yang.
 *
 * `lines` può essere:
 *   - stringa binaria di 6 caratteri (es '101101'), bit 0 = LINEA 1 (basso)
 *   - array di 6 elementi {type:'yang'|'yin', moving?:bool}
 *
 * In display la linea 6 (top) è sopra e la linea 1 (bottom) è sotto.
 */
const HEX_SIZES = {
  xs: { box: 24, line: 2, gap: 2 },
  sm: { box: 40, line: 3, gap: 3 },
  md: { box: 64, line: 4, gap: 4 },
  lg: { box: 96, line: 6, gap: 5 },
  xl: { box: 140, line: 8, gap: 7 },
};

function normalizeLines(input) {
  if (Array.isArray(input)) return input.slice(0, 6);
  if (typeof input === 'string') {
    return input
      .padEnd(6, '0')
      .slice(0, 6)
      .split('')
      .map((b) => ({ type: b === '1' ? 'yang' : 'yin', moving: false }));
  }
  return [];
}

export default function HexagramDrawing({
  lines = '000000',
  size = 'md',
  color = '#2C2C2C',
  emphasizeMoving = true,
  showLineNumbers = false,
  className = '',
}) {
  const s = HEX_SIZES[size] || HEX_SIZES.md;
  const arr = normalizeLines(lines);

  // Top-down visual order: line 6 first
  const display = [...arr].reverse(); // index 0 → line 6 (top), index 5 → line 1 (bottom)

  return (
    <div
      className={`hex-drawing ${className}`}
      style={{ display: 'inline-flex', flexDirection: 'column', gap: s.gap }}
      aria-hidden
    >
      {display.map((ln, i) => {
        const lineNum = 6 - i;
        const isYang = ln.type === 'yang';
        const isMoving = !!ln.moving;
        return (
          <div
            key={lineNum}
            style={{
              width: s.box,
              height: s.line,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isYang ? (
              <div
                style={{
                  width: s.box,
                  height: s.line,
                  background: `linear-gradient(180deg, ${color}, ${shade(color, -12)})`,
                  borderRadius: s.line / 2,
                  position: 'relative',
                  boxShadow: isMoving && emphasizeMoving ? `0 0 8px ${MOVING_COLOR}cc` : 'none',
                }}
              >
                {isMoving && emphasizeMoving && (
                  <div style={movingDotStyle(s)} />
                )}
              </div>
            ) : (
              <div style={{ width: s.box, display: 'flex', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: (s.box - s.gap * 1.5) / 2,
                    height: s.line,
                    background: `linear-gradient(180deg, ${color}, ${shade(color, -12)})`,
                    borderRadius: s.line / 2,
                  }}
                />
                <div
                  style={{
                    width: (s.box - s.gap * 1.5) / 2,
                    height: s.line,
                    background: `linear-gradient(180deg, ${color}, ${shade(color, -12)})`,
                    borderRadius: s.line / 2,
                  }}
                />
                {isMoving && emphasizeMoving && (
                  <div style={movingDotStyle(s)} />
                )}
              </div>
            )}
            {showLineNumbers && (
              <span
                style={{
                  position: 'absolute',
                  right: -18,
                  fontSize: 9,
                  color: '#7a6f63',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {lineNum}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

const MOVING_COLOR = '#C44D38';

function movingDotStyle(s) {
  return {
    position: 'absolute',
    right: -10,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: MOVING_COLOR,
    boxShadow: `0 0 6px ${MOVING_COLOR}cc`,
  };
}

// Tiny color shading helper (positive → lighter, negative → darker, -100..+100)
function shade(hex, percent) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + (c * percent) / 100)));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

// Build a binary string from hexagram trigrams that come from the API
// (each trigram is 3 lines bottom-to-top). Some APIs return symbols
// (☰ etc) so we keep that helper here too.
export const TRIGRAM_TO_BINARY = {
  '☰': '111', // Cielo (Qián)
  '☷': '000', // Terra (Kūn)
  '☳': '001', // Tuono (Zhèn)
  '☵': '010', // Acqua (Kǎn)
  '☶': '100', // Monte (Gèn)
  '☴': '110', // Vento (Xùn)
  '☲': '101', // Fuoco (Lí)
  '☱': '011', // Lago (Duì)
};

export function buildBinaryFromTrigrams(upperSymbol, lowerSymbol) {
  const upper = TRIGRAM_TO_BINARY[upperSymbol] || '000';
  const lower = TRIGRAM_TO_BINARY[lowerSymbol] || '000';
  // Bottom-to-top binary: lower (line 1-3) + upper (line 4-6)
  return lower + upper;
}
