import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// [리팩토링] cva(class-variance-authority) 라이브러리를 도입하여
// 여러 종류의 배지 스타일(색상, 크기 등)을 체계적으로 관리하도록 개선했습니다.
const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        gray: 'bg-gray-100 text-gray-800',
        green: 'bg-green-100 text-green-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        red: 'bg-red-100 text-red-800',
        blue: 'bg-blue-100 text-blue-800',
        purple: 'bg-purple-100 text-purple-800',
      },
    },
    defaultVariants: {
      variant: 'gray',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={badgeVariants({ variant, className })} {...props} />
  );
}

export { Badge, badgeVariants };
