package com.projectx.auth.service;

import com.projectx.auth.domain.entity.ProductQna;
import com.projectx.auth.domain.repository.ProductQnaRepository;
import com.projectx.auth.dto.ProductQnaRequest;
import com.projectx.auth.dto.ProductQnaResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductQnaService {

    private final ProductQnaRepository qnaRepository;
    private final com.projectx.auth.domain.repository.ProductRepository productRepository;

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
    public Page<ProductQnaResponse> getMyQnas(UUID userId, Pageable pageable) {
        return qnaRepository.findByUserId(userId, pageable)
                .map(qna -> {
                    com.projectx.auth.domain.entity.Product product = productRepository.findById(qna.getProductId()).orElse(null);
                    String name = (product != null) ? product.getName() : "Unknown Product";
                    String imageUrl = (product != null) ? product.getMainImageUrl() : null;
                    return ProductQnaResponse.from(qna, name, imageUrl);
                });
    }

    @Transactional(readOnly = true)
    public Page<ProductQnaResponse> getProductQnas(UUID productId, Pageable pageable) {
        com.projectx.auth.domain.entity.Product product = productRepository.findById(productId).orElse(null);
        String name = (product != null) ? product.getName() : "Unknown Product";
        String imageUrl = (product != null) ? product.getMainImageUrl() : null;
        
        return qnaRepository.findByProductId(productId, pageable)
                .map(qna -> ProductQnaResponse.from(qna, name, imageUrl));
    }

    @Transactional
    public void answerQna(UUID qnaId, String answer) {
        log.info("[QNA] Saving answer for QNA {}: {}", qnaId, answer);
        ProductQna qna = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다."));
        qna.addAnswer(answer);
        qnaRepository.save(qna);
    }
}
