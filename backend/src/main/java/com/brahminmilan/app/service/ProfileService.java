package com.brahminmilan.app.service;

import com.brahminmilan.app.dto.ProfileDto;
import com.brahminmilan.app.entity.Photo;
import com.brahminmilan.app.entity.PhotoType;
import com.brahminmilan.app.entity.Profile;
import com.brahminmilan.app.entity.User;
import com.brahminmilan.app.repository.PhotoRepository;
import com.brahminmilan.app.repository.ProfileRepository;
import com.brahminmilan.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PhotoRepository photoRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Transactional
    public Profile updateProfile(Long userId, ProfileDto profileDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Profile> existingProfileOpt = profileRepository.findByUserId(userId);
        Profile profile = existingProfileOpt.orElse(new Profile());

        profile.setUser(user);
        profile.setFullName(profileDto.getFullName());
        profile.setGender(profileDto.getGender());
        profile.setDob(profileDto.getDob());
        profile.setHeight(profileDto.getHeight());
        profile.setSubCaste(profileDto.getSubCaste());
        profile.setMotherTongue(profileDto.getMotherTongue());
        profile.setMaritalStatus(profileDto.getMaritalStatus());
        profile.setLocation(profileDto.getLocation());
        profile.setEducation(profileDto.getEducation());
        profile.setOccupation(profileDto.getOccupation());
        profile.setCompanyName(profileDto.getCompanyName());
        profile.setSalary(profileDto.getSalary());
        profile.setFoodPreference(profileDto.getFoodPreference());
        profile.setAboutMe(profileDto.getAboutMe());
        profile.setPartnerPreferences(profileDto.getPartnerPreferences());

        return profileRepository.save(profile);
    }

    public Profile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    @Transactional
    public Photo uploadPhoto(Long userId, MultipartFile file, PhotoType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String folder = type == PhotoType.HOROSCOPE ? "horoscopes" : "profiles";
        String fileUrl = fileStorageService.storeFile(file, folder);

        Photo photo = new Photo();
        photo.setUser(user);
        photo.setType(type);
        photo.setUrl(fileUrl);
        photo.setApproved(false); // Admin needs to approve

        return photoRepository.save(photo);
    }
}
