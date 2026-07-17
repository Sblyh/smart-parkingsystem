import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ParkingSpot, ParkingFloor } from '@/types/parking';
import { Car, CheckCircle2, Clock, Crown, Ban } from 'lucide-react';

interface ParkingMapProps {
  floor: ParkingFloor;
  spots: ParkingSpot[];
  selectedSpot: ParkingSpot | null;
  onSelectSpot: (spot: ParkingSpot) => void;
  zoneColors: Record<string, string>;
}

const STATUS_CONFIG = {
  available: { color: '#10b981', bg: '#d1fae5', label: '空闲', border: '#34d399', text: '#065f46' },
  occupied:  { color: '#ef4444', bg: '#fee2e2', label: '占用', border: '#f87171', text: '#7f1d1d' },
  reserved:  { color: '#f59e0b', bg: '#fef3c7', label: '预留', border: '#fbbf24', text: '#78350f' },
  disabled:  { color: '#6b7280', bg: '#f3f4f6', label: '禁用', border: '#9ca3af', text: '#374151' },
  vip:       { color: '#a855f7', bg: '#f3e8ff', label: 'VIP',  border: '#c084fc', text: '#581c87' },
};

// ── Ground Floor constants (MUST match useParkingData.ts) ──
const GF_ROAD = {
  roadW: 38,
  pad: 50,
  hRoad1: 250,
  hRoad2: 580,
  vRoad1: 170,
  vRoad2: 500,
  vRoad3: 830,
};
const BUILDINGS = [
  { x: 240, y: 55,  w: 120, h: 170, label: '1#楼' },
  { x: 580, y: 295, w: 120, h: 170, label: '2#楼' },
  { x: 310, y: 615, w: 120, h: 170, label: '3#楼' },
];

