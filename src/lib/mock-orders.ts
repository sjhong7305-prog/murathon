export interface MockOrder {
  id: string;
  buyerNickname: string;
  productId: string;
  price: number;
  cheerMessage?: string;
  promptQuestion?: string;
  promptAnswer?: string;
  isSupporter: boolean;
  reactions: { heart: number; pray: number };
}

export const mockOrders: MockOrder[] = [];
