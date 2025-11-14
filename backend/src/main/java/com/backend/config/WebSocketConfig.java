package com.backend.config;
 
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
 
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
 
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // The broker will handle destinations prefixed with /topic
        config.enableSimpleBroker("/topic");
 
        // Application messages sent from client must start with /app
        config.setApplicationDestinationPrefixes("/app");
    }
 
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint where React frontends will connect
        registry.addEndpoint("/ws")
                .setAllowedOrigins(
                        "http://localhost:3000",
                        "http://localhost:3001"
                )
                .withSockJS(); // Enables SockJS fallback for browsers not supporting WebSocket
    }
}
 