package com.agrishield.backend.repository;

import com.agrishield.backend.entity.TokenBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface TokenBlacklistRepository extends JpaRepository<TokenBlacklist, UUID> {
    Optional<TokenBlacklist> findByToken(String token);
    void deleteByExpiryDateBefore(LocalDateTime date);
}