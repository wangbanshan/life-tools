'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Input } from '@/components/ui/input';
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
import { CATEGORY_ICON_OPTIONS, CATEGORY_COLOR_OPTIONS, getIconComponent } from './constants';

// Zod Schema 定义
const categoryFormSchema = z.object({
  name: z.string()
    .min(1, { message: "请输入分类名称" })
    .max(20, { message: "分类名称不能超过20个字符" }),
  icon: z.string().optional(),
  color: z.string().min(1, { message: "请选择一个颜色" }),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  initialValues?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => void;
  children?: React.ReactNode; // 用于自定义按钮布局
}

export default function CategoryForm({
  initialValues,
  onSubmit,
  children,
}: CategoryFormProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialValues?.name || '',
      icon: initialValues?.icon || '',
      color: initialValues?.color || CATEGORY_COLOR_OPTIONS[0].value,
    },
  });

  const selectedIcon = form.watch('icon');
  const selectedColor = form.watch('color');

  const handleFormSubmit = (values: CategoryFormData) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* 分类名称 */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>分类名称</FormLabel>
              <FormControl>
                <Input
                  placeholder="输入分类名称"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 图标选择 */}
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>图标</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择图标">
                      {selectedIcon && (() => {
                        const IconComponent = getIconComponent(selectedIcon);
                        const iconOption = CATEGORY_ICON_OPTIONS.find(opt => opt.value === selectedIcon);
                        return (
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" style={{ color: selectedColor }} />
                            <span>{iconOption?.label}</span>
                          </div>
                        );
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORY_ICON_OPTIONS.map((option) => {
                    const IconComponent = getIconComponent(option.value);
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* 颜色选择 */}
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>颜色</FormLabel>
              <FormControl>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORY_COLOR_OPTIONS.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        field.value === colorOption.value 
                          ? 'border-gray-400 scale-110' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: colorOption.value }}
                      onClick={() => field.onChange(colorOption.value)}
                      title={colorOption.label}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 自定义按钮区域 */}
        {children}
      </form>
    </Form>
  );
} 