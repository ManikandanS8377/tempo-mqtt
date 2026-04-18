import { useState } from 'react'
import { Wifi, Eye, EyeOff } from 'lucide-react'
import type { Page } from '../App'
import './auth.css'

interface Props { onNavigate: (p: Page) => void }

export default function Login({ onNavigate }: Props) {
  const [showPwd, setShowPwd] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })

  return (
    <div className="auth-screen">
      <div className="grid-bg" />
      <div className="auth-glow" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><Wifi size={22} /></div>
          <span className="logo-text">TempoMQTT</span>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your IoT monitoring dashboard</p>

        <div className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-right">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <button className="icon-btn" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button className="btn btn-primary auth-submit" onClick={() => onNavigate('dashboard')}>
            Login
          </button>
          <p className="auth-link">
            Don't have an account?{' '}
            <span onClick={() => onNavigate('register')}>Create new account</span>
          </p>
        </div>

        <div className="auth-footer">Powered by Manikandan</div>
      </div>
    </div>
  )
}
