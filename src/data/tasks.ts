
import type { Task } from "../types";

export const tasks: Task[] = [
  {
    id: 1,
    title: "Implement user authentication",
    project: "Platform Core",
    assignee: "SK",
    priority: "HIGH",
    status: "IN_PROGRESS",
    dueDate: "2026-10-18",
  },
  {
    id: 2,
    title: "Design inventory dashboard",
    project: "Inventory",
    assignee: "AR",
    priority: "MEDIUM",
    status: "TODO",
    dueDate: "2026-10-20",
  },
  {
    id: 3,
    title: "Add API validation",
    project: "Platform Core",
    assignee: "SK",
    priority: "HIGH",
    status: "COMPLETED",
    dueDate: "2026-10-14",
  },
  {
    id: 4,
    title: "Resolve checkout incident",
    project: "Operations",
    assignee: "RM",
    priority: "HIGH",
    status: "IN_PROGRESS",
    dueDate: "2026-10-17",
  },
  {
    id: 5,
    title: "Write integration tests",
    project: "Platform Core",
    assignee: "AR",
    priority: "LOW",
    status: "TODO",
    dueDate: "2026-10-22",
  },
];
