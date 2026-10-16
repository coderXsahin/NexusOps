
export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "COMPLETED";

export type TaskPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export interface Task {
  id: number;
  title: string;
  project: string;
  assignee: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
}
