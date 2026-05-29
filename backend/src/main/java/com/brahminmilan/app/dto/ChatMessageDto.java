package com.brahminmilan.app.dto;

import lombok.Data;

@Data
public class ChatMessageDto {
    private Long chatId;
    private Long senderId;
    private Long receiverId;
    private String content;
    private String status;
}
