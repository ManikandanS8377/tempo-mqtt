import { useState } from 'react'
import { ArrowLeft, Wifi, WifiOff, Plus, Trash2, Send, Download, X } from 'lucide-react'
import type { Page, MqttClient, SubscribedTopic, ReceivedMessage } from '../App'
import './client-detail.css'

interface Props {
  client: MqttClient
  clients: MqttClient[]
  setClients: React.Dispatch<React.SetStateAction<MqttClient[]>>
  onNavigate: (p: Page) => void
}

const genId = () => Math.random().toString(36).slice(2)

export default function ClientDetail({ client, setClients, onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<'subscriber' | 'publisher'>('subscriber')
  const [subForm, setSubForm] = useState({ topic: '', qos: 0 as 0|1|2, storeLocal: false })
  const [pubForm, setPubForm] = useState({ topic: '', qos: 0 as 0|1|2, payload: '', storeLocal: false })
  const [filter, setFilter] = useState('')

  const update = (fn: (c: MqttClient) => MqttClient) => {
    setClients(cs => cs.map(c2 => c2.id === client.id ? fn(c2) : c2))
  }

  const toggleConnect = () => {
    update(c => ({ ...c, status: c.status === 'connected' ? 'disconnected' : 'connected' }))
  }

  const subscribe = () => {
    if (!subForm.topic.trim()) return
    const topic: SubscribedTopic = { id: genId(), topic: subForm.topic, qos: subForm.qos, storeLocal: subForm.storeLocal, messageCount: 0 }
    update(c => ({ ...c, subscribedTopics: [...c.subscribedTopics, topic] }))
    setSubForm({ topic: '', qos: 0, storeLocal: false })
  }

  const removeTopic = (topicId: string) => {
    update(c => ({ ...c, subscribedTopics: c.subscribedTopics.filter(t => t.id !== topicId) }))
  }

  const publish = () => {
    if (!pubForm.topic.trim() || !pubForm.payload.trim()) return
    const msg: ReceivedMessage = { id: genId(), topic: pubForm.topic, payload: pubForm.payload, timestamp: new Date() }
    update(c => ({
      ...c,
      receivedMessages: [...c.receivedMessages, msg],
      subscribedTopics: c.subscribedTopics.map(t => t.topic === pubForm.topic || pubForm.topic.includes('#')
        ? { ...t, messageCount: t.messageCount + 1 } : t)
    }))
    setPubForm(f => ({ ...f, payload: '' }))
  }

  const clearMessages = () => update(c => ({ ...c, receivedMessages: [] }))

  const exportCSV = () => {
    const rows = [['Topic','Payload','Timestamp'], ...client.receivedMessages.map(m => [m.topic, m.payload, m.timestamp.toISOString()])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `${client.name}_messages.csv`
    a.click()
  }

  const filteredMessages = client.receivedMessages.filter(m =>
    !filter || m.topic.includes(filter) || m.payload.includes(filter)
  )

  return (
    <div className="client-detail">
      <div className="grid-bg" />
      {/* Top bar */}
      <header className="detail-header">
        <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('dashboard')}>
          <ArrowLeft size={14} /> Dashboard
        </button>
        <div className="detail-header-center">
          <div className="client-avatar-lg">{client.name.charAt(0).toUpperCase()}</div>
          <div>
            <h2 className="detail-title">{client.name}</h2>
            <p className="detail-sub">{client.host || 'No host'} · {client.protocol.toUpperCase()}</p>
          </div>
          <span className={`status-badge status-${client.status}`}>{client.status}</span>
        </div>
        <button
          className={`btn ${client.status === 'connected' ? 'btn-danger' : 'btn-success'}`}
          onClick={toggleConnect}
        >
          {client.status === 'connected' ? <><WifiOff size={14} /> Disconnect</> : <><Wifi size={14} /> Connect</>}
        </button>
      </header>

      <div className="detail-body">
        {/* Left panel */}
        <div className="detail-left">
          {/* Tabs */}
          <div className="tab-bar">
            <button className={`tab ${activeTab === 'subscriber' ? 'active' : ''}`} onClick={() => setActiveTab('subscriber')}>
              Subscriber
            </button>
            <button className={`tab ${activeTab === 'publisher' ? 'active' : ''}`} onClick={() => setActiveTab('publisher')}>
              Publisher
            </button>
          </div>

          {activeTab === 'subscriber' && (
            <div className="panel">
              <div className="section-title">Subscribe to Topic</div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Topic to Subscribe</label>
                <input placeholder="e.g. /sensor/# or /home/temp" value={subForm.topic}
                  onChange={e => setSubForm(f => ({ ...f, topic: e.target.value }))} />
              </div>
              <div className="form-row" style={{ marginBottom: 12 }}>
                <div className="form-group">
                  <label>QoS</label>
                  <select value={subForm.qos} onChange={e => setSubForm(f => ({ ...f, qos: parseInt(e.target.value) as 0|1|2 }))}>
                    <option value={0}>0</option><option value={1}>1</option><option value={2}>2</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Store data in local?</label>
                  <div style={{ paddingTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label className="toggle">
                      <input type="checkbox" checked={subForm.storeLocal} onChange={e => setSubForm(f => ({ ...f, storeLocal: e.target.checked }))} />
                      <span className="toggle-slider" />
                    </label>
                    <span style={{ fontSize: 13, color: 'var(--text2)' }}>{subForm.storeLocal ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={subscribe}>
                <Plus size={14} /> Subscribe
              </button>

              {/* Subscribed topics */}
              {client.subscribedTopics.length > 0 && (
                <>
                  <div className="section-title" style={{ marginTop: 20 }}>Active Subscriptions</div>
                  <div className="topics-list">
                    {client.subscribedTopics.map(t => (
                      <div key={t.id} className="topic-item">
                        <div className="topic-pill">{t.topic}</div>
                        <div className="topic-meta">
                          <span className="qos-badge">QoS {t.qos}</span>
                          <span className="msg-count">{t.messageCount} msgs</span>
                        </div>
                        <button className="icon-action icon-action-danger" onClick={() => removeTopic(t.id)}><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'publisher' && (
            <div className="panel">
              <div className="section-title">Publish Message</div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Topic to Publish</label>
                <input placeholder="e.g. /sample/data" value={pubForm.topic}
                  onChange={e => setPubForm(f => ({ ...f, topic: e.target.value }))} />
              </div>
              <div className="form-row" style={{ marginBottom: 12 }}>
                <div className="form-group">
                  <label>QoS</label>
                  <select value={pubForm.qos} onChange={e => setPubForm(f => ({ ...f, qos: parseInt(e.target.value) as 0|1|2 }))}>
                    <option value={0}>0</option><option value={1}>1</option><option value={2}>2</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Store data in local?</label>
                  <div style={{ paddingTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label className="toggle">
                      <input type="checkbox" checked={pubForm.storeLocal} onChange={e => setPubForm(f => ({ ...f, storeLocal: e.target.checked }))} />
                      <span className="toggle-slider" />
                    </label>
                    <span style={{ fontSize: 13, color: 'var(--text2)' }}>{pubForm.storeLocal ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Payload</label>
                <textarea rows={4} placeholder='{"data": "hello"}' value={pubForm.payload}
                  onChange={e => setPubForm(f => ({ ...f, payload: e.target.value }))}
                  style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={publish}>
                <Send size={14} /> Publish
              </button>
            </div>
          )}
        </div>

        {/* Right panel: messages */}
        <div className="detail-right">
          <div className="messages-header">
            <div className="section-title" style={{ margin: 0, flex: 1 }}>
              Live Messages <span className="count-badge">{filteredMessages.length}</span>
            </div>
            <input placeholder="Filter by topic or payload..." value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ width: 220, marginRight: 8 }} />
            <button className="btn btn-ghost btn-sm" onClick={exportCSV}><Download size={13} /> Export</button>
            <button className="btn btn-ghost btn-sm" onClick={clearMessages}><X size={13} /> Clear</button>
          </div>

          <div className="messages-list">
            {filteredMessages.length === 0 ? (
              <div className="no-messages">
                <Wifi size={32} style={{ color: 'var(--text3)' }} />
                <p>No messages yet</p>
                <p style={{ fontSize: 12 }}>Subscribe to topics and publish data to see messages here</p>
              </div>
            ) : (
              [...filteredMessages].reverse().map(m => (
                <div key={m.id} className="message-item">
                  <div className="message-header">
                    <span className="message-topic">{m.topic}</span>
                    <span className="message-time">{m.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <pre className="message-payload">{m.payload}</pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
