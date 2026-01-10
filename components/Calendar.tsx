import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HistoryState } from '../types';
import { DAILY_PLAN, TOTAL_GOALS } from '../constants';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  history: HistoryState;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate, history }) => {
  const [viewDate, setViewDate] = React.useState(selectedDate);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getDayStatus = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    const dayLog = history[dateStr];
    const completedIds = dayLog?.completedIds || [];
    
    // Check if day is truly empty (no protein logged)
    if (completedIds.length === 0 && (!dayLog?.extraProtein || dayLog.extraProtein === 0)) {
        return 'empty';
    }

    // Calculate protein for that day
    let protein = dayLog?.extraProtein || 0;
    completedIds.forEach(id => {
      const block = DAILY_PLAN.find(b => b.id === id);
      if (block) protein += block.totalProtein;
    });

    const percentage = protein / TOTAL_GOALS.protein;
    if (percentage >= 0.9) return 'perfect';
    if (percentage >= 0.5) return 'good';
    return 'started';
  };

  const renderDays = () => {
    const days = [];
    // Empty cells for offset
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const isSelected = isSameDay(currentDate, selectedDate);
      const status = getDayStatus(day);
      const isToday = isSameDay(currentDate, new Date());

      let statusColor = '';
      if (status === 'perfect') statusColor = 'bg-emerald-500';
      else if (status === 'good') statusColor = 'bg-yellow-500';
      else if (status === 'started') statusColor = 'bg-slate-600';

      days.push(
        <button
          key={day}
          onClick={() => onSelectDate(currentDate)}
          className={`h-10 w-10 rounded-full flex flex-col items-center justify-center relative transition-all
            ${isSelected ? 'bg-slate-700 text-white font-bold ring-2 ring-emerald-500' : 'text-slate-400 hover:bg-slate-800'}
            ${isToday && !isSelected ? 'text-emerald-400 font-semibold' : ''}
          `}
        >
          <span className="text-sm">{day}</span>
          {status !== 'empty' && (
            <span className={`absolute bottom-1 w-1 h-1 rounded-full ${statusColor}`} />
          )}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-800 rounded text-slate-400">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-white">{monthNames[month]} {year}</span>
        <button onClick={handleNextMonth} className="p-1 hover:bg-slate-800 rounded text-slate-400">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <span key={d} className="text-xs font-bold text-slate-500">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 place-items-center">
        {renderDays()}
      </div>
    </div>
  );
};