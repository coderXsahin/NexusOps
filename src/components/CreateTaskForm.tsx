
import { useState, type FormEvent } from "react";
import type { Task } from "../types";
import type { CreateTaskInput } from "../services/taskApi";

type CreateTaskFormProps = {
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
};

function CreateTaskForm({
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("NexusOps");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("MEDIUM");
  const [status, setStatus] = useState<Task["status"]>("TODO");
  const [dueDate, setDueDate] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      title: title.trim(),
      project: project.trim(),
      assignee: assignee.trim(),
      priority,
      status,
      dueDate,
    });
  }

  return (
    <form className="create-task-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="task-title">Task title</label>
        <input
          id="task-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Implement authentication"
          required
          maxLength={200}
        />
      </div>

      <div className="form-field">
        <label htmlFor="task-project">Project</label>
        <input
          id="task-project"
          value={project}
          onChange={(event) => setProject(event.target.value)}
          placeholder="e.g. NexusOps"
          required
          maxLength={150}
        />
      </div>

      <div className="form-field">
        <label htmlFor="task-assignee">Assignee</label>
        <input
          id="task-assignee"
          value={assignee}
          onChange={(event) => setAssignee(event.target.value)}
          placeholder="e.g. SK"
          required
          maxLength={100}
        />
      </div>

      <div className="form-field">
        <label htmlFor="task-priority">Priority</label>
        <select
          id="task-priority"
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value as Task["priority"])
          }
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="task-status">Status</label>
        <select
          id="task-status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as Task["status"])
          }
        >
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="task-due-date">Due date</label>
        <input
          id="task-due-date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          required
        />
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button
          className="secondary-button"
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          className="primary-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create task"}
        </button>
      </div>
    </form>
  );
}

export default CreateTaskForm;
