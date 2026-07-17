import { motion, AnimatePresence } from 'framer-motion';
import type { ParkingSpot } from '@/types/parking';
import { X, Car, CheckCircle2, Clock, Crown, Ban, Shield, LogIn, MapPin, Calendar, Timer, Tag, RefreshCw } from 'lucide-react';

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

export default function SpotDetail({ spot, onClose, onToggleStatus, onSetStatus, zoneColors, isAdmin, onLoginClick }: SpotDetailProps) {
  if (!spot) return null;
  const config = STATUS_CONFIG[spot.status];
  const StatusIcon = spot.status === 'occupied' ? Car : spot.status === 'reserved' ? Clock : CheckCircle2;
  const zoneColor = zoneColors[spot.zone] || '#64748b';

  const details = [
    { icon: MapPin, label: '位置', value: `${spot.floor}层 · ${spot.zone}区 · 车位${spot.number}`, always: true },
    ...(spot.vehiclePlate ? [{ icon: Car, label: '车牌号', value: spot.vehiclePlate }] : []),
    ...(spot.vehicleType ? [{ icon: Tag, label: '车辆类型', value: spot.vehicleType }] : []),
    ...(spot.entryTime ? [{ icon: Calendar, label: '入场时间', value: spot.entryTime }] : []),
    ...(spot.duration ? [{ icon: Timer, label: '停车时长', value: spot.duration }] : []),
  ];

  return (
    <AnimatePresence>
      {spot && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Mobile: bottom sheet, Desktop: centered modal */}
          <motion.div
            className="bg-white w-full sm:w-full sm:max-w-md sm:mx-4 sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Drag handle - mobile only */}
            <div className="sm:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="relative px-5 py-4 sm:pb-4 pb-2" style={{ backgroundColor: config.bg }}>
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: config.color }} />
              <button onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 bg-black/5 hover:bg-black/10 rounded-lg flex items-center justify-center transition-all"
                style={{ color: '#4a5568' }}>
                <X size={16} />
              </button>

              <div className="flex items-start gap-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: config.bg, border: `2px solid ${config.border}` }}>
                  <StatusIcon size={24} className="sm:text-[28px]" style={{ color: config.color }} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{spot.number}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
                      {config.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: `${zoneColor}15`, color: zoneColor }}>
                      {spot.floor} · {spot.zone}区
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm mt-2 text-gray-600">{config.description}</p>
            </div>

            {/* Details */}
            <div className="px-5 py-4 space-y-2 max-h-[40vh] sm:max-h-none overflow-y-auto">
              {details.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Icon size={16} className="text-gray-400 shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">{item.label}</p>
                      <p className="text-gray-900 text-sm font-semibold">{item.value}</p>
                    </div>
                  </div>
                );
              })}

              {spot.reservedUntil && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Clock size={16} className="text-amber-500 shrink-0" />
                  <div>
                    <p className="text-amber-600 text-xs">预留至</p>
                    <p className="text-amber-900 text-sm font-semibold">{spot.reservedUntil}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {isAdmin ? (
                <div className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    {(spot.status === 'available' || spot.status === 'occupied' || spot.status === 'reserved') && (
                      <button onClick={() => onToggleStatus(spot.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all border"
                        style={{ backgroundColor: spot.status === 'available' ? '#fee2e2' : '#d1fae5', color: spot.status === 'available' ? '#dc2626' : '#059669', borderColor: spot.status === 'available' ? '#fca5a5' : '#6ee7b7' }}>
                        <RefreshCw size={14} />
                        {spot.status === 'available' ? '模拟停车' : '释放车位'}
                      </button>
                    )}
                    <button onClick={onClose}
                      className="px-5 py-2.5 bg-gray-50 border border-black/5 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-all">
                      关闭
                    </button>
                  </div>

                  {/* Admin controls */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">管理员操作</p>
                    <div className="flex gap-2 flex-wrap">
                      {spot.status !== 'disabled' && (
                        <button onClick={() => onSetStatus(spot.id, 'disabled')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border bg-gray-100 text-gray-500 border-gray-200">
                          <Ban size={12} /> 设为禁用
                        </button>
                      )}
                      {spot.status !== 'vip' && (
                        <button onClick={() => onSetStatus(spot.id, 'vip')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border"
                          style={{ backgroundColor: '#f3e8ff', color: '#7c3aed', borderColor: '#ddd6fe' }}>
                          <Crown size={12} /> 设为VIP
                        </button>
                      )}
                      {(spot.status === 'disabled' || spot.status === 'vip') && (
                        <button onClick={() => onSetStatus(spot.id, 'available')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border"
                          style={{ backgroundColor: '#d1fae5', color: '#059669', borderColor: '#a7f3d0' }}>
                          <CheckCircle2 size={12} /> 恢复空闲
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-lg flex items-center gap-3 border"
                    style={{ backgroundColor: '#fef3c7', borderColor: '#fbbf24' }}>
                    <Shield size={18} className="text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">需要管理员权限</p>
                      <p className="text-xs text-amber-600">访客仅能查看，无法修改车位状态</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { onLoginClick(); onClose(); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold"
                      style={{ backgroundColor: '#5A6460', color: '#fff' }}>
                      <LogIn size={14} /> 管理员登录
                    </button>
                    <button onClick={onClose}
                      className="px-5 py-2.5 bg-gray-50 border border-black/5 text-gray-600 rounded-lg text-sm font-semibold">
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
