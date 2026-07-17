import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ParkingSpot } from '@/types/parking';
import {
  X,
  Shield,
  LayoutGrid,
  CheckCircle2,
  Car,
  Clock,
  Ban,
  Crown,
  Search,
} from 'lucide-react';

interface ManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  spots: ParkingSpot[];
  zoneColors: Record<string, string>;
  onSetStatus: (spotId: string, status: ParkingSpot['status']) => void;
}

const STATUS_CONFIG = {
  available: { color: '#10b981', bg: '#d1fae5', label: '空闲', icon: CheckCircle2 },
  occupied:  { color: '#ef4444', bg: '#fee2e2', label: '占用', icon: Car },
  reserved:  { color: '#f59e0b', bg: '#fef3c7', label: '预留', icon: Clock },
  disabled:  { color: '#6b7280', bg: '#f3f4f6', label: '禁用', icon: Ban },
  vip:       { color: '#a855f7', bg: '#f3e8ff', label: 'VIP',  icon: Crown },
};

export default function ManagementPanel({
  isOpen,
  onClose,
  spots,
  zoneColors,
  onSetStatus,
}: ManagementPanelProps) {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const stats = useMemo(() => {
    return {
      total: spots.length,
      available: spots.filter(s => s.status === 'available').length,
      occupied: spots.filter(s => s.status === 'occupied').length,
      reserved: spots.filter(s => s.status === 'reserved').length,
      disabled: spots.filter(s => s.status === 'disabled').length,
      vip: spots.filter(s => s.status === 'vip').length,
    };
  }, [spots]);

  // Reserved spots list
  const reservedSpots = useMemo(() =>
    spots.filter(s => s.status === 'reserved'),
    [spots]
  );

  // Filtered spots for management table
  const filteredSpots = useMemo(() => {
    let result = spots;
    if (filter !== 'all') result = result.filter(s => s.status === filter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.number.toLowerCase().includes(q) ||
        s.zone.toLowerCase().includes(q) ||
        s.vehiclePlate?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [spots, filter, searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Panel - slides from LEFT */}
          <motion.div
            className="fixed top-0 left-72 bottom-0 z-[70] w-[520px] shadow-2xl flex flex-col overflow-hidden"
            style={{ backgroundColor: '#F3E9DD' }}
            initial={{ x: -520, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -520, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ backgroundColor: '#5A6460', borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-emerald-400" />
                <h2 className="text-base font-bold text-white">管理空间</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '总车位', value: stats.total, color: '#4a5568' },
                  { label: '空闲', value: stats.available, color: '#10b981' },
                  { label: '占用', value: stats.occupied, color: '#ef4444' },
                  { label: '预留', value: stats.reserved, color: '#f59e0b' },
                  { label: '禁用', value: stats.disabled, color: '#6b7280' },
                  { label: 'VIP', value: stats.vip, color: '#a855f7' },
                ].map(item => (
                  <div
                    key={item.label}
                    className="rounded-lg p-3 text-center border"
                    style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderColor: 'rgba(0,0,0,0.06)' }}
                  >
                    <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                    <p className="text-[11px] font-medium" style={{ color: '#718096' }}>{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Reservation Details */}
              <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderColor: 'rgba(0,0,0,0.06)' }}>
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ backgroundColor: 'rgba(255,255,255,0.4)', borderColor: 'rgba(0,0,0,0.06)' }}>
                  <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#2d3748' }}>
                    <Clock size={14} style={{ color: '#f59e0b' }} />
                    预约明细
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                      {reservedSpots.length}
                    </span>
                  </h3>
                </div>
                {reservedSpots.length > 0 ? (
                  <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                    {reservedSpots.map(spot => (
                      <div key={spot.id} className="px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold" style={{ color: zoneColors[spot.zone] }}>{spot.number}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.04)', color: '#718096' }}>{spot.floor}</span>
                          <span className="text-xs" style={{ color: '#718096' }}>{spot.zone}区</span>
                          {spot.vehiclePlate && <span className="text-xs font-mono" style={{ color: '#4a5568' }}>{spot.vehiclePlate}</span>}
                        </div>
                        <span className="text-xs" style={{ color: '#d97706' }}>至 {spot.reservedUntil}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm" style={{ color: '#a0aec0' }}>
                    暂无预约记录
                  </div>
                )}
              </div>

              {/* Spot Management */}
              <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderColor: 'rgba(0,0,0,0.06)' }}>
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ backgroundColor: 'rgba(255,255,255,0.4)', borderColor: 'rgba(0,0,0,0.06)' }}>
                  <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#2d3748' }}>
                    <LayoutGrid size={14} style={{ color: '#5A6460' }} />
                    车位事宜
                  </h3>
                  <span className="text-xs" style={{ color: '#a0aec0' }}>{filteredSpots.length} 个车位</span>
                </div>

                {/* Search & Filter */}
                <div className="p-3 border-b space-y-2" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={13} style={{ color: '#718096' }} />
                    <input
                      type="text"
                      placeholder="搜索车位号或车牌..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                      style={{ backgroundColor: 'rgba(255,255,255,0.8)', color: '#2d3748', border: '1px solid rgba(0,0,0,0.08)' }}
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { value: 'all', label: '全部' },
                      { value: 'available', label: '空闲' },
                      { value: 'occupied', label: '占用' },
                      { value: 'reserved', label: '预留' },
                      { value: 'disabled', label: '禁用' },
                      { value: 'vip', label: 'VIP' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setFilter(opt.value)}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all border"
                        style={{
                          backgroundColor: filter === opt.value ? 'rgba(90,100,96,0.12)' : 'rgba(255,255,255,0.4)',
                          color: filter === opt.value ? '#5A6460' : '#a0aec0',
                          borderColor: filter === opt.value ? 'rgba(90,100,96,0.25)' : 'rgba(0,0,0,0.04)',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spot Table */}
                <div className="max-h-[280px] overflow-y-auto">
                  {filteredSpots.length > 0 ? (
                    <table className="w-full text-left">
                      <thead>
                        <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                          <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#a0aec0' }}>楼层</th>
                          <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#a0aec0' }}>车位</th>
                          <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#a0aec0' }}>状态</th>
                          <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#a0aec0' }}>车牌</th>
                          <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#a0aec0' }}>操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                        {filteredSpots.map(spot => {
                          const cfg = STATUS_CONFIG[spot.status];
                          const canDisable = spot.status !== 'disabled';
                          const canVip = spot.status !== 'vip';
                          const canRestore = spot.status === 'disabled' || spot.status === 'vip';
                          const canRelease = spot.status === 'occupied' || spot.status === 'reserved';
                          return (
                            <tr key={spot.id} className="hover:bg-white/40 transition-colors">
                              <td className="px-2 py-2">
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.04)', color: '#718096' }}>
                                  {spot.floor}
                                </span>
                              </td>
                              <td className="px-2 py-2">
                                <span className="text-xs font-bold" style={{ color: zoneColors[spot.zone] }}>{spot.number}</span>
                              </td>
                              <td className="px-2 py-2">
                                <span
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
                                  style={{ backgroundColor: cfg.bg, color: cfg.color }}
                                >
                                  <cfg.icon size={10} />
                                  {cfg.label}
                                </span>
                              </td>
                              <td className="px-2 py-2">
                                <span className="text-[11px] font-mono" style={{ color: spot.vehiclePlate ? '#4a5568' : '#a0aec0' }}>
                                  {spot.vehiclePlate || '-'}
                                </span>
                              </td>
                              <td className="px-2 py-2">
                                <div className="flex gap-1">
                                  {canRelease && (
                                    <button
                                      onClick={() => onSetStatus(spot.id, 'available')}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all border"
                                      style={{ backgroundColor: '#dbeafe', color: '#2563eb', borderColor: '#93c5fd' }}
                                      title="释放车位"
                                    >
                                      释放
                                    </button>
                                  )}
                                  {canDisable && (
                                    <button
                                      onClick={() => onSetStatus(spot.id, 'disabled')}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all border"
                                      style={{ backgroundColor: '#f3f4f6', color: '#6b7280', borderColor: '#e5e7eb' }}
                                      title="设为禁用"
                                    >
                                      禁用
                                    </button>
                                  )}
                                  {canVip && (
                                    <button
                                      onClick={() => onSetStatus(spot.id, 'vip')}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all border"
                                      style={{ backgroundColor: '#f3e8ff', color: '#7c3aed', borderColor: '#ddd6fe' }}
                                      title="设为VIP"
                                    >
                                      VIP
                                    </button>
                                  )}
                                  {canRestore && (
                                    <button
                                      onClick={() => onSetStatus(spot.id, 'available')}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all border"
                                      style={{ backgroundColor: '#d1fae5', color: '#059669', borderColor: '#a7f3d0' }}
                                      title="恢复空闲"
                                    >
                                      恢复
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-4 py-6 text-center text-sm" style={{ color: '#a0aec0' }}>
                      暂无匹配的车位
                    </div>
                  )}
                </div>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
