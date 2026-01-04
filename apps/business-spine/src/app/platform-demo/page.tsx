"use client";

import { useState, useEffect } from 'react';
import SmoothCard from '@/suites/ui/components/SmoothCard';
import SmoothButton from '@/suites/ui/components/SmoothButton';
import SmoothInput from '@/suites/ui/components/SmoothInput';
import SmoothBadge from '@/suites/ui/components/SmoothBadge';
import SmoothTabs, { SmoothTabsList, SmoothTabsTrigger, SmoothTabsContent } from '@/suites/ui/components/SmoothTabs';
import SmoothAlert, { SmoothAlertDescription } from '@/suites/ui/components/SmoothAlert';
import { 
  Users, 
  Calendar, 
  Settings, 
  MessageSquare, 
  BarChart3, 
  CheckCircle, 
  XCircle,
  DollarSign
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Professional {
  id: string;
  name: string;
  email: string;
  vertical: string;
}

interface Service {
  id: string;
  name: string;
  durationMin: number;
  price: { amountCents: number };
  locationType: string;
  professionalId: string;
}

interface Booking {
  id: string;
  startAtUtc: string;
  total: { amountCents: number };
  status: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
}

interface PlatformStatus {
  initialized: boolean;
  stats: {
    clients: number;
    professionals: number;
    bookings: number;
  };
}

interface ChatResponse {
  response: string;
  intent: { intent: string; confidence: number };
  decision: { action: string };
  suggestions: string[];
}

export default function PlatformDemo() {
  const [status, setStatus] = useState<PlatformStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [clients, setClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Form states
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });
  const [newProfessional, setNewProfessional] = useState({ name: '', email: '', vertical: 'beauty' });
  const [newService, setNewService] = useState({ name: '', durationMin: 60, priceCents: 0, professionalId: '' });
  const [newBooking, setNewBooking] = useState({ clientId: '', professionalId: '', serviceId: '', startAtUtc: '' });

  // Chat states
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState<ChatResponse | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/platform/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const createClient = async () => {
    if (!newClient.name || !newClient.email) return;
    
    try {
      const response = await fetch('/api/platform/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      
      if (response.ok) {
        const client = await response.json();
        setClients([...clients, client]);
        setNewClient({ name: '', email: '', phone: '' });
      }
    } catch (error) {
      setError('Failed to create client');
    }
  };

  const sendMessage = async () => {
    if (!chatMessage.trim()) return;

    try {
      const response = await fetch('/api/platform/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatMessage })
      });

      const data = await response.json();
      
      if (data.success) {
        setChatResponse(data.data);
      }
    } catch (error) {
      setError('Failed to send message');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Demo</h1>
          <p className="text-muted-foreground">Test the integrated platform features</p>
        </div>
        <SmoothButton onClick={loadData} variant="secondary">
          Refresh Data
        </SmoothButton>
      </div>

      {error && (
        <SmoothAlert variant="destructive">
          <SmoothAlertDescription>{error}</SmoothAlertDescription>
        </SmoothAlert>
      )}

      {/* Platform Status */}
      {status && (
        <SmoothCard>
          <div className="p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Platform Status
            </h2>
            <p className="text-muted-foreground mb-4">
              System health and operational metrics
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {status.initialized ? 'Ready' : 'Loading'}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{status.stats.clients}</div>
                <div className="text-sm text-muted-foreground">Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{status.stats.professionals}</div>
                <div className="text-sm text-muted-foreground">Professionals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{status.stats.bookings}</div>
                <div className="text-sm text-muted-foreground">Bookings</div>
              </div>
            </div>
          </div>
        </SmoothCard>
      )}

      {/* Data Tables */}
      <SmoothTabs defaultValue="clients" className="space-y-4">
        <SmoothTabsList>
          <SmoothTabsTrigger value="clients">Clients</SmoothTabsTrigger>
          <SmoothTabsTrigger value="assistant">AI Assistant</SmoothTabsTrigger>
          <SmoothTabsTrigger value="analytics">Analytics</SmoothTabsTrigger>
        </SmoothTabsList>

        {/* Clients Tab */}
        <SmoothTabsContent value="clients" className="space-y-4">
          <SmoothCard>
            <div className="p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Client Management
              </h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <SmoothInput placeholder="Name" value={newClient.name} onChange={(e) => setNewClient({...newClient, name: e.target.value})} />
                  <SmoothInput placeholder="Email" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})} />
                  <SmoothButton onClick={createClient}>Add Client</SmoothButton>
                </div>
                <div className="grid gap-2">
                  {clients.map(client => (
                    <div key={client.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">{client.email}</div>
                        {client.phone && <div className="text-sm text-muted-foreground">{client.phone}</div>}
                      </div>
                      <SmoothBadge variant="outline">Active</SmoothBadge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SmoothCard>
        </SmoothTabsContent>

        {/* AI Assistant Tab */}
        <SmoothTabsContent value="assistant" className="space-y-4">
          <SmoothCard>
            <div className="p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Assistant
              </h2>
              <p className="text-muted-foreground mb-4">Test the NLU and decision engine</p>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <SmoothInput 
                    placeholder="Type your message..." 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <SmoothButton onClick={sendMessage}>Send</SmoothButton>
                </div>
                
                {chatResponse && (
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded">
                      <div className="font-medium mb-2">AI Response:</div>
                      <div className="text-sm">{chatResponse.response}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium text-sm mb-1">Intent:</div>
                        <SmoothBadge variant="outline">{chatResponse.intent.intent} ({Math.round(chatResponse.intent.confidence * 100)}%)</SmoothBadge>
                      </div>
                      <div>
                        <div className="font-medium text-sm mb-1">Action:</div>
                        <SmoothBadge variant="outline">{chatResponse.decision.action}</SmoothBadge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SmoothCard>
        </SmoothTabsContent>

        {/* Analytics Tab */}
        <SmoothTabsContent value="analytics" className="space-y-4">
          <SmoothCard>
            <div className="p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics Overview
              </h2>
              <div className="text-center py-8 text-muted-foreground">
                Analytics dashboard coming soon...
                <br />
                This will show platform metrics, usage patterns, and business insights.
              </div>
            </div>
          </SmoothCard>
        </SmoothTabsContent>
      </SmoothTabs>
    </div>
  );
}
