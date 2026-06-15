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
import java.util.List;
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
            // Delete old "Payel Mukherjee" seed if it exists to prevent duplication
            userRepository.findByEmail("payel.mukherjee@gmail.com").ifPresent(user -> {
                profileRepository.findByUserId(user.getId()).ifPresent(profileRepository::delete);
                List<Photo> photos = photoRepository.findByUserId(user.getId());
                photoRepository.deleteAll(photos);
                userRepository.delete(user);
            });

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

            // 3. Seed default girl profile (Ipsita Bhattacharya)
            String email2 = "ipsita.bhattacharya@gmail.com";
            if (!userRepository.existsByEmail(email2)) {
                User user2 = new User();
                user2.setEmail(email2);
                user2.setPassword(passwordEncoder.encode("password123"));
                user2.setVerified(true);

                Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Role ROLE_USER not found"));

                Set<Role> roles = new HashSet<>();
                roles.add(userRole);
                user2.setRoles(roles);

                userRepository.save(user2);

                // Create Profile
                Profile profile2 = new Profile();
                profile2.setUser(user2);
                profile2.setFullName("Ipsita Bhattacharya");
                profile2.setGender(Gender.FEMALE);
                profile2.setDob(LocalDate.of(2001, 5, 10));
                profile2.setHeight(5.4);
                profile2.setSubCaste("Kulin");
                profile2.setMotherTongue("Bengali");
                profile2.setMaritalStatus(MaritalStatus.NEVER_MARRIED);
                profile2.setLocation("Serampore, West Bengal");
                profile2.setEducation("M.A at Sanskrit");
                profile2.setOccupation("Teacher");
                profile2.setCompanyName("Serampore Girls College");
                profile2.setSalary("0 - 5 Lakhs");
                profile2.setFoodPreference("Vegetarian");
                profile2.setAboutMe("I am a traditional and well-educated person who completed my M.A. in Sanskrit. I love literature, classical music, and teaching.");
                profile2.setPartnerPreferences("Looking for an educated and cultured Brahmin groom from West Bengal.");

                profileRepository.save(profile2);

                // Create Photo 1 (Primary profile photo)
                Photo photo1 = new Photo();
                photo1.setUser(user2);
                photo1.setType(PhotoType.PROFILE);
                photo1.setUrl("http://localhost:5173/ipsita1.jpg");
                photo1.setApproved(true);
                photoRepository.save(photo1);

                // Create Photo 2 (Second profile photo)
                Photo photo2 = new Photo();
                photo2.setUser(user2);
                photo2.setType(PhotoType.PROFILE);
                photo2.setUrl("http://localhost:5173/ipsita2.jpg");
                photo2.setApproved(true);
                photoRepository.save(photo2);
            }

            // 4. Seed default girl profile (Ipsita Chakraborty)
            String email3 = "ipsita.chakraborty@gmail.com";
            if (!userRepository.existsByEmail(email3)) {
                User user3 = new User();
                user3.setEmail(email3);
                user3.setPassword(passwordEncoder.encode("password123"));
                user3.setVerified(true);

                Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Role ROLE_USER not found"));

                Set<Role> roles = new HashSet<>();
                roles.add(userRole);
                user3.setRoles(roles);

                userRepository.save(user3);

                // Create Profile
                Profile profile3 = new Profile();
                profile3.setUser(user3);
                profile3.setFullName("Ipsita Chakraborty");
                profile3.setGender(Gender.FEMALE);
                profile3.setDob(LocalDate.of(2002, 11, 20));
                profile3.setHeight(5.2);
                profile3.setSubCaste("Vaidik");
                profile3.setMotherTongue("Bengali");
                profile3.setMaritalStatus(MaritalStatus.NEVER_MARRIED);
                profile3.setLocation("Baharampur, Murshidabad, West Bengal");
                profile3.setEducation("B.A in Geography");
                profile3.setOccupation("Student");
                profile3.setCompanyName("Krishnath College");
                profile3.setSalary("0 - 5 Lakhs");
                profile3.setFoodPreference("Vegetarian");
                profile3.setAboutMe("I am a cheerful and down-to-earth person who recently graduated with a B.A. in Geography. I love exploring new places and studying nature.");
                profile3.setPartnerPreferences("Looking for an educated, caring, and understanding Brahmin partner.");

                profileRepository.save(profile3);

                // Create Photo 1 (Primary profile photo)
                Photo photo1 = new Photo();
                photo1.setUser(user3);
                photo1.setType(PhotoType.PROFILE);
                photo1.setUrl("http://localhost:5173/ipsitac1.jpg");
                photo1.setApproved(true);
                photoRepository.save(photo1);

                // Create Photo 2 (Second profile photo)
                Photo photo2 = new Photo();
                photo2.setUser(user3);
                photo2.setType(PhotoType.PROFILE);
                photo2.setUrl("http://localhost:5173/ipsitac2.jpg");
                photo2.setApproved(true);
                photoRepository.save(photo2);
            }

            // 5. Seed default girl profile (Nandita Mishra)
            String email4 = "nandita.mishra@gmail.com";
            if (!userRepository.existsByEmail(email4)) {
                User user4 = new User();
                user4.setEmail(email4);
                user4.setPassword(passwordEncoder.encode("password123"));
                user4.setVerified(true);

                Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Role ROLE_USER not found"));

                Set<Role> roles = new HashSet<>();
                roles.add(userRole);
                user4.setRoles(roles);

                userRepository.save(user4);

                // Create Profile
                Profile profile4 = new Profile();
                profile4.setUser(user4);
                profile4.setFullName("Nandita Mishra");
                profile4.setGender(Gender.FEMALE);
                profile4.setDob(LocalDate.of(2003, 4, 12));
                profile4.setHeight(5.3);
                profile4.setSubCaste("Kulin");
                profile4.setMotherTongue("Bengali");
                profile4.setMaritalStatus(MaritalStatus.NEVER_MARRIED);
                profile4.setLocation("Durgapur, West Bengal");
                profile4.setEducation("B.A in History");
                profile4.setOccupation("Unemployed");
                profile4.setCompanyName("None");
                profile4.setSalary("0 - 5 Lakhs");
                profile4.setFoodPreference("Vegetarian");
                profile4.setAboutMe("I graduated with a B.A. in History and am currently looking for job opportunities. I enjoy reading historical novels, craftwork, and classical music.");
                profile4.setPartnerPreferences("Looking for an educated, understanding, and loving Brahmin partner from West Bengal.");

                profileRepository.save(profile4);

                // Create Photo 1 (Primary profile photo)
                Photo photo1 = new Photo();
                photo1.setUser(user4);
                photo1.setType(PhotoType.PROFILE);
                photo1.setUrl("http://localhost:5173/nandita1.jpg");
                photo1.setApproved(true);
                photoRepository.save(photo1);

                // Create Photo 2 (Second profile photo)
                Photo photo2 = new Photo();
                photo2.setUser(user4);
                photo2.setType(PhotoType.PROFILE);
                photo2.setUrl("http://localhost:5173/nandita2.jpg");
                photo2.setApproved(true);
                photoRepository.save(photo2);
            }

            // 6. Seed default girl profile (Sneha Roy Mukherjee)
            String email5 = "sneha.mukherjee@gmail.com";
            if (!userRepository.existsByEmail(email5)) {
                User user5 = new User();
                user5.setEmail(email5);
                user5.setPassword(passwordEncoder.encode("password123"));
                user5.setVerified(true);

                Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Role ROLE_USER not found"));

                Set<Role> roles = new HashSet<>();
                roles.add(userRole);
                user5.setRoles(roles);

                userRepository.save(user5);

                // Create Profile
                Profile profile5 = new Profile();
                profile5.setUser(user5);
                profile5.setFullName("Sneha Roy Mukherjee");
                profile5.setGender(Gender.FEMALE);
                profile5.setDob(LocalDate.of(2005, 7, 25));
                profile5.setHeight(5.2);
                profile5.setSubCaste("Vaidik");
                profile5.setMotherTongue("Bengali");
                profile5.setMaritalStatus(MaritalStatus.NEVER_MARRIED);
                profile5.setLocation("Barrackpore, West Bengal");
                profile5.setEducation("12th");
                profile5.setOccupation("Unemployed");
                profile5.setCompanyName("None");
                profile5.setSalary("0 - 5 Lakhs");
                profile5.setFoodPreference("Vegetarian");
                profile5.setAboutMe("I have completed my 12th standard education and am currently seeking opportunities. I love spending time in nature, painting, and wearing traditional attire.");
                profile5.setPartnerPreferences("Looking for an educated, caring, and well-behaved Brahmin partner.");

                profileRepository.save(profile5);

                // Create Photo 1 (Primary profile photo)
                Photo photo1 = new Photo();
                photo1.setUser(user5);
                photo1.setType(PhotoType.PROFILE);
                photo1.setUrl("http://localhost:5173/sneha1.jpg");
                photo1.setApproved(true);
                photoRepository.save(photo1);

                // Create Photo 2 (Second profile photo)
                Photo photo2 = new Photo();
                photo2.setUser(user5);
                photo2.setType(PhotoType.PROFILE);
                photo2.setUrl("http://localhost:5173/sneha2.jpg");
                photo2.setApproved(true);
                photoRepository.save(photo2);
            }
        };
    }
}
