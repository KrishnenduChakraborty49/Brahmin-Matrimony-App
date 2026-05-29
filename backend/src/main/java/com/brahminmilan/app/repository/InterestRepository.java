package com.brahminmilan.app.repository;

import com.brahminmilan.app.entity.Interest;
import com.brahminmilan.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterestRepository extends JpaRepository<Interest, Long> {
    List<Interest> findBySender(User sender);
    List<Interest> findByReceiver(User receiver);
    boolean existsBySenderAndReceiver(User sender, User receiver);
}
