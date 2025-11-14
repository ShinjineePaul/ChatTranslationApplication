package com.backend.model.repository;
 
 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
 
import com.backend.model.entity.Message;
 
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
}