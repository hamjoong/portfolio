'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { productService } from '@/services/product.service';
import { adminService } from '@/services/admin.service';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';

/**
 * 관리자가 상품 정보를 수정하는 페이지입니다.
 */
export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    options: [] as { optionType: string; optionName: string; additionalPrice: number; stockQuantity: number }[],
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const product = await productService.getProduct(id as any);
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          stockQuantity: product.stockQuantity,
          options: product.options?.map(o => ({
              optionType: o.optionType,
              optionName: o.optionName,
              additionalPrice: o.additionalPrice,
              stockQuantity: o.stockQuantity
          })) || [],
          imageUrl: product.mainImageUrl || '',
        });
      } catch (err) {
        console.error(err);
        alert('상품 정보를 불러오는 데 실패했습니다.');
        router.back();
      }
    };
    fetchProduct();
  }, [id, router]);

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { optionType: '', optionName: '', additionalPrice: 0, stockQuantity: 0 }],
    });
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const updateOption = (index: number, field: string, value: string | number) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        try {
          const presignedUrl = await productService.getUploadUrl(imageFile.name);
          await axios.put(presignedUrl, imageFile, {
            headers: { 'Content-Type': imageFile.type },
          });
          imageUrl = presignedUrl.split('?')[0].replace('raw/', 'optimized/').replace(/\.[^.]+$/, ".webp");
        } catch (uploadErr) {
          console.warn('[Admin] S3 upload failed, using existing/default.');
        }
      }

      await adminService.updateProduct(id, {
        ...formData,
        imageUrl,
      });

      alert('상품이 성공적으로 수정되었습니다.');
      router.push('/admin/products');
    } catch (err) {
      console.error('[Admin] Product update failed:', err);
      alert('상품 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">상품 수정</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="상품명"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="상품 이름을 입력하세요"
            required
          />
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">상품 설명</label>
            <textarea
              className="w-full rounded-md border border-gray-300 p-3 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="상품에 대한 상세 설명을 작성하세요"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="가격 (원)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
            />
            <Input
              label="재고 (개)"
              type="number"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700">상품 옵션</label>
              <Button type="button" onClick={addOption} size="sm">옵션 추가</Button>
            </div>
            {formData.options.map((option, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 items-end border p-4 rounded-md">
                <Input label="분류" value={option.optionType} onChange={(e) => updateOption(index, 'optionType', e.target.value)} />
                <Input label="이름" value={option.optionName} onChange={(e) => updateOption(index, 'optionName', e.target.value)} />
                <Input label="추가금" type="number" value={option.additionalPrice} onChange={(e) => updateOption(index, 'additionalPrice', Number(e.target.value))} />
                <Input label="재고" type="number" value={option.stockQuantity} onChange={(e) => updateOption(index, 'stockQuantity', Number(e.target.value))} />
                <Button type="button" onClick={() => removeOption(index)} className="bg-red-500 hover:bg-red-600">삭제</Button>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">상품 이미지 (변경 시 선택)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-sm text-gray-500"
            />
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            상품 수정하기
          </Button>
        </form>
      </div>
    </div>
  );
}
