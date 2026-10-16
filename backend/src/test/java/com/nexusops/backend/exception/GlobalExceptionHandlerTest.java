
package com.nexusops.backend.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.core.MethodParameter;
import java.lang.reflect.Method;
import com.nexusops.backend.task.Task;
import com.nexusops.backend.task.TaskController;

class GlobalExceptionHandlerTest {

    @Test
    void shouldReturnStructuredErrorForInvalidTitle() throws NoSuchMethodException {
        Task task = new Task(
                " ",
                "NexusOps",
                "SK",
                Task.Priority.HIGH,
                Task.Status.TODO,
                java.time.LocalDate.of(2026, 10, 25)
        );

        BeanPropertyBindingResult bindingResult =
                new BeanPropertyBindingResult(task, "task");

        bindingResult.addError(
                new FieldError("task", "title", "Title is required")
        );

        Method method = TaskController.class.getMethod("createTask", Task.class);
        MethodParameter parameter = new MethodParameter(method, 0);

        MethodArgumentNotValidException exception =
                new MethodArgumentNotValidException(parameter, bindingResult);

        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        ResponseEntity<ApiError> response =
                handler.handleValidationErrors(exception);

        assertEquals(400, response.getStatusCode().value());

        ApiError body = response.getBody();
        assertNotNull(body);

        assertEquals(400, body.status());
        assertEquals("Validation failed", body.error());
        assertEquals(
                Map.of("title", "Title is required"),
                body.fieldErrors()
        );
        assertNotNull(body.timestamp());
    }
}
