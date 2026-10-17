
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  type CreateTaskInput,
} from "./taskApi";
import type { Task } from "../types";

const API_URL = "http://localhost:8080/api/tasks";

const sampleTask: Task = {
  id: 1,
  title: "Implement task API",
  project: "NexusOps",
  assignee: "SK",
  priority: "HIGH",
  status: "IN_PROGRESS",
  dueDate: "2026-10-20",
};

const taskInput: CreateTaskInput = {
  title: "Implement task API",
  project: "NexusOps",
  assignee: "SK",
  priority: "HIGH",
  status: "IN_PROGRESS",
  dueDate: "2026-10-20",
};

describe("taskApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("fetches all tasks successfully", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([sampleTask]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(fetchTasks()).resolves.toEqual([sampleTask]);

    expect(fetch).toHaveBeenCalledWith(API_URL);
  });

  it("throws an error when fetching tasks fails", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("Server error", { status: 500 }),
    );

    await expect(fetchTasks()).rejects.toThrow(
      "Failed to fetch tasks: HTTP 500",
    );
  });

  it("creates a task and sends JSON in the request body", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(sampleTask), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(createTask(taskInput)).resolves.toEqual(sampleTask);

    expect(fetch).toHaveBeenCalledWith(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskInput),
    });
  });

  it("shows a validation message when task creation fails", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Validation failed",
          fieldErrors: { title: "Title must not be blank" },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await expect(createTask(taskInput)).rejects.toThrow(
      "Title must not be blank",
    );
  });

  it("updates an existing task", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(sampleTask), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(updateTask(1, taskInput)).resolves.toEqual(sampleTask);

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/1`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskInput),
    });
  });

  it("deletes a task successfully", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    await expect(deleteTask(1)).resolves.toBeUndefined();

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/1`, {
      method: "DELETE",
    });
  });

  it("throws an error when task deletion fails", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ message: "Task not found with id: 99" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await expect(deleteTask(99)).rejects.toThrow(
      "Task not found with id: 99",
    );
  });
});
