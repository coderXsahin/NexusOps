
package com.nexusops.backend.task;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import tools.jackson.databind.ObjectMapper;

@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TaskService taskService;

    private Task sampleTask() {
        return new Task(
                "Implement task API",
                "NexusOps",
                "SK",
                Task.Priority.HIGH,
                Task.Status.IN_PROGRESS,
                LocalDate.of(2026, 10, 25)
        );
    }

    @Test
    void shouldGetAllTasks() throws Exception {
        Task task = sampleTask();
        when(taskService.getAllTasks()).thenReturn(List.of(task));

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Implement task API"))
                .andExpect(jsonPath("$[0].project").value("NexusOps"))
                .andExpect(jsonPath("$[0].assignee").value("SK"))
                .andExpect(jsonPath("$[0].priority").value("HIGH"))
                .andExpect(jsonPath("$[0].status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$[0].dueDate").value("2026-10-25"));

        verify(taskService).getAllTasks();
    }

    @Test
    void shouldCreateTask() throws Exception {
        Task task = sampleTask();
        when(taskService.createTask(any(Task.class))).thenReturn(task);

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(task)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Implement task API"))
                .andExpect(jsonPath("$.project").value("NexusOps"))
                .andExpect(jsonPath("$.assignee").value("SK"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        verify(taskService).createTask(any(Task.class));
    }

    @Test
    void shouldRejectTaskWithBlankTitle() throws Exception {
        String json = """
                {
                  "title": "   ",
                  "project": "NexusOps",
                  "assignee": "SK",
                  "priority": "HIGH",
                  "status": "TODO",
                  "dueDate": "2026-10-25"
                }
                """;

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.title").value("Title is required"));

        verify(taskService, never()).createTask(any(Task.class));
    }

    @Test
    void shouldUpdateExistingTask() throws Exception {
        Task updatedTask = sampleTask();
        when(taskService.updateTask(eq(1L), any(Task.class)))
                .thenReturn(updatedTask);

        mockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedTask)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Implement task API"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        verify(taskService).updateTask(eq(1L), any(Task.class));
    }

    @Test
    void shouldReturnNotFoundWhenUpdatingMissingTask() throws Exception {
        when(taskService.updateTask(eq(999L), any(Task.class)))
                .thenThrow(new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Task not found with id: 999"
                ));

        mockMvc.perform(put("/api/tasks/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleTask())))
                .andExpect(status().isNotFound());

        verify(taskService).updateTask(eq(999L), any(Task.class));
    }

    @Test
    void shouldDeleteExistingTask() throws Exception {
        doNothing().when(taskService).deleteTask(1L);

        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());

        verify(taskService).deleteTask(1L);
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingTask() throws Exception {
        doThrow(new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Task not found with id: 999"
        )).when(taskService).deleteTask(999L);

        mockMvc.perform(delete("/api/tasks/999"))
                .andExpect(status().isNotFound());

        verify(taskService).deleteTask(999L);
    }

    @Test
    void shouldRejectTaskWithBlankProject() throws Exception {
        String json = """
                {
                  "title": "Implement task API",
                  "project": "   ",
                  "assignee": "SK",
                  "priority": "HIGH",
                  "status": "TODO",
                  "dueDate": "2026-10-25"
                }
                """;

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.project").value("Project is required"));

        verify(taskService, never()).createTask(any(Task.class));
    }

    @Test
    void shouldRejectTaskWithBlankAssignee() throws Exception {
        String json = """
                {
                  "title": "Implement task API",
                  "project": "NexusOps",
                  "assignee": "   ",
                  "priority": "HIGH",
                  "status": "TODO",
                  "dueDate": "2026-10-25"
                }
                """;

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.assignee").value("Assignee is required"));

        verify(taskService, never()).createTask(any(Task.class));
    }

    @Test
    void shouldRejectTaskWhenDueDateIsMissing() throws Exception {
        String json = """
                {
                  "title": "Implement task API",
                  "project": "NexusOps",
                  "assignee": "SK",
                  "priority": "HIGH",
                  "status": "TODO"
                }
                """;

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.dueDate").value("Due date is required"));

        verify(taskService, never()).createTask(any(Task.class));
    }

    @Test
    void shouldRejectMalformedJson() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ invalid json }"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid request body"))
                .andExpect(jsonPath("$.fieldErrors").isMap())
                .andExpect(jsonPath("$.fieldErrors").isEmpty());

        verify(taskService, never()).createTask(any(Task.class));
    }

    @Test
    void shouldRejectTaskWithInvalidPriority() throws Exception {
        String json = """
                {
                  "title": "Implement task API",
                  "project": "NexusOps",
                  "assignee": "SK",
                  "priority": "URGENT",
                  "status": "TODO",
                  "dueDate": "2026-10-25"
                }
                """;

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid request body"))
                .andExpect(jsonPath("$.fieldErrors").isEmpty());

        verify(taskService, never()).createTask(any(Task.class));
    }

    @Test
    void shouldRejectTaskWithInvalidStatus() throws Exception {
        String json = """
                {
                  "title": "Implement task API",
                  "project": "NexusOps",
                  "assignee": "SK",
                  "priority": "HIGH",
                  "status": "BLOCKED",
                  "dueDate": "2026-10-25"
                }
                """;

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid request body"))
                .andExpect(jsonPath("$.fieldErrors").isEmpty());

        verify(taskService, never()).createTask(any(Task.class));
    }
}
