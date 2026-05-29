package com.brahminmilan.app.repository;

import com.brahminmilan.app.entity.BlockedUser;
import com.brahminmilan.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlockedUserRepository extends JpaRepository<BlockedUser, Long> {
    List<BlockedUser> findByBlocker(User blocker);
    boolean existsByBlockerAndBlocked(User blocker, User blocked);
}
