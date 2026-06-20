package com.brahminmilan.app.service;

import com.brahminmilan.app.entity.*;
import com.brahminmilan.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Optional;

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

    @Autowired
    private NotificationService notificationService;

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
        Interest saved = interestRepository.save(interest);

        // Notify the receiver
        String senderName = profileRepository.findByUserId(senderId)
                .map(Profile::getFullName)
                .orElse(sender.getEmail());
        notificationService.createNotification(receiver, senderName + " has sent you a connection interest!");

        return saved;
    }

    @Transactional
    public Interest respondToInterest(Long receiverId, Long interestId, InterestStatus status) {
        Interest interest = interestRepository.findById(interestId).orElseThrow(() -> new RuntimeException("Interest not found"));

        if (!interest.getReceiver().getId().equals(receiverId)) {
            throw new RuntimeException("Unauthorized to respond to this interest");
        }

        interest.setStatus(status);
        Interest saved = interestRepository.save(interest);

        // Notify the sender if status is ACCEPTED
        if (status == InterestStatus.ACCEPTED) {
            String receiverName = profileRepository.findByUserId(receiverId)
                    .map(Profile::getFullName)
                    .orElse(interest.getReceiver().getEmail());
            notificationService.createNotification(interest.getSender(), receiverName + " has accepted your connection interest!");
        }

        return saved;
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

    @Autowired
    private PhotoRepository photoRepository;

    public List<Shortlist> getUserShortlist(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return shortlistRepository.findByUser(user);
    }

    public List<Map<String, Object>> getEnrichedReceivedInterests(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<Interest> interests = interestRepository.findByReceiver(user);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Interest interest : interests) {
            User sender = interest.getSender();
            Optional<Profile> profileOpt = profileRepository.findByUserId(sender.getId());
            if (profileOpt.isEmpty()) continue;

            Profile p = profileOpt.get();
            Map<String, Object> map = new HashMap<>();
            map.put("interestId", interest.getId());
            map.put("status", interest.getStatus().name());
            map.put("createdAt", interest.getCreatedAt());
            map.put("userId", sender.getId());
            map.put("fullName", p.getFullName());
            map.put("gender", p.getGender() != null ? p.getGender().name() : null);
            map.put("location", p.getLocation());
            map.put("subCaste", p.getSubCaste());
            map.put("occupation", p.getOccupation());
            map.put("height", p.getHeight());

            // Compute match score dynamically
            Optional<Profile> myProfileOpt = profileRepository.findByUserId(userId);
            int matchScore = 0;
            if (myProfileOpt.isPresent()) {
                matchScore = calculateMatchScore(myProfileOpt.get(), p);
            }
            map.put("matchScore", matchScore);

            // Get approved profile picture
            List<Photo> photos = photoRepository.findByUserIdAndType(sender.getId(), PhotoType.PROFILE);
            String avatarUrl = null;
            for (Photo photo : photos) {
                if (photo.isApproved()) {
                    avatarUrl = photo.getUrl();
                    break;
                }
            }
            if (avatarUrl == null && !photos.isEmpty()) {
                avatarUrl = photos.get(0).getUrl();
            }
            map.put("avatar", avatarUrl);

            result.add(map);
        }
        return result;
    }

    public List<Map<String, Object>> getEnrichedSentInterests(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<Interest> interests = interestRepository.findBySender(user);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Interest interest : interests) {
            User receiver = interest.getReceiver();
            Optional<Profile> profileOpt = profileRepository.findByUserId(receiver.getId());
            if (profileOpt.isEmpty()) continue;

            Profile p = profileOpt.get();
            Map<String, Object> map = new HashMap<>();
            map.put("interestId", interest.getId());
            map.put("status", interest.getStatus().name());
            map.put("createdAt", interest.getCreatedAt());
            map.put("userId", receiver.getId());
            map.put("fullName", p.getFullName());
            map.put("gender", p.getGender() != null ? p.getGender().name() : null);
            map.put("location", p.getLocation());
            map.put("subCaste", p.getSubCaste());
            map.put("occupation", p.getOccupation());
            map.put("height", p.getHeight());

            // Compute match score dynamically
            Optional<Profile> myProfileOpt = profileRepository.findByUserId(userId);
            int matchScore = 0;
            if (myProfileOpt.isPresent()) {
                matchScore = calculateMatchScore(myProfileOpt.get(), p);
            }
            map.put("matchScore", matchScore);

            // Get approved profile picture
            List<Photo> photos = photoRepository.findByUserIdAndType(receiver.getId(), PhotoType.PROFILE);
            String avatarUrl = null;
            for (Photo photo : photos) {
                if (photo.isApproved()) {
                    avatarUrl = photo.getUrl();
                    break;
                }
            }
            if (avatarUrl == null && !photos.isEmpty()) {
                avatarUrl = photos.get(0).getUrl();
            }
            map.put("avatar", avatarUrl);

            result.add(map);
        }
        return result;
    }

    public List<Map<String, Object>> getEnrichedShortlist(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<Shortlist> shortlists = shortlistRepository.findByUser(user);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Shortlist shortlist : shortlists) {
            Profile p = shortlist.getProfile();
            Map<String, Object> map = new HashMap<>();
            map.put("shortlistId", shortlist.getId());
            map.put("profileId", p.getId());
            map.put("userId", p.getUser().getId());
            map.put("fullName", p.getFullName());
            map.put("gender", p.getGender() != null ? p.getGender().name() : null);
            map.put("location", p.getLocation());
            map.put("subCaste", p.getSubCaste());
            map.put("occupation", p.getOccupation());
            map.put("height", p.getHeight());
            map.put("createdAt", shortlist.getCreatedAt());

            // Compute match score dynamically
            Optional<Profile> myProfileOpt = profileRepository.findByUserId(userId);
            int matchScore = 0;
            if (myProfileOpt.isPresent()) {
                matchScore = calculateMatchScore(myProfileOpt.get(), p);
            }
            map.put("matchScore", matchScore);

            // Get approved profile picture
            List<Photo> photos = photoRepository.findByUserIdAndType(p.getUser().getId(), PhotoType.PROFILE);
            String avatarUrl = null;
            for (Photo photo : photos) {
                if (photo.isApproved()) {
                    avatarUrl = photo.getUrl();
                    break;
                }
            }
            if (avatarUrl == null && !photos.isEmpty()) {
                avatarUrl = photos.get(0).getUrl();
            }
            map.put("avatar", avatarUrl);

            result.add(map);
        }
        return result;
    }

    @Transactional
    public void removeShortlistByProfile(Long userId, Long profileId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Profile profile = profileRepository.findById(profileId).orElseThrow(() -> new RuntimeException("Profile not found"));
        Optional<Shortlist> shortlistOpt = shortlistRepository.findByUserAndProfile(user, profile);
        shortlistOpt.ifPresent(shortlist -> shortlistRepository.delete(shortlist));
    }
}