export default function ParkingMap({ floor, spots, selectedSpot, onSelectSpot, zoneColors }: ParkingMapProps) {
  const filteredSpotIds = new Set(spots.map(s => s.id));
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);
  const isGroundFloor = floor.id === '1F';
  const { roadW, hRoad1, hRoad2, vRoad1, vRoad2, vRoad3 } = GF_ROAD;

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isHovering.current || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    const newScale = Math.min(Math.max(scale + delta, 0.4), 3);
    const scaleRatio = newScale / scale;
    setOffset(prev => ({ x: mouseX - (mouseX - prev.x) * scaleRatio, y: mouseY - (mouseY - prev.y) * scaleRatio }));
    setScale(newScale);
  }, [scale]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onEnter = () => { isHovering.current = true; };
    const onLeave = () => { isHovering.current = false; };
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => { el.removeEventListener('mouseenter', onEnter); el.removeEventListener('mouseleave', onLeave); el.removeEventListener('wheel', handleWheel); };
  }, [handleWheel]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-spot]')) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }, [offset]);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setOffset({ x: panStart.current.ox + e.clientX - panStart.current.x, y: panStart.current.oy + e.clientY - panStart.current.y });
  }, [isPanning]);
  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const getSpotIcon = (s: ParkingSpot['status']) => {
    switch (s) { case 'occupied': return <Car size={14} />; case 'available': return <CheckCircle2 size={14} />; case 'reserved': return <Clock size={14} />; case 'disabled': return <Ban size={14} />; case 'vip': return <Crown size={14} />; }
  };

  const SPOT_W = 76, SPOT_H = 46;

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-xl border select-none"
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
      style={{ backgroundColor: isGroundFloor ? '#c0b8a8' : '#F3E9DD', borderColor: 'rgba(0,0,0,0.1)', cursor: isPanning ? 'grabbing' : 'grab' }}>
      <div className="origin-top-left" style={{ width: floor.width, height: floor.height, transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, willChange: 'transform' }}>
        <svg width={floor.width} height={floor.height} viewBox={`0 0 ${floor.width} ${floor.height}`}>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <pattern id="bld" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#9ca3af" />
              <rect x="1" y="1" width="3" height="4" fill="#d1d5db" opacity="0.5" />
              <rect x="6" y="1" width="3" height="4" fill="#d1d5db" opacity="0.5" />
              <rect x="1" y="6" width="3" height="3" fill="#d1d5db" opacity="0.4" />
              <rect x="6" y="6" width="3" height="3" fill="#d1d5db" opacity="0.4" />
            </pattern>
          </defs>

          {/* ═══════ GROUND FLOOR (1F) ═══════ */}
          {isGroundFloor && (
            <g>
              {/* Grass base */}
              <rect x="0" y="0" width={floor.width} height={floor.height} fill="#a3b899" opacity="0.2" />

              {/* Road segments (drawn in 2 parts per road to leave gaps at buildings) */}
              {/* hRoad1: top horizontal — split into 3 segments to avoid building 1 */}
              <rect x="0" y={hRoad1} width={220} height={roadW} fill="#8a7e72" />                        {/* left of 1# */}
              <rect x={380} y={hRoad1} width={420} height={roadW} fill="#8a7e72" />                      {/* between 1# and right */}
              <rect x={830 + roadW} y={hRoad1} width={floor.width - 830 - roadW} height={roadW} fill="#8a7e72" /> {/* right of center */}

              {/* hRoad2: bottom horizontal — split to avoid building 3 */}
              <rect x="0" y={hRoad2} width={310} height={roadW} fill="#8a7e72" />                        {/* left of 3# */}
              <rect x={450} y={hRoad2} width={floor.width - 450} height={roadW} fill="#8a7e72" />       {/* right of 3# */}

              {/* vRoad1: left vertical — full */}
              <rect x={vRoad1} y="0" width={roadW} height={floor.height} fill="#8a7e72" />

              {/* vRoad2: center vertical — split to avoid building 2 */}
              <rect x={vRoad2} y="0" width={roadW} height={270} fill="#8a7e72" />                        {/* above 2# */}
              <rect x={vRoad2} y={475} width={roadW} height={floor.height - 475} fill="#8a7e72" />       {/* below 2# */}

              {/* vRoad3: right vertical — full */}
              <rect x={vRoad3} y="0" width={roadW} height={floor.height} fill="#8a7e72" />

              {/* Road center lines */}
              <line x1="0" y1={hRoad1 + roadW/2} x2={220} y2={hRoad1 + roadW/2} stroke="#a0937d" strokeWidth="1" strokeDasharray="10,8" />
              <line x1={380} y1={hRoad1 + roadW/2} x2={830 + roadW} y2={hRoad1 + roadW/2} stroke="#a0937d" strokeWidth="1" strokeDasharray="10,8" />
              <line x1={830 + roadW} y1={hRoad1 + roadW/2} x2={floor.width} y2={hRoad1 + roadW/2} stroke="#a0937d" strokeWidth="1" strokeDasharray="10,8" />
              <line x1="0" y1={hRoad2 + roadW/2} x2={310} y2={hRoad2 + roadW/2} stroke="#a0937d" strokeWidth="1" strokeDasharray="10,8" />
              <line x1={450} y1={hRoad2 + roadW/2} x2={floor.width} y2={hRoad2 + roadW/2} stroke="#a0937d" strokeWidth="1" strokeDasharray="10,8" />
              <line x1={vRoad1 + roadW/2} y1="0" x2={vRoad1 + roadW/2} y2={floor.height} stroke="#a0937d" strokeWidth="1" strokeDasharray="10,8" />
              <line x1={vRoad2 + roadW/2} y1="0" x2={vRoad2 + roadW/2} y2={270} stroke="#a0937d" strokeWidth="1" strokeDasharray="8,6" />
              <line x1={vRoad2 + roadW/2} y1={475} x2={vRoad2 + roadW/2} y2={floor.height} stroke="#a0937d" strokeWidth="1" strokeDasharray="8,6" />
              <line x1={vRoad3 + roadW/2} y1="0" x2={vRoad3 + roadW/2} y2={floor.height} stroke="#a0937d" strokeWidth="1" strokeDasharray="10,8" />

              {/* Road labels */}
              <text x={floor.width/2} y={hRoad1 + roadW/2 + 4} textAnchor="middle" fill="#c4b8a8" fontSize="11" fontWeight="700">益众北道</text>
              <text x={floor.width/2} y={hRoad2 + roadW/2 + 4} textAnchor="middle" fill="#c4b8a8" fontSize="11" fontWeight="700">迎宾道</text>
              <text x={vRoad1 + roadW/2 - 4} y={floor.height/2} textAnchor="middle" fill="#c4b8a8" fontSize="11" fontWeight="700" transform={`rotate(-90, ${vRoad1 + roadW/2 - 4}, ${floor.height/2})`}>德昭路</text>
              <text x={vRoad2 + roadW/2 - 4} y={170} textAnchor="middle" fill="#c4b8a8" fontSize="10" fontWeight="600" transform={`rotate(-90, ${vRoad2 + roadW/2 - 4}, 170)`}>中心路</text>
              <text x={vRoad3 + roadW/2 + 4} y={floor.height/2} textAnchor="middle" fill="#c4b8a8" fontSize="11" fontWeight="700" transform={`rotate(90, ${vRoad3 + roadW/2 + 4}, ${floor.height/2})`}>东环路</text>

              {/* Buildings */}
              {BUILDINGS.map((b, i) => (
                <g key={`b-${i}`}>
                  <rect x={b.x + 4} y={b.y + 4} width={b.w} height={b.h} rx="6" fill="rgba(0,0,0,0.15)" />
                  <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="6" fill="url(#bld)" stroke="#4b5563" strokeWidth="2" />
                  <rect x={b.x + 12} y={b.y - 12} width={b.w - 24} height="20" rx="4" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
                  <text x={b.x + b.w/2} y={b.y + 5} textAnchor="middle" fill="#374151" fontSize="13" fontWeight="900">{b.label}</text>
                  <rect x={b.x + b.w/2 - 14} y={b.y + b.h - 5} width="28" height="10" rx="3" fill="#6b7280" />
                  <text x={b.x + b.w/2} y={b.y + b.h + 12} textAnchor="middle" fill="#6b7280" fontSize="8" fontWeight="700">单元门</text>
                </g>
              ))}

              {/* Trees */}
              {[
                { cx: 210, cy: 80 }, { cx: 200, cy: 130 }, { cx: 215, cy: 180 },
                { cx: 440, cy: 80 }, { cx: 455, cy: 130 }, { cx: 440, cy: 180 },
                { cx: 550, cy: 320 }, { cx: 535, cy: 370 }, { cx: 550, cy: 420 },
                { cx: 730, cy: 330 }, { cx: 745, cy: 380 }, { cx: 730, cy: 430 },
                { cx: 280, cy: 640 }, { cx: 265, cy: 690 }, { cx: 280, cy: 730 },
                { cx: 450, cy: 640 }, { cx: 465, cy: 690 }, { cx: 450, cy: 730 },
                { cx: 100, cy: 350 }, { cx: 900, cy: 180 }, { cx: 920, cy: 500 },
                { cx: 520, cy: 100 }, { cx: 700, cy: 650 },
              ].map((t, i) => (
                <g key={`t-${i}`}><circle cx={t.cx} cy={t.cy} r="10" fill="#5b8c5a" opacity="0.45" /><circle cx={t.cx} cy={t.cy} r="6" fill="#7ab87a" opacity="0.55" /></g>
              ))}

              {/* Two entrances/exits */}
              <g>
                <rect x={floor.width/2 - 40} y={floor.height - 42} width="80" height="26" rx="6" fill="#0d9488" opacity="0.9" />
                <text x={floor.width/2} y={floor.height - 24} textAnchor="middle" fill="#ccfbf1" fontSize="11" fontWeight="800">小区出入口</text>
              </g>
              <g>
                <rect x={floor.width - 65} y={floor.height/2 - 22} width="55" height="22" rx="5" fill="#7f1d1d" opacity="0.8" />
                <text x={floor.width - 37} y={floor.height/2 - 7} textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="800">车辆出口</text>
              </g>
            </g>
          )}

          {/* ═══════ UNDERGROUND FLOORS (B1, B2) ═══════ */}
          {!isGroundFloor && (
            <g>
              {(() => {
                const uz = floor.zones.find(z => z.id === 'A');
                const ly = uz ? Math.max(...uz.spots.map(s => s.y + SPOT_H)) + 18 : floor.height / 2;
                const lx = uz ? Math.max(...uz.spots.map(s => s.x + SPOT_W)) + 18 : floor.width / 2;
                return (
                  <g>
                    <rect x="0" y={ly} width={floor.width} height="22" fill="#e8ddd0" opacity="0.9" />
                    <line x1="0" y1={ly + 11} x2={floor.width} y2={ly + 11} stroke="#c4b49e" strokeWidth="1" strokeDasharray="10,8" />
                    <rect x={lx} y="0" width="22" height={floor.height} fill="#e8ddd0" opacity="0.9" />
                    <line x1={lx + 11} y1="0" x2={lx + 11} y2={floor.height} stroke="#c4b49e" strokeWidth="1" strokeDasharray="10,8" />
                    {floor.zones.map(z => {
                      const mix = Math.min(...z.spots.map(s => s.x)), max = Math.max(...z.spots.map(s => s.x + SPOT_W)), miy = Math.min(...z.spots.map(s => s.y));
                      const cx = (mix + max) / 2;
                      const col = zoneColors[z.id] || '#64748b';
                      return (<g key={`zl-${z.id}`}><rect x={cx - 26} y={miy - 28} width="52" height="22" rx="6" fill={col} opacity="0.12" stroke={col} strokeWidth="1" /><text x={cx} y={miy - 13} textAnchor="middle" fill={col} fontSize="12" fontWeight="800">{z.name}</text></g>);
                    })}
                    <rect x="8" y={floor.height - 42} width="56" height="28" rx="6" fill="#0d9488" opacity="0.85" />
                    <text x="36" y={floor.height - 22} textAnchor="middle" fill="#ccfbf1" fontSize="11" fontWeight="800">入口</text>
                    <rect x={floor.width - 64} y={floor.height - 42} width="56" height="28" rx="6" fill="#7f1d1d" opacity="0.75" />
                    <text x={floor.width - 36} y={floor.height - 22} textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="800">出口</text>
                    <rect x={floor.width - 60} y="10" width="50" height="24" rx="6" fill="#2563eb" opacity="0.75" />
                    <text x={floor.width - 35} y="27" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="800">电梯</text>
                  </g>
                );
              })()}
            </g>
          )}

          {/* ═══════ PARKING SPOTS ═══════ */}
          <AnimatePresence>
            {floor.zones.map(zone => zone.spots.map(spot => {
              const cfg = STATUS_CONFIG[spot.status];
              const isSel = selectedSpot?.id === spot.id;
              const isHov = hoveredSpot === spot.id;
              const isMatch = filteredSpotIds.has(spot.id);
              const isDim = filteredSpotIds.size > 0 && !isMatch && !isSel;
              const op = isDim ? 0.1 : 1;
              const cx = spot.x + SPOT_W / 2, cy = spot.y + SPOT_H / 2;
              const tr = spot.rotation ? `rotate(${spot.rotation}, ${cx}, ${cy})` : undefined;
              return (
                <g key={spot.id} data-spot="true" transform={tr}
                  onClick={(e) => { if (!isDim) { e.stopPropagation(); onSelectSpot(spot); } }}
                  onMouseEnter={() => { if (!isDim) setHoveredSpot(spot.id); }} onMouseLeave={() => setHoveredSpot(null)}
                  style={{ cursor: isDim ? 'default' : 'pointer', opacity: op }}>
                  <motion.rect x={spot.x} y={spot.y} width={SPOT_W} height={SPOT_H} rx="8"
                    fill={isDim ? (isGroundFloor ? '#b8b0a4' : '#e8ddd0') : cfg.bg}
                    stroke={isSel ? '#3b82f6' : isHov && !isDim ? cfg.border : isDim ? (isGroundFloor ? '#a8a098' : '#d4c8b8') : cfg.border}
                    strokeWidth={isSel ? 3 : isHov && !isDim ? 2.5 : 1.5}
                    initial={false} animate={{ fill: isDim ? (isGroundFloor ? '#b8b0a4' : '#e8ddd0') : cfg.bg, stroke: isSel ? '#3b82f6' : isHov && !isDim ? cfg.border : isDim ? (isGroundFloor ? '#a8a098' : '#d4c8b8') : cfg.border }}
                    transition={{ duration: 0.25 }} filter={isSel ? 'url(#glow)' : undefined} />
                  {!isDim && (<>
                    <line x1={spot.x + 12} y1={spot.y + SPOT_H - 8} x2={spot.x + SPOT_W - 12} y2={spot.y + SPOT_H - 8} stroke={cfg.color} strokeWidth="2" opacity="0.3" strokeLinecap="round" />
                    <foreignObject x={spot.x + 8} y={spot.y + 6} width="18" height="18">
                      <div style={{ color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{getSpotIcon(spot.status)}</div>
                    </foreignObject>
                    <text x={cx + 2} y={cy + 5} textAnchor="middle" fill={cfg.text} fontSize="13" fontWeight="800">{spot.number}</text>
                    {spot.status === 'vip' && (<g><rect x={spot.x + SPOT_W - 24} y={spot.y + 6} width="20" height="12" rx="3" fill="#a855f7" /><text x={spot.x + SPOT_W - 14} y={spot.y + 15} textAnchor="middle" fill="white" fontSize="7" fontWeight="900">VIP</text></g>)}
                    {spot.status === 'occupied' && (<motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}><rect x={cx - 14} y={spot.y + SPOT_H - 14} width="28" height="8" rx="3" fill={cfg.color} opacity="0.35" /></motion.g>)}
                  </>)}
                  {isDim && <text x={cx} y={cy + 4} textAnchor="middle" fill={isGroundFloor ? '#a8a098' : '#c4b49e'} fontSize="10" fontWeight="500">{spot.number}</text>}
                  {isHov && !isSel && !isDim && (
                    <g>
                      <rect x={spot.x - 15} y={spot.y - 48} width={SPOT_W + 30} height="34" rx="8" fill="#fff" stroke={cfg.border} strokeWidth="1.2" opacity="0.98" />
                      <polygon points={`${cx - 6},${spot.y - 14} ${cx + 6},${spot.y - 14} ${cx},${spot.y - 8}`} fill="#fff" stroke={cfg.border} strokeWidth="1" />
                      <polygon points={`${cx - 5},${spot.y - 14.5} ${cx + 5},${spot.y - 14.5} ${cx},${spot.y - 9.5}`} fill="#fff" />
                      <text x={cx} y={spot.y - 29} textAnchor="middle" fill={cfg.text} fontSize="11" fontWeight="700">{spot.number} · {cfg.label}</text>
                      {spot.vehiclePlate && <text x={cx} y={spot.y - 17} textAnchor="middle" fill="#718096" fontSize="9">{spot.vehiclePlate}</text>}
                    </g>
                  )}
                </g>
              );
            }))}
          </AnimatePresence>
        </svg>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        {['+', '⌖', '−'].map((lbl, i) => (
          <button key={i} onClick={[() => setScale(s => Math.min(s + 0.2, 3)), () => { setScale(1); setOffset({ x: 0, y: 0 }); }, () => setScale(s => Math.max(s - 0.2, 0.4))][i]}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shadow-lg transition-all"
            style={{ backgroundColor: 'rgba(255,255,255,0.85)', color: '#4a5568', border: '1px solid rgba(0,0,0,0.1)' }}
            title={['放大', '重置视图', '缩小'][i]}>{lbl}</button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 rounded-xl p-3.5 shadow-xl z-10" style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.08)' }}>
        <h4 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: '#4a5568' }}>状态图例</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {Object.entries(STATUS_CONFIG).map(([k, c]) => (<div key={k} className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} /><span className="text-[11px]" style={{ color: '#4a5568' }}>{c.label}</span></div>))}
        </div>
        {isGroundFloor && (
          <div className="mt-2 pt-2 border-t space-y-1" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2"><div className="w-4 h-3 rounded-sm" style={{ backgroundColor: '#8a7e72' }} /><span className="text-[10px]" style={{ color: '#718096' }}>道路</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-3 rounded-sm" style={{ backgroundColor: '#9ca3af' }} /><span className="text-[10px]" style={{ color: '#718096' }}>居民楼</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
