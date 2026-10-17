
package com.nexusops.backend.task;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
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
    void shouldReturnAllTasks() {
        List<Task> tasks = List.of(sampleTask());
        when(taskRepository.findAll()).thenReturn(tasks);

        List<Task> result = taskService.getAllTasks();

        assertEquals(1, result.size());
        assertEquals("Implement task API", result.get(0).getTitle());
        verify(taskRepository).findAll();
    }

    @Test
    void shouldTrimFieldsWhenCreatingTask() {
        Task task = new Task(
                "  Implement task API  ",
                "  NexusOps  ",
                "  SK  ",
                Task.Priority.HIGH,
                Task.Status.TODO,
                LocalDate.of(2026, 10, 25)
        );

        when(taskRepository.save(any(Task.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Task result = taskService.createTask(task);

        assertEquals("Implement task API", result.getTitle());
        assertEquals("NexusOps", result.getProject());
        assertEquals("SK", result.getAssignee());
        verify(taskRepository).save(task);
    }

    @Test
    void shouldUpdateExistingTask() {
        Task existingTask = sampleTask();
        Task updatedTask = new Task(
                "  Add validation  ",
                "  NexusOps  ",
                "  Alex  ",
                Task.Priority.MEDIUM,
                Task.Status.COMPLETED,
                LocalDate.of(2026, 11, 1)
        );

        when(taskRepository.findById(1L))
                .thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Task result = taskService.updateTask(1L, updatedTask);

        assertEquals("Add validation", result.getTitle());
        assertEquals("NexusOps", result.getProject());
        assertEquals("Alex", result.getAssignee());
        assertEquals(Task.Priority.MEDIUM, result.getPriority());
        assertEquals(Task.Status.COMPLETED, result.getStatus());
        assertEquals(LocalDate.of(2026, 11, 1), result.getDueDate());

        verify(taskRepository).findById(1L);
        verify(taskRepository).save(existingTask);
    }

    @Test
    void shouldThrowNotFoundWhenUpdatingMissingTask() {
        when(taskRepository.findById(999L))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> taskService.updateTask(999L, sampleTask())
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(taskRepository).findById(999L);
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void shouldDeleteExistingTask() {
        Task task = sampleTask();
        when(taskRepository.findById(1L))
                .thenReturn(Optional.of(task));

        taskService.deleteTask(1L);

        verify(taskRepository).findById(1L);
        verify(taskRepository).delete(task);
    }

    @Test
    void shouldThrowNotFoundWhenDeletingMissingTask() {
        when(taskRepository.findById(999L))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> taskService.deleteTask(999L)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(taskRepository).findById(999L);
        verify(taskRepository, never()).delete(any(Task.class));
    }
}
