package com.tony.gael.ProyectoI.service;

import com.tony.gael.ProyectoI.model.User;
import com.tony.gael.ProyectoI.repo.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepo UserRepo;

    public UserService(UserRepo userRepository) {
        this.UserRepo = userRepository;
    }

    public User createUser(User user) {
        return UserRepo.save(user);
    }

    public List<User> getAllUsers() {
        return UserRepo.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return UserRepo.findById(id);
    }
}
