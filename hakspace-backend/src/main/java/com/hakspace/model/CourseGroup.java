package com.hakspace.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
@Table(name = "course_groups")
public class CourseGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Group name is required")
    @Column(nullable = false)
    private String groupName;

    @NotNull(message = "Max students is required")
    @Min(value = 1, message = "Max students must be at least 1")
    @Column(nullable = false)
    private Integer maxStudents;

    @Column(nullable = false)
    private Integer currentStudents = 0;

    @NotBlank(message = "Schedule is required")
    @Column(nullable = false)
    private String schedule;

    @Column(nullable = false)
    private Boolean isAvailable = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "groups"})
    private Course course;

    // Computed helpers (not persisted)
    @Transient
    public int getRemainingSeats() {
        return Math.max(0, maxStudents - currentStudents);
    }

    /** Call this before persisting to keep isAvailable in sync. */
    public void recalculateAvailability() {
        this.isAvailable = (this.currentStudents < this.maxStudents);
    }
}
