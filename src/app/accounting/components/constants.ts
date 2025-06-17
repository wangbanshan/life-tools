import * as LucideIcons from 'lucide-react';

// === 分类相关常量 ===

// 可选的图标列表
export const CATEGORY_ICON_OPTIONS = [
  { value: 'utensils', label: '餐具', icon: 'Utensils' },
  { value: 'shirt', label: '衣服', icon: 'Shirt' },
  { value: 'car', label: '汽车', icon: 'Car' },
  { value: 'home', label: '房屋', icon: 'Home' },
  { value: 'gamepad-2', label: '娱乐', icon: 'Gamepad2' },
  { value: 'shopping-cart', label: '购物', icon: 'ShoppingCart' },
  { value: 'heart-pulse', label: '健康', icon: 'HeartPulse' },
  { value: 'graduation-cap', label: '教育', icon: 'GraduationCap' },
  { value: 'coffee', label: '咖啡', icon: 'Coffee' },
  { value: 'fuel', label: '燃料', icon: 'Fuel' },
  { value: 'plane', label: '旅行', icon: 'Plane' },
  { value: 'gift', label: '礼品', icon: 'Gift' },
  { value: 'book', label: '书籍', icon: 'Book' },
  { value: 'laptop', label: '电子', icon: 'Laptop' },
  { value: 'dumbbell', label: '健身', icon: 'Dumbbell' },
  { value: 'more-horizontal', label: '其他', icon: 'MoreHorizontal' },
];

// 可选的颜色列表
export const CATEGORY_COLOR_OPTIONS = [
  { value: '#3b82f6', label: '蓝色' },
  { value: '#10b981', label: '绿色' },
  { value: '#f59e0b', label: '黄色' },
  { value: '#ef4444', label: '红色' },
  { value: '#8b5cf6', label: '紫色' },
  { value: '#f97316', label: '橙色' },
  { value: '#06b6d4', label: '青色' },
  { value: '#ec4899', label: '粉色' },
  { value: '#6b7280', label: '灰色' },
];

// === 分类相关工具函数 ===

// 动态获取Lucide图标组件
export const getIconComponent = (iconName: string) => {
  const toPascalCase = (str: string) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  };
  
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[toPascalCase(iconName)];
  return IconComponent || LucideIcons.MoreHorizontal;
};

// === 其他常量可以在此处添加 === 