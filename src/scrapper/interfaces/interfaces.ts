export interface PaymentMethod {
  payId: string | null;
  payMethodId: string;
  payType: string;
  payAccount: string | null;
  payBank: string | null;
  paySubBank: string | null;
  identifier: string;
  iconUrlColor: string | null;
  tradeMethodName: string;
  tradeMethodShortName: string;
  tradeMethodBgColor: string;
}

export interface Advertiser {
  userNo: string;
  realName: string | null;
  nickName: string;
  margin: string | null;
  marginUnit: string | null;
  orderCount: string | null;
  monthOrderCount: number;
  monthFinishRate: number;
  advConfirmTime: number | null;
  email: string | null;
  registrationTime: string | null;
  mobile: string | null;
  userType: string;
  tagIconUrls: string[];
  userGrade: number;
  userIdentity: string;
  proMerchant: string | null;
  isBlocked: string | null;
}

export interface Advertisement {
  advNo: string;
  classify: string;
  tradeType: string;
  asset: string;
  fiatUnit: string;
  advStatus: string | null;
  priceType: string | null;
  priceFloatingRatio: string | null;
  rateFloatingRatio: string | null;
  currencyRate: string | null;
  price: string;
  initAmount: string | null;
  surplusAmount: string;
  tradableQuantity: string;
  amountAfterEditing: string | null;
  maxSingleTransAmount: string;
  minSingleTransAmount: string;
  buyerKycLimit: string | null;
  buyerRegDaysLimit: string | null;
  buyerBtcPositionLimit: string | null;
  remarks: string | null;
  autoReplyMsg: string | null;
  payTimeLimit: number;
  tradeMethods: PaymentMethod[];
  userTradeCountFilterTime: string | null;
  userBuyTradeCountMin: string | null;
  userBuyTradeCountMax: string | null;
  userSellTradeCountMin: string | null;
}

export interface APIDataItem {
  adv: Advertisement;
  advertiser: Advertiser;
}

export interface APIResponse {
  code: string;
  message: string | null;
  messageDetail: string | null;
  data: APIDataItem[];
  total: number;
  success: boolean;
}
