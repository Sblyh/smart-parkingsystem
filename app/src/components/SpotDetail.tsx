import { motion, AnimatePresence } from 'framer-motion';
import type { ParkingSpot } from '@/types/parking';
import {
  X,
  Car,
  CheckCircle2,
  Clock,
  Crown,
  Ban,
  Shield,
  LogIn,
  MapPin,
  Calendar,
  Timer,
  Tag,
  RefreshCw,
} from 'lucide-react';

interface SpotDetailProps {
  spot: ParkingSpot | null;
  onClose: () => void;
  onToggleStatus: (spotId: string) => void;
  onSetStatus: (spotId: string, status: ParkingSpot['status']) => void;
  zoneColors: Record<string, string>;
  isAdmin: boolean;
  onLoginClick: () => void;
}

const STATUS_CONFIG = {
  available: { color: '#10b981', bg: '#d1fae5', label: '空闲', border: '#34d399', text: '#065f46', description: '该车位当前空闲，可停放车辆' },
  occupied:  { color: '#ef4444', bg: '#fee2e2', label: '占用', border: '#f87171', text: '#7f1d1d', description: '该车位已被占用' },
  reserved:  { color: '#f59e0b', bg: '#fef3c7', label: '预留', border: '#fbbf24', text: '#78350f', description: '该车位已被预留' },
  disabled:  { color: '#6b7280', bg: '#f3f4f6', label: '禁用', border: '#9ca3af', text: '#374151', description: '该车位已禁用，暂停使用' },
  vip:       { color: '#a855f7', bg: '#f3e8ff', label: 'VIP',  border: '#c084fc', text: '#581c87', description: 'VIP专用车位' },
};

export default function SpotDetail({
  spot,
  onClose,
  onToggleStatus,
  onSetStatus,
  zoneColors,
  isAdmin,
  onLoginClick,
}: SpotDetailProps) {
  if (!spot) return null;

  const config = STATUS_CONFIG[spot.status];
  const StatusIcon = spot.status === 'occupied' ? Car : spot.status === 'reserved' ? Clock : CheckCircle2;
  const zoneColor = zoneColors[spot.zone] || '#64748b';

  return (
    <AnimatePresence>
      {spot && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white border border-black/[0.08] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
          >
            {/* Header */}
            <div className="relative p-6 pb-4" style={{ backgroundColor: config.bg }}>
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: config.color }} />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-black/5 hover:bg-black/10 rounded-lg flex items-center justify-center transition-all"
                style={{ color: '#4a5568' }}
              >
                <X size={16} />
              </button>

              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: config.bg, border: `2px solid ${config.border}` }}
                >
                  <StatusIcon size={28} style={{ color: config.color }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{spot.number}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: config.bg, color: config.color, border: `1px solid ${config.border}` }}
                    >
                      {config.label}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: `${zoneColor}15`, color: zoneColor }}
                    >
                      {spot.floor} · {spot.zone}区
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm mt-3 text-gray-600">{config.description}</p>
            </div>

            {/* Details */}
            <div className="p-6 pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin size={16} className="text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs">位置</p>
                    <p className="text-gray-900 text-sm font-semibold">{spot.floor}层 · {spot.zone}区 · 车位{spot.number}</p>
                  </div>
                </div>

                {spot.vehiclePlate && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Car size={16} className="text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-xs">车牌号</p>
                      <p className="text-gray-900 text-sm font-semibold">{spot.vehiclePlate}</p>
                    </div>
                  </div>
                )}

                {spot.vehicleType && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Tag size={16} className="text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-xs">车辆类型</p>
                      <p className="text-gray-900 text-sm font-semibold">{spot.vehicleType}</p>
                    </div>
                  </div>
                )}

                {spot.entryTime && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-xs">入场时间</p>
                      <p className="text-gray-900 text-sm font-semibold">{spot.entryTime}</p>
                    </div>
                  </div>
                )}

                {spot.duration && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Timer size={16} className="text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-xs">停车时长</p>
                      <p className="text-gray-900 text-sm font-semibold">{spot.duration}</p>
                    </div>
                  </div>
                )}

                {spot.reservedUntil && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <Clock size={16} className="text-amber-500" />
                    <div>
                      <p className="text-amber-600 text-xs">预留至</p>
                      <p className="text-amber-900 text-sm font-semibold">{spot.reservedUntil}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Admin Actions ── */}
              {isAdmin ? (
                <div className="mt-5 space-y-3">
                  {/* Primary action: toggle available / occupied */}
                  <div className="flex gap-2">
                    {(spot.status === 'available' || spot.status === 'occupied' || spot.status === 'reserved') && (
                      <button
                        onClick={() => onToggleStatus(spot.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all border"
                        style={{
                          backgroundColor: spot.status === 'available' ? '#fee2e2' : '#d1fae5',
                          color: spot.status === 'available' ? '#dc2626' : '#059669',
                          borderColor: spot.status === 'available' ? '#fca5a5' : '#6ee7b7',
                        }}
                      >
                        <RefreshCw size={14} />
                        {spot.status === 'available' ? '模拟停车' : '释放车位'}
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 bg-gray-50 border border-black/5 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-all"
                    >
                      关闭
                    </button>
                  </div>

                  {/* Admin special status controls */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">管理员操作</p>
                    <div className="flex gap-2 flex-wrap">
                      {spot.status !== 'disabled' && (
                        <button
                          onClick={() => { onSetStatus(spot.id, 'disabled'); onClose(); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all"
                          style={{ backgroundColor: '#f3f4f6', color: '#6b7280', borderColor: '#e5e7eb' }}
                        >
                          <Ban size={12} />
                          设为禁用
                        </button>
                      )}
                      {spot.status !== 'vip' && (
                        <button
                          onClick={() => { onSetStatus(spot.id, 'vip'); onClose(); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all"
                          style={{ backgroundColor: '#f3e8ff', color: '#7c3aed', borderColor: '#ddd6fe' }}
                        >
                          <Crown size={12} />
                          设为VIP
                        </button>
                      )}
                      {(spot.status === 'disabled' || spot.status === 'vip') && (
                        <button
                          onClick={() => { onSetStatus(spot.id, 'available'); onClose(); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all"
                          style={{ backgroundColor: '#d1fae5', color: '#059669', borderColor: '#a7f3d0' }}
                        >
                          <CheckCircle2 size={12} />
                          恢复为空闲
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Guest: Login Required ── */
                <div className="mt-5 space-y-3">
                  <div
                    className="p-4 rounded-lg flex items-center gap-3 border"
                    style={{ backgroundColor: '#fef3c7', borderColor: '#fbbf24' }}
                  >
                    <Shield size={18} className="text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">需要管理员权限</p>
                      <p className="text-xs text-amber-600">访客仅能查看车位信息，无法修改车位状态</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onLoginClick(); onClose(); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all"
                      style={{ backgroundColor: '#5A6460', color: '#fff' }}
                    >
                      <LogIn size={14} />
                      管理员登录
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 bg-gray-50 border border-black/5 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-all"
                    >
                      关闭
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
