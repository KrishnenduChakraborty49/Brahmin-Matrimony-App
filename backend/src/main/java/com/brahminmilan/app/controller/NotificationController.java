package com.brahminmilan.app.controller;

import com.brahminmilan.app.dto.MessageResponse;
import com.brahminmilan.app.entity.Notification;
import com.brahminmilan.app.security.UserDetailsImpl;
import com.brahminmilan.app.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Notification> list = notificationService.getUserNotifications(userDetails.getId());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        long count = notificationService.getUnreadCount(userDetails.getId());
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            notificationService.markAsRead(id, userDetails.getId());
            return ResponseEntity.ok(new MessageResponse("Notification marked as read"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            notificationService.markAllAsRead(userDetails.getId());
            return ResponseEntity.ok(new MessageResponse("All notifications marked as read"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
