import React, { useState, useEffect } from 'react';
import { format, addDays, addHours, addMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEventStore } from '../store/eventStore';
import type { Event, EventPriority } from '../store/eventStore';
import { PlusIcon, PencilSquareIcon, CalendarDaysIcon, ClockIcon, BarsArrowUpIcon, TrashIcon, PaintBrushIcon, DocumentTextIcon, BellIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const priorityOptions: { value: EventPriority; label: string; color: string }[] = [
  { value: 'baja', label: 'Baja', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'media', label: 'Media', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-800 border-red-200' },
];

const reminderOptions = [
  { value: 'none', label: 'Sin recordatorio' },
  { value: '15min', label: '15 minutos antes' },
  { value: '30min', label: '30 minutos antes' },
  { value: '1h', label: '1 hora antes' },
  { value: '1d', label: '1 día antes' },
  { value: 'custom', label: 'Personalizado' },
];

const EventForm: React.FC = () => {
  const {
    editingEvent,
    selectedDate,
    showEventForm,
    addEvent,
    updateEvent,
    deleteEvent,
    closeEventForm,
  } = useEventStore();

  const [formData, setFormData] = useState({
    title: '',
    date: selectedDate || new Date(),
    time: '09:00',
    description: '',
    color: '#3b82f6',
    priority: 'media' as EventPriority,
    reminder: '1d' as 'none' | '15min' | '30min' | '1h' | '1d' | 'custom',
    customReminder: {
      days: 1,
      hours: 0,
      minutes: 0,
    },
  });

  const [activeSection, setActiveSection] = useState<'basic' | 'details'>('basic');

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        date: editingEvent.date,
        time: editingEvent.time,
        description: editingEvent.description || '',
        color: editingEvent.color,
        priority: editingEvent.priority,
        reminder: editingEvent.reminder || '1d',
        customReminder: editingEvent.customReminder || {
          days: 1,
          hours: 0,
          minutes: 0,
        },
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate,
      }));
    }
  }, [editingEvent, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const eventData = {
      title: formData.title.trim(),
      date: formData.date,
      time: formData.time,
      description: formData.description.trim(),
      color: formData.color,
      priority: formData.priority,
      reminder: formData.reminder,
      customReminder: formData.customReminder,
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
    } else {
      addEvent(eventData);
    }

    // Schedule notification if reminder is enabled
    if (formData.reminder !== 'none') {
      const eventDateTime = new Date(formData.date);
      const [hours, minutes] = formData.time.split(':').map(Number);
      eventDateTime.setHours(hours, minutes, 0, 0);

      let reminderTime = new Date(eventDateTime);

      if (formData.reminder === 'custom') {
        reminderTime = addDays(reminderTime, -formData.customReminder.days);
        reminderTime = addHours(reminderTime, -formData.customReminder.hours);
        reminderTime = addMinutes(reminderTime, -formData.customReminder.minutes);
      } else {
        switch (formData.reminder) {
          case '15min':
            reminderTime = addMinutes(reminderTime, -15);
            break;
          case '30min':
            reminderTime = addMinutes(reminderTime, -30);
            break;
          case '1h':
            reminderTime = addHours(reminderTime, -1);
            break;
          case '1d':
            reminderTime = addDays(reminderTime, -1);
            break;
        }
      }

      // Request notification permission if not already granted
      if (Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            scheduleNotification(eventData, reminderTime);
          }
        });
      } else {
        scheduleNotification(eventData, reminderTime);
      }
    }

    closeEventForm();
  };

  const scheduleNotification = (eventData: Omit<Event, 'id'>, reminderTime: Date) => {
    const now = new Date();
    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    if (timeUntilReminder > 0) {
      setTimeout(() => {
        new Notification(eventData.title, {
          body: eventData.description || '¡No olvides tu evento!',
          icon: '/favicon.ico', // You can add your own icon here
          tag: eventData.title, // Using title as tag since id is not available
          requireInteraction: true,
        });
      }, timeUntilReminder);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      date: new Date(e.target.value)
    }));
  };

  const handleDelete = () => {
    if (editingEvent) {
      deleteEvent(editingEvent.id);
      closeEventForm();
    }
  };

  if (!showEventForm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
    onClick={closeEventForm}
    >
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-0 w-full max-w-4xl m-2 sm:m-4 transform animate-slideUp overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-8 py-4 sm:py-5">
          <div className="flex justify-between items-center">
            <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              {editingEvent ? (
                <>
                  <PencilSquareIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  Editar Evento
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  Nuevo Evento
                </>
              )}
            </h3>
            <button
              onClick={closeEventForm}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8">
          {/* Mobile Navigation */}
          <div className="sm:hidden mb-6">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setActiveSection('basic')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeSection === 'basic'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Información Básica
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('details')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeSection === 'details'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Detalles
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            {/* Columna Izquierda - Información Básica */}
            <div className={`space-y-4 sm:space-y-6 ${activeSection === 'details' ? 'hidden sm:block' : ''}`}>
              {/* Título */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <PencilSquareIcon className="w-4 h-4" />
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Ej: Reunión con el equipo"
                  required
                />
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4" />
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={format(formData.date, 'yyyy-MM-dd')}
                    onChange={handleDateChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Prioridad */}
              <div className="space-y-2 sm:space-y-3">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <BarsArrowUpIcon className="w-4 h-4" />
                  Prioridad
                </label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                      className={`
                        px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 text-sm font-semibold transition-all duration-200 hover:scale-102 cursor-pointer flex items-center gap-2 justify-center
                        ${formData.priority === option.value
                          ? `${option.color} shadow-lg transform scale-105`
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }
                      `}
                    >
                      <span className="text-sm sm:text-base">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2 sm:space-y-3">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <PaintBrushIcon className="w-4 h-4" />
                  Color del evento
                </label>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <input
                    type="color"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl cursor-pointer border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  />
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      Selecciona el color para destacar tu evento
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation Button */}
              <div className="sm:hidden">
                <button
                  type="button"
                  onClick={() => setActiveSection('details')}
                  className="w-full bg-blue-50 text-blue-600 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-100 transition-all duration-200"
                >
                  Siguiente
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Columna Derecha - Detalles */}
            <div className={`space-y-4 sm:space-y-6 ${activeSection === 'basic' ? 'hidden sm:block' : ''}`}>
              {/* Descripción */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 transition-all duration-200 resize-none"
                  rows={4}
                  placeholder="Agrega detalles adicionales sobre el evento..."
                />
              </div>

              {/* Recordatorio */}
              <div className="space-y-2 sm:space-y-3">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <BellIcon className="w-4 h-4" />
                  Recordatorio
                </label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {reminderOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, reminder: option.value as typeof prev.reminder }))}
                      className={`
                        px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 text-sm font-semibold transition-all duration-200 hover:scale-102 cursor-pointer flex items-center gap-2 justify-center
                        ${formData.reminder === option.value
                          ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-lg transform scale-105'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }
                      `}
                    >
                      <span className="text-sm sm:text-base">{option.label}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Reminder Settings */}
                {formData.reminder === 'custom' && (
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-2 sm:mt-3">
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-600">Días</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.customReminder.days}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          customReminder: {
                            ...prev.customReminder,
                            days: parseInt(e.target.value) || 0
                          }
                        }))}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-600">Horas</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={formData.customReminder.hours}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          customReminder: {
                            ...prev.customReminder,
                            hours: parseInt(e.target.value) || 0
                          }
                        }))}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-600">Minutos</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={formData.customReminder.minutes}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          customReminder: {
                            ...prev.customReminder,
                            minutes: parseInt(e.target.value) || 0
                          }
                        }))}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Navigation Button */}
              <div className="sm:hidden">
                <button
                  type="button"
                  onClick={() => setActiveSection('basic')}
                  className="w-full bg-gray-50 text-gray-600 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-100 transition-all duration-200"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  Anterior
                </button>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-gray-200">
            <button
              type="submit"
              className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold flex items-center justify-center gap-2"
            >
              {editingEvent ? 'Actualizar' : 'Crear'} Evento
            </button>

            <button
              type="button"
              onClick={closeEventForm}
              className="w-full sm:flex-1 bg-gray-100 text-gray-700 py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
            >
              Cancelar
            </button>
          </div>

          {/* Botón eliminar (solo si es edición) */}
          {editingEvent && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold flex items-center justify-center gap-2 mt-3 sm:mt-4"
            >
              <TrashIcon className="w-5 h-5" />
              Eliminar Evento
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default EventForm;
