package com.backend.model.dto;
public class LanguageUpdateDto {
    private String username;
    private String language;

    public LanguageUpdateDto() {}

    public LanguageUpdateDto(String username, String language) {
        this.username = username;
        this.language = language;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}