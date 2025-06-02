'use client';

import { useState } from 'react';
import { Plus, Trash2, Settings2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  useTransactionCategories,
  useAddCategory,
  useDeleteCategory
} from '@/lib/hooks/useTransactionCategories';
import { TransactionCategory, CreateCategoryPayload } from '../types';

// 可选的图标列表
const AVAILABLE_ICONS = [
  { name: 'utensils', label: '餐饮' },
  { name: 'shirt', label: '衣物' },
  { name: 'car', label: '交通' },
  { name: 'shopping-cart', label: '购物' },
  { name: 'gamepad-2', label: '娱乐' },
  { name: 'home', label: '居家' },
  { name: 'book', label: '学习' },
  { name: 'heart', label: '健康' },
  { name: 'phone', label: '通讯' },
  { name: 'coffee', label: '咖啡' },
  { name: 'plane', label: '旅行' },
  { name: 'gift', label: '礼品' },
  { name: 'music', label: '音乐' },
  { name: 'camera', label: '摄影' },
  { name: 'dumbbell', label: '健身' },
  { name: 'laptop', label: '电子' },
  { name: 'palette', label: '艺术' },
  { name: 'more-horizontal', label: '其他' },
];

// 可选的颜色列表
const AVAILABLE_COLORS = [
  { value: '#ef4444', label: '红色' },
  { value: '#f97316', label: '橙色' },
  { value: '#f59e0b', label: '黄色' },
  { value: '#10b981', label: '绿色' },
  { value: '#06b6d4', label: '青色' },
  { value: '#3b82f6', label: '蓝色' },
  { value: '#8b5cf6', label: '紫色' },
  { value: '#ec4899', label: '粉色' },
  { value: '#6b7280', label: '灰色' },
];

interface ManageCategoriesDialogProps {
  children: React.ReactNode;
}

// 动态获取Lucide图标组件
const getIconComponent = (iconName: string) => {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[toPascalCase(iconName)];
  return IconComponent || LucideIcons.MoreHorizontal;
};

// 转换为PascalCase（Lucide图标的命名约定）
const toPascalCase = (str: string) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

export default function ManageCategoriesDialog({ children }: ManageCategoriesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<CreateCategoryPayload>({
    name: '',
    icon: undefined,
    color: undefined
  });
  const [deletingCategory, setDeletingCategory] = useState<TransactionCategory | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Hooks
  const { data: categories, isLoading } = useTransactionCategories();
  const addCategoryMutation = useAddCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      return;
    }

    try {
      await addCategoryMutation.mutateAsync(newCategory);
      
      // 重置表单
      setNewCategory({
        name: '',
        icon: undefined,
        color: undefined
      });
      setIsAddingCategory(false);
    } catch (error) {
      console.error('添加类型失败:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategoryMutation.mutateAsync(deletingCategory.id);
      setDeletingCategory(null);
    } catch (error) {
      console.error('删除类型失败:', error);
    }
  };

  const renderIcon = (category: TransactionCategory) => {
    if (!category.icon) return null;
    
    const IconComponent = getIconComponent(category.icon);
    return (
      <IconComponent 
        className="h-4 w-4" 
        style={{ color: category.color || undefined }}
      />
    );
  };

  const renderIconOption = (iconName: string, label: string) => {
    const IconComponent = getIconComponent(iconName);
    return (
      <div className="flex items-center gap-2">
        <IconComponent className="h-4 w-4" />
        <span>{label}</span>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              管理消费类型
            </DialogTitle>
            <DialogDescription>
              管理您的消费类型，包括添加自定义类型和删除不需要的类型。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* 当前类型列表 */}
            <div>
              <h3 className="text-lg font-medium mb-3">现有类型</h3>
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">加载中...</div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories?.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {renderIcon(category)}
                        <span className="font-medium">{category.name}</span>
                        {category.is_preset && (
                          <Badge variant="secondary" className="text-xs">
                            系统预设
                          </Badge>
                        )}
                      </div>
                      
                      {!category.is_preset && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingCategory(category)}
                          disabled={deleteCategoryMutation.isPending}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 添加新类型表单 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">添加新类型</h3>
                {!isAddingCategory && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingCategory(true)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    添加类型
                  </Button>
                )}
              </div>

              {isAddingCategory && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  {/* 类型名称 */}
                  <div className="space-y-2">
                    <Label htmlFor="category-name">类型名称</Label>
                    <Input
                      id="category-name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="请输入类型名称"
                      className="w-full"
                    />
                  </div>

                  {/* 图标选择 */}
                  <div className="space-y-2">
                    <Label>选择图标</Label>
                    <Select
                      value={newCategory.icon || ''}
                      onValueChange={(value) => setNewCategory({ ...newCategory, icon: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择图标（可选）">
                          {newCategory.icon && renderIconOption(newCategory.icon, '')}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ICONS.map(({ name, label }) => (
                          <SelectItem key={name} value={name}>
                            {renderIconOption(name, label)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 颜色选择 */}
                  <div className="space-y-2">
                    <Label>选择颜色</Label>
                    <div className="flex gap-2 flex-wrap">
                      {AVAILABLE_COLORS.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setNewCategory({ ...newCategory, color: value })}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            newCategory.color === value
                              ? 'border-gray-400 scale-110'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: value }}
                          title={label}
                        />
                      ))}
                    </div>
                    {newCategory.color && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewCategory({ ...newCategory, color: undefined })}
                        className="text-xs"
                      >
                        清除颜色
                      </Button>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategory({ name: '', icon: undefined, color: undefined });
                      }}
                      disabled={addCategoryMutation.isPending}
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleAddCategory}
                      disabled={!newCategory.name.trim() || addCategoryMutation.isPending}
                    >
                      {addCategoryMutation.isPending ? '添加中...' : '添加类型'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除类型？</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <span>您确定要删除这个消费类型吗？此操作无法撤销。</span>
                {deletingCategory && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                    <div className="flex items-center gap-2">
                      {renderIcon(deletingCategory)}
                      <strong>{deletingCategory.name}</strong>
                    </div>
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  注意：如果有消费记录使用了此类型，删除将会失败。
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingCategory(null)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteCategoryMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteCategoryMutation.isPending ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 