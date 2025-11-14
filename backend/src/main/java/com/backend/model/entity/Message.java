package com.backend.model.entity;
 
import java.time.LocalDateTime;
 
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
 
@Entity
@Data
public class Message {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long msgId;
 
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
 
    @NotBlank
    @Column(nullable = false, length = 50)
    private String sender;
 
    @NotBlank
    @Column(nullable = false, length = 50)
    private String receiver;
 
    @NotBlank
    @Column(nullable = false, length = 30)
    private String targetLanguage;
 
    @Column(columnDefinition = "TEXT")
    private String translatedContent;
 
    @Column(nullable = false)
    private LocalDateTime timestamp;
}