package com.hakspace.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "enrollments")
public class Enrollment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String fullName;
    private String phone;
    private String email;
    private String city;
    private String contactMethod;
    private String contactTime;
    private String notes;
    @Enumerated(EnumType.STRING) private LeadStatus status = LeadStatus.NEW;
    @ManyToOne @JoinColumn(name = "course_id") private Course course;
    @Column(name = "created_at") private LocalDateTime createdAt = LocalDateTime.now();
    public enum LeadStatus { NEW, CONTACTED, ENROLLED, CLOSED }
}