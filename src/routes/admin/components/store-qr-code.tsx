import * as React from 'react'

// A stand-in for the storefront's QR code. The prototype has no encoder, so the
// module pattern is generated deterministically from `value`: the same link
// always draws the same code, while the colour is applied at render time so the
// picker updates the preview instantly (a bitmap asset couldn't be recoloured).
//
// The structural parts a real code has — the three finder squares, the
// alignment square, and the timing lines — are drawn exactly, so the preview
// reads as a QR code rather than as noise.

// Module count per side, matching a version 4 code.
const MODULES = 33

// The centre square left blank for the logomark, in modules.
const LOGO_MODULES = 9

// FNV-1a, so a link maps to a stable seed.
function hashString(value: string) {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

// xorshift32: enough randomness for a pattern, and stable across renders.
function createRandom(seed: number) {
  let state = seed || 1
  return () => {
    state ^= state << 13
    state >>>= 0
    state ^= state >>> 17
    state ^= state << 5
    state >>>= 0
    return state / 0xffffffff
  }
}

function buildModules(value: string) {
  const filled: boolean[][] = Array.from({ length: MODULES }, () =>
    Array<boolean>(MODULES).fill(false),
  )
  // Structural modules can't be overwritten by the data fill below.
  const reserved: boolean[][] = Array.from({ length: MODULES }, () =>
    Array<boolean>(MODULES).fill(false),
  )

  // The three 7×7 finder squares, each with a one-module blank separator.
  const finders = [
    [0, 0],
    [0, MODULES - 7],
    [MODULES - 7, 0],
  ]
  for (const [finderRow, finderCol] of finders) {
    for (let row = -1; row <= 7; row += 1) {
      for (let col = -1; col <= 7; col += 1) {
        const r = finderRow + row
        const c = finderCol + col
        if (r < 0 || c < 0 || r >= MODULES || c >= MODULES) continue
        reserved[r][c] = true
        const insideFinder = row >= 0 && row <= 6 && col >= 0 && col <= 6
        const isRing = row === 0 || row === 6 || col === 0 || col === 6
        const isCore = row >= 2 && row <= 4 && col >= 2 && col <= 4
        filled[r][c] = insideFinder && (isRing || isCore)
      }
    }
  }

  // The 5×5 alignment square near the bottom-right corner.
  const alignStart = MODULES - 9
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const r = alignStart + row
      const c = alignStart + col
      reserved[r][c] = true
      filled[r][c] =
        row === 0 || row === 4 || col === 0 || col === 4 || (row === 2 && col === 2)
    }
  }

  // The timing lines running between the finders on row and column 6.
  for (let index = 8; index < MODULES - 8; index += 1) {
    if (!reserved[6][index]) {
      reserved[6][index] = true
      filled[6][index] = index % 2 === 0
    }
    if (!reserved[index][6]) {
      reserved[index][6] = true
      filled[index][6] = index % 2 === 0
    }
  }

  // Clear the centre so the logomark sits on plain background.
  const logoStart = Math.floor((MODULES - LOGO_MODULES) / 2)
  for (let row = logoStart; row < logoStart + LOGO_MODULES; row += 1) {
    for (let col = logoStart; col < logoStart + LOGO_MODULES; col += 1) {
      reserved[row][col] = true
      filled[row][col] = false
    }
  }

  const random = createRandom(hashString(value))
  for (let row = 0; row < MODULES; row += 1) {
    for (let col = 0; col < MODULES; col += 1) {
      if (!reserved[row][col]) filled[row][col] = random() < 0.48
    }
  }

  return filled
}

export function StoreQrCode({
  value,
  color,
  className,
}: {
  value: string
  color: string
  className?: string
}) {
  const modules = React.useMemo(() => buildModules(value), [value])

  return (
    <div className={className}>
      <div className="relative">
        <svg
          viewBox={`0 0 ${MODULES} ${MODULES}`}
          role="img"
          aria-label={`QR code linking to ${value}`}
          className="block w-full"
        >
          {modules.map((row, rowIndex) =>
            row.map((isFilled, colIndex) =>
              isFilled ? (
                <rect
                  key={`${rowIndex}-${colIndex}`}
                  x={colIndex}
                  y={rowIndex}
                  width={1}
                  height={1}
                  fill={color}
                />
              ) : null,
            ),
          )}
        </svg>
        <img
          src="/cococart-logomark.svg"
          alt=""
          className="absolute top-1/2 left-1/2 w-[18%] -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    </div>
  )
}
