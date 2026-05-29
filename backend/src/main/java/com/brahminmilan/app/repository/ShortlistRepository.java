package com.brahminmilan.app.repository;

import com.brahminmilan.app.entity.Profile;
import com.brahminmilan.app.entity.Shortlist;
import com.brahminmilan.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShortlistRepository extends JpaRepository<Shortlist, Long> {
    List<Shortlist> findByUser(User user);
    boolean existsByUserAndProfile(User user, Profile profile);
}
