package com.hakspace.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "certificates")
@ToString(exclude = {"student", "course", "studentCourse"})
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "certificate_id", unique = true, nullable = false)
    private String certificateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({"groups", "hibernateLazyInitializer", "handler"})
    private Course course;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_course_id", nullable = false)
    @JsonIgnoreProperties({"certificate", "student", "course", "group", "hibernateLazyInitializer", "handler"})
    private StudentCourse studentCourse;

    @Column(name = "issue_date", nullable = false)
    private LocalDateTime issueDate = LocalDateTime.now();

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "course_name", nullable = false)
    private String courseName;
}
