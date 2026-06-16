package com.brahminmilan.app.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Cloudinary cloudinary;
    private final boolean useCloudinary;
    private final Path localUploadPath;

    public FileStorageService(
            @Value("${spring.cloudinary.cloud_name}") String cloudName,
            @Value("${spring.cloudinary.api_key}") String apiKey,
            @Value("${spring.cloudinary.api_secret}") String apiSecret) {
        
        if (cloudName == null || cloudName.trim().isEmpty() || cloudName.equals("your-cloud-name")) {
            this.useCloudinary = false;
            this.cloudinary = null;
        } else {
            this.useCloudinary = true;
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret));
        }
        
        this.localUploadPath = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.localUploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create local upload directory", e);
        }
    }

    public String storeFile(MultipartFile file) {
        return storeFile(file, "general");
    }

    public String storeFile(MultipartFile file, String folder) {
        if (useCloudinary) {
            try {
                Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("folder", folder));
                return uploadResult.get("url").toString();
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload file to Cloudinary", e);
            }
        } else {
            try {
                String originalFilename = file.getOriginalFilename();
                String fileExtension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String newFilename = UUID.randomUUID().toString() + fileExtension;
                
                Path targetLocation = this.localUploadPath.resolve(newFilename);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                
                return "http://localhost:8080/uploads/" + newFilename;
            } catch (IOException e) {
                throw new RuntimeException("Failed to store file locally", e);
            }
        }
    }
}
