import { useEffect, useState } from "react";
import {
  registerUser,
  loginUser,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  logout,
  getToken,
} from "./Api";
import AnimatedList from "./components/AnimatedList";
import TaskCard from "./components/TaskCard";
import DraggableCalendar from "./components/DraggableCalendar";
import "./App.css";

export default function App() {
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    completed: false,
    due_date: "",
    end_date: "",
    due_time: "",
    reminder_preference: "none",
    selectedColor: null,
  });

  const [dateSelectionState, setDateSelectionState] = useState({
    startDate: null,
    endDate: null,
    waitingForEndDate: false,
  });

  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [bgColor, setBgColor] = useState("#000000");
  const [bgColor2, setBgColor2] = useState("#3c54a0");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const isLoggedIn = !!getToken();

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data.results || []);
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    }
  };

  useEffect(() => {
    if (isLoggedIn) loadTasks();
  }, [isLoggedIn]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser(registerForm);
      setMessage("Registered. Now log in.");
      setMessageType("success");
      setRegisterForm({ username: "", email: "", password: "", password_confirm: "" });
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser(loginForm);
      setMessage("Logged in.");
      setMessageType("success");
      setLoginForm({ username: "", password: "" });
      loadTasks();
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...taskForm };
      // Combine date and time if both are set
      if (dateSelectionState.startDate && payload.due_time) {
        const [hours, minutes] = payload.due_time.split(':');
        const dueDateTime = new Date(dateSelectionState.startDate);
        dueDateTime.setHours(parseInt(hours), parseInt(minutes));
        payload.due_date = dueDateTime.toISOString();
        
        // Set end date if different from start date
        if (dateSelectionState.endDate) {
          const endDateTime = new Date(dateSelectionState.endDate);
          endDateTime.setHours(parseInt(hours), parseInt(minutes));
          payload.end_date = endDateTime.toISOString();
        }
        
        // Use the stored color for calendar display
        payload.color = taskForm.selectedColor || `hsl(${Math.random() * 360}, 70%, 80%)`;
      } else {
        delete payload.due_date;
        delete payload.end_date;
      }
      delete payload.due_time;
      
      await createTask(payload);
      setTaskForm({ title: "", description: "", completed: false, due_date: "", end_date: "", due_time: "", reminder_preference: "none", selectedColor: null });
      setDateSelectionState({ startDate: null, endDate: null, waitingForEndDate: false });
      setMessage("Task created!");
      setMessageType("success");
      loadTasks();
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    // Convert ISO date to local datetime-local format
    const editData = { ...task };
    if (editData.due_date) {
      editData.due_date = new Date(editData.due_date).toISOString().slice(0, 16);
    }
    setEditForm(editData);
  };

  const handleSaveEdit = async () => {
    try {
      const payload = { ...editForm };
      // Convert local datetime to ISO format if due_date is set
      if (payload.due_date) {
        payload.due_date = new Date(payload.due_date).toISOString();
      }
      await updateTask(editingId, payload);
      setEditingId(null);
      setMessage("Task updated!");
      setMessageType("success");
      loadTasks();
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      setMessage("Task deleted!");
      setMessageType("success");
      loadTasks();
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await updateTask(task.id, { ...task, completed: !task.completed });
      loadTasks();
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    }
  };

  const handleLogout = () => {
    logout();
    setTasks([]);
    setMessage("Logged out.");
    setMessageType("success");
  };

  const checkTaskReminders = () => {
    const now = new Date();
    const upcomingAlerts = [];
    
    tasks.forEach(task => {
      if (task.completed || !task.due_date || task.reminder_preference === 'none') return;
      
      const dueDate = new Date(task.due_date);
      const timeDiff = dueDate - now;
      
      let alertTime = 0;
      let alertLabel = '';
      
      switch(task.reminder_preference) {
        case '1_hour':
          alertTime = 60 * 60 * 1000;
          alertLabel = '1 hour';
          break;
        case '1_day':
          alertTime = 24 * 60 * 60 * 1000;
          alertLabel = '1 day';
          break;
        case '1_week':
          alertTime = 7 * 24 * 60 * 60 * 1000;
          alertLabel = '1 week';
          break;
      }
      
      if (timeDiff > 0 && timeDiff <= alertTime && !task.reminder_sent) {
        upcomingAlerts.push({
          id: task.id,
          title: task.title,
          timeLabel: alertLabel,
          dueDate: dueDate
        });
      }
    });
    
    setAlerts(upcomingAlerts);
  };

  const dismissAlert = async (alertId) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
    const task = tasks.find(t => t.id === alertId);
    if (task) {
      await updateTask(alertId, { ...task, reminder_sent: true });
      // Update local tasks state directly to prevent alert from reappearing
      setTasks(tasks.map(t => t.id === alertId ? { ...t, reminder_sent: true } : t));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dateStr = e.dataTransfer.getData('date');
    if (!dateStr) return;
    
    const droppedDate = new Date(dateStr);
    
    if (!dateSelectionState.startDate) {
      // First date dropped - set as start date and generate color
      const randomColor = `hsl(${Math.random() * 360}, 70%, 80%)`;
      setTaskForm({ ...taskForm, selectedColor: randomColor });
      setDateSelectionState({
        startDate: droppedDate,
        endDate: null,
        waitingForEndDate: true,
      });
    } else if (dateSelectionState.waitingForEndDate) {
      // Second date dropped - set as end date
      const start = dateSelectionState.startDate;
      const end = droppedDate;
      
      setDateSelectionState({
        startDate: start < end ? start : end,
        endDate: start < end ? end : start,
        waitingForEndDate: false,
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  useEffect(() => {
    if (isLoggedIn && tasks.length > 0) {
      checkTaskReminders();
      const interval = setInterval(checkTaskReminders, 60000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, tasks]);

  useEffect(() => {
    document.body.style.background = `linear-gradient(135deg, ${bgColor} 0%, ${bgColor2} 100%)`;
    document.body.style.backgroundSize = '400% 400%';
    document.body.style.animation = 'gradientShift 15s ease infinite';
  }, [bgColor, bgColor2]);

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>✓ Easy Tasker</h1>
        {isLoggedIn && (
          <div className="color-picker-controls">
            <button 
              className="btn-color-toggle"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              Customize
            </button>
            {showColorPicker && (
              <div className="color-picker-panel">
                <div className="color-input-group">
                  <label>Color 1</label>
                  <input 
                    type="color" 
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                </div>
                <div className="color-input-group">
                  <label>Color 2</label>
                  <input 
                    type="color" 
                    value={bgColor2}
                    onChange={(e) => setBgColor2(e.target.value)}
                  />
                </div>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setBgColor("#000000");
                    setBgColor2("#3c54a0");
                  }}
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isLoggedIn && alerts.length > 0 && (
        <div className="alerts-bar">
          {alerts.map(alert => (
            <div key={alert.id} className="alert-item">
              <span className="alert-icon">⏰</span>
              <span className="alert-text">
                You have task <strong>{alert.title}</strong> in <strong>{alert.timeLabel}</strong>
              </span>
              <button 
                className="alert-dismiss"
                onClick={() => dismissAlert(alert.id)}
                title="Dismiss"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {message && <div className={`message ${messageType}`}>{message}</div>}

      {!isLoggedIn && (
        <div className="auth-container">
          <div className="auth-form">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <input 
                  type="text"
                  placeholder="Username" 
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <input 
                  type="email"
                  placeholder="Email" 
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={registerForm.password_confirm}
                  onChange={(e) => setRegisterForm({ ...registerForm, password_confirm: e.target.value })} 
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary"
                style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor2} 100%)` }}
              >
                Register
              </button>
            </form>
          </div>

          <div className="auth-form">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input 
                  type="text"
                  placeholder="Username" 
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} 
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary"
                style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor2} 100%)` }}
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {isLoggedIn && (
        <div className="logged-in-container">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>

          <div className="main-content-grid">
            {/* Left - Calendar */}
            <div className="calendar-section">
              <DraggableCalendar 
                tasks={tasks} 
                selectedDateRange={dateSelectionState.startDate ? {
                  start: dateSelectionState.startDate,
                  end: dateSelectionState.endDate || dateSelectionState.startDate,
                  color: taskForm.selectedColor || `hsl(${Math.random() * 360}, 70%, 80%)`
                } : null}
              />
            </div>

            {/* Middle - Create Task Form */}
            <div className="create-task-section">
              <div 
                className={`task-section ${dateSelectionState.waitingForEndDate ? 'waiting-for-date' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <h2 style={{ borderBottomColor: bgColor }}>Create Task</h2>
                
                {/* Date Drop Zone */}
                <div className="date-drop-zone">
                  {!dateSelectionState.startDate ? (
                    <p className="drop-hint">📅 Drag and drop a date from the calendar</p>
                  ) : dateSelectionState.waitingForEndDate ? (
                    <div className="date-selection-info">
                      <p className="date-selected">Start: {dateSelectionState.startDate.toLocaleDateString('en-GB')}</p>
                      <p className="drop-hint warning">⏳ Select end date (or drop same date for single day)</p>
                    </div>
                  ) : (
                    <div className="date-selection-info">
                      <p className="date-selected">
                        📅 {dateSelectionState.startDate.toLocaleDateString('en-GB')}
                        {dateSelectionState.endDate && dateSelectionState.endDate.getTime() !== dateSelectionState.startDate.getTime() && 
                          ` - ${dateSelectionState.endDate.toLocaleDateString('en-GB')}`
                        }
                      </p>
                      <button 
                        type="button" 
                        className="btn-clear-dates"
                        onClick={() => setDateSelectionState({ startDate: null, endDate: null, waitingForEndDate: false })}
                      >
                        Clear Dates
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleCreateTask}>
                  <div className="form-group">
                    <input 
                      type="text"
                      placeholder="Task Title" 
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} 
                      required
                      disabled={dateSelectionState.waitingForEndDate}
                    />
                  </div>
                  <div className="form-group">
                    <textarea 
                      placeholder="Description" 
                      value={taskForm.description}
                      rows="3"
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} 
                      disabled={dateSelectionState.waitingForEndDate}
                    />
                  </div>
                  
                  {/* Time Input */}
                  {dateSelectionState.startDate && !dateSelectionState.waitingForEndDate && (
                    <div className="form-group">
                      <label htmlFor="due-time">Time</label>
                      <input 
                        type="time"
                        id="due-time"
                        value={taskForm.due_time}
                        onChange={(e) => setTaskForm({ ...taskForm, due_time: e.target.value })} 
                      />
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="reminder">Reminder</label>
                    <select 
                      id="reminder"
                      value={taskForm.reminder_preference}
                      onChange={(e) => setTaskForm({ ...taskForm, reminder_preference: e.target.value })}
                      disabled={dateSelectionState.waitingForEndDate}
                    >
                      <option value="none">No Reminder</option>
                      <option value="1_hour">1 Hour Before</option>
                      <option value="1_day">1 Day Before</option>
                      <option value="1_week">1 Week Before</option>
                    </select>
                  </div>
                  <div className="form-group checkbox-group">
                    <input 
                      type="checkbox" 
                      id="completed"
                      checked={taskForm.completed}
                      onChange={(e) => setTaskForm({ ...taskForm, completed: e.target.checked })} 
                      disabled={dateSelectionState.waitingForEndDate}
                    />
                <label htmlFor="completed">Mark as completed</label>
              </div>
              <button 
                type="submit" 
                className="btn-primary"
                style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor2} 100%)` }}
                disabled={dateSelectionState.waitingForEndDate || !dateSelectionState.startDate}
              >
                Add Task
              </button>
            </form>
          </div>

          {editingId && (
            <div className="edit-form">
              <h3>Edit Task</h3>
              <div className="form-group">
                <input 
                  type="text"
                  placeholder="Title" 
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <textarea 
                  placeholder="Description" 
                  value={editForm.description}
                  rows="3"
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-due-date">Due Date & Time</label>
                <input 
                  type="datetime-local"
                  id="edit-due-date"
                  value={editForm.due_date || ""}
                  onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-reminder">Reminder</label>
                <select 
                  id="edit-reminder"
                  value={editForm.reminder_preference || "none"}
                  onChange={(e) => setEditForm({ ...editForm, reminder_preference: e.target.value })}
                >
                  <option value="none">No Reminder</option>
                  <option value="1_hour">1 Hour Before</option>
                  <option value="1_day">1 Day Before</option>
                  <option value="1_week">1 Week Before</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="edit-completed"
                  checked={editForm.completed}
                  onChange={(e) => setEditForm({ ...editForm, completed: e.target.checked })} 
                />
                <label htmlFor="edit-completed">Mark as completed</label>
              </div>
              <div className="form-buttons">
                <button onClick={handleSaveEdit} className="btn-success">Save</button>
                <button onClick={() => setEditingId(null)} className="btn-secondary">Cancel</button>
              </div>
                </div>
              )}
            </div>

            {/* Right - Your Tasks */}
            <div className="task-list-section">
              <div className="task-section">
                <h2 style={{ borderBottomColor: bgColor }}>Your Tasks</h2>
                {tasks.length > 0 ? (
                  <AnimatedList
                    items={tasks}
                    showGradients={true}
                    enableArrowNavigation={true}
                    displayScrollbar={true}
                    renderItem={(task, index, isSelected) => (
                      <TaskCard
                        task={task}
                        isSelected={isSelected}
                        onToggleComplete={handleToggleComplete}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    )}
                  />
                ) : (
                  <p style={{ textAlign: 'center', color: '#666' }}>No tasks yet. Create one above!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}