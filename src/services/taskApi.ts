
import type { Task } from "../types";

const API_BASE_URL = "http://localhost:8080/api";

export type CreateTaskInput = Omit<Task, "id">;

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/tasks`);

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: HTTP ${response.status}`);
  }

  return (await response.json()) as Task[];
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let message = `Failed to create task: HTTP ${response.status}`;

    try {
      const errorBody: {
        error?: string;
        fieldErrors?: Record<string, string>;
      } = await response.json();

      const validationMessages = Object.values(errorBody.fieldErrors ?? {});

      if (validationMessages.length > 0) {
        message = validationMessages.join(", ");
      } else if (errorBody.error) {
        message = errorBody.error;
      }
    } catch {
      // Keep the fallback HTTP error message if the response isn't JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as Task;
}

export async function updateTask(
  id: number,
  input: CreateTaskInput,
): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let message = `Failed to update task: HTTP ${response.status}`;

    try {
      const errorBody: {
        error?: string;
        fieldErrors?: Record<string, string>;
      } = await response.json();

      const validationMessages = Object.values(errorBody.fieldErrors ?? {});

      if (validationMessages.length > 0) {
        message = validationMessages.join(", ");
      } else if (errorBody.error) {
        message = errorBody.error;
      }
    } catch {
      // Keep the fallback HTTP error message if the response isn't JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as Task;
}
