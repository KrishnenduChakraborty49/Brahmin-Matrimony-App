package com.brahminmilan.app.dto;

import com.brahminmilan.app.entity.SubscriptionPlan;
import lombok.Data;

@Data
public class PaymentOrderDto {
    private SubscriptionPlan plan;
    private Double amount;
}
