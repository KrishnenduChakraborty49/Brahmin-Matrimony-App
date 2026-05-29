package com.brahminmilan.app.service;

import com.brahminmilan.app.dto.PaymentOrderDto;
import com.brahminmilan.app.dto.PaymentVerificationDto;
import com.brahminmilan.app.entity.*;
import com.brahminmilan.app.repository.PaymentRepository;
import com.brahminmilan.app.repository.SubscriptionRepository;
import com.brahminmilan.app.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PaymentService {

    @Value("${razorpay.key_id}")
    private String razorpayKeyId;

    @Value("${razorpay.key_secret}")
    private String razorpayKeySecret;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Transactional
    public Payment createOrder(Long userId, PaymentOrderDto orderDto) throws RazorpayException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", orderDto.getAmount() * 100); // Amount in paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        Order razorpayOrder = client.orders.create(orderRequest);

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPlanType(orderDto.getPlan());
        payment.setAmount(orderDto.getAmount());
        payment.setRazorpayOrderId(razorpayOrder.get("id"));
        payment.setStatus(PaymentStatus.PENDING);
        
        return paymentRepository.save(payment);
    }

    @Transactional
    public boolean verifyPayment(Long userId, PaymentVerificationDto verificationDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", verificationDto.getRazorpayOrderId());
            options.put("razorpay_payment_id", verificationDto.getRazorpayPaymentId());
            options.put("razorpay_signature", verificationDto.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            Payment payment = paymentRepository.findByRazorpayOrderId(verificationDto.getRazorpayOrderId())
                    .orElseThrow(() -> new RuntimeException("Payment record not found"));

            if (isValid) {
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setRazorpayPaymentId(verificationDto.getRazorpayPaymentId());
                paymentRepository.save(payment);

                // Activate Subscription
                Subscription subscription = new Subscription();
                subscription.setUser(user);
                subscription.setPlan(payment.getPlanType());
                subscription.setStartDate(LocalDateTime.now());
                subscription.setEndDate(LocalDateTime.now().plusMonths(1)); // 1 month subscription
                subscription.setActive(true);
                subscriptionRepository.save(subscription);

                return true;
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                return false;
            }

        } catch (RazorpayException e) {
            throw new RuntimeException("Payment verification failed", e);
        }
    }
}
