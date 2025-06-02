'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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
  useDailyTransactions, 
  useDeleteTransaction, 
  formatAmount 
} from '@/lib/hooks/useAccountingRecords';
import { Transaction } from '../types';

interface AccountingListProps {
  selectedDate: string;
}

export default function AccountingList({ selectedDate }: AccountingListProps) {
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  
  // 获取选中日期的消费记录
  const { data: transactions, isLoading } = useDailyTransactions(selectedDate);
  const deleteTransactionMutation = useDeleteTransaction();
  
  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    
    try {
      await deleteTransactionMutation.mutateAsync(deletingTransaction.id);
      setDeletingTransaction(null); // 关闭对话框
    } catch (error) {
      console.error('删除失败:', error);
      // 错误处理已经在mutation的onError中处理了
    }
  };
  
  // 计算当日总消费
  const totalAmount = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
  
  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        加载中...
      </div>
    );
  }
  
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>当日暂无消费记录</p>
        <p className="text-sm mt-2">点击左侧表单添加消费记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 当日消费汇总 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">当日总消费</p>
          <p className="text-xl font-semibold text-red-600 dark:text-red-400">
            {formatAmount(totalAmount)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">消费笔数</p>
          <p className="text-xl font-semibold">{transactions.length}</p>
        </div>
      </div>
      
      {/* 消费记录表格 */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>时间</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>备注</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {format(new Date(transaction.created_at), 'HH:mm')}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {/* 显示类型名称，使用关联的类型信息 */}
                    {transaction.transaction_categories?.name || '未知类型'}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-red-600 dark:text-red-400">
                  {formatAmount(transaction.amount)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {transaction.description || '-'}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deleteTransactionMutation.isPending}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeletingTransaction(transaction)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除？</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                          <div className="space-y-2">
                            <span>您确定要删除这条消费记录吗？此操作无法撤销。</span>
                            {deletingTransaction && (
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                                <div><strong>类型：</strong>{deletingTransaction.transaction_categories?.name || '未知类型'}</div>
                                <div><strong>金额：</strong>{formatAmount(deletingTransaction.amount)}</div>
                                {deletingTransaction.description && (
                                  <div><strong>备注：</strong>{deletingTransaction.description}</div>
                                )}
                              </div>
                            )}
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingTransaction(null)}>
                          取消
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteConfirm}
                          disabled={deleteTransactionMutation.isPending}
                          className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                          {deleteTransactionMutation.isPending ? '删除中...' : '确认删除'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 