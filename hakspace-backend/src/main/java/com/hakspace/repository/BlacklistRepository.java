package com.hakspace.repository;

import com.hakspace.model.Blacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlacklistRepository extends JpaRepository<Blacklist, Long> {

    Optional<Blacklist> findByEmailAndActiveTrue(String email);
    Optional<Blacklist> findByPhoneNumberAndActiveTrue(String phoneNumber);

    boolean existsByEmailAndActiveTrue(String email);
    boolean existsByPhoneNumberAndActiveTrue(String phoneNumber);

    List<Blacklist> findByFullNameContainingIgnoreCaseOrPhoneNumberContainingIgnoreCase(
            String fullName, String phoneNumber);

    List<Blacklist> findByActiveTrue();

    List<Blacklist> findByActiveFalse();
}
