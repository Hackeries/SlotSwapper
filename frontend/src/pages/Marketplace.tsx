import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SwappableSlot {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  user_name: string;
  user_email: string;
}

interface MyEvent {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
}

const Marketplace = () => {
  const [slots, setSlots] = useState<SwappableSlot[]>([]);
  const [mySwappableSlots, setMySwappableSlots] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SwappableSlot | null>(null);
  const [selectedMySlot, setSelectedMySlot] = useState<number | null>(null);

  const fetchSlots = async () => {
    try {
      const [slotsRes, myEventsRes] = await Promise.all([
        axios.get(`${API_URL}/api/swappable-slots`),
        axios.get(`${API_URL}/api/events`)
      ]);
      
      setSlots(slotsRes.data);
      setMySwappableSlots(myEventsRes.data.filter((e: MyEvent) => e.status === 'SWAPPABLE'));
    } catch (error) {
      toast.error('Failed to fetch swappable slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();

    const handleUpdate = () => {
      fetchSlots();
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

  const handleRequestSwap = (slot: SwappableSlot) => {
    if (mySwappableSlots.length === 0) {
      toast.error('You need to have at least one swappable slot to request a swap');
      return;
    }
    setSelectedSlot(slot);
    setShowModal(true);
  };

  const handleSubmitSwapRequest = async () => {
    if (!selectedSlot || !selectedMySlot) {
      toast.error('Please select your slot to offer');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/swap-request`, {
        mySlotId: selectedMySlot,
        theirSlotId: selectedSlot.id
      });
      toast.success('Swap request sent!');
      setShowModal(false);
      setSelectedSlot(null);
      setSelectedMySlot(null);
      fetchSlots();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send swap request');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>
          Available Slots
        </h1>

        {slots.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No swappable slots available</h3>
            <p>Check back later for available time slots</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {slots.map((slot) => (
              <div key={slot.id} className="event-card swappable">
                <div className="event-title">{slot.title}</div>
                <div className="event-time">
                  {format(new Date(slot.start_time), 'MMM dd, yyyy hh:mm a')} -{' '}
                  {format(new Date(slot.end_time), 'hh:mm a')}
                </div>
                <div style={{ color: '#6c757d', fontSize: '14px', marginTop: '8px' }}>
                  Owner: {slot.user_name}
                </div>
                <div style={{ marginTop: '12px' }}>
                  <button
                    onClick={() => handleRequestSwap(slot)}
                    className="btn btn-primary btn-small"
                  >
                    Request Swap
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedSlot && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Select Your Slot to Offer</h2>
            
            <div style={{ marginBottom: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>They offer:</div>
              <div><strong>{selectedSlot.title}</strong></div>
              <div style={{ color: '#6c757d', fontSize: '14px' }}>
                {format(new Date(selectedSlot.start_time), 'MMM dd, yyyy hh:mm a')} -{' '}
                {format(new Date(selectedSlot.end_time), 'hh:mm a')}
              </div>
            </div>

            {mySwappableSlots.length === 0 ? (
              <div className="error">You don't have any swappable slots</div>
            ) : (
              <>
                <label className="label">Select one of your swappable slots:</label>
                {mySwappableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedMySlot(slot.id)}
                    style={{
                      padding: '12px',
                      marginBottom: '8px',
                      border: selectedMySlot === slot.id ? '2px solid #667eea' : '2px solid #e0e0e0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: selectedMySlot === slot.id ? '#f0f4ff' : 'white'
                    }}
                  >
                    <div style={{ fontWeight: '600' }}>{slot.title}</div>
                    <div style={{ color: '#6c757d', fontSize: '14px' }}>
                      {format(new Date(slot.start_time), 'MMM dd, yyyy hh:mm a')} -{' '}
                      {format(new Date(slot.end_time), 'hh:mm a')}
                    </div>
                  </div>
                ))}
              </>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={handleSubmitSwapRequest}
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={!selectedMySlot}
              >
                Send Request
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedSlot(null);
                  setSelectedMySlot(null);
                }}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
