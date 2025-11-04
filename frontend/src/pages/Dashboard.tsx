import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import EventCard from '../components/EventCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Event {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
}

const Dashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start_time: '',
    end_time: '',
    status: 'BUSY'
  });

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/events`);
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    // Listen for socket events
    const handleSwapUpdate = () => {
      fetchEvents();
    };

    window.addEventListener('swap_request_accepted', handleSwapUpdate);
    window.addEventListener('swap_request_rejected', handleSwapUpdate);

    return () => {
      window.removeEventListener('swap_request_accepted', handleSwapUpdate);
      window.removeEventListener('swap_request_rejected', handleSwapUpdate);
    };
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/events`, newEvent);
      toast.success('Event created successfully!');
      setShowModal(false);
      setNewEvent({ title: '', start_time: '', end_time: '', status: 'BUSY' });
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create event');
    }
  };

  const handleMakeSwappable = async (id: number) => {
    try {
      await axios.put(`${API_URL}/api/events/${id}`, { status: 'SWAPPABLE' });
      toast.success('Event marked as swappable!');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  const handleMakeBusy = async (id: number) => {
    try {
      await axios.put(`${API_URL}/api/events/${id}`, { status: 'BUSY' });
      toast.success('Event marked as busy');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/events/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700' }}>My Calendar</h1>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            Create Event
          </button>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No events yet</h3>
            <p>Create your first event to get started</p>
          </div>
        ) : (
          <div>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onMakeSwappable={handleMakeSwappable}
                onMakeBusy={handleMakeBusy}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  className="input"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                  placeholder="Team Meeting"
                />
              </div>
              <div>
                <label className="label">Start Time</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">End Time</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={newEvent.end_time}
                  onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={newEvent.status}
                  onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                >
                  <option value="BUSY">Busy</option>
                  <option value="SWAPPABLE">Swappable</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
