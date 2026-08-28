package com.agrishield.backend.repository;

import com.agrishield.backend.entity.ChatHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ChatHistoryRepository extends JpaRepository<ChatHistory, UUID> {
    // This method now returns a Page instead of a List
    Page<ChatHistory> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}