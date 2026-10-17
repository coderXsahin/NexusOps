
package com.nexusops.backend.task;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doReturn;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

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
                LocalDate.of(2026, 10, 25));
    }

    @Test
    void shouldReturnAllTasks() throws Exception {
        when(taskRepository.findAll()).thenReturn(List.of(sampleTask()));

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Implement task API"))
                .andExpect(jsonPath("$[0].project").value("NexusOps"))
                .andExpect(jsonPath("$[0].priority").value("HIGH"))
                .andExpect(jsonPath("$[0].status").value("IN_PROGRESS"));
    }

    @Test
    void shouldCreateTask() throws Exception {
        Task task = sampleTask();

        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task saved = invocation.getArgument(0);
            saved.setTitle(saved.getTitle().trim());
            return saved;
        });

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(task)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Implement task API"))
                .andExpect(jsonPath("$.project").value("NexusOps"))
                .andExpect(jsonPath("$.assignee").value("SK"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.dueDate").value("2026-10-25"));

        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void shouldRejectTaskWithBlankTitle() throws Exception {
        String invalidJson = """
                {
                  "title": " ",
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
                .andExpect(status().isBadRequest());

        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void shouldUpdateExistingTask() throws Exception {
        Task existing = sampleTask();

        Task updated = new Task(
                "Add API integration tests",
                "NexusOps",
                "SK",
                Task.Priority.MEDIUM,
                Task.Status.COMPLETED,
                LocalDate.of(2026, 10, 30));

        when(taskRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(taskRepository.save(any(Task.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Add API integration tests"))
                .andExpect(jsonPath("$.priority").value("MEDIUM"))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.dueDate").value("2026-10-30"));

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
        Task existing = sampleTask();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(existing));
        doNothing().when(taskRepository).delete(existing);

        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());

        verify(taskRepository).delete(existing);
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingTask() throws Exception {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/tasks/999"))
                .andExpect(status().isNotFound());

        verify(taskRepository, never()).delete(any(Task.class));
    }
}
