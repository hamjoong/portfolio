package com.projectx.auth.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "product_options")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductOption extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 100)
    private String optionType; // 예: 사이즈, 색상

    @Column(nullable = false, length = 100)
    private String optionName; // 예: XL, 빨간색

    @Column(nullable = false)
    private BigDecimal additionalPrice; // 추가 금액

    @Column(nullable = false)
    private int stockQuantity; // 해당 옵션의 재고

    public void removeStock(int quantity) {
        int restStock = this.stockQuantity - quantity;
        if (restStock < 0) {
            throw new RuntimeException("옵션 재고가 부족합니다.");
        }
        this.stockQuantity = restStock;
    }

    public void addStock(int quantity) {
        this.stockQuantity += quantity;
    }
}
