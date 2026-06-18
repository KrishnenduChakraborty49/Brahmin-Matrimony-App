package com.brahminmilan.app.controller;

import com.brahminmilan.app.entity.*;
import com.brahminmilan.app.repository.*;
import com.brahminmilan.app.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PhotoRepository photoRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalUsers = userRepository.count();
        
        long activeSubscriptions = subscriptionRepository.findAll().stream()
                .filter(sub -> sub.isActive() && (sub.getPlan() == SubscriptionPlan.PREMIUM || sub.getPlan() == SubscriptionPlan.GOLD))
                .count();

        long activeMatches = profileRepository.count();

        long reportedProfiles = photoRepository.findAll().stream()
                .filter(photo -> !photo.isApproved())
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("premiumUsers", activeSubscriptions);
        stats.put("activeMatches", activeMatches);
        stats.put("reportedProfiles", reportedProfiles);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();

        for (User user : users) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("email", user.getEmail());
            userMap.put("isVerified", user.isVerified());
            userMap.put("isSuspended", user.isSuspended());
            userMap.put("createdAt", user.getCreatedAt());

            Optional<Profile> profileOpt = profileRepository.findByUserId(user.getId());
            if (profileOpt.isPresent()) {
                userMap.put("name", profileOpt.get().getFullName());
            } else {
                userMap.put("name", "New Member");
            }

            Optional<Subscription> subOpt = subscriptionRepository.findByUserAndIsActiveTrue(user);
            if (subOpt.isPresent()) {
                userMap.put("plan", subOpt.get().getPlan().name());
            } else {
                userMap.put("plan", "FREE");
            }

            response.add(userMap);
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{userId}/suspend")
    public ResponseEntity<?> toggleSuspendUser(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }
        User user = userOpt.get();
        user.setSuspended(!user.isSuspended());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User suspension status updated successfully", "isSuspended", user.isSuspended()));
    }

    @PutMapping("/users/{userId}/verify")
    public ResponseEntity<?> toggleVerifyUser(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }
        User user = userOpt.get();
        user.setVerified(!user.isVerified());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User verification status updated successfully", "isVerified", user.isVerified()));
    }

    @PutMapping("/users/{userId}/subscription")
    public ResponseEntity<?> updateSubscription(@PathVariable Long userId, @RequestParam SubscriptionPlan plan) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }
        User user = userOpt.get();

        subscriptionRepository.findByUserAndIsActiveTrue(user).ifPresent(sub -> {
            sub.setActive(false);
            subscriptionRepository.save(sub);
        });

        Subscription subscription = new Subscription();
        subscription.setUser(user);
        subscription.setPlan(plan);
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(LocalDateTime.now().plusMonths(6));
        subscription.setActive(true);
        subscriptionRepository.save(subscription);

        return ResponseEntity.ok(Map.of("message", "User subscription updated to " + plan));
    }

    @GetMapping("/photos/pending")
    public ResponseEntity<?> getPendingPhotos() {
        List<Photo> allPhotos = photoRepository.findAll();
        List<Map<String, Object>> pending = new ArrayList<>();

        for (Photo photo : allPhotos) {
            if (!photo.isApproved()) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", photo.getId());
                map.put("url", photo.getUrl());
                map.put("type", photo.getType().name());
                map.put("userId", photo.getUser().getId());
                map.put("userEmail", photo.getUser().getEmail());
                
                Optional<Profile> p = profileRepository.findByUserId(photo.getUser().getId());
                map.put("userName", p.isPresent() ? p.get().getFullName() : "Unknown");
                
                pending.add(map);
            }
        }
        return ResponseEntity.ok(pending);
    }

    @PutMapping("/photos/{photoId}/approve")
    public ResponseEntity<?> approvePhoto(@PathVariable Long photoId) {
        Optional<Photo> photoOpt = photoRepository.findById(photoId);
        if (photoOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Photo not found"));
        }
        Photo photo = photoOpt.get();
        photo.setApproved(true);
        photoRepository.save(photo);
        
        notificationService.createNotification(photo.getUser(), "Your " + photo.getType().name().toLowerCase() + " photo has been approved by the admin.");
        
        return ResponseEntity.ok(Map.of("message", "Photo approved successfully"));
    }

    @DeleteMapping("/photos/{photoId}")
    public ResponseEntity<?> deletePhoto(@PathVariable Long photoId) {
        Optional<Photo> photoOpt = photoRepository.findById(photoId);
        if (photoOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Photo not found"));
        }
        Photo photo = photoOpt.get();
        photoRepository.delete(photo);
        
        notificationService.createNotification(photo.getUser(), "Your " + photo.getType().name().toLowerCase() + " photo has been rejected and deleted by the admin.");
        
        return ResponseEntity.ok(Map.of("message", "Photo rejected and deleted successfully"));
    }
}
