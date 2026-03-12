package com.projectx.auth.service;

import com.projectx.auth.domain.entity.ProductQna;
import com.projectx.auth.domain.repository.ProductQnaRepository;
import com.projectx.auth.dto.ProductQnaRequest;
import com.projectx.auth.dto.ProductQnaResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductQnaService {

    private final ProductQnaRepository qnaRepository;

    @Transactional
    public UUID createQna(UUID userId, ProductQnaRequest request) {
        ProductQna qna = ProductQna.builder()
                .userId(userId)
                .productId(request.getProductId())
                .title(request.getTitle())
                .content(request.getContent())
                .build();
        return qnaRepository.save(qna).getId();
    }

    @Transactional(readOnly = true)
    public List<ProductQnaResponse> getMyQnas(UUID userId) {
        return qnaRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ProductQnaResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductQnaResponse> getProductQnas(UUID productId) {
        return qnaRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(ProductQnaResponse::from)
                .collect(Collectors.toList());
    }
}
