package com.backend.model.service;
 
import com.backend.model.dto.MessageRequestDto;
import com.backend.model.entity.Message;
 
public interface MessageService {
    Message sendMessage(MessageRequestDto request);
    void updateUserLanguage(String username, String language);
}