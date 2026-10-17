
package com.nexusops.backend.task;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
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
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import tools.jackson.databind.ObjectMapper;

@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TaskRepository taskRepository;

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
        when(taskRepository.findAll()).thenReturn(List.of(sampleTask()));

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title")
                        .value("Implement task API"))
                .andExpect(jsonPath("$[0].project").value("NexusOps"))
                .andExpect(jsonPath("$[0].assignee").value("SK"))
                .andExpect(jsonPath("$[0].priority").value("HIGH"))
                .andExpect(jsonPath("$[0].status").value("IN_PROGRESS"));

        verify(taskRepository).findAll();
    }

    @Test
    void shouldCreateTask() throws Exception {
        Task task = sampleTask();

        when(taskRepository.save(any(Task.class))).thenReturn(task);

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(task)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Implement task API"))
                .andExpect(jsonPath("$.project").value("NexusOps"))
                .andExpect(jsonPath("$.assignee").value("SK"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void shouldRejectTaskWithBlankTitle() throws Exception {
        String invalidJson = """
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
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.title")
                        .value("Title is required"));

        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void shouldUpdateExistingTask() throws Exception {
        Task existingTask = sampleTask();
        Task updatedTask = new Task(
                "Updated task title",
                "NexusOps",
                "SK",
                Task.Priority.MEDIUM,
                Task.Status.COMPLETED,
                LocalDate.of(2026, 11, 1)
        );

        when(taskRepository.findById(1L))
                .thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedTask)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated task title"))
                .andExpect(jsonPath("$.priority").value("MEDIUM"))
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        verify(taskRepository).findById(1L);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void shouldReturnNotFoundWhenUpdatingMissingTask() throws Exception {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/tasks/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleTask())))
                .andExpect(status().isNotFound());

        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void shouldDeleteExistingTask() throws Exception {
        Task existingTask = sampleTask();

        when(taskRepository.findById(1L))
                .thenReturn(Optional.of(existingTask));
        doNothing().when(taskRepository).delete(existingTask);

        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());

        verify(taskRepository).findById(1L);
        verify(taskRepository).delete(existingTask);
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingTask() throws Exception {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/tasks/999"))
                .andExpect(status().isNotFound());

        verify(taskRepository, never()).delete(any(Task.class));
    }

    @Test
    void shouldRejectTaskWithBlankProject() throws Exception {
        String invalidJson = """
                {
                  "title": "Implement task API",
                  "project": " ",
                  "assignee": "SK",
                  "priority": "HIGH",
                  "status": "TODO",
                  "dueDate": "2026-10-25"
                }
                """;

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.project")
                        .value("Project is required"));

        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void shouldRejectTaskWithBlankAssignee() throws Exception {
        String invalidJson = """
                {
                  "title": "Implement task API",
                  "project": "NexusOps",
                  "assignee": " ",
                  "priority": "HIGH",
                  "status": "TODO",
                  "dueDate": "2026-10-25"
                }
                """;

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.assignee")
                        .value("Assignee is required"));

        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void shouldRejectTaskWhenDueDateIsMissing() throws Exception {
        String invalidJson = """
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
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.dueDate")
                        .value("Due date is required"));

        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void shouldRejectMalformedJson() throws Exception {
        String malformedJson = """
                {
                  "title": "Implement task API",
                }
                """;

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(malformedJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Invalid request body"))
                .andExpect(jsonPath("$.fieldErrors").isMap())
                .andExpect(jsonPath("$.fieldErrors").isEmpty());

        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void shouldRejectTaskWithInvalidPriority() throws Exception {
        String invalidJson = """
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
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Invalid request body"))
                .andExpect(jsonPath("$.fieldErrors").isMap())
                .andExpect(jsonPath("$.fieldErrors").isEmpty());

        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void shouldRejectTaskWithInvalidStatus() throws Exception {
        String invalidJson = """
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
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Invalid request body"))
                .andExpect(jsonPath("$.fieldErrors").isMap())
                .andExpect(jsonPath("$.fieldErrors").isEmpty());

        verify(taskRepository, never()).save(any(Task.class));
    }
}
