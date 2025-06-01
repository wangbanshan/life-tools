'use client';

import { useState } from 'react';
import { format } from 'date-fns';
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
import { 
  TRANSACTION_CATEGORIES, 
  CreateTransactionPayload,
  TransactionCategory 
} from '../types';
import { useAddTransaction } from '@/lib/hooks/useAccountingRecords';

interface AccountingFormProps {
  defaultDate?: string;
}

export default function AccountingForm({ defaultDate }: AccountingFormProps) {
  const [formData, setFormData] = useState<CreateTransactionPayload>({
    date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    category: '餐饮',
    description: ''
  });

  const [amountInput, setAmountInput] = useState<string>('');

  const addTransactionMutation = useAddTransaction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单数据
    if (formData.amount <= 0) {
      alert('请输入有效的消费金额');
      return;
    }
    
    if (!formData.category) {
      alert('请选择消费类型');
      return;
    }

    try {
      await addTransactionMutation.mutateAsync(formData);
      
      // 重置表单，保留日期和类型
      setFormData({
        date: formData.date,
        amount: 0,
        category: formData.category,
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

  const handleCategoryChange = (value: TransactionCategory) => {
    setFormData({ ...formData, category: value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, date: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, description: e.target.value });
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
        <Label htmlFor="category">消费类型</Label>
        <Select 
          value={formData.category} 
          onValueChange={handleCategoryChange}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="请选择消费类型" />
          </SelectTrigger>
          <SelectContent>
            {TRANSACTION_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        disabled={addTransactionMutation.isPending}
      >
        {addTransactionMutation.isPending ? '添加中...' : '添加消费记录'}
      </Button>
    </form>
  );
} 