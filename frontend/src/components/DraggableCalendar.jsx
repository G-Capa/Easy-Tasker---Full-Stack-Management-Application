import { useState } from 'react';
import './Calendar.css';

const DraggableCalendar = ({ tasks = [], onDateDragStart, selectedDateRange = null }) => {
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
      const taskStart = new Date(task.due_date);
      const taskEnd = task.end_date ? new Date(task.end_date) : taskStart;
      const checkDate = new Date(year, month, day);
      
      return checkDate >= new Date(taskStart.getFullYear(), taskStart.getMonth(), taskStart.getDate()) &&
             checkDate <= new Date(taskEnd.getFullYear(), taskEnd.getMonth(), taskEnd.getDate());
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

  const handleDragStart = (e, year, month, day) => {
    const dateObj = new Date(year, month, day);
    e.dataTransfer.setData('date', dateObj.toISOString());
    e.dataTransfer.effectAllowed = 'copy';
    if (onDateDragStart) {
      onDateDragStart(dateObj);
    }
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
      
      // Check if this day is in the selected date range
      const checkDate = new Date(year, month, day);
      const isInSelectedRange = selectedDateRange && 
        checkDate >= new Date(selectedDateRange.start.getFullYear(), selectedDateRange.start.getMonth(), selectedDateRange.start.getDate()) &&
        checkDate <= new Date(selectedDateRange.end.getFullYear(), selectedDateRange.end.getMonth(), selectedDateRange.end.getDate());

      // Generate color based on task if exists, or use selected range color
      const taskColor = hasTask && tasksOnDay[0].color ? tasksOnDay[0].color : null;
      const displayColor = isInSelectedRange ? selectedDateRange.color : taskColor;

      cells.push(
        <div
          key={day}
          className={`calendar-day ${hasTask ? 'has-task' : ''} ${isCurrentDay ? 'today' : ''} ${isInSelectedRange ? 'selected-range' : ''}`}
          style={displayColor ? { backgroundColor: displayColor, border: `2px solid ${displayColor}` } : {}}
          draggable={true}
          onDragStart={(e) => handleDragStart(e, year, month, day)}
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
      <p className="drag-hint">🖱️ Drag dates to the task form</p>
    </div>
  );
};

export default DraggableCalendar;
