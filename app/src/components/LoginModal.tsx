import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, LogIn, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  showPrompt?: boolean;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess, showPrompt }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.trim() !== 'sblyh' || password.trim() !== 'sblyh') {
      setError('账号或密码错误');
      return;
    }

    onLoginSuccess();
    setUsername('');
    setPassword('');
  };

  const handleClose = () => {
    onClose();
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            className="w-full max-w-sm mx-4 rounded-2xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: '#fff' }}
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div
              className="relative px-6 py-5 flex items-center justify-center border-b"
              style={{ backgroundColor: '#9FB8AA', borderColor: 'rgba(0,0,0,0.06)' }}
            >
              <h2 className="text-lg font-bold" style={{ color: '#2d3748' }}>管理员登录</h2>
              <button
                onClick={handleClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#2d3748' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Prompt message */}
            {showPrompt && (
              <div
                className="mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 text-xs"
                style={{ backgroundColor: '#fef3c7', color: '#78350f', border: '1px solid #fbbf24' }}
              >
                <AlertCircle size={14} />
                <span>该功能需要管理员权限，请先登录</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Error message */}
              {error && (
                <div
                  className="p-3 rounded-lg flex items-center gap-2 text-xs"
                  style={{ backgroundColor: '#fee2e2', color: '#7f1d1d', border: '1px solid #f87171' }}
                >
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              {/* Username */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#4a5568' }}>
                  用户名
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    size={16}
                    style={{ color: '#718096' }}
                  />
                  <input
                    type="text"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-all"
                    style={{
                      backgroundColor: '#f7f8fa',
                      color: '#2d3748',
                      border: error ? '1px solid #f87171' : '1px solid rgba(0,0,0,0.08)',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#4a5568' }}>
                  密码
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    size={16}
                    style={{ color: '#718096' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入密码"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-lg pl-10 pr-20 py-2.5 text-sm focus:outline-none transition-all"
                    style={{
                      backgroundColor: '#f7f8fa',
                      color: '#2d3748',
                      border: error ? '1px solid #f87171' : '1px solid rgba(0,0,0,0.08)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                    style={{ color: '#718096' }}
                  >
                    {showPassword ? '隐藏' : '显示'}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded accent-emerald-600"
                  />
                  <span className="text-xs" style={{ color: '#4a5568' }}>记住我</span>
                </label>
                <button type="button" className="text-xs font-medium" style={{ color: '#059669' }}>
                  忘记密码？
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                style={{ backgroundColor: '#5A6460', color: '#fff' }}
              >
                <LogIn size={16} />
                登录
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }} />
                <span className="text-xs" style={{ color: '#a0aec0' }}>或</span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }} />
              </div>

              {/* Guest login */}
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2 rounded-lg text-xs font-semibold transition-all border"
                style={{ backgroundColor: 'transparent', color: '#4a5568', borderColor: 'rgba(0,0,0,0.1)' }}
              >
                以访客身份继续使用
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
