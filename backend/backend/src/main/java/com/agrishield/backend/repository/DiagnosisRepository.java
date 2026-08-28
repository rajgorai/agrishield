package com.agrishield.backend.repository;

import com.agrishield.backend.entity.Diagnosis;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DiagnosisRepository extends JpaRepository<Diagnosis, UUID> {
    // This method now returns a Page instead of a List
    Page<Diagnosis> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}