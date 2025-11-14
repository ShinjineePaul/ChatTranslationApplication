package com.backend.model.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.backend.model.dto.MessageRequestDto;
import com.backend.model.entity.Message;
import com.backend.model.exception.CustomException;
import com.backend.model.repository.MessageRepository;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageRepository messageRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    private final Map<String, String> userLanguageMap = new ConcurrentHashMap<>();

 @Override
public Message sendMessage(MessageRequestDto request) {
    String targetLanguage = request.getTargetLanguage();

    
if (targetLanguage == null || targetLanguage.isBlank()) {
        targetLanguage = userLanguageMap.getOrDefault(request.getReceiver(), "english");
        if (targetLanguage == null || targetLanguage.isBlank()) {
            targetLanguage = "english"; // Final fallback
        }
    }


    Message message = new Message();
    message.setContent(request.getContent());
    message.setSender(request.getSender());
    message.setReceiver(request.getReceiver());
    message.setTargetLanguage(targetLanguage);
    message.setTimestamp(LocalDateTime.now());

    String translated = translateText(request.getContent(), targetLanguage);
    message.setTranslatedContent(translated);

    return messageRepository.save(message);
}

    @Override
    public void updateUserLanguage(String username, String language) {
        userLanguageMap.put(username, language);
    }

    private String translateText(String content, String targetLanguage) {
    try {
        String apiKey = "AIzaSyAXrbqWARlFjoBNv_0KccFG95iTAsL5UTg"; 
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        String prompt = String.format("Translate only the message to %s without transliteration: %s", targetLanguage, content);

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        Map<String, Object> contentMap = new HashMap<>();
        contentMap.put("parts", List.of(part));

        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(contentMap));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

        if (response != null && response.containsKey("candidates")) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (!candidates.isEmpty()) {
                Map<String, Object> candidate = candidates.get(0);
                Map<String, Object> contentObj = (Map<String, Object>) candidate.get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) contentObj.get("parts");
                if (!parts.isEmpty() && parts.get(0).containsKey("text")) {
                    return parts.get(0).get("text").toString().trim(); 
                }
            }
        }
    } catch (CustomException e) {
        e.printStackTrace();
    }
    return content; 
}
}