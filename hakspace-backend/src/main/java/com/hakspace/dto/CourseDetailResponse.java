package com.hakspace.dto;

import com.hakspace.model.Course;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Enriched course response including all groups with seat availability.
 */
@Data
public class CourseDetailResponse {

    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private String duration;
    private String instructorName;
    private Double price;
    private Double rating;
    private Integer studentCount;
    private List<CourseGroupResponse> groups;

    public static CourseDetailResponse from(Course course) {
        CourseDetailResponse dto = new CourseDetailResponse();
        dto.id = course.getId();
        dto.title = course.getTitle();
        dto.description = course.getDescription();
        dto.imageUrl = course.getImageUrl();
        dto.duration = course.getDuration();
        dto.instructorName = course.getInstructorName();
        dto.price = course.getPrice();
        dto.rating = course.getRating();
        dto.studentCount = course.getStudentCount();
        dto.groups = course.getGroups().stream()
                .map(CourseGroupResponse::from)
                .collect(Collectors.toList());
        return dto;
    }
}
