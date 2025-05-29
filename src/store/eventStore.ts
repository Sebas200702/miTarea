import { create } from 'zustand';


export type EventPriority = 'baja' | 'media' | 'alta' | 'urgente';

export interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  description?: string;
  color: string;
  priority: EventPriority;
  reminder: 'none' | '15min' | '30min' | '1h' | '1d' | 'custom';
  customReminder?: {
    days: number;
    hours: number;
    minutes: number;
  };
}

interface EventStore {
  events: Event[];

  // Actions
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Omit<Event, 'id'>) => void;
  deleteEvent: (id: string) => void;
  getEventsByDate: (date: Date) => Event[];
  getUpcomingEvents: (limit?: number) => Event[];

  // UI State
  selectedDate: Date | null;
  editingEvent: Event | null;
  showEventForm: boolean;
  currentView: 'calendar' | 'list';

  // UI Actions
  setSelectedDate: (date: Date | null) => void;
  setEditingEvent: (event: Event | null) => void;
  setShowEventForm: (show: boolean) => void;
  setCurrentView: (view: 'calendar' | 'list') => void;
  openEventForm: (date?: Date) => void;
  closeEventForm: () => void;
  editEvent: (event: Event) => void;
}

const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

export const useEventStore = create<EventStore>()(

    (set, get) => ({
      events: [],
      selectedDate: null,
      editingEvent: null,
      showEventForm: false,
      currentView: 'calendar',

      // Event actions
      addEvent: (eventData) => {
        const newEvent: Event = {
          ...eventData,
          id: generateId(),
          date: new Date(eventData.date), // Ensure it's a Date object
        };
        set((state) => ({
          events: [...state.events, newEvent],
        }));
      },

      updateEvent: (id, eventData) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id
              ? { ...eventData, id, date: new Date(eventData.date) }
              : event
          ),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },

      getEventsByDate: (date) => {
        const { events } = get();
        return events.filter((event) => isSameDay(event.date, date));
      },

      getUpcomingEvents: (limit = 5) => {
        const { events } = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return events
          .filter((event) => event.date >= today)
          .sort((a, b) => {
            const dateComparison = a.date.getTime() - b.date.getTime();
            if (dateComparison !== 0) return dateComparison;
            return a.time.localeCompare(b.time);
          })
          .slice(0, limit);
      },

      // UI actions
      setSelectedDate: (date) => set({ selectedDate: date }),

      setEditingEvent: (event) => set({ editingEvent: event }),

      setShowEventForm: (show) => set({ showEventForm: show }),

      setCurrentView: (view) => set({ currentView: view }),

      openEventForm: (date) => {
        set({
          selectedDate: date || new Date(),
          showEventForm: true,
          editingEvent: null,
        });
      },

      closeEventForm: () => {
        set({
          showEventForm: false,
          selectedDate: null,
          editingEvent: null,
        });
      },

      editEvent: (event) => {
        set({
          editingEvent: event,
          showEventForm: true,
          selectedDate: null,
        });
      },
    }),


  )
