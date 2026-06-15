package com.brahminmilan.app.service;

import com.brahminmilan.app.entity.*;
import com.brahminmilan.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MatchmakingService {

    @Autowired
    private InterestRepository interestRepository;

    @Autowired
    private ShortlistRepository shortlistRepository;

    @Autowired
    private BlockedUserRepository blockedUserRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Transactional
    public Interest sendInterest(Long senderId, Long receiverId) {
        if (senderId.equals(receiverId)) {
            throw new RuntimeException("Cannot send interest to yourself");
        }

        User sender = userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId).orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (blockedUserRepository.existsByBlockerAndBlocked(receiver, sender)) {
            throw new RuntimeException("You cannot send an interest to this user");
        }

        if (interestRepository.existsBySenderAndReceiver(sender, receiver)) {
            throw new RuntimeException("Interest already sent");
        }

        Interest interest = new Interest();
        interest.setSender(sender);
        interest.setReceiver(receiver);
        return interestRepository.save(interest);
    }

    @Transactional
    public Interest respondToInterest(Long receiverId, Long interestId, InterestStatus status) {
        Interest interest = interestRepository.findById(interestId).orElseThrow(() -> new RuntimeException("Interest not found"));

        if (!interest.getReceiver().getId().equals(receiverId)) {
            throw new RuntimeException("Unauthorized to respond to this interest");
        }

        interest.setStatus(status);
        return interestRepository.save(interest);
    }

    @Transactional
    public Shortlist shortlistProfile(Long userId, Long profileId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Profile profile = profileRepository.findById(profileId).orElseThrow(() -> new RuntimeException("Profile not found"));

        if (shortlistRepository.existsByUserAndProfile(user, profile)) {
            throw new RuntimeException("Profile already shortlisted");
        }

        Shortlist shortlist = new Shortlist();
        shortlist.setUser(user);
        shortlist.setProfile(profile);
        return shortlistRepository.save(shortlist);
    }

    @Transactional
    public BlockedUser blockUser(Long blockerId, Long blockedId) {
        if (blockerId.equals(blockedId)) {
            throw new RuntimeException("Cannot block yourself");
        }

        User blocker = userRepository.findById(blockerId).orElseThrow(() -> new RuntimeException("Blocker not found"));
        User blocked = userRepository.findById(blockedId).orElseThrow(() -> new RuntimeException("Blocked not found"));

        if (blockedUserRepository.existsByBlockerAndBlocked(blocker, blocked)) {
            throw new RuntimeException("User already blocked");
        }

        BlockedUser blockedUser = new BlockedUser();
        blockedUser.setBlocker(blocker);
        blockedUser.setBlocked(blocked);
        return blockedUserRepository.save(blockedUser);
    }

    public List<Interest> getReceivedInterests(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return interestRepository.findByReceiver(user);
    }

    /**
     * Advanced AI Match Scoring Algorithm (Heuristic based)
     * Calculates compatibility score between 0 to 100
     */
    public int calculateMatchScore(Profile userProfile, Profile targetProfile) {
        int score = 0;
        
        // 1. Marital Status compatibility (30 points)
        if (userProfile.getMaritalStatus() == targetProfile.getMaritalStatus()) {
            score += 30;
        }

        // 2. Education compatibility (20 points)
        if (userProfile.getEducation() != null && targetProfile.getEducation() != null) {
            String edu1 = userProfile.getEducation().toLowerCase();
            String edu2 = targetProfile.getEducation().toLowerCase();
            if (edu1.equals(edu2)) {
                score += 20;
            } else if ((edu1.contains("b.sc") || edu1.contains("b.a") || edu1.contains("b.tech") || edu1.contains("bachelor")) && 
                       (edu2.contains("b.sc") || edu2.contains("b.a") || edu2.contains("b.tech") || edu2.contains("bachelor"))) {
                score += 15; // Both have Bachelor's degrees
            } else {
                score += 10; // Partial match for having education info
            }
        }

        // 3. Location compatibility (20 points)
        if (userProfile.getLocation() != null && targetProfile.getLocation() != null) {
            String loc1 = userProfile.getLocation().toLowerCase();
            String loc2 = targetProfile.getLocation().toLowerCase();
            if (loc1.equals(loc2)) {
                score += 20;
            } else if (loc1.contains("west bengal") && loc2.contains("west bengal")) {
                score += 15; // Same state match
            } else {
                score += 5; // Both have location specified
            }
        }

        // 4. Sub-caste Check (Brahmin matching rule: Preferred to be same sub-caste)
        if (userProfile.getSubCaste() != null && targetProfile.getSubCaste() != null) {
            if (userProfile.getSubCaste().equalsIgnoreCase(targetProfile.getSubCaste())) {
                score += 20; // Bonus for same sub-caste
            } else {
                score += 5; // Minor match for both being Brahmin
            }
        }

        // Bound the score between 0 and 100
        return Math.max(0, Math.min(100, score));
    }
}
