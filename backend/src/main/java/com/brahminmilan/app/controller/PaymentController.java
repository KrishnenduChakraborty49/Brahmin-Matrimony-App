package com.brahminmilan.app.controller;

import com.brahminmilan.app.dto.MessageResponse;
import com.brahminmilan.app.dto.PaymentOrderDto;
import com.brahminmilan.app.dto.PaymentVerificationDto;
import com.brahminmilan.app.entity.Payment;
import com.brahminmilan.app.security.UserDetailsImpl;
import com.brahminmilan.app.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                         @RequestBody PaymentOrderDto orderDto) {
        try {
            Payment payment = paymentService.createOrder(userDetails.getId(), orderDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", payment.getRazorpayOrderId());
            response.put("amount", payment.getAmount());
            response.put("plan", payment.getPlanType());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error creating order: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                           @RequestBody PaymentVerificationDto verificationDto) {
        try {
            boolean isSuccess = paymentService.verifyPayment(userDetails.getId(), verificationDto);
            if (isSuccess) {
                return ResponseEntity.ok(new MessageResponse("Payment verified and subscription activated successfully"));
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Payment verification failed"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error verifying payment: " + e.getMessage()));
        }
    }
}
