package com.brahminmilan.app.repository;

import com.brahminmilan.app.entity.Subscription;
import com.brahminmilan.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByUserAndIsActiveTrue(User user);
}
