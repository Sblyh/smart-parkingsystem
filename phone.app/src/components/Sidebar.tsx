import { motion } from 'framer-motion';
import type { ParkingStats } from '@/types/parking';
import {
  LayoutGrid, CheckCircle2, Car, Clock, AlertTriangle, Crown,
  TrendingUp, Search, Filter, Shield, X,
} from 'lucide-react';

interface SidebarProps {
  floors: { id: string; name: string }[];
  currentFloor: string;
  onFloorChange: (floor: string) => void;
  stats: ParkingStats;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterStatus: string;
  onFilterChange: (f: string) => void;
  isAdmin: boolean;
  onOpenManagement: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: '全部', icon: LayoutGrid },
  { value: 'available', label: '空闲', icon: CheckCircle2, color: '#10b981' },
  { value: 'occupied', label: '占用', icon: Car, color: '#ef4444' },
  { value: 'reserved', label: '预留', icon: Clock, color: '#f59e0b' },
  { value: 'disabled', label: '禁用', icon: AlertTriangle, color: '#6b7280' },
  { value: 'vip', label: 'VIP', icon: Crown, color: '#a855f7' },
];

export default function Sidebar({
  floors, currentFloor, onFloorChange,
  stats, searchQuery, onSearchChange,
  filterStatus, onFilterChange,
  isAdmin, onOpenManagement,
  isMobile, onCloseMobile,
}: SidebarProps) {
  return (
    <div className="w-72 h-full flex flex-col" style={{ backgroundColor: '#5A6460' }}>
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <Car className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">智慧停车</h1>
            <p className="text-white/50 text-xs">停车场管理系统</p>
          </div>
        </div>
        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Floor Selector */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">楼层选择</h3>
        <div className="flex gap-2">
          {floors.map(floor => (
            <button
              key={floor.id}
              onClick={() => onFloorChange(floor.id)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold transition-all border ${
                currentFloor === floor.id
                  ? 'bg-white/20 text-white border-white/30 shadow-lg'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              {floor.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            type="text"
            placeholder="搜索车位号或车牌..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-white/30 focus:outline-none transition-all"
            style={{ backgroundColor: 'rgba(0,0,0,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-white/40" />
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider">状态筛选</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const active = filterStatus === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onFilterChange(opt.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border"
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                  borderColor: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <Icon size={12} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="p-4 flex-1 overflow-y-auto">
        <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">实时统计</h3>

        {/* Occupancy Rate Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-white/50 text-xs">占用率</span>
            <span className="text-white text-sm font-bold">{stats.occupancyRate}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: stats.occupancyRate > 85 ? '#ef4444' : stats.occupancyRate > 60 ? '#f59e0b' : '#10b981' }}
              initial={{ width: 0 }}
              animate={{ width: `${stats.occupancyRate}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: '总车位', value: stats.total, color: '#94a3b8' },
            { label: '空闲', value: stats.available, color: '#10b981' },
            { label: '占用', value: stats.occupied, color: '#ef4444' },
            { label: '预留', value: stats.reserved, color: '#f59e0b' },
            { label: '禁用', value: stats.disabled, color: '#9ca3af' },
            { label: 'VIP', value: stats.vip, color: '#a855f7' },
          ].map(item => {
            const Icon = item.label === '总车位' ? LayoutGrid : item.label === '空闲' ? CheckCircle2 : item.label === '占用' ? Car : item.label === '预留' ? Clock : item.label === '禁用' ? AlertTriangle : Crown;
            return (
              <motion.div
                key={item.label}
                className="rounded-lg p-3 border"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                    <Icon size={13} style={{ color: item.color }} />
                  </div>
                  <span className="text-white/40 text-xs">{item.label}</span>
                </div>
                <motion.p className="text-xl font-bold" style={{ color: item.color }}
                  key={item.value} initial={{ scale: 1.2, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }}>
                  {item.value}
                </motion.p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Admin: Management Space Entry */}
      {isAdmin && (
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onOpenManagement}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all border"
            style={{ backgroundColor: 'rgba(5,150,105,0.15)', color: '#34d399', borderColor: 'rgba(52,211,153,0.25)' }}
          >
            <Shield size={14} />
            进入管理空间
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2 text-white/30 text-xs">
          <TrendingUp size={12} />
          <span>数据实时同步中</span>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#10b981' }} />
        </div>
      </div>
    </div>
  );
}
