'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CreateTransactionPayload, TransactionCategory } from '../types';
import { useAddTransaction } from '@/lib/hooks/useAccountingRecords';
import { useTransactionCategories } from '@/lib/hooks/useTransactionCategories';

// Zod Schema 定义 - 分为输入和输出类型
const formInputSchema = z.object({
  date: z.date({
    required_error: "请选择一个消费日期。",
  }),
  amount: z.string().min(1, { message: "请输入消费金额" }),
  category_id: z.string().min(1, { message: "请选择一个消费类型。" }),
  description: z.string().optional(),
});

const formOutputSchema = formInputSchema.extend({
  amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "请输入一个大于0的有效金额",
  }).transform(val => parseFloat(val)),
});

type FormInputData = z.infer<typeof formInputSchema>;

interface AccountingFormProps {
  defaultDate?: string;
  onSuccess?: () => void;
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

export default function AccountingForm({ defaultDate, onSuccess }: AccountingFormProps) {
  const form = useForm<FormInputData>({
    resolver: zodResolver(formInputSchema),
    defaultValues: {
      date: defaultDate ? new Date(defaultDate) : new Date(),
      amount: '',
      category_id: "",
      description: "",
    },
  });

  const addTransactionMutation = useAddTransaction();
  const { data: categories, isLoading: categoriesLoading } = useTransactionCategories();

  function handleFormSubmit(values: FormInputData) {
    // 验证并转换数据
    const result = formOutputSchema.safeParse(values);
    
    if (!result.success) {
      // 如果验证失败，设置表单错误
      result.error.errors.forEach((error) => {
        if (error.path[0] === 'amount') {
          form.setError('amount', { message: error.message });
        }
      });
      return;
    }

    const payload: CreateTransactionPayload = {
      date: format(result.data.date, 'yyyy-MM-dd'),
      amount: result.data.amount,
      category_id: result.data.category_id,
      description: result.data.description || '',
    };

    addTransactionMutation.mutate(payload, {
      onSuccess: () => {
        form.reset({
          date: form.getValues("date"), // 保留上次选择的日期
          amount: '',
          category_id: "",
          description: "",
        });
        // 调用父组件传入的成功回调
        if (onSuccess) {
          onSuccess();
        }
      },
    });
  }

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* 日期选择 */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>消费日期</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "yyyy-MM-dd")
                      ) : (
                        <span>选择日期</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 金额输入 */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>消费金额 (¥)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="decimal" // 移动端唤起数字键盘
                  placeholder="0.00"
                  value={value || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    // 允许输入数字和小数点
                    if (/^\d*\.?\d{0,2}$/.test(val) || val === '') {
                      onChange(val);
                    }
                  }}
                  {...rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 消费类型选择 */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>消费类型</FormLabel>
              
              {categoriesLoading ? (
                <div className="text-center py-2 text-gray-500 text-sm">
                  加载类型中...
                </div>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择消费类型">
                        {field.value && categories && (() => {
                          const selectedCategory = categories.find(cat => cat.id === field.value);
                          return selectedCategory ? renderCategoryOption(selectedCategory) : null;
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {renderCategoryOption(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 消费描述 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>消费描述（可选）</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="添加一些关于这笔消费的说明..."
                  className="min-h-[60px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 提交按钮 */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={addTransactionMutation.isPending}
        >
          {addTransactionMutation.isPending ? "添加中..." : "添加消费记录"}
        </Button>
      </form>
    </Form>
  );
} 