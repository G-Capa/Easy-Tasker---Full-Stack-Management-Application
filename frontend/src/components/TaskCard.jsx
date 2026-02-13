const TaskCard = ({ task, isSelected, onToggleComplete, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReminderLabel = (preference) => {
    const labels = {
      'none': 'No Reminder',
      '1_hour': '🔔 1 Hour Before',
      '1_day': '🔔 1 Day Before',
      '1_week': '🔔 1 Week Before'
    };
    return labels[preference] || 'No Reminder';
  };

  return (
    <div className={`task-card ${isSelected ? 'selected' : ''}`}>
      <div className="task-card-header">
        <div>
          <h3 className="task-card-title">{task.title}</h3>
          {task.description && <p className="task-card-description">{task.description}</p>}
          {task.due_date && (
            <p className="task-card-due-date">
              📅 Due: {formatDate(task.due_date)}
            </p>
          )}
          {task.reminder_preference && task.reminder_preference !== 'none' && (
            <p className="task-card-reminder">
              {getReminderLabel(task.reminder_preference)}
              {task.reminder_sent && <span className="reminder-sent"> ✓ Sent</span>}
            </p>
          )}
        </div>
        <span className={`task-card-status ${task.completed ? 'done' : 'todo'}`}>
          {task.completed ? '✓ Done' : '⏳ Todo'}
        </span>
      </div>
      <div className="task-card-actions">
        <button onClick={() => onToggleComplete(task)} className="btn-action btn-toggle">
          {task.completed ? 'Mark Todo' : 'Mark Done'}
        </button>
        <button onClick={() => onEdit(task)} className="btn-action btn-edit">Edit</button>
        <button onClick={() => onDelete(task.id)} className="btn-action btn-delete">Delete</button>
      </div>
    </div>
  );
};

export default TaskCard;