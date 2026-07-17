import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ParkingSpot } from '@/types/parking';
import { X, Search, Clock, CheckCircle2, Car, Calendar, Shield } from 'lucide-react';

interface ReservationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  availableSpots: ParkingSpot[];
  onReserve: (spotId: string, plate: string, hours: number) => void;
  zoneColors: Record<string, string>;
  isAdmin: boolean;
}

export default function ReservationPanel({
  isOpen,
  onClose,
  availableSpots,
  onReserve,
  zoneColors,
  isAdmin,
}: ReservationPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [plateNumber, setPlateNumber] = useState('');
  const [duration, setDuration] = useState(2);
  const [reservedList, setReservedList] = useState<Array<{ spotNumber: string; plate: string; until: string }>>([]);

  const selectedSpot = availableSpots.find(s => s.id === selectedSpotId);

  const filteredSpots = useMemo(() => {
    if (!searchQuery) return availableSpots;
    const q = searchQuery.toLowerCase();
    return availableSpots.filter(
      s =>
        s.number.toLowerCase().includes(q) ||
        s.zone.toLowerCase().includes(q) ||
        s.floor.toLowerCase().includes(q)
    );
  }, [availableSpots, searchQuery]);

  const handleReserve = () => {
    if (!selectedSpotId || !plateNumber.trim()) return;
    const spot = availableSpots.find(s => s.id === selectedSpotId);
    if (!spot) return;

    onReserve(selectedSpotId, plateNumber.trim(), duration);

    // Add to reserved list
    const until = new Date(Date.now() + duration * 60 * 60 * 1000);
    setReservedList(prev => [
      ...prev,
      {
        spotNumber: spot.number,
        plate: plateNumber.trim(),
        until: until.toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // Reset form
    setSelectedSpotId(null);
    setPlateNumber('');
    setDuration(2);
  };

  const handleClose = () => {
    onClose();
    setSelectedSpotId(null);
    setPlateNumber('');
    setDuration(2);
    setSearchQuery('');
  };

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
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-[70] w-[420px] shadow-2xl flex flex-col overflow-hidden"
            style={{ backgroundColor: '#F3E9DD' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ backgroundColor: '#9FB8AA', borderColor: 'rgba(0,0,0,0.08)' }}>
              <div className="flex items-center gap-2">
                <Calendar size={18} style={{ color: '#2d3748' }} />
                <h2 className="text-base font-bold" style={{ color: '#2d3748' }}>车位预约</h2>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#2d3748' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isAdmin ? (
                <>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: '#718096' }} />
                    <input
                      type="text"
                      placeholder="搜索空闲车位..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none transition-all"
                      style={{ backgroundColor: 'rgba(255,255,255,0.7)', color: '#2d3748', border: '1px solid rgba(0,0,0,0.08)' }}
                    />
                  </div>

                  {/* Available spots grid */}
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: '#4a5568' }}>
                      空闲车位 ({filteredSpots.length})
                    </p>
                    <div className="grid grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {filteredSpots.map(spot => (
                        <button
                          key={spot.id}
                          onClick={() => setSelectedSpotId(spot.id)}
                          className="py-2 px-1 rounded-lg text-xs font-bold transition-all border"
                          style={{
                            backgroundColor: selectedSpotId === spot.id ? `${zoneColors[spot.zone]}25` : 'rgba(255,255,255,0.6)',
                            color: selectedSpotId === spot.id ? zoneColors[spot.zone] : '#4a5568',
                            borderColor: selectedSpotId === spot.id ? zoneColors[spot.zone] : 'rgba(0,0,0,0.06)',
                          }}
                        >
                          {spot.number}
                        </button>
                      ))}
                      {filteredSpots.length === 0 && (
                        <div className="col-span-4 text-center py-6 text-sm" style={{ color: '#a0aec0' }}>
                          暂无匹配的空闲车位
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reservation form */}
                  <AnimatePresence>
                    {selectedSpot && (
                      <motion.div
                        className="rounded-xl p-4 space-y-3 border"
                        style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderColor: 'rgba(0,0,0,0.06)' }}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                          <span className="text-sm font-semibold" style={{ color: '#2d3748' }}>
                            已选择：{selectedSpot.number}（{selectedSpot.floor}层 {selectedSpot.zone}区）
                          </span>
                        </div>

                        {/* Plate number */}
                        <div>
                          <label className="text-xs font-medium mb-1 block" style={{ color: '#4a5568' }}>
                            车牌号
                          </label>
                          <div className="relative">
                            <Car className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: '#718096' }} />
                            <input
                              type="text"
                              placeholder="如：沪A12345"
                              value={plateNumber}
                              onChange={e => setPlateNumber(e.target.value)}
                              className="w-full rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none transition-all"
                              style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#2d3748', border: '1px solid rgba(0,0,0,0.1)' }}
                            />
                          </div>
                        </div>

                        {/* Duration */}
                        <div>
                          <label className="text-xs font-medium mb-1 block" style={{ color: '#4a5568' }}>
                            预约时长
                          </label>
                          <div className="flex items-center gap-2">
                            <Clock size={14} style={{ color: '#718096' }} />
                            <div className="flex gap-2 flex-wrap">
                              {[1, 2, 4, 8, 12, 24].map(h => (
                                <button
                                  key={h}
                                  onClick={() => setDuration(h)}
                                  className="px-3 py-1 rounded-md text-xs font-semibold transition-all border"
                                  style={{
                                    backgroundColor: duration === h ? '#10b98115' : 'rgba(255,255,255,0.6)',
                                    color: duration === h ? '#059669' : '#4a5568',
                                    borderColor: duration === h ? '#10b98150' : 'rgba(0,0,0,0.06)',
                                  }}
                                >
                                  {h}小时
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Submit */}
                        <button
                          onClick={handleReserve}
                          disabled={!plateNumber.trim()}
                          className="w-full py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: plateNumber.trim() ? '#059669' : '#a0aec0',
                            color: '#fff',
                          }}
                        >
                          确认预约
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Reserved history */}
                  {reservedList.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-2" style={{ color: '#4a5568' }}>
                        本次预约记录
                      </p>
                      <div className="space-y-2">
                        {reservedList.map((r, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 rounded-lg border"
                            style={{ backgroundColor: 'rgba(255,255,255,0.5)', borderColor: 'rgba(0,0,0,0.04)' }}
                          >
                            <div>
                              <span className="text-sm font-bold" style={{ color: '#2d3748' }}>{r.spotNumber}</span>
                              <span className="text-xs ml-2" style={{ color: '#718096' }}>{r.plate}</span>
                            </div>
                            <span className="text-xs" style={{ color: '#d97706' }}>
                              至 {r.until}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Guest: No permission */
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: '#fef3c7', border: '2px solid #fbbf24' }}
                  >
                    <Shield size={28} style={{ color: '#d97706' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold" style={{ color: '#78350f' }}>需要管理员权限</p>
                    <p className="text-xs mt-1" style={{ color: '#a0aec0' }}>车位预约功能仅对管理员开放</p>
                  </div>
                  <p className="text-xs" style={{ color: '#a0aec0' }}>
                    请先登录管理员账号以使用此功能
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
