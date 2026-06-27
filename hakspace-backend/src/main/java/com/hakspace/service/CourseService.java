package com.hakspace.service;

import com.hakspace.dto.CourseDetailResponse;
import com.hakspace.dto.CourseRequest;
import com.hakspace.dto.EnrollmentRequest;
import com.hakspace.model.Course;
import com.hakspace.model.CourseGroup;
import com.hakspace.model.Enrollment;
import com.hakspace.repository.CourseGroupRepository;
import com.hakspace.repository.CourseRepository;
import com.hakspace.repository.EnrollmentRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepo;
    private final CourseGroupRepository groupRepo;
    private final EnrollmentRepository enrollmentRepo;

    // ── Public ─────────────────────────────────────────────────────────────────

    public List<CourseDetailResponse> getAll() {
        return courseRepo.findAll().stream()
                .map(CourseDetailResponse::from)
                .collect(Collectors.toList());
    }

    public CourseDetailResponse getById(Long id) {
        Course course = courseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("course.not.found"));
        return CourseDetailResponse.from(course);
    }

    @Transactional
    public Enrollment enroll(@Valid EnrollmentRequest req) {
        Course course = courseRepo.findById(req.getCourseId())
                .orElseThrow(() -> new RuntimeException("course.not.found"));

        CourseGroup group = null;
        if (req.getGroupId() != null) {
            group = groupRepo.findById(req.getGroupId())
                    .orElseThrow(() -> new RuntimeException("course.group.not.found"));

            if (!group.getCourse().getId().equals(course.getId())) {
                throw new RuntimeException("course.group.mismatch");
            }
            if (!group.getIsAvailable() || group.getCurrentStudents() >= group.getMaxStudents()) {
                throw new RuntimeException("course.group.full");
            }
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setFullName(req.getFullName());
        enrollment.setPhone(req.getPhone());
        enrollment.setEmail(req.getEmail());
        enrollment.setCity(req.getCity());
        enrollment.setContactMethod(req.getContactMethod());
        enrollment.setContactTime(req.getContactTime());
        enrollment.setNotes(req.getNotes());
        enrollment.setCourse(course);
        enrollment.setGroup(group);
        enrollment.setStatus(Enrollment.LeadStatus.NEW);

        return enrollmentRepo.save(enrollment);
    }

    // ── Admin ──────────────────────────────────────────────────────────────────

    public List<CourseDetailResponse> adminGetAll() {
        return getAll();
    }

    @Transactional
    public CourseDetailResponse create(@Valid CourseRequest req) {
        Course course = new Course();
        mapRequestToCourse(req, course);
        course = courseRepo.save(course);

        List<CourseGroup> groups = buildGroupsFromRequest(req, course);
        groupRepo.saveAll(groups);
        course.setGroups(groups);

        return CourseDetailResponse.from(course);
    }

    @Transactional
    public CourseDetailResponse update(Long id, @Valid CourseRequest req) {
        Course course = courseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("course.not.found"));

        mapRequestToCourse(req, course);

        // ── Sync groups in-place ────────────────────────────────────────────
        // With orphanRemoval=true we MUST mutate the existing managed collection,
        // never replace the reference via setGroups().
        List<CourseGroup> existingGroups = course.getGroups();
        Set<Long> incomingIds = req.getGroups().stream()
                .filter(g -> g.getId() != null)
                .map(CourseRequest.GroupRequest::getId)
                .collect(java.util.stream.Collectors.toSet());

        // Remove dropped groups
        existingGroups.removeIf(g -> g.getId() != null && !incomingIds.contains(g.getId()));

        // Update existing / add new
        for (CourseRequest.GroupRequest gr : req.getGroups()) {
            if (gr.getId() != null) {
                existingGroups.stream()
                        .filter(g -> g.getId().equals(gr.getId()))
                        .findFirst()
                        .ifPresent(g -> {
                            g.setGroupName(gr.getGroupName());
                            g.setMaxStudents(gr.getMaxStudents());
                            g.setSchedule(gr.getSchedule());
                            g.recalculateAvailability();
                        });
            } else {
                CourseGroup newGroup = new CourseGroup();
                newGroup.setCourse(course);
                newGroup.setGroupName(gr.getGroupName());
                newGroup.setMaxStudents(gr.getMaxStudents() != null ? gr.getMaxStudents() : 20);
                newGroup.setSchedule(gr.getSchedule());
                newGroup.setCurrentStudents(0);
                newGroup.setIsAvailable(true);
                existingGroups.add(newGroup);
            }
        }

        return CourseDetailResponse.from(courseRepo.save(course));
    }

    @Transactional
    public void delete(Long id) {
        Course course = courseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("course.not.found"));
        enrollmentRepo.deleteByCourseId(id);
        groupRepo.deleteByCourseId(id);
        courseRepo.delete(course);
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private void mapRequestToCourse(CourseRequest req, Course course) {
        course.setTitle(req.getTitle());
        course.setDescription(req.getDescription());
        course.setImageUrl(req.getImageUrl());
        course.setDuration(req.getDuration());
        course.setInstructorName(req.getInstructorName());
        course.setPrice(req.getPrice());
        if (req.getRating() != null) course.setRating(req.getRating());
        if (req.getStudentCount() != null) course.setStudentCount(req.getStudentCount());
    }

    private List<CourseGroup> buildGroupsFromRequest(CourseRequest req, Course course) {
        return req.getGroups().stream().map(gr -> {
            CourseGroup g = new CourseGroup();
            g.setCourse(course);
            g.setGroupName(gr.getGroupName());
            g.setMaxStudents(gr.getMaxStudents() != null ? gr.getMaxStudents() : 20);
            g.setSchedule(gr.getSchedule());
            g.setCurrentStudents(0);
            g.setIsAvailable(true);
            return g;
        }).collect(Collectors.toList());
    }
}
