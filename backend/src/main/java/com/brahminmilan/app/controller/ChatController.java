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

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/init/{receiverId}")
    public ResponseEntity<Chat> initChat(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                         @PathVariable Long receiverId) {
        Chat chat = chatService.getOrCreateChat(userDetails.getId(), receiverId);
        return ResponseEntity.ok(chat);
    }

    @GetMapping("/my-chats")
    public ResponseEntity<List<Chat>> getMyChats(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(chatService.getUserChats(userDetails.getId()));
    }

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<Message>> getChatMessages(@PathVariable Long chatId) {
        return ResponseEntity.ok(chatService.getChatHistory(chatId));
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
