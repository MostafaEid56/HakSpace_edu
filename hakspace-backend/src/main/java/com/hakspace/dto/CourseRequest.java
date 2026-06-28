package com.hakspace.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * Request body for creating or updating a Course along with its groups.
 */
@Data
public class CourseRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String imageUrl;

    @Pattern(regexp = "^(https?://).*", message = "Must be a valid URL starting with http:// or https://")
    private String courseMaterialsLink;

    private String duration;
    private String instructorName;
    private Double price;
    private Double rating;
    private Integer studentCount;

    @Valid
    private List<GroupRequest> groups = new ArrayList<>();

    @Data
    public static class GroupRequest {

        private Long id; // null = new group, non-null = existing group to update

        @NotBlank(message = "Group name is required")
        private String groupName;

        private Integer maxStudents = 20;

        @NotBlank(message = "Schedule is required")
        private String schedule;
    }
}
