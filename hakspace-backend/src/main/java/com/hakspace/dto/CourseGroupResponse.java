package com.hakspace.dto;

import com.hakspace.model.CourseGroup;
import lombok.Data;

/**
 * Public-facing DTO for a CourseGroup — includes computed fields like remainingSeats.
 */
@Data
public class CourseGroupResponse {

    private Long id;
    private String groupName;
    private Integer maxStudents;
    private Integer currentStudents;
    private Integer remainingSeats;
    private String schedule;
    private Boolean isAvailable;

    public static CourseGroupResponse from(CourseGroup g) {
        CourseGroupResponse dto = new CourseGroupResponse();
        dto.id = g.getId();
        dto.groupName = g.getGroupName();
        dto.maxStudents = g.getMaxStudents();
        dto.currentStudents = g.getCurrentStudents();
        dto.remainingSeats = g.getRemainingSeats();
        dto.schedule = g.getSchedule();
        dto.isAvailable = g.getIsAvailable();
        return dto;
    }
}
