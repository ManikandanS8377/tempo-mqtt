import { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ClientDetail from './pages/ClientDetail'
import './App.css'

export type Page = 'login' | 'register' | 'dashboard' | 'client-detail'

export interface MqttClient {
  id: string
  name: string
  username: string
  host: string
  password: string
  protocol: 'mqtt' | 'mqtts' | 'ws' | 'wss'
  clientId: string
  keepAlive: number
  qos: 0 | 1 | 2
  autoConnect: boolean
  status: 'connected' | 'disconnected' | 'connecting'
  subscribedTopics: SubscribedTopic[]
  publishedMessages: PublishedMessage[]
  receivedMessages: ReceivedMessage[]
}

export interface SubscribedTopic {
  id: string
  topic: string
  qos: 0 | 1 | 2
  storeLocal: boolean
  messageCount: number
}

export interface PublishedMessage {
  id: string
  topic: string
  payload: string
  qos: 0 | 1 | 2
  storeLocal: boolean
  timestamp: Date
}

export interface ReceivedMessage {
  id: string
  topic: string
  payload: string
  timestamp: Date
}

function App() {
  const [page, setPage] = useState<Page>('login')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [clients, setClients] = useState<MqttClient[]>([])

  const navigate = (p: Page, clientId?: string) => {
    setPage(p)
    if (clientId) setSelectedClientId(clientId)
  }

  const selectedClient = clients.find(c => c.id === selectedClientId) || null

  return (
    <div className="app">
      {page === 'login' && <Login onNavigate={navigate} />}
      {page === 'register' && <Register onNavigate={navigate} />}
      {page === 'dashboard' && (
        <Dashboard
          clients={clients}
          setClients={setClients}
          onNavigate={navigate}
        />
      )}
      {page === 'client-detail' && selectedClient && (
        <ClientDetail
          client={selectedClient}
          clients={clients}
          setClients={setClients}
          onNavigate={navigate}
        />
      )}
    </div>
  )
}

export default App
