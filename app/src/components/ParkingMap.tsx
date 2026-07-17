import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ParkingSpot, ParkingFloor } from '@/types/parking';
import {
  Car,
  CheckCircle2,
  Clock,
  Crown,
  Ban,
} from 'lucide-react';

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

export default function ParkingMap({
  floor,
  spots,
  selectedSpot,
  onSelectSpot,
  zoneColors,
}: ParkingMapProps) {
  const filteredSpotIds = new Set(spots.map(s => s.id));
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null);

  // Zoom / Pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Only react to wheel when the container is hovered
  const isHovering = useRef(false);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isHovering.current) return;
    // If user is holding Ctrl or Meta, let browser handle it (page zoom)
    if (e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Zoom toward mouse pointer
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    const newScale = Math.min(Math.max(scale + delta, 0.4), 3);
    const scaleRatio = newScale / scale;

    setOffset(prev => ({
      x: mouseX - (mouseX - prev.x) * scaleRatio,
      y: mouseY - (mouseY - prev.y) * scaleRatio,
    }));
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
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    // Don't pan if clicking on a spot
    const target = e.target as HTMLElement;
    if (target.closest('[data-spot]')) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setOffset({ x: panStart.current.ox + dx, y: panStart.current.oy + dy });
  }, [isPanning]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const handleZoomIn  = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.4));
  const handleReset   = () => { setScale(1); setOffset({ x: 0, y: 0 }); };

  const getSpotIcon = (status: ParkingSpot['status']) => {
    switch (status) {
      case 'occupied': return <Car size={14} />;
      case 'available': return <CheckCircle2 size={14} />;
      case 'reserved': return <Clock size={14} />;
      case 'disabled': return <Ban size={14} />;
      case 'vip': return <Crown size={14} />;
    }
  };

  const zones = floor.zones;
  const SPOT_W = 76;
  const SPOT_H = 46;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-xl border select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        backgroundColor: '#F3E9DD',
        borderColor: 'rgba(0,0,0,0.1)',
        cursor: isPanning ? 'grabbing' : 'grab',
      }}
    >
      {/* Transform wrapper - this is the ONLY element that scales */}
      <div
        className="origin-top-left"
        style={{
          width: floor.width,
          height: floor.height,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          willChange: 'transform',
        }}
      >
        {/* SVG uses fixed viewBox matching floor dimensions */}
        <svg
          width={floor.width}
          height={floor.height}
          viewBox={`0 0 ${floor.width} ${floor.height}`}
        >
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#a0937d" />
            </marker>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ── Drive Lanes ── */}
          {(() => {
            const upperZone = zones.find(z => z.id === 'A');
            const laneY = upperZone
              ? Math.max(...upperZone.spots.map(s => s.y + SPOT_H)) + 18
              : floor.height / 2;
            return (
              <g>
                <rect x="0" y={laneY} width={floor.width} height="22" fill="#e8ddd0" opacity="0.9" />
                <line x1="0" y1={laneY + 11} x2={floor.width} y2={laneY + 11} stroke="#c4b49e" strokeWidth="1" strokeDasharray="10,8" />
                {[80, 180, 280, 380].map((x, i) => (
                  <line key={`ha-${i}`} x1={x} y1={laneY + 11} x2={x + 22} y2={laneY + 11} stroke="#b8a890" strokeWidth="1.5" markerEnd="url(#arrow)" />
                ))}
              </g>
            );
          })()}

          {(() => {
            const leftZone = zones.find(z => z.id === 'A');
            const laneX = leftZone
              ? Math.max(...leftZone.spots.map(s => s.x + SPOT_W)) + 18
              : floor.width / 2;
            return (
              <g>
                <rect x={laneX} y="0" width="22" height={floor.height} fill="#e8ddd0" opacity="0.9" />
                <line x1={laneX + 11} y1="0" x2={laneX + 11} y2={floor.height} stroke="#c4b49e" strokeWidth="1" strokeDasharray="10,8" />
              </g>
            );
          })()}

          {/* ── Zone Labels ── */}
          {zones.map(zone => {
            const minX = Math.min(...zone.spots.map(s => s.x));
            const maxX = Math.max(...zone.spots.map(s => s.x + SPOT_W));
            const minY = Math.min(...zone.spots.map(s => s.y));
            const cx = (minX + maxX) / 2;
            const color = zoneColors[zone.id] || '#64748b';
            return (
              <g key={`label-${zone.id}`}>
                <rect
                  x={cx - 26} y={minY - 28} width="52" height="22" rx="6"
                  fill={color} opacity="0.12" stroke={color} strokeWidth="1"
                />
                <text x={cx} y={minY - 13} textAnchor="middle" fill={color} fontSize="12" fontWeight="800">
                  {zone.name}
                </text>
              </g>
            );
          })}

          {/* ── Parking Spots ── */}
          <AnimatePresence>
            {zones.map(zone =>
              zone.spots.map(spot => {
                const config = STATUS_CONFIG[spot.status];
                const isSelected = selectedSpot?.id === spot.id;
                const isHovered = hoveredSpot === spot.id;
                const isMatch = filteredSpotIds.has(spot.id);
                const isDimmed = filteredSpotIds.size > 0 && !isMatch && !isSelected;
                const opacity = isDimmed ? 0.1 : 1;
                const cx = spot.x + SPOT_W / 2;
                const cy = spot.y + SPOT_H / 2;

                return (
                  <g
                    key={spot.id}
                    data-spot="true"
                    transform={`rotate(${spot.rotation}, ${cx}, ${cy})`}
                    onClick={(e) => {
                      if (isDimmed) return;
                      e.stopPropagation();
                      onSelectSpot(spot);
                    }}
                    onMouseEnter={() => { if (!isDimmed) setHoveredSpot(spot.id); }}
                    onMouseLeave={() => setHoveredSpot(null)}
                    style={{ cursor: isDimmed ? 'default' : 'pointer', opacity }}
                  >
                    <motion.rect
                      x={spot.x} y={spot.y} width={SPOT_W} height={SPOT_H} rx="8"
                      fill={isDimmed ? '#e8ddd0' : config.bg}
                      stroke={
                        isSelected ? '#3b82f6'
                          : isHovered && !isDimmed ? config.border
                            : isDimmed ? '#d4c8b8'
                              : config.border
                      }
                      strokeWidth={isSelected ? 3 : isHovered && !isDimmed ? 2.5 : 1.5}
                      initial={false}
                      animate={{
                        fill: isDimmed ? '#e8ddd0' : config.bg,
                        stroke: isSelected ? '#3b82f6' : isHovered && !isDimmed ? config.border : isDimmed ? '#d4c8b8' : config.border,
                      }}
                      transition={{ duration: 0.25 }}
                      filter={isSelected ? 'url(#glow)' : undefined}
                    />

                    {!isDimmed && (
                      <>
                        <line x1={spot.x + 12} y1={spot.y + SPOT_H - 8} x2={spot.x + SPOT_W - 12} y2={spot.y + SPOT_H - 8}
                          stroke={config.color} strokeWidth="2" opacity="0.3" strokeLinecap="round" />

                        <foreignObject x={spot.x + 8} y={spot.y + 6} width="18" height="18">
                          <div style={{ color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                            {getSpotIcon(spot.status)}
                          </div>
                        </foreignObject>

                        <text x={cx + 2} y={cy + 5} textAnchor="middle" fill={config.text} fontSize="13" fontWeight="800">
                          {spot.number}
                        </text>

                        {spot.status === 'vip' && (
                          <g>
                            <rect x={spot.x + SPOT_W - 24} y={spot.y + 6} width="20" height="12" rx="3" fill="#a855f7" />
                            <text x={spot.x + SPOT_W - 14} y={spot.y + 15} textAnchor="middle" fill="white" fontSize="7" fontWeight="900">VIP</text>
                          </g>
                        )}

                        {spot.status === 'occupied' && (
                          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <rect x={cx - 14} y={spot.y + SPOT_H - 14} width="28" height="8" rx="3"
                              fill={config.color} opacity="0.35" />
                          </motion.g>
                        )}
                      </>
                    )}

                    {isDimmed && (
                      <text x={cx} y={cy + 4} textAnchor="middle" fill="#c4b49e" fontSize="10" fontWeight="500">
                        {spot.number}
                      </text>
                    )}

                    {isHovered && !isSelected && !isDimmed && (
                      <g>
                        <rect x={spot.x - 15} y={spot.y - 48} width={SPOT_W + 30} height="34" rx="8"
                          fill="#fff" stroke={config.border} strokeWidth="1.2" opacity="0.98" />
                        <polygon points={`${cx - 6},${spot.y - 14} ${cx + 6},${spot.y - 14} ${cx},${spot.y - 8}`}
                          fill="#fff" stroke={config.border} strokeWidth="1" />
                        <polygon points={`${cx - 5},${spot.y - 14.5} ${cx + 5},${spot.y - 14.5} ${cx},${spot.y - 9.5}`}
                          fill="#fff" />
                        <text x={cx} y={spot.y - 29} textAnchor="middle" fill={config.text} fontSize="11" fontWeight="700">
                          {spot.number} · {config.label}
                        </text>
                        {spot.vehiclePlate && (
                          <text x={cx} y={spot.y - 17} textAnchor="middle" fill="#718096" fontSize="9">
                            {spot.vehiclePlate}
                          </text>
                        )}
                      </g>
                    )}
                  </g>
                );
              })
            )}
          </AnimatePresence>

          {/* Entrance / Exit */}
          <g>
            <rect x="8" y={floor.height - 42} width="56" height="28" rx="6" fill="#0d9488" opacity="0.85" />
            <text x="36" y={floor.height - 22} textAnchor="middle" fill="#ccfbf1" fontSize="11" fontWeight="800">入口</text>
          </g>
          <g>
            <rect x={floor.width - 64} y={floor.height - 42} width="56" height="28" rx="6" fill="#dc2626" opacity="0.75" />
            <text x={floor.width - 36} y={floor.height - 22} textAnchor="middle" fill="#fee2e2" fontSize="11" fontWeight="800">出口</text>
          </g>

          {/* Elevator */}
          <g>
            <rect x={floor.width - 60} y="10" width="50" height="24" rx="6" fill="#2563eb" opacity="0.75" />
            <text x={floor.width - 35} y="27" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="800">电梯</text>
          </g>
        </svg>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shadow-lg transition-all"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)', color: '#4a5568', border: '1px solid rgba(0,0,0,0.1)' }}
          title="放大"
        >
          +
        </button>
        <button
          onClick={handleReset}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shadow-lg transition-all"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)', color: '#4a5568', border: '1px solid rgba(0,0,0,0.1)' }}
          title="重置视图"
        >
          ⌖
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shadow-lg transition-all"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)', color: '#4a5568', border: '1px solid rgba(0,0,0,0.1)' }}
          title="缩小"
        >
          −
        </button>
      </div>

      {/* Compact Legend */}
      <div className="absolute top-4 left-4 rounded-xl p-3.5 shadow-xl z-10" style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.08)' }}>
        <h4 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: '#4a5568' }}>状态图例</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
              <span className="text-[11px]" style={{ color: '#4a5568' }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
