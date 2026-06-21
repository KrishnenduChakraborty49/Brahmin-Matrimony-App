package com.brahminmilan.app.controller;

import com.brahminmilan.app.dto.MessageResponse;
import com.brahminmilan.app.dto.ProfileDto;
import com.brahminmilan.app.entity.PhotoType;
import com.brahminmilan.app.entity.Profile;
import com.brahminmilan.app.entity.User;
import com.brahminmilan.app.entity.Subscription;
import com.brahminmilan.app.repository.UserRepository;
import com.brahminmilan.app.repository.SubscriptionRepository;
import com.brahminmilan.app.security.UserDetailsImpl;
import com.brahminmilan.app.service.ProfileService;
import com.brahminmilan.app.service.MatchmakingService;
import com.brahminmilan.app.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private MatchmakingService matchmakingService;

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Profile profile = profileService.getProfileByUserId(userDetails.getId());
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/me/photos")
    public ResponseEntity<?> getMyPhotos(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            return ResponseEntity.ok(profileService.getMyPhotos(userDetails.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                             @RequestBody ProfileDto profileDto) {
        Profile updatedProfile = profileService.updateProfile(userDetails.getId(), profileDto);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping
    public ResponseEntity<?> getMatches(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            return ResponseEntity.ok(profileService.getMatchesForUser(userDetails.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/me/photos")
    public ResponseEntity<?> uploadPhoto(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                         @RequestParam("file") MultipartFile file,
                                         @RequestParam("type") PhotoType type) {
        try {
            profileService.uploadPhoto(userDetails.getId(), file, type);
            return ResponseEntity.ok(new MessageResponse("File uploaded successfully. Pending admin approval."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Could not upload the file: " + e.getMessage()));
        }
    }

    @GetMapping("/me/dashboard-stats")
    public ResponseEntity<?> getDashboardStats(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            int interestsCount = matchmakingService.getReceivedInterests(userDetails.getId()).size();
            int shortlistedCount = matchmakingService.getUserShortlist(userDetails.getId()).size();
            int chatsCount = chatService.getUserChats(userDetails.getId()).size();
            int profileViews = 15; // Realistic mock stats for profile views

            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Optional<Subscription> subOpt = subscriptionRepository.findByUserAndIsActiveTrue(user);

            Map<String, Object> stats = new HashMap<>();
            stats.put("interests", interestsCount);
            stats.put("shortlisted", shortlistedCount);
            stats.put("messages", chatsCount);
            stats.put("profileViews", profileViews);

            if (subOpt.isPresent()) {
                Subscription sub = subOpt.get();
                stats.put("plan", sub.getPlan().name());
                stats.put("startDate", sub.getStartDate());
                stats.put("endDate", sub.getEndDate());
                stats.put("subscriptionActive", sub.isActive());
            } else {
                stats.put("plan", "FREE");
                stats.put("subscriptionActive", false);
            }

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error retrieving stats: " + e.getMessage()));
        }
    }
}
