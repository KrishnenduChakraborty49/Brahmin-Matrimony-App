package com.brahminmilan.app.repository;

import com.brahminmilan.app.entity.Photo;
import com.brahminmilan.app.entity.PhotoType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByUserIdAndType(Long userId, PhotoType type);
    Optional<Photo> findByUserIdAndTypeAndIsApprovedTrue(Long userId, PhotoType type);
    List<Photo> findByUserId(Long userId);
}
