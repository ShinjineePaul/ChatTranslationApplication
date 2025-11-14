package com.backend.model.dto;
 
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
 
@Data
public class MessageRequestDto {
    @NotBlank
    private String content;
 
    @NotBlank
    private String sender;
 
    @NotBlank
    private String receiver;
 
    @NotBlank
    private String targetLanguage;
 
    private String translatedContent;
}
 