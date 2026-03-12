export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export interface ReviewRequest {
  productId: string;
  orderId: string;
  rating: number;
  content: string;
  imageUrl?: string;
}

export interface ProductQna {
  id: string;
  userId: string;
  productId: string;
  title: string;
  content: string;
  answer?: string;
  isAnswered: boolean;
  createdAt: string;
}

export interface ProductQnaRequest {
  productId: string;
  title: string;
  content: string;
}
