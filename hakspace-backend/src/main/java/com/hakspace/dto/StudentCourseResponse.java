package com.hakspace.dto;

import com.hakspace.model.StudentCourse;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StudentCourseResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long courseId;
    private String courseName;
    private Long groupId;
    private String groupName;
    private LocalDateTime enrollmentDate;
    private String completionStatus;
    private LocalDateTime completionDate;
    private String certificateId;

    public static StudentCourseResponse from(StudentCourse sc) {
        StudentCourseResponse resp = new StudentCourseResponse();
        resp.setId(sc.getId());
        if (sc.getStudent() != null) {
            resp.setStudentId(sc.getStudent().getId());
            resp.setStudentName(sc.getStudent().getFullName());
            resp.setStudentEmail(sc.getStudent().getEmail());
        }
        if (sc.getCourse() != null) {
            resp.setCourseId(sc.getCourse().getId());
            resp.setCourseName(sc.getCourse().getTitle());
        }
        if (sc.getGroup() != null) {
            resp.setGroupId(sc.getGroup().getId());
            resp.setGroupName(sc.getGroup().getGroupName());
        }
        resp.setEnrollmentDate(sc.getEnrollmentDate());
        resp.setCompletionStatus(sc.getCompletionStatus().name());
        resp.setCompletionDate(sc.getCompletionDate());
        if (sc.getCertificate() != null) {
            resp.setCertificateId(sc.getCertificate().getCertificateId());
        }
        return resp;
    }
}
