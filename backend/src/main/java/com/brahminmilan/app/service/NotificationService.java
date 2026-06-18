package com.brahminmilan.app.service;

import com.brahminmilan.app.entity.Notification;
import com.brahminmilan.app.entity.User;
import com.brahminmilan.app.repository.NotificationRepository;
import com.brahminmilan.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public Notification createNotification(User user, String content) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setContent(content);
        Notification saved = notificationRepository.save(notification);

        // Send real-time notification over WebSocket to /user/{userId}/queue/notifications
        try {
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(user.getId()),
                    "/queue/notifications",
                    saved
            );
        } catch (Exception e) {
            System.err.println("Could not send real-time notification: " + e.getMessage());
        }

        return saved;
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : unread) {
            if (!n.isRead()) {
                n.setRead(true);
            }
        }
        notificationRepository.saveAll(unread);
    }
}
