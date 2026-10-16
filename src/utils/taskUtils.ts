
import type { Task, TaskStatus } from "../types";

export function filterTasks(
  tasks: Task[],
  searchQuery: string,
): Task[] {
  const query = searchQuery.trim().toLowerCase();

  return tasks.filter((task) =>
    [task.title, task.project, task.assignee, task.status]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );
}

export function countTasksByStatus(
  tasks: Task[],
  status: TaskStatus,
): number {
  return tasks.filter((task) => task.status === status).length;
}

export function countOverdueTasks(
  tasks: Task[],
  referenceDate: string,
): number {
  return tasks.filter(
    (task) =>
      task.status !== "COMPLETED" && task.dueDate < referenceDate,
  ).length;
}
