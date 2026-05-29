package com.brahminmilan.app.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final String uploadDir = "uploads/";

    public String storeFile(MultipartFile file, String type) {
        // Normalize file name
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = "";
        
        int i = originalFilename.lastIndexOf('.');
        if (i > 0) {
            extension = originalFilename.substring(i);
        }

        String fileName = UUID.randomUUID().toString() + extension;
        
        try {
            // Check if the file's name contains invalid characters
            if (fileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            // Target location
            Path targetLocation = Paths.get(uploadDir + type).toAbsolutePath().normalize().resolve(fileName);
            
            // Create directories if they don't exist
            Files.createDirectories(targetLocation.getParent());

            // Copy file to the target location (Replacing existing file with the same name)
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/api/files/" + type + "/" + fileName; // Return logical URL
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }
}
