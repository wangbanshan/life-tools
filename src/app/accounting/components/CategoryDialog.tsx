'use client';

import { useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  useAddCategory, 
  useUpdateCategory 
} from '@/lib/hooks/useTransactionCategories';
import { TransactionCategory, CreateCategoryPayload, UpdateCategoryPayload } from '../types';
import CategoryForm, { CategoryFormData } from './CategoryForm';

interface CategoryDialogProps {
  category?: TransactionCategory; // 如果有category说明是编辑模式，否则是添加模式
  trigger?: React.ReactNode;
}

export default function CategoryDialog({ category, trigger }: CategoryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const addMutation = useAddCategory();
  const updateMutation = useUpdateCategory();
  
  const isEditMode = !!category;
  const mutation = isEditMode ? updateMutation : addMutation;
  
  const handleSubmit = (data: CategoryFormData) => {
    if (isEditMode && category) {
      // 编辑模式
      const payload: UpdateCategoryPayload = {
        name: data.name.trim(),
        icon: data.icon || undefined,
        color: data.color,
      };
      
      updateMutation.mutate(
        { id: category.id, payload },
        {
          onSuccess: () => {
            setIsOpen(false);
          },
        }
      );
    } else {
      // 添加模式
      const payload: CreateCategoryPayload = {
        name: data.name.trim(),
        icon: data.icon || undefined,
        color: data.color,
      };
      
      addMutation.mutate(payload, {
        onSuccess: () => {
          setIsOpen(false);
        },
      });
    }
  };
  
  const defaultTrigger = isEditMode ? (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
    >
      <Edit2 className="h-4 w-4" />
    </Button>
  ) : (
    <Button className="gap-2">
      <Plus className="h-4 w-4" />
      添加分类
    </Button>
  );

  // 准备初始值（编辑模式）
  const initialValues = isEditMode && category ? {
    name: category.name,
    icon: category.icon || '',
    color: category.color || '',
  } : undefined;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? '编辑分类' : '添加分类'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? '修改该消费分类的名称、图标和颜色。' 
              : '创建一个新的消费分类。'
            }
          </DialogDescription>
        </DialogHeader>
        
        <CategoryForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending 
                ? (isEditMode ? '保存中...' : '添加中...') 
                : (isEditMode ? '保存' : '添加')
              }
            </Button>
          </DialogFooter>
        </CategoryForm>
      </DialogContent>
    </Dialog>
  );
} 