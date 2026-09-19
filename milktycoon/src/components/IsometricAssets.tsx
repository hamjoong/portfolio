import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/** 
 * @function MansionIsometric
 * @description 목장의 본채(Mansion)를 아이소매트릭 SVG로 구현한 컴포넌트입니다.
 * 레벨에 따라 디자인이 고급스러워집니다.
 */
export const MansionIsometric = React.memo(({ level = 1 }: { level?: number }) => {
  // 레벨에 따른 색상/디자인 설정
  const isAdvanced = level >= 5;
  const isImproved = level >= 3;
  
  const wallColor = isAdvanced ? '#f1f5f9' : isImproved ? '#e2e8f0' : '#f8fafc';
  const roofColor = isAdvanced ? '#475569' : isImproved ? '#64748b' : '#94a3b8';
  const windowColor = isAdvanced ? '#38bdf8' : isImproved ? '#7dd3fc' : '#bae6fd';

  return (
  <svg viewBox="0 0 400 400" className="w-full h-full">
    <defs>
      <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={windowColor} />
        <stop offset="100%" stopColor={windowColor} />
      </linearGradient>
      <linearGradient id="wallMain" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={wallColor} />
        <stop offset="100%" stopColor={wallColor} />
      </linearGradient>
      <filter id="shadowBlur">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
      </filter>
    </defs>
    <g transform="translate(200, 250)">
      <ellipse cx="0" cy="20" rx="180" ry="60" fill="black" opacity="0.1" filter="url(#shadowBlur)" />
      <path d="M-140 5 L0 75 L140 5 L0 -65 Z" fill="black" opacity="0.2" />
      <path d="M-160 -5 L0 75 L160 -5 L0 -85 Z" fill={roofColor} stroke={roofColor} strokeWidth="1" />
    </g>
    <g transform="translate(200, 230)">
      <path d="M-135 0 L0 68 L135 0 L0 -68 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2" />
      <g transform="translate(-10, -5)">
        <path d="M-105 0 L0 52 L0 -85 L-105 -137 Z" fill="url(#wallMain)" stroke="#1e293b" strokeWidth="2.5" />
        <path d="M0 52 L95 5 L95 -130 L0 -85 Z" fill="url(#glassGrad)" stroke="#1e293b" strokeWidth="2.5" />
        <path d="M-115 -137 L0 -80 L105 -132 L-10 -189 Z" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
        <path d="M-115 -137 L0 -80 L0 -70 L-115 -127 Z" fill="#1e293b" />
      </g>
      <g transform="translate(65, -55)">
        <path d="M-45 0 L0 22 L0 -65 L-45 -87 Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" />
        <path d="M0 22 L65 -10 L65 -95 L0 -62 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" />
        <rect x="15" y="-60" width="35" height="28" fill="url(#glassGrad)" stroke="#1e293b" strokeWidth="1.5" transform="skewY(-26)" />
        <path d="M-55 -87 L0 -60 L75 -95 L20 -122 Z" fill="#475569" stroke="#1e293b" strokeWidth="2" />
      </g>
      {/* 고급 레벨일 경우 장식 추가 */}
      {isImproved && (
        <g transform="translate(-55, 30)">
          <path d="M-35 0 L0 18 L0 -50 L-35 -68 Z" fill={isAdvanced ? '#92400e' : '#78350f'} stroke={isAdvanced ? '#532308' : '#451a03'} strokeWidth="2" />
          <rect x="-25" y="-50" width="14" height="40" fill="#1e293b" transform="skewY(26)" />
        </g>
      )}
    </g>
  </svg>
)});

/** 
 * @function SiloIsometric
 * @description 우유 저장고(Silo)를 아이소매트릭 SVG로 구현하며, 우유 양에 따라 내부 수위가 변동되는 애니메이션을 포함합니다.
 * 레벨에 따라 디자인이 고급스러워집니다.
 * @param {object} props - fillLevel (0~100), level (1~N)
 */
