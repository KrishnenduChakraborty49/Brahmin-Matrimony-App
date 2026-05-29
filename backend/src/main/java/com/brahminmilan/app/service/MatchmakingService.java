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
}
