package com.hakspace.controller;

import com.hakspace.dto.CourseDetailResponse;
import com.hakspace.dto.CourseRequest;
import com.hakspace.model.Course;
import com.hakspace.model.CourseGroup;
import com.hakspace.repository.CourseGroupRepository;
import com.hakspace.repository.CourseRepository;
import com.hakspace.repository.EnrollmentRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/courses")
@RequiredArgsConstructor
public class AdminCourseController {

    private final CourseRepository courseRepo;
    private final CourseGroupRepository groupRepo;
    private final EnrollmentRepository enrollmentRepo;

    @GetMapping
    public ResponseEntity<List<CourseDetailResponse>> getAll() {
        List<CourseDetailResponse> response = courseRepo.findAll()
                .stream()
                .map(CourseDetailResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<CourseDetailResponse> create(@Valid @RequestBody CourseRequest req) {
        Course course = new Course();
        mapRequestToCourse(req, course);
        course = courseRepo.save(course);

        List<CourseGroup> groups = buildGroupsFromRequest(req, course);
        groupRepo.saveAll(groups);
        course.setGroups(groups);

        return ResponseEntity.ok(CourseDetailResponse.from(course));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<CourseDetailResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest req) {

        Course course = courseRepo.findById(id).orElseThrow(() ->
                new RuntimeException("Course not found: " + id));

        mapRequestToCourse(req, course);

        // Sync groups: keep existing by id, remove deleted, add new
        List<CourseGroup> existingGroups = new ArrayList<>(groupRepo.findByCourseId(id));
        Set<Long> incomingIds = req.getGroups().stream()
                .filter(g -> g.getId() != null)
                .map(CourseRequest.GroupRequest::getId)
                .collect(Collectors.toSet());

        // Delete groups that are no longer in the request
        List<CourseGroup> toDelete = existingGroups.stream()
                .filter(g -> !incomingIds.contains(g.getId()))
                .collect(Collectors.toList());
        groupRepo.deleteAll(toDelete);

        // Update or create groups
        List<CourseGroup> updatedGroups = new ArrayList<>();
        for (CourseRequest.GroupRequest gr : req.getGroups()) {
            CourseGroup group;
            if (gr.getId() != null) {
                group = groupRepo.findById(gr.getId()).orElseThrow(() ->
                        new RuntimeException("Group not found: " + gr.getId()));
            } else {
                group = new CourseGroup();
                group.setCourse(course);
            }
            group.setGroupName(gr.getGroupName());
            group.setMaxStudents(gr.getMaxStudents());
            group.setSchedule(gr.getSchedule());
            group.recalculateAvailability();
            updatedGroups.add(groupRepo.save(group));
        }

        course = courseRepo.save(course);
        course.setGroups(updatedGroups);

        return ResponseEntity.ok(CourseDetailResponse.from(course));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Course c = courseRepo.findById(id).orElseThrow(() ->
                new RuntimeException("Course not found: " + id));
        // Delete enrollments first (FK), then groups, then course
        enrollmentRepo.deleteByCourseId(id);
        groupRepo.deleteByCourseId(id);
        courseRepo.delete(c);
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────

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
        List<CourseGroup> groups = new ArrayList<>();
        for (CourseRequest.GroupRequest gr : req.getGroups()) {
            CourseGroup g = new CourseGroup();
            g.setCourse(course);
            g.setGroupName(gr.getGroupName());
            g.setMaxStudents(gr.getMaxStudents() != null ? gr.getMaxStudents() : 20);
            g.setSchedule(gr.getSchedule());
            g.setCurrentStudents(0);
            g.setIsAvailable(true);
            groups.add(g);
        }
        return groups;
    }
}
