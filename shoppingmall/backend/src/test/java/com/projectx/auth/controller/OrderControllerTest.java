package com.projectx.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectx.auth.dto.PaymentRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("결제 검증 API는 올바른 요청 시 정상적으로 동작해야 한다.")
    void verifyPaymentTest() throws Exception {
        PaymentRequest request = PaymentRequest.builder()
                .orderId(UUID.randomUUID())
                .amount(new BigDecimal("10000"))
                .idempotencyKey(UUID.randomUUID().toString())
                .build();

        mockMvc.perform(post("/api/v1/orders/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("결제 검증 API는 유효하지 않은 요청 시 BAD_REQUEST를 반환해야 한다.")
    void verifyPaymentInvalidRequestTest() throws Exception {
        PaymentRequest request = PaymentRequest.builder()
                .orderId(null) // Invalid: null
                .amount(new BigDecimal("-100")) // Invalid: negative
                .idempotencyKey("") // Invalid: blank
                .build();

        mockMvc.perform(post("/api/v1/orders/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
