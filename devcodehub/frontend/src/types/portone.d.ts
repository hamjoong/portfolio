interface IamportResponse {
  success: boolean;
  imp_uid?: string;
  merchant_uid?: string;
  error_msg?: string;
  [key: string]: unknown;
}

interface IamportRequest {
  pg: string;
  pay_method: string;
  merchant_uid: string;
  name: string;
  amount: number;
  buyer_email?: string;
  buyer_name?: string;
  [key: string]: unknown;
}

interface IMP {
  init: (accountCode: string) => void;
  request_pay: (
    request: IamportRequest,
    callback: (response: IamportResponse) => void
  ) => void;
}

interface Window {
  IMP: IMP;
}
