import type { Task, TaskPriority, TaskStatus } from "../types";

interface TaskTableProps {
  tasks: Task[];
  variant: "dashboard" | "tasks";
  onEdit?: (task: Task) => void;
}

function formatStatus(status: TaskStatus) {
  return status.replace("_", " ");
}

function formatPriority(priority: TaskPriority) {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

function formatDashboardDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function TaskTable({
  tasks,
  variant,
  onEdit,
}: TaskTableProps) {
  const isDashboard = variant === "dashboard";

  return (
    <div className="table-scroll">
      <table className="task-table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due date</th>
            {!isDashboard && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>
                <div className="task-title">
                  <strong>{task.title}</strong>
                  <span>
                    {isDashboard
                      ? task.project
                      : `${task.project} · ${task.assignee}`}
                  </span>
                </div>
              </td>

              <td>
                <span
                  className={`priority priority-${task.priority.toLowerCase()}`}
                >
                  {formatPriority(task.priority)}
                </span>
              </td>

              <td>
                <span
                  className={`status status-${task.status.toLowerCase()}`}
                >
                  {formatStatus(task.status)}
                </span>
              </td>

              <td className="due-date">
                {isDashboard ? formatDashboardDate(task.dueDate) : task.dueDate}
              </td>

              {!isDashboard && (
                <td>
                  <button
                    type="button"
                    className="task-edit-button"
                    onClick={() => onEdit?.(task)}
                    disabled={!onEdit}
                  >
                    Edit
                  </button>
                </td>
              )}
            </tr>
          ))}

          {tasks.length === 0 && (
            <tr>
              <td colSpan={isDashboard ? 4 : 5} className="empty-state">
                No tasks match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}