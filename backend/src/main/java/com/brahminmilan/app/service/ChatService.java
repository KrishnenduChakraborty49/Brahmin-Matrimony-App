package com.brahminmilan.app.service;

import com.brahminmilan.app.dto.ChatMessageDto;
import com.brahminmilan.app.entity.Chat;
import com.brahminmilan.app.entity.Message;
import com.brahminmilan.app.entity.User;
import com.brahminmilan.app.repository.ChatRepository;
import com.brahminmilan.app.repository.MessageRepository;
import com.brahminmilan.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Chat getOrCreateChat(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1).orElseThrow(() -> new RuntimeException("User not found"));
        User user2 = userRepository.findById(userId2).orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Chat> existingChat = chatRepository.findChatBetweenUsers(user1, user2);
        
        if (existingChat.isPresent()) {
            return existingChat.get();
        }

        Chat chat = new Chat();
        chat.setUser1(user1);
        chat.setUser2(user2);
        return chatRepository.save(chat);
    }

    @Transactional
    public Message saveMessage(ChatMessageDto chatMessageDto) {
        Chat chat = chatRepository.findById(chatMessageDto.getChatId())
                .orElseThrow(() -> new RuntimeException("Chat not found"));
                
        User sender = userRepository.findById(chatMessageDto.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        Message message = new Message();
        message.setChat(chat);
        message.setSender(sender);
        message.setContent(chatMessageDto.getContent());

        // update chat timestamp
        chat.setUpdatedAt(LocalDateTime.now());
        chatRepository.save(chat);

        return messageRepository.save(message);
    }

    public List<Chat> getUserChats(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return chatRepository.findChatsByUser(user);
    }

    public List<Message> getChatHistory(Long chatId) {
        Chat chat = chatRepository.findById(chatId).orElseThrow(() -> new RuntimeException("Chat not found"));
        return messageRepository.findByChatOrderByCreatedAtAsc(chat);
    }
}
