import { useState } from 'react'
import { Wifi, Eye, EyeOff } from 'lucide-react'
import type { Page } from '../App'
import './auth.css'

interface Props { onNavigate: (p: Page) => void }

export default function Register({ onNavigate }: Props) {
  const [showPwd, setShowPwd] = useState(false)
  const [agree, setAgree] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', contact: '', password: '', confirmPassword: '' })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="auth-screen">
      <div className="grid-bg" />
      <div className="auth-glow" />
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <div className="logo-icon"><Wifi size={22} /></div>
          <span className="logo-text">TempoMQTT</span>
        </div>
        <h1 className="auth-title">Create an Account</h1>
        <p className="auth-subtitle">Join the platform to manage your IoT clients</p>

        <div className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input placeholder="Enter your first name" value={form.firstName} onChange={set('firstName')} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input placeholder="Enter your last name" value={form.lastName} onChange={set('lastName')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Enter your email" value={form.email} onChange={set('email')} />
            </div>
            <div className="form-group">
              <label>Contact No</label>
              <input type="tel" placeholder="Enter your contact no" value={form.contact} onChange={set('contact')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>New Password</label>
              <div className="input-icon-right">
                <input type={showPwd ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={set('password')} />
                <button className="icon-btn" onClick={() => setShowPwd(!showPwd)}>{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Enter your password" value={form.confirmPassword} onChange={set('confirmPassword')} />
            </div>
          </div>
          <div className="terms-row">
            <label className="checkbox-label">
              <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
              <span className="checkmark" />
              <span>I agree to the Terms and Conditions</span>
            </label>
          </div>
          <button className="btn btn-primary auth-submit" onClick={() => onNavigate('dashboard')} disabled={!agree}>
            Create Account
          </button>
          <p className="auth-link">
            Already have an account?{' '}
            <span onClick={() => onNavigate('login')}>Sign in</span>
          </p>
        </div>

        <div className="auth-footer">Powered by Manikandan</div>
      </div>
    </div>
  )
}
