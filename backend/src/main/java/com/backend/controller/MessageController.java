package com.backend.controller;
 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

import com.backend.model.dto.LanguageUpdateDto;
import com.backend.model.dto.MessageRequestDto;
import com.backend.model.entity.Message;
import com.backend.model.service.MessageService;
 
@RestController
public class MessageController {

    @Autowired
    private MessageService messageService;
 
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
 
    @MessageMapping("/chat")
    public void sendMessage(@Payload MessageRequestDto request) {
        // Save to DB and translate
        Message savedMessage = messageService.sendMessage(request);
 
        System.out.println("Sending message to " + savedMessage.getReceiver() +
                           " with translated content: " + savedMessage.getTranslatedContent());
 
        // Send to receiver
        messagingTemplate.convertAndSend(
            "/topic/messages/" + savedMessage.getReceiver(),
            savedMessage
        );
 
    }
    
    @MessageMapping("/language")
    public void updateLanguage(@Payload LanguageUpdateDto update) {
        System.out.println("Language update received: " + update.getUsername() + " → " + update.getLanguage());
        messageService.updateUserLanguage(update.getUsername(), update.getLanguage());

        messagingTemplate.convertAndSend(
            "/topic/language/" + (update.getUsername().equals("user1") ? "user2" : "user1"),
            update
        );
    }
}

