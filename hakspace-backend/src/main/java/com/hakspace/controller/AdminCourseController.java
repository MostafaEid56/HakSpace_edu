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
                new RuntimeException("course.not.found"));

        mapRequestToCourse(req, course);

        // ── Sync groups in-place ──────────────────────────────────────────────
        // IMPORTANT: with orphanRemoval=true we must NEVER replace the collection
        // reference via setGroups(). Instead, we mutate the existing list so
        // Hibernate can track additions and removals correctly.

        List<CourseGroup> existingGroups = course.getGroups(); // managed collection
        Set<Long> incomingIds = req.getGroups().stream()
                .filter(g -> g.getId() != null)
                .map(CourseRequest.GroupRequest::getId)
                .collect(Collectors.toSet());

        // Remove groups that the client dropped
        existingGroups.removeIf(g -> g.getId() != null && !incomingIds.contains(g.getId()));

        // Update existing / add new groups
        for (CourseRequest.GroupRequest gr : req.getGroups()) {
            if (gr.getId() != null) {
                // Update existing group already in the managed collection
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
                // New group — add to existing managed collection
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

        course = courseRepo.save(course);
        return ResponseEntity.ok(CourseDetailResponse.from(course));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Course c = courseRepo.findById(id).orElseThrow(() ->
                new RuntimeException("course.not.found"));
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
