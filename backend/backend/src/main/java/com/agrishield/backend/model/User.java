package com.agrishield.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false, length = 15)
    private String phone;

    @Column(nullable = false)
    private String passwordHash;

    @Column(length = 5)
    private String preferredLanguage = "en";

    private String district;
}