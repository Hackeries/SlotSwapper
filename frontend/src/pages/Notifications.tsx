import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SwapRequest {
  id: number;
  status: string;
  requester_name?: string;
  target_name?: string;
  requester_slot_title: string;
  requester_slot_start: string;
  requester_slot_end: string;
  target_slot_title: string;
  target_slot_start: string;
  target_slot_end: string;
  created_at: string;
}

const Notifications = () => {
  const [incomingRequests, setIncomingRequests] = useState<SwapRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        axios.get(`${API_URL}/api/requests/incoming`),
        axios.get(`${API_URL}/api/requests/outgoing`)
      ]);
      
      setIncomingRequests(incomingRes.data);
      setOutgoingRequests(outgoingRes.data);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    const handleUpdate = () => {
      fetchRequests();
    };

    window.addEventListener('swap_request_received', handleUpdate);
    window.addEventListener('swap_request_accepted', handleUpdate);
    window.addEventListener('swap_request_rejected', handleUpdate);

    return () => {
      window.removeEventListener('swap_request_received', handleUpdate);
      window.removeEventListener('swap_request_accepted', handleUpdate);
      window.removeEventListener('swap_request_rejected', handleUpdate);
    };
  }, []);

  const handleResponse = async (requestId: number, accepted: boolean) => {
    try {
      await axios.post(`${API_URL}/api/swap-response/${requestId}`, { accepted });
      toast.success(accepted ? 'Swap accepted!' : 'Swap rejected');
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to respond to request');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: { bg: '#fff3cd', color: '#856404' },
      ACCEPTED: { bg: '#d4edda', color: '#155724' },
      REJECTED: { bg: '#f8d7da', color: '#721c24' }
    };
    const style = colors[status as keyof typeof colors] || colors.PENDING;
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        background: style.bg,
        color: style.color
      }}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>
          Incoming Requests
        </h1>

        {incomingRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📬</div>
            <h3>No incoming requests</h3>
            <p>You'll see swap requests from other users here</p>
          </div>
        ) : (
          <div>
            {incomingRequests.map((request) => (
              <div key={request.id} className="event-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      From: {request.requester_name}
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '14px' }}>
                      {format(new Date(request.created_at), 'MMM dd, yyyy hh:mm a')}
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-2" style={{ marginBottom: '12px' }}>
                  <div style={{ padding: '12px', background: '#f0f4ff', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px', color: '#667eea' }}>
                      They offer:
                    </div>
                    <div style={{ fontWeight: '600' }}>{request.requester_slot_title}</div>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                      {format(new Date(request.requester_slot_start), 'MMM dd, hh:mm a')} -{' '}
                      {format(new Date(request.requester_slot_end), 'hh:mm a')}
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: '#fff3e0', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px', color: '#ff9800' }}>
                      For your:
                    </div>
                    <div style={{ fontWeight: '600' }}>{request.target_slot_title}</div>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                      {format(new Date(request.target_slot_start), 'MMM dd, hh:mm a')} -{' '}
                      {format(new Date(request.target_slot_end), 'hh:mm a')}
                    </div>
                  </div>
                </div>

                {request.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleResponse(request.id, true)}
                      className="btn btn-success btn-small"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleResponse(request.id, false)}
                      className="btn btn-danger btn-small"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>
          Outgoing Requests
        </h1>

        {outgoingRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📤</div>
            <h3>No outgoing requests</h3>
            <p>Visit the marketplace to request swaps</p>
          </div>
        ) : (
          <div>
            {outgoingRequests.map((request) => (
              <div key={request.id} className="event-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      To: {request.target_name}
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '14px' }}>
                      {format(new Date(request.created_at), 'MMM dd, yyyy hh:mm a')}
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-2">
                  <div style={{ padding: '12px', background: '#f0f4ff', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px', color: '#667eea' }}>
                      You offered:
                    </div>
                    <div style={{ fontWeight: '600' }}>{request.requester_slot_title}</div>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                      {format(new Date(request.requester_slot_start), 'MMM dd, hh:mm a')} -{' '}
                      {format(new Date(request.requester_slot_end), 'hh:mm a')}
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: '#fff3e0', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px', color: '#ff9800' }}>
                      For their:
                    </div>
                    <div style={{ fontWeight: '600' }}>{request.target_slot_title}</div>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                      {format(new Date(request.target_slot_start), 'MMM dd, hh:mm a')} -{' '}
                      {format(new Date(request.target_slot_end), 'hh:mm a')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
