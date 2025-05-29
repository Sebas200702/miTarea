import React from 'react';
import { CalendarDaysIcon, ClockIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEventStore } from '../store/eventStore';
import type { Event, EventPriority } from '../store/eventStore';

interface EventListProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onEventEdit?: (event: Event) => void;
  showDate?: boolean;
  maxEvents?: number;
}

const priorityConfig: Record<EventPriority, { label: string; color: string; icon: string; bgColor: string }> = {
  baja: { label: 'Baja', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🟢', bgColor: 'bg-emerald-50' },
  media: { label: 'Media', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '🟡', bgColor: 'bg-amber-50' },
  alta: { label: 'Alta', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '🟠', bgColor: 'bg-orange-50' },
  urgente: { label: 'Urgente', color: 'bg-red-100 text-red-800 border-red-200', icon: '🔴', bgColor: 'bg-red-50' },
};

const EventList: React.FC<EventListProps> = ({
  events,
  onEventClick,
  onEventEdit,
  showDate = true,
  maxEvents
}) => {
  const { editEvent } = useEventStore();

  const formatEventDate = (date: Date) => {
    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    if (isYesterday(date)) return 'Ayer';
    return format(date, 'dd MMM yyyy', { locale: es });
  };

  const sortedEvents = [...events].sort((a, b) => {
    const dateComparison = a.date.getTime() - b.date.getTime();
    if (dateComparison !== 0) return dateComparison;
    return a.time.localeCompare(b.time);
  });

  const displayEvents = maxEvents ? sortedEvents.slice(0, maxEvents) : sortedEvents;

  const handleEventClick = (event: Event) => {
    onEventClick?.(event) || editEvent(event);
  };

  const handleEventEdit = (event: Event) => {
    onEventEdit?.(event) || editEvent(event);
  };

  if (events.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <div className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-200">
          <div className="items-center justify-center flex"><CalendarDaysIcon className='h-24 w-24'/></div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay eventos programados</h3>
          <p className="text-sm text-gray-500">¡Crea tu primer evento para comenzar!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayEvents.map((event, index) => (
        <div
          key={event.id}
          onClick={() => handleEventClick(event)}
          className="group bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-[1.02] relative overflow-hidden"
          style={{
            animation: `slideInUp 0.3s ease-out ${index * 0.1}s both`
          }}
        >
          {/* Priority stripe */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
            style={{ backgroundColor: event.color }}
          ></div>

          <div className="flex items-start justify-between ml-3">
            <div className="flex-1 min-w-0">
              {/* Title and Priority */}
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: event.color }}
                ></div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-200 truncate">
                  {event.title}
                </h3>

                {/* Priority Badge */}
                <span className={`
                  px-3 py-1 text-xs font-bold rounded-full border-2 flex items-center gap-1
                  ${priorityConfig[event.priority].color}
                  transform group-hover:scale-110 transition-transform duration-200
                `}>
                  <span className="text-xs">{priorityConfig[event.priority].icon}</span>
                  {priorityConfig[event.priority].label}
                </span>
              </div>

              {/* Date and Time */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                {showDate && (
                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-xl">
                    <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{formatEventDate(event.date)}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-xl">
                  <ClockIcon className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-700">{event.time}</span>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="bg-gray-50 rounded-xl p-3 mt-3">
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                    📄 {event.description}
                  </p>
                </div>
              )}
            </div>

            {/* Edit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEventEdit(event);
              }}
              className="ml-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-110 opacity-0 group-hover:opacity-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>

          {/* Priority background glow */}
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl ${priorityConfig[event.priority].bgColor}`}
          ></div>
        </div>
      ))}

      {maxEvents && events.length > maxEvents && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-medium rounded-xl border border-blue-200">
            <ChevronDoubleRightIcon className="w-4 h-4" />
            <span>... y {events.length - maxEvents} eventos más</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
