// ── Kitchen Order Types ──

export interface KitchenTable {
  id: number;
  code: string;
  name: string;
  hall_name: (string | null)[];
}

export interface KitchenCaptainOrder {
  id: number;
  name: string;
  user_name: string;
}

export interface KitchenVariation {
  name: string | null;
  options: (string | null)[];
}

export interface KitchenAddon {
  name: string | null;
  price: number;
}

export interface KitchenOrderItem {
  id: number;
  product_id: number;
  product_name: string | null;
  quantity: number;
  price: number;
  note: string;
  variations: KitchenVariation[];
  addons: KitchenAddon[];
}

export interface KitchenOrder {
  type: string;
  id: number;
  order_id: number;
  module: string;
  status: string;
  table: KitchenTable;
  captain_order: KitchenCaptainOrder;
  items: KitchenOrderItem[];
  total: number;
  completed_at: string | null;
  created_at: string;
}

export interface KitchenOrdersResponse {
  status: boolean;
  data: KitchenOrder[];
}

export interface KitchenDoneOrdersResponse {
  status: boolean;
  data: KitchenOrder[];
  count: number;
}

export interface KitchenCheckNewResponse {
  status: boolean;
  difference: Record<string, unknown>;
  new_orders: (KitchenOrder | null)[];
}