export const SiloIsometric = React.memo(({ fillLevel = 0, level = 1 }: { fillLevel?: number, level?: number }) => {
  const isAdvanced = level >= 5;
  const isImproved = level >= 3;

  const bodyColor = isAdvanced ? '#f8fafc' : isImproved ? '#e2e8f0' : '#cbd5e1';
  const baseColor = isAdvanced ? '#475569' : isImproved ? '#64748b' : '#64748b';
  const scale = isAdvanced ? 1.2 : isImproved ? 1.1 : 1;

  return (
  <svg viewBox="0 0 400 400" className="w-full h-full">
    <defs>
      <filter id="shadowBlurSilo">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
      </filter>
      <linearGradient id="siloBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="50%" stopColor={bodyColor} />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
      <clipPath id="siloInnerClip">
        <path d={`M${-60 * scale} ${-150 * scale} A${60 * scale} ${25 * scale} 0 0 0 ${60 * scale} ${-150 * scale} L${60 * scale} ${15 * scale} A${60 * scale} ${25 * scale} 0 0 1 ${-60 * scale} ${15 * scale} Z`} />
      </clipPath>
    </defs>
    <g transform={`translate(200, 330) scale(${scale})`}>
      <ellipse cx="0" cy="10" rx="90" ry="35" fill="black" opacity="0.12" filter="url(#shadowBlurSilo)" />
      <ellipse cx="0" cy="0" rx="65" ry="25" fill="black" opacity="0.2" />
      <path d="M-80 0 L0 40 L80 0 L0 -40 Z" fill={baseColor} stroke="#1e293b" strokeWidth="1" />
      <path d="M-80 0 L0 40 L0 48 L-80 8 Z" fill="#475569" />
      <path d="M80 0 L0 40 L0 48 L80 8 Z" fill="#334155" />
    </g>
    <g transform={`translate(200, 310) scale(${scale})`}>
      <ellipse cx="0" cy="15" rx="60" ry="25" fill="#475569" />
      <path d="M-60 -150 A60 25 0 0 0 60 -150 L60 15 A60 25 0 0 1 -60 15 Z" fill="url(#siloBodyGrad)" stroke="#1e293b" strokeWidth="2" />
      <g clipPath="url(#siloInnerClip)">
        <motion.rect 
          initial={{ y: 15 }}
          animate={{ y: 15 - (fillLevel * 1.65) }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          x="-60" width="120" height="170" 
          fill="#3b82f6" opacity="0.4"
        />
        <motion.ellipse 
          animate={{ y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          cx="0" cy={15 - (fillLevel * 1.65)} rx="60" ry="25" 
          fill="#60a5fa" opacity="0.6" 
        />
      </g>
      <ellipse cx="0" cy="-150" rx="60" ry="25" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2" />
      <path d="M-60 -155 A60 65 0 0 1 60 -155 Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="2" />
      {/* 장식 */}
      {isImproved && <rect x="-5" y="-140" width="10" height="130" fill="#1e293b" opacity="0.3" />}
      {isAdvanced && <path d="M40 -120 L40 -30" stroke="#1e293b" strokeWidth="4" />}
    </g>
  </svg>
)});

/** 
 * @function FactoryIsometric
 * @description 가공 공장 건물을 아이소매트릭 SVG로 구현한 컴포넌트입니다.
 * 레벨에 따라 설비가 추가되고 디자인이 고급스러워집니다.
 */
export const FactoryIsometric = React.memo(({ level = 1 }: { level?: number }) => {
  const isAdvanced = level >= 5;
  const isImproved = level >= 3;

  const wallColor = isAdvanced ? '#f1f5f9' : isImproved ? '#e2e8f0' : '#cbd5e1';
  const accentColor = isAdvanced ? '#f59e0b' : isImproved ? '#d97706' : '#fde68a';

  return (
  <svg viewBox="0 0 400 400" className="w-full h-full">
    <defs>
      <filter id="shadowBlurFactory">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
      </filter>
    </defs>
    <g transform="translate(200, 310)">
      <ellipse cx="0" cy="15" rx="140" ry="45" fill="black" opacity="0.12" filter="url(#shadowBlurFactory)" />
      <path d="M-130 -5 L0 60 L130 -5 L0 -70 Z" fill="black" opacity="0.22" />
      <path d="M-140 -10 L0 60 L140 -10 L0 -80 Z" fill={isImproved ? '#64748b' : '#475569'} stroke="#1e293b" strokeWidth="1" />
      <path d="M-140 -10 L0 60 L0 75 L-140 5 Z" fill="#334155" />
      <path d="M140 -10 L0 60 L0 75 L140 5 Z" fill="#1e293b" />
    </g>
    <g transform="translate(200, 295)">
      <path d="M-115 0 L0 58 L0 -55 L-115 -113 Z" fill={wallColor} stroke="#1e293b" strokeWidth="2.5" />
      <path d="M0 58 L115 0 L115 -113 L0 -55 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5" />
      <path d="M-115 -113 L0 -171 L115 -113 L0 -55 Z" fill="#475569" stroke="#1e293b" strokeWidth="2" />
      
      {/* 기본 창문/설비 */}
      {[ -80, -30, 20 ].map((x, i) => (
        <g key={i} transform={`translate(${x}, ${-113 + (Math.abs(x)/2)})`}>
          <path d="M0 0 L30 -15 L30 15 L0 30 Z" fill="#1e293b" stroke="#1e293b" strokeWidth="1" />
          <path d="M30 -15 L80 10 L80 40 L30 15 Z" fill="#334155" stroke="#1e293b" strokeWidth="1" />
        </g>
      ))}
      
      {/* 레벨에 따른 설비 추가 */}
      <g transform="translate(50, -25)">
        <circle cx="0" cy="0" r={isImproved ? 38 : 32} fill={accentColor} stroke="#1e293b" strokeWidth="3" />
        <circle cx="0" cy="0" r={isImproved ? 12 : 8} fill="#1e293b" />
        {isImproved && [0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
          <rect key={deg} x="-5" y="-45" width="10" height="10" fill="#1e293b" transform={`rotate(${deg}, 0, 0)`} />
        ))}
      </g>
      
      {/* 굴뚝 (Improved 이상) */}
      {isImproved && (
        <path d="M-70 -115 L-70 -165 L-50 -155 L-50 -105 Z" fill="#334155" stroke="#1e293b" strokeWidth="2" />
      )}
      
      {/* 더 많은 굴뚝/설비 (Advanced 이상) */}
      {isAdvanced && (
        <path d="M-90 -100 L-90 -140 L-75 -132 L-75 -92 Z" fill="#475569" stroke="#1e293b" strokeWidth="2" />
      )}
    </g>
  </svg>
)});

export const FencePerimeter = React.memo(() => (
  <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-10">
    <g fill="#854d0e" stroke="#451a03" strokeWidth="4">
      {/* Wooden Fence Posts */}
      {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(t => (
        <rect key={`top-${t}`} x={10 + (980*t) - 8} y={50} width="16" height="60" rx="4" />
      ))}
      {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(t => (
        <rect key={`bot-${t}`} x={10 + (980*t) - 8} y={890} width="16" height="60" rx="4" />
      ))}
      {/* Rails */}
      <rect x="10" y="65" width="980" height="10" rx="2" />
      <rect x="10" y="95" width="980" height="10" rx="2" />
      <rect x="10" y="905" width="980" height="10" rx="2" />
      <rect x="10" y="935" width="980" height="10" rx="2" />
    </g>
  </svg>
));

export const GrassBackground = React.memo(() => {
  const tufts = useMemo(() => {
    const items = [];
    const rows = 15;
    const cols = 15;
    
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const seed = r * cols + c;
        items.push({
          id: `${r}-${c}`,
          x: (c * (100 / cols)) + (seededRandom(seed) * 6),
          y: (r * (100 / rows)) + (seededRandom(seed + 1) * 6),
          color: seededRandom(seed + 2) > 0.5 ? '#65a30d' : '#4d7c0f',
          scale: 0.8 + seededRandom(seed + 3) * 0.8,
          rotation: seededRandom(seed + 4) * 20 - 10
        });
      }
    }
    return items;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[#84cc16] opacity-30" />
      {tufts.map(t => (
        <div
          key={t.id}
          style={{ 
            left: `${t.x}%`, 
            top: `${t.y}%`, 
            transform: `scale(${t.scale}) rotate(${t.rotation}deg)` 
          }}
          className="absolute origin-bottom"
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 38C20 38 18 28 8 22" stroke={t.color} strokeWidth="3" strokeLinecap="round" />
            <path d="M20 38C20 38 20 20 15 10" stroke={t.color} strokeWidth="4" strokeLinecap="round" />
            <path d="M20 38C20 38 22 25 32 18" stroke={t.color} strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      ))}
    </div>
  );
});
