package com.brahminmilan.app;

import com.brahminmilan.app.entity.*;
import com.brahminmilan.app.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@SpringBootApplication
public class BrahminMilanApplication {

    public static void main(String[] args) {
        SpringApplication.run(BrahminMilanApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedDatabase(
            RoleRepository roleRepository,
            UserRepository userRepository,
            ProfileRepository profileRepository,
            PhotoRepository photoRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Seed Roles
            for (RoleName roleName : RoleName.values()) {
                if (roleRepository.findByName(roleName).isEmpty()) {
                    Role role = new Role();
                    role.setName(roleName);
                    roleRepository.save(role);
                }
            }

            // 2. Seed default girl profile (Sohini Mazumdar)
            String email = "sohini.mazumdar@gmail.com";
            if (!userRepository.existsByEmail(email)) {
                User user = new User();
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode("password123"));
                user.setVerified(true);

                Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Role ROLE_USER not found"));

                Set<Role> roles = new HashSet<>();
                roles.add(userRole);
                user.setRoles(roles);

                userRepository.save(user);

                // Create Profile
                Profile profile = new Profile();
                profile.setUser(user);
                profile.setFullName("Sohini Mazumdar");
                profile.setGender(Gender.FEMALE);
                profile.setDob(LocalDate.of(2003, 8, 15));
                profile.setHeight(5.3);
                profile.setSubCaste("Vaidik");
                profile.setMotherTongue("Bengali");
                profile.setMaritalStatus(MaritalStatus.NEVER_MARRIED);
                profile.setLocation("Guskara, West Bengal");
                profile.setEducation("B.Sc in Biology");
                profile.setOccupation("Student");
                profile.setCompanyName("Burdwan University");
                profile.setSalary("0 - 5 Lakhs");
                profile.setFoodPreference("Vegetarian");
                profile.setAboutMe("I am a simple and caring person who loves nature, reading, and learning about biology.");
                profile.setPartnerPreferences("Looking for an educated and kind-hearted Brahmin partner from West Bengal.");

                profileRepository.save(profile);

                // Create Photo 1 (Primary profile photo)
                Photo photo1 = new Photo();
                photo1.setUser(user);
                photo1.setType(PhotoType.PROFILE);
                photo1.setUrl("http://localhost:5173/girl1.jpg");
                photo1.setApproved(true);
                photoRepository.save(photo1);

                // Create Photo 2 (Second profile photo)
                Photo photo2 = new Photo();
                photo2.setUser(user);
                photo2.setType(PhotoType.PROFILE);
                photo2.setUrl("http://localhost:5173/girl2.jpg");
                photo2.setApproved(true);
                photoRepository.save(photo2);
            }
        };
    }
}
