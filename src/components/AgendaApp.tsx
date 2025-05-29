import React from 'react';
import {
  CalendarDaysIcon,
  ListBulletIcon,
  PlusIcon,
  RocketLaunchIcon,
  StarIcon,
} from '@heroicons/react/24/solid';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import Calendar from './Calendar';
import EventForm from './EventForm';
import EventList from './EventList';
import { useEventStore } from '../store/eventStore';

const AgendaApp: React.FC = () => {
  const {
    events,
    currentView,
    getUpcomingEvents,
    setCurrentView,
    openEventForm,
  } = useEventStore();

  const upcomingEvents = getUpcomingEvents(5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800 selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-5">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                <CalendarDaysIcon className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-3xl font-black text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                  Mi Tarea: Organiza tu Vida
                </h1>
                <p className="text-xs md:text-sm text-gray-500 font-medium hidden sm:block truncate">
                  Organiza tus tareas
                </p>
              </div>
            </div>

            {/* Desktop: View Toggle + Add Event Button */}
            <div className="hidden md:flex items-center space-x-3 md:space-x-4">
              <div className="flex bg-gray-100/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-1 shadow-md border border-gray-200/60">
                <button
                  onClick={() => setCurrentView('calendar')}
                  className={`px-3 py-2 md:px-4 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    currentView === 'calendar'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/80'
                  }`}
                >
                  <CalendarDaysIcon className="w-4 h-4" />
                  Calendario
                </button>
                <button
                  onClick={() => setCurrentView('list')}
                  className={`px-3 py-2 md:px-4 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    currentView === 'list'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/80'
                  }`}
                >
                  <ListBulletIcon className="w-4 h-4" />
                  Lista
                </button>
              </div>
              <button
                onClick={() => openEventForm(new Date())}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 md:px-5 md:py-3 rounded-xl md:rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold text-xs md:text-sm"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Nuevo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile: Bottom Navigation Bar (View Toggle) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/80 shadow-top z-50 p-2">
          <div className="max-w-md mx-auto grid grid-cols-2 gap-2">
             <button
              onClick={() => setCurrentView('calendar')}
              className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                currentView === 'calendar'
                  ? 'bg-blue-100 text-blue-700 shadow-inner'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <CalendarDaysIcon className="w-4 h-4" />
              Calendario
            </button>
            <button
              onClick={() => setCurrentView('list')}
              className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                currentView === 'list'
                  ? 'bg-blue-100 text-blue-700 shadow-inner'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <ListBulletIcon className="w-4 h-4" />
              Lista
            </button>
          </div>
        </div>
      </header>

      {/* Mobile: FAB for Add Event */}
      <button
        onClick={() => openEventForm(new Date())}
        className="md:hidden fixed bottom-20 right-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-full shadow-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-110 z-50 focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label="Agregar nuevo evento"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-8"> {/* Added pb-28 for mobile bottom nav */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Calendar/List View */}
          <div className="lg:col-span-2">
            {currentView === 'calendar' ? (
              <Calendar />
            ) : (
              <div className="content-card p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-5 md:mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <CalendarDaysIcon className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Todos los Eventos
                  </h2>
                </div>
                <EventList events={events} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 md:space-y-8">
            {/* Quick Stats */}
            <div className="content-card p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                  <ChartBarIcon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Resumen</h3>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/80 shadow-sm">
                  <span className="text-gray-700 font-medium flex items-center gap-2 text-sm sm:text-base">
                    <CalendarDaysIcon className="w-4 h-4" />
                    Total de eventos
                  </span>
                  <span className="font-black text-xl sm:text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {events.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/80 shadow-sm">
                  <span className="text-gray-700 font-medium flex items-center gap-2 text-sm sm:text-base">
                    <RocketLaunchIcon className="w-4 h-4" />
                    Próximos eventos
                  </span>
                  <span className="font-black text-xl sm:text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {upcomingEvents.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="content-card p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-5 md:mb-6">

                  <StarIcon className="w-6 h-6 text-gray-800" />

                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  Próximos Eventos
                </h3>
              </div>
              <EventList
                events={upcomingEvents}
                maxEvents={5}
                showDate={true}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Event Form Modal */}
      <EventForm />

      {/* Floating background decoration - subtle on mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10 md:opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10 md:opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10 md:opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default AgendaApp;
