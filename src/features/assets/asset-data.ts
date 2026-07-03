import {
  IconBrandAlipay,
  IconBrandPaypal,
  IconBrandWechat,
  IconBriefcase2,
  IconBuildingBank,
  IconBuildingCommunity,
  IconBus,
  IconCash,
  IconCashBanknote,
  IconChartDonut2,
  IconCoins,
  IconCreditCard,
  IconCurrencyYuan,
  IconDeviceMobile,
  IconDiamond,
  IconPigMoney,
  IconReceiptYuan,
  IconShieldHeart,
  IconWallet,
  type Icon,
} from "@tabler/icons-react";

export type AssetKind = "asset" | "liability";

export type AssetGroupId = "cash" | "credit" | "stored" | "investment" | "other";

export type AssetType = {
  id: string;
  name: string;
  groupId: AssetGroupId;
  color: string;
  Icon: Icon;
  kind: AssetKind;
};

export type AssetGroup = {
  id: AssetGroupId;
  name: string;
};

export type AssetAccount = {
  id: string;
  typeId: string;
  name: string;
  note: string;
  balance: number;
  currency: string;
  includeInTotal: boolean;
  createdAt: string;
};

export const assetGroups: AssetGroup[] = [
  { id: "cash", name: "资金账户" },
  { id: "credit", name: "信用卡账户" },
  { id: "stored", name: "充值账户" },
  { id: "investment", name: "投资账户" },
  { id: "other", name: "其它账户" },
];

export const assetTypes: AssetType[] = [
  { id: "cash", name: "现金", groupId: "cash", color: "#6f7de8", Icon: IconCash, kind: "asset" },
  { id: "wechat", name: "微信", groupId: "cash", color: "#1fbf72", Icon: IconBrandWechat, kind: "asset" },
  { id: "alipay", name: "支付宝", groupId: "cash", color: "#2388f2", Icon: IconBrandAlipay, kind: "asset" },
  { id: "bank-card", name: "银行卡", groupId: "cash", color: "#4f9ddf", Icon: IconCreditCard, kind: "asset" },
  { id: "bank", name: "银行", groupId: "cash", color: "#d82445", Icon: IconBuildingBank, kind: "asset" },
  { id: "provident-fund", name: "公积金", groupId: "cash", color: "#7957d5", Icon: IconReceiptYuan, kind: "asset" },
  { id: "yu-ebao", name: "余额宝", groupId: "cash", color: "#1a9be6", Icon: IconPigMoney, kind: "asset" },
  { id: "jd-finance", name: "京东金融", groupId: "cash", color: "#f0323f", Icon: IconWallet, kind: "asset" },
  { id: "medical", name: "医保", groupId: "cash", color: "#6a58d7", Icon: IconShieldHeart, kind: "asset" },
  { id: "digital-cny", name: "数字人民币", groupId: "cash", color: "#da1f2d", Icon: IconCurrencyYuan, kind: "asset" },
  { id: "paypal", name: "Paypal", groupId: "cash", color: "#2d8bc7", Icon: IconBrandPaypal, kind: "asset" },
  { id: "other-cash", name: "其它", groupId: "cash", color: "#7c68d9", Icon: IconCoins, kind: "asset" },

  { id: "credit-card", name: "信用卡", groupId: "credit", color: "#eb704c", Icon: IconCreditCard, kind: "liability" },
  { id: "huabei", name: "花呗", groupId: "credit", color: "#3997de", Icon: IconWallet, kind: "liability" },
  { id: "jiebei", name: "借呗", groupId: "credit", color: "#348bd7", Icon: IconCoins, kind: "liability" },
  { id: "jd-baitiao", name: "京东白条", groupId: "credit", color: "#ef4046", Icon: IconWallet, kind: "liability" },
  { id: "meituan", name: "美团月付", groupId: "credit", color: "#f4ba24", Icon: IconCreditCard, kind: "liability" },
  { id: "wechat-credit", name: "微信分付", groupId: "credit", color: "#4fac59", Icon: IconBrandWechat, kind: "liability" },
  { id: "other-credit", name: "其它信用卡", groupId: "credit", color: "#7c68d9", Icon: IconCreditCard, kind: "liability" },

  { id: "phone", name: "话费", groupId: "stored", color: "#f1662f", Icon: IconDeviceMobile, kind: "asset" },
  { id: "utilities", name: "水电", groupId: "stored", color: "#3b9d9a", Icon: IconCashBanknote, kind: "asset" },
  { id: "meal-card", name: "饭卡", groupId: "stored", color: "#f07b2f", Icon: IconWallet, kind: "asset" },
  { id: "deposit", name: "押金", groupId: "stored", color: "#2f78db", Icon: IconBuildingCommunity, kind: "asset" },
  { id: "transport", name: "公交卡", groupId: "stored", color: "#5b7283", Icon: IconBus, kind: "asset" },

  { id: "fund", name: "基金", groupId: "investment", color: "#d55345", Icon: IconChartDonut2, kind: "asset" },
  { id: "stock", name: "股票", groupId: "investment", color: "#3f8c63", Icon: IconBriefcase2, kind: "asset" },
  { id: "wealth", name: "理财", groupId: "investment", color: "#c18a2b", Icon: IconDiamond, kind: "asset" },
  { id: "other", name: "自定义账户", groupId: "other", color: "#6b6f7a", Icon: IconWallet, kind: "asset" },
];

export const assetTypesById = assetTypes.reduce<Record<string, AssetType>>((acc, type) => {
  acc[type.id] = type;
  return acc;
}, {});
