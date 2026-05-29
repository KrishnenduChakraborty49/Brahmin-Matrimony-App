package com.brahminmilan.app.controller;

import com.brahminmilan.app.dto.MessageResponse;
import com.brahminmilan.app.entity.InterestStatus;
import com.brahminmilan.app.security.UserDetailsImpl;
import com.brahminmilan.app.service.MatchmakingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/matchmaking")
public class MatchmakingController {

    @Autowired
    private MatchmakingService matchmakingService;

    @PostMapping("/interests/send/{receiverId}")
    public ResponseEntity<?> sendInterest(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                          @PathVariable Long receiverId) {
        try {
            matchmakingService.sendInterest(userDetails.getId(), receiverId);
            return ResponseEntity.ok(new MessageResponse("Interest sent successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/interests/{interestId}/respond")
    public ResponseEntity<?> respondToInterest(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                               @PathVariable Long interestId,
                                               @RequestParam InterestStatus status) {
        try {
            matchmakingService.respondToInterest(userDetails.getId(), interestId, status);
            return ResponseEntity.ok(new MessageResponse("Interest updated to " + status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/interests/received")
    public ResponseEntity<?> getReceivedInterests(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(matchmakingService.getReceivedInterests(userDetails.getId()));
    }

    @PostMapping("/shortlist/{profileId}")
    public ResponseEntity<?> shortlistProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                              @PathVariable Long profileId) {
        try {
            matchmakingService.shortlistProfile(userDetails.getId(), profileId);
            return ResponseEntity.ok(new MessageResponse("Profile shortlisted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/block/{blockedId}")
    public ResponseEntity<?> blockUser(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                       @PathVariable Long blockedId) {
        try {
            matchmakingService.blockUser(userDetails.getId(), blockedId);
            return ResponseEntity.ok(new MessageResponse("User blocked successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
