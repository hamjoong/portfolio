package com.projectx.auth.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * 상품 카테고리를 관리하는 엔티티입니다.
 * [이유] 상품을 체계적으로 분류하여 사용자가 원하는 상품을 
 * 쉽고 빠르게 탐색할 수 있는 계층적 구조를 제공하기 위함입니다.
 */
@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    /**
     * 상위 카테고리입니다.
     * [이유] 대분류 > 중분류 > 소분류와 같은 트리 구조를 형성하여
     * 카테고리 기반 필터링 기능을 고도화하기 위함입니다.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent")
    private List<Category> children = new ArrayList<>();

    private int displayOrder;

    public Category(String name, Category parent, int displayOrder) {
        this.name = name;
        this.parent = parent;
        this.displayOrder = displayOrder;
    }
}
