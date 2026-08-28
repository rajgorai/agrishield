package com.agrishield.backend.repository;

import com.agrishield.backend.entity.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ChatHistoryRepository extends JpaRepository<ChatHistory, UUID> {
    List<ChatHistory> findByUserIdOrderByCreatedAtDesc(UUID userId);
}