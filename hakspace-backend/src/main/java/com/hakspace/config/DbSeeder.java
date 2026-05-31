package com.hakspace.config;

import com.hakspace.model.Course;
import com.hakspace.model.User;
import com.hakspace.repository.CourseRepository;
import com.hakspace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DbSeeder implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed admin user
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setEmail("admin@hakspace.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("HakSpace Admin");
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Admin user seeded: admin@hakspace.com / admin123");
        }

        // Seed courses
        if (courseRepository.count() == 0) {
            Course c1 = new Course();
            c1.setTitle("Full Stack Web Development BootCamp");
            c1.setDescription("Learn modern web development using HTML, CSS, React, Node.js, and PostgreSQL. Build real-world projects and deploy them.");
            c1.setImageUrl("https://images.unsplash.com/photo-1517694712202-14dd9538aa97");
            c1.setDuration("12 Weeks");
            c1.setInstructorName("Dr. Sarah Jenkins");
            c1.setPrice(499.0);
            c1.setRating(4.8);
            c1.setStudentCount(120);
            courseRepository.save(c1);

            Course c2 = new Course();
            c2.setTitle("Data Science & Machine Learning");
            c2.setDescription("Master Python, Pandas, NumPy, Scikit-Learn, and TensorFlow. Dive deep into statistics, data visualization, and predictive modeling.");
            c2.setImageUrl("https://images.unsplash.com/photo-1527474305487-b87b222841cc");
            c2.setDuration("10 Weeks");
            c2.setInstructorName("Prof. Michael Chen");
            c2.setPrice(399.0);
            c2.setRating(4.9);
            c2.setStudentCount(85);
            courseRepository.save(c2);

            Course c3 = new Course();
            c3.setTitle("AI & Deep Learning Masterclass");
            c3.setDescription("Learn advanced neural networks, natural language processing, computer vision, and generative AI. Build and fine-tune large language models.");
            c3.setImageUrl("https://images.unsplash.com/photo-1677442136019-21780efad99a");
            c3.setDuration("8 Weeks");
            c3.setInstructorName("Alex Mercer");
            c3.setPrice(599.0);
            c3.setRating(4.7);
            c3.setStudentCount(95);
            courseRepository.save(c3);

            System.out.println("Default courses seeded successfully.");
        }
    }
}
