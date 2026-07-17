import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, RefreshCw, Wifi, Bell, Settings, Shield } from 'lucide-react';

interface TopBarProps {
  currentFloorName: string;
  onRefresh: () => void;
  occupancyRate: number;
  isAdmin: boolean;
  onOpenReservation: () => void;
  onOpenLogin: () => void;
}

export default function TopBar({
  currentFloorName,
  onRefresh,
  occupancyRate,
  isAdmin,
  onOpenReservation,
  onOpenLogin,
}: TopBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const getOccupancyColor = () => {
    if (occupancyRate > 85) return '#ef4444';
    if (occupancyRate > 60) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="h-14 flex items-center justify-between px-5 border-b" style={{ backgroundColor: '#9FB8AA', borderColor: 'rgba(0,0,0,0.08)' }}>
      {/* Left */}
      <div className="flex items-center gap-4">
        <h2 className="font-bold text-base" style={{ color: '#2d3748' }}>
          {currentFloorName}
          <span className="font-normal text-sm ml-2" style={{ color: '#4a5568' }}>停车场平面图</span>
        </h2>
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#2d3748' }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: getOccupancyColor() }} />
          占用率 {occupancyRate}%
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Admin badge */}
        {isAdmin && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{ backgroundColor: '#05966925', color: '#059669', border: '1px solid #05966940' }}
          >
            <Shield size={12} />
            管理员
          </div>
        )}

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#2d3748', borderColor: 'rgba(0,0,0,0.08)' }}
        >
          <motion.div animate={{ rotate: isRefreshing ? 360 : 0 }} transition={{ duration: 0.8, ease: 'linear' }}>
            <RefreshCw size={13} />
          </motion.div>
          刷新
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#2d3748' }}>
          <Wifi size={12} style={{ color: '#10b981' }} />
          <span>在线</span>
        </div>

        {/* Bell - Reservation */}
        <button
          onClick={onOpenReservation}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all border hover:scale-105 active:scale-95"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(0,0,0,0.08)', color: '#4a5568' }}
          title="车位预约"
        >
          <Bell size={14} />
        </button>

        {/* Settings - Login */}
        <button
          onClick={onOpenLogin}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all border hover:scale-105 active:scale-95"
          style={{ backgroundColor: isAdmin ? 'rgba(5,150,105,0.15)' : 'rgba(255,255,255,0.15)', borderColor: isAdmin ? 'rgba(5,150,105,0.3)' : 'rgba(0,0,0,0.08)', color: isAdmin ? '#059669' : '#4a5568' }}
          title={isAdmin ? '已登录管理员' : '管理员登录'}
        >
          <Settings size={14} />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: 'rgba(0,0,0,0.12)' }}>
          <Clock size={13} style={{ color: '#4a5568' }} />
          <span className="text-xs font-mono" style={{ color: '#2d3748' }}>
            {currentTime.toLocaleString('zh-CN', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}
