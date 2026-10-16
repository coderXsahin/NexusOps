import { useMemo, useState } from "react";
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
import { tasks } from "./data/tasks";
import {
  countOverdueTasks,
  countTasksByStatus,
  filterTasks,
} from "./utils/taskUtils";

import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = useMemo(
    () => filterTasks(tasks, searchQuery),
    [searchQuery],
  );

  const completedTasks = countTasksByStatus(tasks, "COMPLETED");
  const inProgressTasks = countTasksByStatus(tasks, "IN_PROGRESS");
  const todoTasks = countTasksByStatus(tasks, "TODO");

  // Fixed reference date for the current demo dataset.
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
      detail: `${Math.round((completedTasks / Math.max(tasks.length, 1)) * 100)}% of all tasks`,
      icon: TrendingUp,
      trend: "Completed",
      positive: true,
    },
  ];

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="main-content">
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
                <p className="eyebrow">THURSDAY, OCTOBER 15</p>
                <h1>Good morning, Shaheen 👋</h1>
                <p className="page-description">
                  Here&apos;s what&apos;s happening with your workspace today.
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
                    <p>Your team&apos;s latest work and progress</p>
                  </div>

                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setActivePage("Tasks")}
                  >
                    View all <ArrowRight size={15} />
                  </button>
                </div>

                <TaskTable
                  tasks={filteredTasks}
                  variant="dashboard"
                />

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

                <div className="progress-track" aria-label="Task status distribution">
                  <div
                    className="progress-segment progress-completed"
                    style={{
                      width: `${(completedTasks / Math.max(tasks.length, 1)) * 100}%`,
                    }}
                  />
                  <div
                    className="progress-segment progress-in-progress"
                    style={{
                      width: `${(inProgressTasks / Math.max(tasks.length, 1)) * 100}%`,
                    }}
                  />
                  <div
                    className="progress-segment progress-todo"
                    style={{
                      width: `${(todoTasks / Math.max(tasks.length, 1)) * 100}%`,
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

              <div className="task-count-badge">
                {filteredTasks.length}{" "}
                {filteredTasks.length === 1 ? "task" : "tasks"}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>All tasks</h2>
                  <p>Search across task titles, projects, assignees, and status</p>
                </div>
              </div>

              <TaskTable
                tasks={filteredTasks}
                variant="tasks"
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