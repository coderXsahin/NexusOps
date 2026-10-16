package com.nexusops.backend.task;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "tasks")
public class Task {

    public enum Status {
        TODO,
        IN_PROGRESS,
        COMPLETED
    }

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Column(nullable = false, length = 200)
    private String title;

    @NotBlank(message = "Project is required")
    @Column(nullable = false, length = 100)
    private String project;

    @NotBlank(message = "Assignee is required")
    @Column(nullable = false, length = 100)
    private String assignee;

    @NotNull(message = "Priority is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Priority priority;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @NotNull(message = "Due date is required")
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    protected Task() {
        // Required by JPA.
    }

    public Task(
            String title,
            String project,
            String assignee,
            Priority priority,
            Status status,
            LocalDate dueDate) {
        this.title = title;
        this.project = project;
        this.assignee = assignee;
        this.priority = priority;
        this.status = status;
        this.dueDate = dueDate;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getProject() {
        return project;
    }

    public String getAssignee() {
        return assignee;
    }

    public Priority getPriority() {
        return priority;
    }

    public Status getStatus() {
        return status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setProject(String project) {
        this.project = project;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}
