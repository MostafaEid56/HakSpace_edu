package com.hakspace.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "student_courses", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "course_id"})
})
@ToString(exclude = {"student", "course", "group", "certificate"})
public class StudentCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({"groups", "hibernateLazyInitializer", "handler"})
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    @JsonIgnoreProperties({"course", "hibernateLazyInitializer", "handler"})
    private CourseGroup group;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDateTime enrollmentDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "completion_status", nullable = false)
    private CompletionStatus completionStatus = CompletionStatus.IN_PROGRESS;

    @Column(name = "completion_date")
    private LocalDateTime completionDate;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "certificate_id")
    @JsonIgnoreProperties({"studentCourse", "student", "course", "hibernateLazyInitializer", "handler"})
    private Certificate certificate;

    public enum CompletionStatus {
        IN_PROGRESS,
        COMPLETED
    }
}
