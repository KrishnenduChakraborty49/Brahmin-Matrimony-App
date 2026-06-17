package com.brahminmilan.app.controller;

import com.brahminmilan.app.dto.ChatMessageDto;
import com.brahminmilan.app.entity.Chat;
import com.brahminmilan.app.entity.Message;
import com.brahminmilan.app.security.UserDetailsImpl;
import com.brahminmilan.app.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import com.brahminmilan.app.entity.User;
import com.brahminmilan.app.entity.Profile;
import com.brahminmilan.app.entity.Photo;
import com.brahminmilan.app.entity.PhotoType;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private com.brahminmilan.app.repository.ProfileRepository profileRepository;

    @Autowired
    private com.brahminmilan.app.repository.PhotoRepository photoRepository;

    @Autowired
    private com.brahminmilan.app.repository.MessageRepository messageRepository;

    @PostMapping("/init/{receiverId}")
    public ResponseEntity<Chat> initChat(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                         @PathVariable Long receiverId) {
        Chat chat = chatService.getOrCreateChat(userDetails.getId(), receiverId);
        return ResponseEntity.ok(chat);
    }

    @GetMapping("/my-chats")
    public ResponseEntity<?> getMyChats(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Chat> chats = chatService.getUserChats(userDetails.getId());
        List<Map<String, Object>> response = new ArrayList<>();

        for (Chat chat : chats) {
            User recipient = chat.getUser1().getId().equals(userDetails.getId()) ? chat.getUser2() : chat.getUser1();
            Map<String, Object> map = new HashMap<>();
            map.put("id", chat.getId());
            map.put("recipientId", recipient.getId());
            map.put("recipientEmail", recipient.getEmail());

            // Get profile name
            Optional<Profile> profileOpt = profileRepository.findByUserId(recipient.getId());
            if (profileOpt.isPresent()) {
                map.put("recipientName", profileOpt.get().getFullName());
            } else {
                map.put("recipientName", recipient.getEmail());
            }

            // Get approved profile picture
            List<Photo> photos = photoRepository.findByUserIdAndType(recipient.getId(), PhotoType.PROFILE);
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
            map.put("recipientAvatar", avatarUrl);

            // Get last message details
            List<Message> messages = chatService.getChatHistory(chat.getId());
            String lastMessage = "";
            java.time.LocalDateTime lastMessageTime = chat.getUpdatedAt() != null ? chat.getUpdatedAt() : chat.getCreatedAt();

            if (!messages.isEmpty()) {
                Message last = messages.get(messages.size() - 1);
                lastMessage = last.getContent();
                lastMessageTime = last.getCreatedAt();
            }

            map.put("lastMessage", lastMessage);
            map.put("lastMessageTime", lastMessageTime);

            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<Message>> getChatHistory(@PathVariable Long chatId) {
        List<Message> history = chatService.getChatHistory(chatId);
        return ResponseEntity.ok(history);
    }

    // WebSocket Endpoint for real-time messaging
    @MessageMapping("/chat.sendMessage")
    public void processMessage(@Payload ChatMessageDto chatMessageDto) {
        Message savedMsg = chatService.saveMessage(chatMessageDto);
        
        // Broadcast to the specific receiver's private topic
        messagingTemplate.convertAndSendToUser(
                String.valueOf(chatMessageDto.getReceiverId()), 
                "/queue/messages", 
                savedMsg);
    }
}
