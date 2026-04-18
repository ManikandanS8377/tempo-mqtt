import { useState } from 'react'
import { Plus, Wifi, Users, Activity, Zap, LogOut, Edit2, Trash2, X } from 'lucide-react'
import type { Page, MqttClient } from '../App'
import './dashboard.css'

interface Props {
  clients: MqttClient[]
  setClients: React.Dispatch<React.SetStateAction<MqttClient[]>>
  onNavigate: (p: Page, clientId?: string) => void
}

const genId = () => Math.random().toString(36).slice(2)
const genClientId = () => `tempo_${Math.random().toString(36).slice(2, 10)}`

interface ClientForm {
  name: string; username: string; host: string; password: string
  protocol: 'mqtt' | 'mqtts' | 'ws' | 'wss'; clientId: string
  keepAlive: number; qos: 0 | 1 | 2; autoConnect: boolean
}
const emptyForm = (): ClientForm => ({
  name: '', username: '', host: '', password: '',
  protocol: 'mqtt', clientId: genClientId(), keepAlive: 20, qos: 0, autoConnect: false
})

export default function Dashboard({ clients, setClients, onNavigate }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [editClient, setEditClient] = useState<MqttClient | null>(null)
  const [deleteClient, setDeleteClient] = useState<MqttClient | null>(null)
  const [form, setForm] = useState<ClientForm>(emptyForm())

  const set = (k: keyof ClientForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setForm(f => ({ ...f, [k]: val }))
  }

  const openAdd = () => { setForm(emptyForm()); setShowAdd(true) }
  const openEdit = (c: MqttClient) => {
    setForm({ name: c.name, username: c.username, host: c.host, password: c.password,
      protocol: c.protocol, clientId: c.clientId, keepAlive: c.keepAlive, qos: c.qos, autoConnect: c.autoConnect })
    setEditClient(c)
  }

  const saveClient = () => {
    if (editClient) {
      setClients(cs => cs.map(c => c.id === editClient.id ? { ...c, ...form } : c))
      setEditClient(null)
    } else {
      const newClient: MqttClient = { id: genId(), ...form, status: 'disconnected', subscribedTopics: [], publishedMessages: [], receivedMessages: [] }
      setClients(cs => [...cs, newClient])
      setShowAdd(false)
    }
  }

  const confirmDelete = () => {
    if (deleteClient) {
      setClients(cs => cs.filter(c => c.id !== deleteClient.id))
      setDeleteClient(null)
    }
  }

  const connectedCount = clients.filter(c => c.status === 'connected').length
  const totalMessages = clients.reduce((a, c) => a + c.receivedMessages.length, 0)

  return (
    <div className="dashboard">
      <div className="grid-bg" />
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><Wifi size={18} /></div>
          <span className="logo-text">TempoMQTT</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item active"><Activity size={16} /><span>Dashboard</span></div>
        </nav>
        <div className="sidebar-bottom">
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('login')}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header className="main-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-sub">Manage your MQTT clients</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={16} />Add New Client</button>
        </header>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue"><Users size={20} /></div>
            <div><p className="stat-val">{clients.length}</p><p className="stat-label">Total Clients</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green"><Wifi size={20} /></div>
            <div><p className="stat-val">{connectedCount}</p><p className="stat-label">Connected</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-red"><Wifi size={20} /></div>
            <div><p className="stat-val">{clients.length - connectedCount}</p><p className="stat-label">Disconnected</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-purple"><Zap size={20} /></div>
            <div><p className="stat-val">{totalMessages}</p><p className="stat-label">Messages</p></div>
          </div>
        </div>

        {/* Client list */}
        <div className="section-title">Clients <span className="count-badge">{clients.length}</span></div>

        {clients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Wifi size={40} /></div>
            <p className="empty-title">No Clients</p>
            <p className="empty-sub">Add your first MQTT client to get started</p>
            <button className="btn btn-primary" onClick={openAdd}><Plus size={16} />Add New Client</button>
          </div>
        ) : (
          <div className="clients-grid">
            {clients.map(c => (
              <div key={c.id} className="client-card" onClick={() => onNavigate('client-detail', c.id)}>
                <div className="client-card-top">
                  <div className="client-avatar">{c.name.charAt(0).toUpperCase()}</div>
                  <div className="client-info">
                    <p className="client-name">{c.name}</p>
                    <p className="client-host">{c.host || 'No host configured'}</p>
                  </div>
                  <span className={`status-badge status-${c.status}`}>{c.status}</span>
                </div>
                <div className="client-meta">
                  <span>{c.protocol.toUpperCase()}</span>
                  <span>{c.subscribedTopics.length} topics</span>
                  <span>{c.receivedMessages.length} msgs</span>
                </div>
                <div className="client-actions" onClick={e => e.stopPropagation()}>
                  <button className="icon-action" onClick={() => openEdit(c)}><Edit2 size={14} /></button>
                  <button className="icon-action icon-action-danger" onClick={() => setDeleteClient(c)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {(showAdd || editClient) && (
        <div className="modal-overlay" onClick={() => { setShowAdd(false); setEditClient(null) }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editClient ? 'Edit Client' : 'Add New Client'}</span>
              <button className="icon-btn" onClick={() => { setShowAdd(false); setEditClient(null) }}><X size={18} /></button>
            </div>
            <div className="modal-form">
              <div className="section-title">MQTT Configuration</div>
              <div className="form-row">
                <div className="form-group">
                  <label>MQTT Client Name</label>
                  <input placeholder="Client Name" value={form.name} onChange={set('name')} />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input placeholder="Username" value={form.username} onChange={set('username')} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Host</label>
                  <input placeholder="broker.example.com" value={form.host} onChange={set('host')} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" placeholder="Password" value={form.password} onChange={set('password')} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Protocol</label>
                  <select value={form.protocol} onChange={set('protocol')}>
                    <option value="mqtt">MQTT</option>
                    <option value="mqtts">MQTTS</option>
                    <option value="ws">WS</option>
                    <option value="wss">WSS</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>MQTT Client ID</label>
                  <input placeholder="Auto generated" value={form.clientId} onChange={set('clientId')} />
                </div>
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label>Keep Alive (s)</label>
                  <input type="number" value={form.keepAlive} onChange={set('keepAlive')} />
                </div>
                <div className="form-group">
                  <label>QoS</label>
                  <select value={form.qos} onChange={set('qos')}>
                    <option value={0}>0 – At most once</option>
                    <option value={1}>1 – At least once</option>
                    <option value={2}>2 – Exactly once</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Auto Connect?</label>
                  <div style={{ paddingTop: '8px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label className="toggle">
                      <input type="checkbox" checked={form.autoConnect} onChange={set('autoConnect')} />
                      <span className="toggle-slider" />
                    </label>
                    <span style={{ fontSize: 13, color: 'var(--text2)' }}>{form.autoConnect ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => { setShowAdd(false); setEditClient(null) }}>Cancel</button>
              <button className="btn btn-primary" onClick={saveClient}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteClient && (
        <div className="modal-overlay" onClick={() => setDeleteClient(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Remove Client</span>
              <button className="icon-btn" onClick={() => setDeleteClient(null)}><X size={18} /></button>
            </div>
            <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6 }}>
              Are you sure you want to remove <strong style={{ color: 'var(--text)' }}>{deleteClient.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteClient(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
