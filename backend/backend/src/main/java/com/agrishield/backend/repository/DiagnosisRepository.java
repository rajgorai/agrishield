package com.agrishield.backend.repository;

import com.agrishield.backend.entity.Diagnosis;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DiagnosisRepository extends JpaRepository<Diagnosis, UUID> {
    List<Diagnosis> findByUserIdOrderByCreatedAtDesc(UUID userId);
}