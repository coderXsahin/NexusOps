import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";
import TaskTable from "./components/TaskTable";
import CreateTaskForm from "./components/CreateTaskForm";
import type { Task } from "./types";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from "./services/taskApi";
import type { CreateTaskInput } from "./services/taskApi";
import {
  countOverdueTasks,
  countTasksByStatus,
  filterTasks,
} from "./utils/taskUtils";

import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [createTaskError, setCreateTaskError] = useState<string | null>(null);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [updateTaskError, setUpdateTaskError] = useState<string | null>(null);

  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [deleteTaskError, setDeleteTaskError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      try {
        setIsLoadingTasks(true);
        setTasksError(null);

        const data = await fetchTasks();

        if (!cancelled) {
          setTasks(data);
        }
      } catch (error) {
        if (!cancelled) {
          setTasksError(
            error instanceof Error
              ? error.message
              : "Unable to load tasks.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTasks(false);
        }
      }
    }

    void loadTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreateTask(input: CreateTaskInput) {
    setIsCreatingTask(true);
    setCreateTaskError(null);

    try {
      const createdTask = await createTask(input);

      setTasks((currentTasks) => [...currentTasks, createdTask]);
      setIsCreateFormOpen(false);
      setSearchQuery("");
    } catch (error) {
      setCreateTaskError(
        error instanceof Error ? error.message : "Unable to create task.",
      );
    } finally {
      setIsCreatingTask(false);
    }
  }

  function handleEditTask(task: Task) {
    setIsCreateFormOpen(false);
    setCreateTaskError(null);
    setUpdateTaskError(null);
    setDeleteTaskError(null);
    setEditingTask(task);
  }

  async function handleUpdateTask(input: CreateTaskInput) {
    if (!editingTask) {
      return;
    }

    setIsUpdatingTask(true);
    setUpdateTaskError(null);

    try {
      const updatedTask = await updateTask(editingTask.id, input);

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task,
        ),
      );

      setEditingTask(null);
      setSearchQuery("");
    } catch (error) {
      setUpdateTaskError(
        error instanceof Error ? error.message : "Unable to update task.",
      );
    } finally {
      setIsUpdatingTask(false);
    }
  }

  async function handleDeleteTask(task: Task) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingTaskId(task.id);
    setDeleteTaskError(null);

    try {
      await deleteTask(task.id);

      setTasks((currentTasks) =>
        currentTasks.filter((currentTask) => currentTask.id !== task.id),
      );

      if (editingTask?.id === task.id) {
        setEditingTask(null);
      }

      setIsCreateFormOpen(false);
    } catch (error) {
      setDeleteTaskError(
        error instanceof Error ? error.message : "Unable to delete task.",
      );
    } finally {
      setDeletingTaskId(null);
    }
  }

  const filteredTasks = useMemo(
    () => filterTasks(tasks, searchQuery),
    [tasks, searchQuery],
  );

  const completedTasks = countTasksByStatus(tasks, "COMPLETED");
  const inProgressTasks = countTasksByStatus(tasks, "IN_PROGRESS");
  const todoTasks = countTasksByStatus(tasks, "TODO");

  const overdueTasks = countOverdueTasks(tasks, "2026-10-16");

  const stats = [
    {
      label: "Total tasks",
      value: tasks.length,
      detail: "Across all projects",
      icon: CheckCircle2,
      trend: "+12.5%",
      positive: true,
    },
    {
      label: "In progress",
      value: inProgressTasks,
      detail: "Currently active",
      icon: Clock3,
      trend: "Active",
      positive: true,
    },
    {
      label: "Overdue tasks",
      value: overdueTasks,
      detail: overdueTasks > 0 ? "Needs review" : "On track",
      icon: CircleAlert,
      trend: overdueTasks > 0 ? "Attention" : "Good",
      positive: overdueTasks === 0,
    },
    {
      label: "Completed",
      value: completedTasks,
      detail: `${Math.round(
        (completedTasks / Math.max(tasks.length, 1)) * 100,
      )}% of all tasks`,
      icon: TrendingUp,
      trend: "Completed",
      positive: true,
    },
  ];

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="main-content">
        {isLoadingTasks && (
          <p className="api-feedback" role="status">
            Loading tasks from NexusOps...
          </p>
        )}

        {tasksError && (
          <p className="api-feedback api-error" role="alert">
            Could not load tasks: {tasksError}
          </p>
        )}

        {deleteTaskError && (
          <p className="api-feedback api-error" role="alert">
            Could not delete task: {deleteTaskError}
          </p>
        )}

        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <ArrowRight size={15} />
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search tasks, projects..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Search tasks and projects"
              />
              <kbd>⌘ K</kbd>
            </label>

            <button
              className="icon-button notification-button"
              type="button"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="notification-dot" />
            </button>

            <div className="topbar-avatar" aria-label="User profile">
              SK
            </div>
          </div>
        </header>

        {activePage === "Dashboard" && (
          <>
            <section className="page-heading">
              <div>
                <p className="eyebrow">WORKSPACE OVERVIEW</p>
                <h1>Good morning, Shaheen 👋</h1>
                <p className="page-description">
                  Here's what's happening with your workspace today.
                </p>
              </div>

              <button
                className="primary-button"
                type="button"
                onClick={() => setActivePage("Tasks")}
              >
                <Plus size={17} />
                View tasks
              </button>
            </section>

            <section className="stats-grid" aria-label="Workspace statistics">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <StatCard
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    detail={stat.detail}
                    icon={<Icon size={19} />}
                    trend={stat.trend}
                    positive={stat.positive}
                  />
                );
              })}
            </section>

            <section className="dashboard-grid">
              <div className="panel recent-tasks-panel">
                <div className="panel-header">
                  <div>
                    <h2>Recent tasks</h2>
                    <p>Your team's latest work and progress</p>
                  </div>

                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setActivePage("Tasks")}
                  >
                    View all <ArrowRight size={15} />
                  </button>
                </div>

                <TaskTable tasks={filteredTasks} variant="dashboard" />

                <div className="panel-footer">
                  <span>
                    Showing {filteredTasks.length} of {tasks.length} tasks
                  </span>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setActivePage("Tasks")}
                  >
                    Manage tasks <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              <div className="panel progress-panel">
                <div className="panel-header">
                  <div>
                    <h2>Task overview</h2>
                    <p>Current workload breakdown</p>
                  </div>
                  <CalendarDays size={19} />
                </div>

                <div className="progress-summary">
                  <div>
                    <span className="progress-total">{tasks.length}</span>
                    <span className="progress-caption">Total tasks</span>
                  </div>
                  <span className="progress-period">All projects</span>
                </div>

                <div
                  className="progress-track"
                  aria-label="Task status distribution"
                >
                  <div
                    className="progress-segment progress-completed"
                    style={{
                      width: `${
                        (completedTasks / Math.max(tasks.length, 1)) * 100
                      }%`,
                    }}
                  />
                  <div
                    className="progress-segment progress-in-progress"
                    style={{
                      width: `${
                        (inProgressTasks / Math.max(tasks.length, 1)) * 100
                      }%`,
                    }}
                  />
                  <div
                    className="progress-segment progress-todo"
                    style={{
                      width: `${
                        (todoTasks / Math.max(tasks.length, 1)) * 100
                      }%`,
                    }}
                  />
                </div>

                <div className="progress-legend">
                  <div className="legend-item">
                    <span className="legend-dot dot-completed" />
                    <span>Completed</span>
                    <strong>{completedTasks}</strong>
                  </div>

                  <div className="legend-item">
                    <span className="legend-dot dot-in-progress" />
                    <span>In progress</span>
                    <strong>{inProgressTasks}</strong>
                  </div>

                  <div className="legend-item">
                    <span className="legend-dot dot-todo" />
                    <span>To do</span>
                    <strong>{todoTasks}</strong>
                  </div>
                </div>

                <div className="progress-note">
                  <div className="progress-note-icon">
                    <TrendingUp size={17} />
                  </div>
                  <div>
                    <strong>
                      {Math.round(
                        (completedTasks / Math.max(tasks.length, 1)) * 100,
                      )}
                      % completed
                    </strong>
                    <p>Keep up the momentum. Every task counts.</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activePage === "Tasks" && (
          <section className="tasks-page">
            <div className="page-heading">
              <div>
                <p className="eyebrow">WORK MANAGEMENT</p>
                <h1>Tasks</h1>
                <p className="page-description">
                  Track assignments, priorities, and delivery dates.
                </p>
              </div>

              <div className="tasks-heading-actions">
                <div className="task-count-badge">
                  {filteredTasks.length}{" "}
                  {filteredTasks.length === 1 ? "task" : "tasks"}
                </div>

                <button
                  className="primary-button"
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setUpdateTaskError(null);
                    setCreateTaskError(null);
                    setDeleteTaskError(null);
                    setIsCreateFormOpen(true);
                  }}
                >
                  <Plus size={17} />
                  New task
                </button>
              </div>
            </div>

            {(isCreateFormOpen || editingTask !== null) && (
              <div className="panel create-task-panel">
                <div className="panel-header">
                  <div>
                    <h2>{editingTask ? "Edit task" : "Create a task"}</h2>
                    <p>
                      {editingTask
                        ? `Update the details for task #${editingTask.id}.`
                        : "Add a task to your NexusOps workspace."}
                    </p>
                  </div>
                </div>

                <CreateTaskForm
                  key={editingTask ? `edit-${editingTask.id}` : "create"}
                  initialTask={editingTask}
                  onSubmit={
                    editingTask ? handleUpdateTask : handleCreateTask
                  }
                  onCancel={() => {
                    setIsCreateFormOpen(false);
                    setEditingTask(null);
                    setCreateTaskError(null);
                    setUpdateTaskError(null);
                  }}
                  isSubmitting={
                    editingTask ? isUpdatingTask : isCreatingTask
                  }
                  error={editingTask ? updateTaskError : createTaskError}
                />
              </div>
            )}

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>All tasks</h2>
                  <p>
                    Search across task titles, projects, assignees, and status
                  </p>
                </div>
              </div>

              <TaskTable
                tasks={filteredTasks}
                variant="tasks"
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                deletingTaskId={deletingTaskId}
              />
            </div>
          </section>
        )}

        {activePage !== "Dashboard" && activePage !== "Tasks" && (
          <section className="placeholder-page">
            <div className="placeholder-icon">
              <TrendingUp size={28} />
            </div>
            <p className="eyebrow">NEXUSOPS WORKSPACE</p>
            <h1>{activePage}</h1>
            <p className="page-description">
              The {activePage.toLowerCase()} module is planned for a future
              development step.
            </p>
            <button
              className="primary-button"
              type="button"
              onClick={() => setActivePage("Dashboard")}
            >
              Back to dashboard
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
