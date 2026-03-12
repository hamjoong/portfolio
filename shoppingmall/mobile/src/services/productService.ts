import api from '../api/api';

/**
 * 모바일용 상품 서비스입니다.
 */
export const productService = {
  async getProducts(page = 0, size = 10) {
    const response = await api.get(`/products?page=${page}&size=${size}`);
    return response.data.data;
  },

  async getProductDetail(id: string) {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  async searchProducts(keyword: string) {
    const response = await api.get(`/products/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data.data;
  },
};
