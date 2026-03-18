import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import client from '../api/api';

/**
 * 모바일용 상품 상세 화면입니다.
 * [이유] 사용자가 상품의 스펙을 명확히 확인하고,
 * 하단에 고정된 구매/장바구니 버튼을 통해 전환율을 높이기 위함입니다.
 */
export default function ProductDetailScreen({ route }: any) {
  const { id } = route.params;
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await client.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('[Mobile Detail] Fetch product failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await client.post(`/cart?productId=${id}&quantity=1`);
      alert('장바구니에 담겼습니다.');
    } catch (error) {
      alert('장바구니 담기에 실패했습니다.');
    }
  };

  if (isLoading) {return <ActivityIndicator style={{ flex: 1 }} />;}
  if (!product) {return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>상품 정보를 불러올 수 없습니다.</Text></View>;}

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={{ uri: product.mainImageUrl || 'https://via.placeholder.com/400' }} style={styles.mainImage} />
        <View style={styles.content}>
          <Text style={styles.category}>{product.categoryName}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{product.price.toLocaleString()}원</Text>
          <View style={styles.divider} />
          <Text style={styles.descriptionTitle}>상품 정보</Text>
          <Text style={styles.description}>{product.description || '상세 설명이 없습니다.'}</Text>
        </View>
      </ScrollView>

      {/* 하단 고정 버튼 영역 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
          <Text style={styles.cartButtonText}>장바구니</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>바로 구매</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  mainImage: { width: '100%', aspectRatio: 1 },
  content: { padding: 24 },
  category: { fontSize: 12, color: '#2563eb', fontWeight: '700', marginBottom: 8 },
  name: { fontSize: 24, fontWeight: '800', color: '#0f172a', lineHeight: 32 },
  price: { fontSize: 28, fontWeight: '900', color: '#0f172a', marginTop: 12 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 24 },
  descriptionTitle: { fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 12 },
  description: { fontSize: 15, color: '#64748b', lineHeight: 24 },
  footer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 12 },
  cartButton: { flex: 1, height: 56, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buyButton: { flex: 2, height: 56, backgroundColor: '#2563eb', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cartButtonText: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  buyButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
