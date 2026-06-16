package com.brahminmilan.app.controller;

import com.brahminmilan.app.dto.MessageResponse;
import com.brahminmilan.app.dto.ProfileDto;
import com.brahminmilan.app.entity.PhotoType;
import com.brahminmilan.app.entity.Profile;
import com.brahminmilan.app.security.UserDetailsImpl;
import com.brahminmilan.app.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

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
}
