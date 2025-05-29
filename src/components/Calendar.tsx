import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEventStore } from '../store/eventStore';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/solid';

const Calendar: React.FC = () => {
  const { events, getEventsByDate, editEvent, openEventForm } = useEventStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mobileView, setMobileView] = useState<'week' | 'month'>('week');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // For mobile week view
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get first day of week (Monday = 1, Sunday = 0)
  const firstDayOfMonth = monthStart.getDay();
  const startCalendar = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Add empty cells for previous month
  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < startCalendar; i++) {
    calendarDays.push(null);
  }
  calendarDays.push(...monthDays);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const days = direction === 'prev' ? -7 : 7;
      return addDays(prev, days);
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    openEventForm(date);
  };

  const handleEventClick = (event: any) => {
    editEvent(event);
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setCurrentDate(newDate);
    setShowDatePicker(false);
  };

  const handleTitleClick = () => {
    setShowDatePicker(!showDatePicker);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setShowDatePicker(false);
  };

  // Desktop Grid View Component
  const DesktopGridView = () => (
    <div className="p-2 sm:p-4">
      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="p-1 sm:p-3 text-center text-xs sm:text-sm font-bold text-gray-600 bg-gray-50 rounded-lg">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-4">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-12 sm:h-24"></div>;
          }

          const dayEvents = getEventsByDate(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isTodayDate = isToday(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);

          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                h-12 sm:h-24 p-1 sm:p-2 border rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md relative overflow-hidden
                ${!isCurrentMonth ? 'text-gray-400 bg-gray-50/50 border-gray-200/50' : 'bg-white border-gray-200/60 hover:border-blue-300'}
                ${isTodayDate ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-md' : ''}
                ${isSelected ? 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-400 shadow-lg' : ''}
              `}
            >
              {/* Date number */}
              <div className={`
                text-xs sm:text-sm font-bold mb-1
                ${isTodayDate ? 'text-blue-700' : isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}
              `}>
                {format(date, 'd')}
              </div>

              {/* Events */}
              <div className="space-y-0.5 sm:space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                    className="text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-md text-white cursor-pointer truncate font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.01]"
                    style={{ backgroundColor: event.color }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[10px] sm:text-xs text-gray-500 px-1 font-medium">
                    +{dayEvents.length - 2} más
                  </div>
                )}
              </div>

              {/* Today indicator */}
              {isTodayDate && (
                <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Mobile Week View Component
  const MobileWeekView = () => (
    <div className="space-y-3 sm:space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <button
          onClick={() => navigateWeek('prev')}
          className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg sm:rounded-xl transition-all duration-200"
        >
          <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="text-center">
          <div className="text-xs sm:text-sm text-white/80 font-medium">
            {format(weekStart, 'dd MMM', { locale: es })} - {format(weekEnd, 'dd MMM yyyy', { locale: es })}
          </div>
        </div>

        <button
          onClick={() => navigateWeek('next')}
          className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg sm:rounded-xl transition-all duration-200"
        >
          <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Days List */}
      {weekDays.map((date, index) => {
        const dayEvents = getEventsByDate(date);
        const isTodayDate = isToday(date);
        const isSelected = selectedDate && isSameDay(date, selectedDate);

        return (
          <div
            key={index}
            className={`
              bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border transition-all duration-200
              ${isTodayDate ? 'border-blue-300 bg-blue-50/90' : 'border-gray-200/60'}
              ${isSelected ? 'border-blue-400 bg-blue-100/90' : ''}
            `}
          >
            {/* Date Header */}
            <div
              onClick={() => handleDateClick(date)}
              className="flex items-center justify-between mb-2 sm:mb-3 cursor-pointer"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`
                  w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-base sm:text-lg
                  ${isTodayDate ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}
                `}>
                  {format(date, 'd')}
                </div>
                <div>
                  <div className={`font-bold text-sm sm:text-base ${isTodayDate ? 'text-blue-600' : 'text-gray-800'}`}>
                    {format(date, 'EEEE', { locale: es })}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {format(date, 'dd MMMM yyyy', { locale: es })}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2">
                {dayEvents.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    {dayEvents.length} evento{dayEvents.length > 1 ? 's' : ''}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEventForm(date);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Events */}
            {dayEvents.length > 0 ? (
              <div className="space-y-1.5 sm:space-y-2">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                    className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50"
                    style={{ borderLeft: `4px solid ${event.color}` }}
                  >
                    <div
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                      style={{ backgroundColor: event.color }}
                    ></div>
                    <div className="flex-1">
                      <div className="font-medium text-sm sm:text-base text-gray-900">{event.title}</div>
                      <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 sm:gap-2">
                        <span>⏰ {event.time}</span>
                        {event.description && (
                          <span className="truncate">• {event.description}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 sm:py-4 text-gray-500">
                <div className="text-xl sm:text-2xl mb-1">📝</div>
                <div className="text-xs sm:text-sm">Sin eventos programados</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="content-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Mobile view toggle */}
          <div className="flex items-center space-x-1 sm:space-x-2 sm:hidden">
            <button
              onClick={() => setMobileView('week')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                mobileView === 'week' ? 'bg-white/20 text-white' : 'text-white/70'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setMobileView('month')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                mobileView === 'month' ? 'bg-white/20 text-white' : 'text-white/70'
              }`}
            >
              Mes
            </button>
          </div>

          {/* Navigation for desktop and month view */}
          {(mobileView === 'month') && (
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-[1.05]"
            >
              <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          <div className="relative flex-1 flex justify-center sm:flex-initial">
            <h2
              className="text-lg sm:text-2xl font-bold text-white cursor-pointer hover:text-blue-100 transition-colors px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl hover:bg-white/10 text-center"
              onClick={handleTitleClick}
              title="Click para seleccionar fecha personalizada"
            >
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>

            {/* Date Picker Dropdown */}
            {showDatePicker && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 sm:mt-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-2xl p-3 sm:p-4 z-20 min-w-max backdrop-blur-sm">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Ir a fecha:
                    </label>
                    <input
                      type="month"
                      value={format(currentDate, 'yyyy-MM')}
                      onChange={handleCustomDateChange}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs sm:text-sm"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={goToToday}
                      className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] shadow-md"
                    >
                      Hoy
                    </button>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-lg hover:bg-gray-200 transition-all duration-200"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation for desktop and month view */}
          {(mobileView === 'month') && (
            <button
              onClick={() => navigateMonth('next')}
              className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-[1.05]"
            >
              <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Desktop navigation */}
          <div className="hidden sm:flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-[1.05]"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-[1.05]"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="sm:hidden p-2 sm:p-4">
        {mobileView === 'week' ? <MobileWeekView /> : <DesktopGridView />}
      </div>
      <div className="hidden sm:block">
        <DesktopGridView />
      </div>

      {/* Click outside to close date picker */}
      {showDatePicker && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
};

export default Calendar;
