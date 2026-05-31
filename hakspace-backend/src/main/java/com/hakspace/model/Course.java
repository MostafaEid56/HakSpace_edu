package com.hakspace.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "courses")
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true, nullable = false) private String title;
    @Column(columnDefinition = "TEXT") private String description;
    private String imageUrl;
    private String duration;
    private String instructorName;
    private Double price;
    private Double rating = 0.0;
    private Integer studentCount = 0;
    @Column(name = "created_at") private LocalDateTime createdAt = LocalDateTime.now();
}