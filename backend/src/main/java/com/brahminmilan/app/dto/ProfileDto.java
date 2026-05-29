package com.brahminmilan.app.dto;

import com.brahminmilan.app.entity.Gender;
import com.brahminmilan.app.entity.MaritalStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProfileDto {
    private String fullName;
    private Gender gender;
    private LocalDate dob;
    private Double height;
    private String subCaste;
    private String motherTongue;
    private MaritalStatus maritalStatus;
    private String location;
    private String education;
    private String occupation;
    private String companyName;
    private String salary;
    private String foodPreference;
    private String aboutMe;
    private String partnerPreferences;
}
