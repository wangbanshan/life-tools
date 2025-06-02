'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Settings2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { CreateTransactionPayload, TransactionCategory } from '../types';
import { useAddTransaction } from '@/lib/hooks/useAccountingRecords';
import { useTransactionCategories } from '@/lib/hooks/useTransactionCategories';
import ManageCategoriesDialog from './ManageCategoriesDialog';

interface AccountingFormProps {
  defaultDate?: string;
}

// 动态获取Lucide图标组件
const getIconComponent = (iconName: string) => {
  const toPascalCase = (str: string) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  };
  
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[toPascalCase(iconName)];
  return IconComponent || LucideIcons.MoreHorizontal;
};

export default function AccountingForm({ defaultDate }: AccountingFormProps) {
  const [formData, setFormData] = useState<CreateTransactionPayload>({
    date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    category_id: '', // 改为使用category_id
    description: ''
  });

  const [amountInput, setAmountInput] = useState<string>('');

  const addTransactionMutation = useAddTransaction();
  const { data: categories, isLoading: categoriesLoading } = useTransactionCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单数据
    if (formData.amount <= 0) {
      alert('请输入有效的消费金额');
      return;
    }
    
    if (!formData.category_id) {
      alert('请选择消费类型');
      return;
    }

    try {
      await addTransactionMutation.mutateAsync(formData);
      
      // 重置表单，保留日期和类型
      setFormData({
        date: formData.date,
        amount: 0,
        category_id: '',
        description: ''
      });
      setAmountInput(''); // 重置金额输入
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // 直接更新输入状态
    setAmountInput(inputValue);
    
    // 转换为数字值
    const numericValue = parseFloat(inputValue) || 0;
    setFormData({ ...formData, amount: numericValue });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category_id: value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, date: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, description: e.target.value });
  };

  // 渲染类型选项，包含图标
  const renderCategoryOption = (category: TransactionCategory) => {
    if (!category.icon) {
      return <span>{category.name}</span>;
    }

    const IconComponent = getIconComponent(category.icon);
    return (
      <div className="flex items-center gap-2">
        <IconComponent 
          className="h-4 w-4" 
          style={{ color: category.color || undefined }}
        />
        <span>{category.name}</span>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 日期选择 */}
      <div className="space-y-2">
        <Label htmlFor="date">消费日期</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={handleDateChange}
          required
          className="w-full"
        />
      </div>

      {/* 金额输入 */}
      <div className="space-y-2">
        <Label htmlFor="amount">消费金额 (¥)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={amountInput}
          onChange={handleAmountChange}
          placeholder="请输入消费金额"
          required
          className="w-full"
        />
      </div>

      {/* 消费类型选择 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="category">消费类型</Label>
          <ManageCategoriesDialog>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs"
            >
              <Settings2 className="h-3 w-3" />
              管理
            </Button>
          </ManageCategoriesDialog>
        </div>
        
        {categoriesLoading ? (
          <div className="text-center py-2 text-gray-500 text-sm">
            加载类型中...
          </div>
        ) : (
          <Select 
            value={formData.category_id} 
            onValueChange={handleCategoryChange}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="请选择消费类型">
                {formData.category_id && categories && (() => {
                  const selectedCategory = categories.find(cat => cat.id === formData.category_id);
                  return selectedCategory ? renderCategoryOption(selectedCategory) : null;
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {renderCategoryOption(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* 备注输入 */}
      <div className="space-y-2">
        <Label htmlFor="description">备注说明</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={handleDescriptionChange}
          placeholder="请输入消费备注（可选）"
          rows={3}
          className="w-full resize-none"
        />
      </div>

      {/* 提交按钮 */}
      <Button 
        type="submit" 
        className="w-full"
        disabled={addTransactionMutation.isPending || categoriesLoading}
      >
        {addTransactionMutation.isPending ? '添加中...' : '添加消费记录'}
      </Button>
    </form>
  );
} 