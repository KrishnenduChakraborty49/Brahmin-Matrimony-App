package com.brahminmilan.app.dto;

import lombok.Data;

@Data
public class PaymentVerificationDto {
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}
