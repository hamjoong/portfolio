package com.projectx.auth.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ProductApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("상품 목록 조회 API가 정상적으로 동작하며 초기 데이터를 포함해야 한다.")
    void getProductsTest() throws Exception {
        mockMvc.perform(get("/api/v1/products")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.content[0].name", notNullValue()));
    }

    @Test
    @DisplayName("특정 키워드로 상품 검색 시 결과가 반환되어야 한다.")
    void searchProductsTest() throws Exception {
        mockMvc.perform(get("/api/v1/products/search")
                .param("keyword", "스마트폰"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", is(not(empty()))));
    }
}
