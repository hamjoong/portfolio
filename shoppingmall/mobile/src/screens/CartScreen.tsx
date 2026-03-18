import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import client from '../api/api';

/**
 * 모바일 장바구니 화면입니다.
 * [이유] 사용자가 구매를 확정하기 전 담아둔 상품들을 검토하고
 * 최종 결제 단계로 유도하기 위한 효율적인 목록 뷰를 제공하기 위함입니다.
 */
export default function CartScreen({ navigation }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      // 1. 장바구니 ID 목록 조회
      const cartResponse = await client.get('/cart');
      const productIds = Object.keys(cartResponse.data);

      // 2. 각 상품 상세 정보 병렬 조회
      const detailedItems = await Promise.all(
        productIds.map(async (id) => {
          const productRes = await client.get(`/products/${id}`);
          return { ...productRes.data, quantity: cartResponse.data[id] };
        })
      );
      setItems(detailedItems);
    } catch (error) {
      console.error('[Mobile Cart] Fetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await client.delete(`/cart/${productId}`);
      setItems(items.filter(item => item.id !== productId));
    } catch (error) {
      console.error('[Mobile Cart] Remove failed:', error);
    }
  };

  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const renderItem = ({ item }: any) => (
    <View style={styles.itemCard}>
      <Image source={{ uri: item.mainImageUrl || 'https://via.placeholder.com/100' }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price.toLocaleString()}원</Text>
        <Text style={styles.itemQuantity}>수량: {item.quantity}개</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeButton}>
        <Trash2 size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>장바구니</Text>

      {isLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>장바구니가 비어있습니다.</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopButtonText}>쇼핑하러 가기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
          <View style={styles.footer}>
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>총 결제 금액</Text>
              <Text style={styles.totalPrice}>{totalPrice.toLocaleString()}원</Text>
            </View>
            <TouchableOpacity style={styles.orderButton} onPress={() => navigation.navigate('Order')}>
              <Text style={styles.orderButtonText}>주문하기</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '800', padding: 24, color: '#0f172a' },
  list: { padding: 16 },
  itemCard: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', elevation: 1 },
  itemImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f8fafc' },
  itemInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  itemName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  itemPrice: { fontSize: 16, fontWeight: '700', color: '#2563eb', marginTop: 4 },
  itemQuantity: { fontSize: 12, color: '#64748b', marginTop: 4 },
  removeButton: { padding: 8 },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#f1f5f9', backgroundColor: '#fff' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  totalLabel: { fontSize: 14, color: '#64748b' },
  totalPrice: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  orderButton: { height: 56, backgroundColor: '#0f172a', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  orderButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: '#94a3b8', marginBottom: 20 },
  shopButton: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#f1f5f9', borderRadius: 12 },
  shopButtonText: { color: '#475569', fontWeight: '700' },
});
