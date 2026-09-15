package com.agrishield.backend.repository;

import com.agrishield.backend.dto.DiagnosisHistoryItem;
import com.agrishield.backend.entity.Diagnosis;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface DiagnosisRepository extends JpaRepository<Diagnosis, UUID> {

    Page<Diagnosis> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    // NEW: JOIN with diseases for history list
    @Query("SELECT new com.agrishield.backend.dto.DiagnosisHistoryItem(" +
            "  d.id, d.imageUrl, d.confidenceScore, " +
            "  dis.cropName, dis.diseaseNameEn, dis.diseaseNameBn, dis.diseaseNameHi, " +
            "  dis.severity, d.createdAt) " +
            "FROM Diagnosis d, Disease dis " +
            "WHERE d.diseaseId = dis.id AND d.userId = :userId " +
            "ORDER BY d.createdAt DESC")
    Page<DiagnosisHistoryItem> findHistoryWithDisease(
            @Param("userId") UUID userId,
            Pageable pageable);
}