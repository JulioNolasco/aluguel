import React from 'react';

export default function PS5Symbols() {
  const symbols = ['△', '○', '□', '✕', '△', '○', '□', '✕', '△', '○'];
  const colors = ['#01d5fa', '#ff476f', '#00d189', '#f59e0b', '#0070d1'];

  return (
    <div className="ps-floating-symbols" aria-hidden="true">
      {symbols.map((sym, i) => (
        <span
          key={i}
          className="ps-sym"
          style={{
            top: `${(i * 12) + 5}%`,
            left: `${((i * 19) % 90) + 4}%`,
            fontSize: `${22 + (i % 4) * 8}px`,
            color: colors[i % colors.length],
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${14 + (i % 5) * 4}s`,
          }}
        >
          {sym}
        </span>
      ))}
    </div>
  );
}
