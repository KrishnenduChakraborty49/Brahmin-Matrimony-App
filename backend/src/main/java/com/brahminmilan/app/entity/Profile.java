package com.brahminmilan.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "profiles")
@Data
@NoArgsConstructor
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name")
    private String fullName;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private LocalDate dob;

    private Double height;

    private String religion = "Hindu";

    @Column(name = "sub_caste")
    private String subCaste;

    @Column(name = "mother_tongue")
    private String motherTongue;

    @Enumerated(EnumType.STRING)
    @Column(name = "marital_status")
    private MaritalStatus maritalStatus;

    private String location;

    private String education;

    private String occupation;

    @Column(name = "company_name")
    private String companyName;

    private String salary;

    @Column(name = "food_preference")
    private String foodPreference;

    @Column(name = "about_me", columnDefinition = "TEXT")
    private String aboutMe;

    @Column(name = "partner_preferences", columnDefinition = "TEXT")
    private String partnerPreferences;

    @Column(name = "birth_time")
    private String birthTime;

    @Column(name = "birth_place")
    private String birthPlace;

    private String rashi;

    private String nakshatra;

    @Column(name = "manglik_status")
    private String manglikStatus;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
