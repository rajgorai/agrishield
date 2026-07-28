package com.agrishield.backend.repository;

import com.agrishield.backend.entity.Disease;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface DiseaseRepository extends JpaRepository<Disease, UUID> {
    Optional<Disease> findByModelClassLabel(String modelClassLabel);
}
