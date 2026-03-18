import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { productService } from '../services/productService';
import { ShoppingCart, Search } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 2;

/**
 * 개별 상품 카드 컴포넌트 (메모이제이션 적용)
 * [성능 최적화] React.memo를 사용하여 부모 컴포넌트 리렌더링 시 불필요한 재계산을 방지합니다.
 */
const ProductItem = memo(({ item, onPress }: { item: any, onPress: (id: string) => void }) => (
  <TouchableOpacity 
    style={styles.card}
    onPress={() => onPress(item.id)}
    activeOpacity={0.7}
  >
    <Image 
      source={{ uri: item.mainImageUrl || 'https://picsum.photos/400/400?random=' + item.id }} 
      style={styles.image} 
    />
    <View style={styles.cardContent}>
      <Text style={styles.category}>{item.categoryName || 'General'}</Text>
      <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{item.price.toLocaleString()}원</Text>
        <View style={styles.cartButton}>
          <ShoppingCart size={16} color="#2563eb" />
        </View>
      </View>
    </View>
  </TouchableOpacity>
));

export default function HomeScreen({ navigation }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data.content);
    } catch (error) {
      console.error('[Performance] Product fetch error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = useCallback((id: string) => {
    navigation.navigate('ProductDetail', { id });
  }, [navigation]);

  const renderProduct = useCallback(({ item }: { item: any }) => (
    <ProductItem item={item} onPress={handlePress} />
  ), [handlePress]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>PROJECT X</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Search size={22} color="#1f2937" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          // [성능 최적화] FlatList 렌더링 엔진 튜닝
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  logo: { fontSize: 20, fontWeight: '900', color: '#2563eb', letterSpacing: -1 },
  iconButton: { padding: 4 },
  list: { padding: 12 },
  card: { 
    width: COLUMN_WIDTH,
    margin: 8, 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12
  },
  image: { width: '100%', aspectRatio: 1, backgroundColor: '#f1f5f9' },
  cardContent: { padding: 12 },
  category: { fontSize: 10, fontWeight: '800', color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' },
  name: { fontSize: 13, fontWeight: '600', color: '#334155', height: 38, lineHeight: 18 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  price: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  cartButton: { padding: 6, backgroundColor: '#eff6ff', borderRadius: 8 }
});
