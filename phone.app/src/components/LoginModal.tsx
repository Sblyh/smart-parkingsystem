import { useState, useEffect, useCallback } from 'react';
import { X, User, Lock, LogIn, AlertCircle, Shield, LogOut, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  onLogout: () => void;
  isAdmin: boolean;
  showPrompt?: boolean;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess, onLogout, isAdmin, showPrompt }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (username.trim() !== 'sblyh' || password.trim() !== 'sblyh') {
      setError('账号或密码错误');
      return;
    }
    onLoginSuccess();
    setUsername('');
    setPassword('');
  }, [username, password, onLoginSuccess]);

  const handleClose = useCallback(() => {
    onClose();
    setError('');
  }, [onClose]);

  const handleLogoutClick = useCallback(() => {
    onLogout();
    handleClose();
  }, [onLogout, handleClose]);

  if (!isOpen && !visible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto"
      style={{
        backgroundColor: visible ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)',
        transition: 'background-color 0.15s ease',
        pointerEvents: isOpen ? 'auto' : 'none',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Modal wrapper - uses padding for vertical spacing instead of flex */}
      <div
        className="min-h-full flex items-start justify-center px-4 py-10 sm:py-16"
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        <div
          className="w-full rounded-2xl shadow-2xl overflow-hidden relative"
          style={{
            maxWidth: '380px',
            backgroundColor: '#fff',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
            transition: 'opacity 0.2s ease, transform 0.2s ease-out',
            willChange: 'transform, opacity',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="relative px-6 py-5 flex items-center justify-center border-b"
            style={{ backgroundColor: '#9FB8AA', borderColor: 'rgba(0,0,0,0.06)' }}
          >
            <h2 className="text-lg font-bold" style={{ color: '#2d3748' }}>
              {isAdmin ? '管理员信息' : '管理员登录'}
            </h2>
            <button
              onClick={handleClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#2d3748' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          {isAdmin ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ backgroundColor: '#d1fae5', borderColor: '#6ee7b7' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#10b981' }}>
                  <Shield size={24} color="#fff" />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#065f46' }}>管理员已登录</p>
                  <p className="text-xs mt-0.5" style={{ color: '#059669' }}>账号：sblyh</p>
                </div>
                <CheckCircle2 size={20} style={{ color: '#059669', marginLeft: 'auto' }} />
              </div>
              <div className="space-y-2">
                {[
                  { c: '#10b981', t: '可修改车位状态（停车/释放）' },
                  { c: '#a855f7', t: '可设置禁用/VIP车位' },
                  { c: '#f59e0b', t: '可使用车位预约功能' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: '#f7f8fa' }}>
                    <CheckCircle2 size={14} style={{ color: item.c }} />
                    <span className="text-xs" style={{ color: '#4a5568' }}>{item.t}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleLogoutClick}
                className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border"
                style={{ backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }}>
                <LogOut size={16} /> 退出登录
              </button>
            </div>
          ) : (
            <>
              {showPrompt && (
                <div className="mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 text-xs"
                  style={{ backgroundColor: '#fef3c7', color: '#78350f', border: '1px solid #fbbf24' }}>
                  <AlertCircle size={14} />
                  <span>该功能需要管理员权限，请先登录</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 rounded-lg flex items-center gap-2 text-xs"
                    style={{ backgroundColor: '#fee2e2', color: '#7f1d1d', border: '1px solid #f87171' }}>
                    <AlertCircle size={14} /><span>{error}</span>
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#4a5568' }}>用户名</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: '#718096' }} />
                    <input type="text" autoComplete="username" placeholder="请输入用户名"
                      value={username} onChange={e => setUsername(e.target.value)}
                      className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                      style={{ backgroundColor: '#f7f8fa', color: '#2d3748', border: error ? '1px solid #f87171' : '1px solid rgba(0,0,0,0.08)', WebkitAppearance: 'none' }} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#4a5568' }}>密码</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: '#718096' }} />
                    <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="请输入密码"
                      value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full rounded-lg pl-10 pr-16 py-2.5 text-sm focus:outline-none"
                      style={{ backgroundColor: '#f7f8fa', color: '#2d3748', border: error ? '1px solid #f87171' : '1px solid rgba(0,0,0,0.08)', WebkitAppearance: 'none' }} />
                    <button type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPassword(!showPassword); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs font-semibold cursor-pointer z-10"
                      style={{ color: '#059669' }}>
                      {showPassword ? '隐藏' : '显示'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded accent-emerald-600" />
                    <span className="text-xs" style={{ color: '#4a5568' }}>记住我</span>
                  </label>
                </div>
                <button type="submit" className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#5A6460', color: '#fff' }}>
                  <LogIn size={16} /> 登录
                </button>
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }} />
                  <span className="text-xs" style={{ color: '#a0aec0' }}>或</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }} />
                </div>
                <button type="button" onClick={handleClose}
                  className="w-full py-2 rounded-lg text-xs font-semibold border"
                  style={{ backgroundColor: 'transparent', color: '#4a5568', borderColor: 'rgba(0,0,0,0.1)' }}>
                  以访客身份继续使用
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
