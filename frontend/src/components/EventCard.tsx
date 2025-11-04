import { format } from 'date-fns';

interface Event {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
}

interface EventCardProps {
  event: Event;
  onMakeSwappable?: (id: number) => void;
  onMakeBusy?: (id: number) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onMakeSwappable,
  onMakeBusy,
  onDelete,
  showActions = true
}) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'BUSY':
        return 'status-busy';
      case 'SWAPPABLE':
        return 'status-swappable';
      case 'SWAP_PENDING':
        return 'status-swap-pending';
      default:
        return 'status-busy';
    }
  };

  return (
    <div className={`event-card ${event.status.toLowerCase()}`}>
      <div className="event-title">{event.title}</div>
      <div className="event-time">
        {format(new Date(event.start_time), 'MMM dd, yyyy hh:mm a')} -{' '}
        {format(new Date(event.end_time), 'hh:mm a')}
      </div>
      <div>
        <span className={`event-status ${getStatusClass(event.status)}`}>
          {event.status.replace('_', ' ')}
        </span>
      </div>
      {showActions && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          {event.status === 'BUSY' && onMakeSwappable && (
            <button
              onClick={() => onMakeSwappable(event.id)}
              className="btn btn-success btn-small"
            >
              Make Swappable
            </button>
          )}
          {event.status === 'SWAPPABLE' && onMakeBusy && (
            <button
              onClick={() => onMakeBusy(event.id)}
              className="btn btn-secondary btn-small"
            >
              Make Busy
            </button>
          )}
          {event.status !== 'SWAP_PENDING' && onDelete && (
            <button
              onClick={() => onDelete(event.id)}
              className="btn btn-danger btn-small"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCard;
