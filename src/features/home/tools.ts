import {
  IconCalendarRepeat,
  IconLayoutGrid,
  IconUsers,
  IconWallet,
  type Icon,
} from "@tabler/icons-react";

export type ToolAccent = "sage" | "apricot";

export type ToolItem = {
  title: string;
  description: string;
  detail: string;
  accent: ToolAccent;
  Icon: Icon;
  requiresAuth?: boolean;
};

export const tools: ToolItem[] = [
  {
    title: "资产台账",
    description: "账户、余额和现金流放进同一张视图。",
    detail: "资产台账会聚合账户、存款、支出和余额变化，方便你回看一段时间里的真实财务状态。",
    accent: "sage",
    Icon: IconWallet,
  },
  {
    title: "订阅日历",
    description: "看清续费日、周期和固定支出。",
    detail: "订阅日历会记录服务名称、金额、续费周期和提醒时间，帮你提前处理不想继续付费的项目。",
    accent: "apricot",
    Icon: IconCalendarRepeat,
  },
  {
    title: "共享账本",
    description: "多人收支记录，关系账目更清楚。",
    detail: "共享账本适合家庭、搭子或小团队一起记录共同花销，后续会支持成员、分类和结算视图。",
    accent: "sage",
    Icon: IconUsers,
  },
  {
    title: "工具库",
    description: "把新的生活工具慢慢收进来。",
    detail: "工具库会作为后续功能入口，适合放提醒、清单、换算、记录类的小工具。",
    accent: "apricot",
    Icon: IconLayoutGrid,
  },
];
