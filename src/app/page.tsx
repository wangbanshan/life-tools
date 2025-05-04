import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto py-10 space-y-8 max-w-4xl">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">生活工具集</h1>
        <p className="text-muted-foreground">实用工具，让生活更美好</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>早睡早起打卡</CardTitle>
            <CardDescription>
              养成健康的睡眠习惯，记录你的睡眠时间
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/check-in">
              <Button className="w-full">立即打卡</Button>
            </Link>
          </CardContent>
        </Card>
        
        {/* 未来可以添加更多工具卡片 */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle>更多实用工具</CardTitle>
            <CardDescription>
              更多实用工具正在开发中...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>即将上线</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
