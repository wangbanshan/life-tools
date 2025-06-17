'use client';

import { Trash2, Settings2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  useTransactionCategories, 
  useDeleteCategory 
} from '@/lib/hooks/useTransactionCategories';
import { TransactionCategory } from '../types';
import { getIconComponent } from './constants';
import CategoryDialog from './CategoryDialog';

// 删除确认对话框
interface DeleteCategoryDialogProps {
  category: TransactionCategory;
  trigger: React.ReactNode;
}

function DeleteCategoryDialog({ category, trigger }: DeleteCategoryDialogProps) {
  const deleteMutation = useDeleteCategory();
  
  const handleDelete = () => {
    deleteMutation.mutate(category.id);
  };
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除分类「{category.name}」吗？此操作无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteMutation.isPending ? '删除中...' : '删除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// 主组件
export default function CategoryManager() {
  const { data: categories, isLoading, error } = useTransactionCategories();
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            分类管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            加载中...
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            分类管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            加载失败，请稍后重试
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // 分离系统预设和自定义分类
  const presetCategories = categories?.filter(cat => cat.is_preset) || [];
  const customCategories = categories?.filter(cat => !cat.is_preset) || [];
  
  const renderCategoryRow = (category: TransactionCategory) => {
    const IconComponent = category.icon ? getIconComponent(category.icon) : null;
    
    return (
      <TableRow key={category.id}>
        <TableCell className="w-12">
          {IconComponent && (
            <IconComponent 
              className="h-5 w-5" 
              style={{ color: category.color || undefined }}
            />
          )}
        </TableCell>
        <TableCell className="font-medium">{category.name}</TableCell>
        <TableCell>
          {category.is_preset ? (
            <Badge variant="secondary">系统预设</Badge>
          ) : (
            <Badge variant="outline">自定义</Badge>
          )}
        </TableCell>
        <TableCell>
          {category.color && (
            <div 
              className="w-6 h-6 rounded-full border border-gray-200" 
              style={{ backgroundColor: category.color }}
              title={category.color}
            />
          )}
        </TableCell>
        <TableCell className="w-24">
          {!category.is_preset && (
            <div className="flex items-center gap-1">
              <CategoryDialog
                category={category}
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                }
              />
              <DeleteCategoryDialog
                category={category}
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          )}
        </TableCell>
      </TableRow>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            分类管理
          </CardTitle>
          <CategoryDialog />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          管理您的消费分类，包括系统预设和自定义分类
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">图标</TableHead>
              <TableHead>分类名称</TableHead>
              <TableHead className="w-24">类型</TableHead>
              <TableHead className="w-16">颜色</TableHead>
              <TableHead className="w-24">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 系统预设分类 */}
            {presetCategories.map(renderCategoryRow)}
            
            {/* 自定义分类 */}
            {customCategories.map(renderCategoryRow)}
            
            {/* 空状态 */}
            {(!categories || categories.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  暂无分类数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {/* 统计信息 */}
        {categories && categories.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            共 {categories.length} 个分类（系统预设 {presetCategories.length} 个，自定义 {customCategories.length} 个）
          </div>
        )}
      </CardContent>
    </Card>
  );
} 