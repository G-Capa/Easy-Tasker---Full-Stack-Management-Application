// frontend/src/components/Calendar.jsx
import { useState } from 'react';
import './Calendar.css';

const Calendar = ({ tasks = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDate = (year, month, day) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate.getFullYear() === year &&
             taskDate.getMonth() === month &&
             taskDate.getDate() === day;
    });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = new Date();
  const isToday = (year, month, day) => {
    return today.getFullYear() === year &&
           today.getMonth() === month &&
           today.getDate() === day;
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);
    const cells = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= days; day++) {
      const tasksOnDay = getTasksForDate(year, month, day);
      const hasTask = tasksOnDay.length > 0;
      const isCurrentDay = isToday(year, month, day);

      cells.push(
        <div
          key={day}
          className={`calendar-day ${hasTask ? 'has-task' : ''} ${isCurrentDay ? 'today' : ''}`}
        >
          <span className="day-number">{day}</span>
          {hasTask && (
            <div className="task-dots">
              {tasksOnDay.slice(0, 3).map((task, idx) => (
                <span 
                  key={idx} 
                  className={`task-dot ${task.completed ? 'completed' : ''}`}
                  title={task.title}
                />
              ))}
              {tasksOnDay.length > 3 && (
                <span className="task-count">+{tasksOnDay.length - 3}</span>
              )}
            </div>
          )}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <button onClick={prevMonth} className="calendar-nav-btn">‹</button>
        <h3 className="calendar-title">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button onClick={nextMonth} className="calendar-nav-btn">›</button>
      </div>
      <div className="calendar-weekdays">
        <div className="weekday">Sun</div>
        <div className="weekday">Mon</div>
        <div className="weekday">Tue</div>
        <div className="weekday">Wed</div>
        <div className="weekday">Thu</div>
        <div className="weekday">Fri</div>
        <div className="weekday">Sat</div>
      </div>
      <div className="calendar-grid">
        {renderCalendar()}
      </div>
    </div>
  );
};

export default Calendar;