package com.brahminmilan.app.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendWelcomeEmail(String toEmail, String name) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to BrahminMilan! Let the Journey Begin");

            String htmlContent = String.format(
                    "<div style='font-family: Arial, sans-serif; color: #333; padding: 20px;'>" +
                    "<h2 style='color: #c026d3;'>Welcome to BrahminMilan, %s!</h2>" +
                    "<p>Thank you for registering on BrahminMilan. We are thrilled to help you find your perfect match.</p>" +
                    "<p>To get started, please log in and complete your profile.</p>" +
                    "<br/>" +
                    "<p>Best Regards,</p>" +
                    "<p><b>The BrahminMilan Team</b></p>" +
                    "</div>", name);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send welcome email to: {}", toEmail, e);
        }
    }
}
