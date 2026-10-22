# Cashier Orders API - Complete Documentation

## Overview

This document provides complete documentation for the Cashier Orders API endpoints with full response structures including all nested relationships.

---

## Table of Contents

1. [Get Orders List](#1-get-orders-list)
2. [Get Order Details](#2-get-order-details)
3. [Data Models](#3-data-models)

---

## 1. Get Orders List

Retrieves a paginated list of orders with optional filtering.

**Endpoint:** `GET /api/cashier/orders`  
**Auth:** `auth:cashier`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `per_page` | integer | No | Items per page (default: 15) |
| `shift_id` | integer | No | Filter by shift ID |
| `module` | string | No | Filter by order type: `takeaway`, `dinein`, `delivery` |
| `status` | string | No | Filter by order status |
| `paid` | boolean | No | Filter by payment status |
| `search` | string | No | Search by order number, customer name, or phone |
| `date_from` | string | No | Filter from date (format: YYYY-MM-DD) |
| `date_to` | string | No | Filter to date (format: YYYY-MM-DD) |

### Response (200 OK)

```json
{
  "data": [
    {
      "id": 123,
      "shift_id": 5,
      "shift_name": "Morning Shift",
      "cashier_id": 2,
      "cashier_man_id": 8,
      "hall_table_id": null,
      "financial_account_id": 1,
      "financial_id": 1,
      "payment_method_id": 1,
      "delivery_id": 2,
      "branch_id": 1,
      "module": "delivery",
      "address": "123 Main Street, Building 5",
      "lat": 30.0444,
      "lng": 31.2357,
      "note": "Ring the bell twice",
      "phone": "01012345678",
      "name": "Ahmed Mohamed",
      "is_pos": true,
      "paid": false,
      "status": "out_of_delivery",
      "total": 150.00,
      "total_tax": 15.00,
      "total_discount": 10.00,
      "final_price": 155.00,
      "created_at": "2026-10-21T10:30:00.000000Z",
      "updated_at": "2026-10-21T10:35:00.000000Z",
      
      "financial_account": {
        "id": 1,
        "name": ["Cash Register 1", "الخزينة 1"],
        "icon": "cash-icon.png",
        "balance": 5000.00,
        "status": true,
        "is_cash": true,
        "branch_id": 1,
        "branch": {
          "id": 1,
          "name": ["Main Branch", "الفرع الرئيسي"]
        },
        "created_at": "2026-01-01T00:00:00.000000Z",
        "updated_at": "2026-10-21T10:00:00.000000Z"
      },
      
      "payment_method": {
        "id": 1,
        "name": ["Cash", "نقدي"],
        "description": ["Cash on Delivery", "الدفع عند الاستلام"],
        "icon": "cash.png",
        "status": true,
        "is_cash": true,
        "created_at": "2026-01-01T00:00:00.000000Z",
        "updated_at": "2026-01-01T00:00:00.000000Z"
      },
      
      "delivery": {
        "id": 2,
        "name": "Captain Mahmoud Ali",
        "phone": "01098765432",
        "id_images": ["/uploads/id-front.jpg", "/uploads/id-back.jpg"],
        "branch_id": 1,
        "branch": {
          "id": 1,
          "name": ["Main Branch", "الفرع الرئيسي"],
          "user_name": "main_branch",
          "address": "Downtown, Cairo",
          "location": [30.0444, 31.2357],
          "watts": "+201234567890",
          "facebook": "https://facebook.com/mainbranch",
          "status": true,
          "role": "branch",
          "created_at": "2026-01-01T00:00:00.000000Z",
          "updated_at": "2026-10-20T00:00:00.000000Z"
        },
        "created_at": "2026-02-01T00:00:00.000000Z",
        "updated_at": "2026-10-01T00:00:00.000000Z"
      },
      
      "branch": {
        "id": 1,
        "name": ["Main Branch", "الفرع الرئيسي"],
        "user_name": "main_branch",
        "address": "Downtown, Cairo",
        "location": [30.0444, 31.2357],
        "watts": "+201234567890",
        "facebook": "https://facebook.com/mainbranch",
        "status": true,
        "role": "branch",
        "created_at": "2026-01-01T00:00:00.000000Z",
        "updated_at": "2026-10-20T00:00:00.000000Z"
      },
      
      "shift": {
        "id": 5,
        "name": ["Morning Shift", "وردية الصباح"],
        "start_time": "08:00:00",
        "end_time": "16:00:00",
        "branch_id": 1,
        "is_tomorrow": false,
        "branch": {
          "id": 1,
          "name": ["Main Branch", "الفرع الرئيسي"],
          "user_name": "main_branch",
          "address": "Downtown, Cairo",
          "location": [30.0444, 31.2357],
          "watts": "+201234567890",
          "facebook": "https://facebook.com/mainbranch",
          "status": true,
          "role": "branch",
          "created_at": "2026-01-01T00:00:00.000000Z",
          "updated_at": "2026-10-20T00:00:00.000000Z"
        },
        "created_at": "2026-01-01T00:00:00.000000Z",
        "updated_at": "2026-01-01T00:00:00.000000Z"
      },
      
      "cashier": {
        "id": 2,
        "name": "Cashier Device 2",
        "cashier_man_id": 8,
        "branch_id": 1,
        "branch": {
          "id": 1,
          "name": ["Main Branch", "الفرع الرئيسي"],
          "user_name": "main_branch",
          "address": "Downtown, Cairo",
          "location": [30.0444, 31.2357],
          "watts": "+201234567890",
          "facebook": "https://facebook.com/mainbranch",
          "status": true,
          "role": "branch",
          "created_at": "2026-01-01T00:00:00.000000Z",
          "updated_at": "2026-10-20T00:00:00.000000Z"
        },
        "created_at": "2026-01-01T00:00:00.000000Z",
        "updated_at": "2026-10-01T00:00:00.000000Z"
      },
      
      "cashier_man": {
        "id": 8,
        "name": "Mohamed Hassan",
        "cashier_id": 2,
        "branch_id": 1,
        "shift_id": 5,
        "role": "cashier",
        "branch": {
          "id": 1,
          "name": ["Main Branch", "الفرع الرئيسي"],
          "user_name": "main_branch",
          "address": "Downtown, Cairo",
          "location": [30.0444, 31.2357],
          "watts": "+201234567890",
          "facebook": "https://facebook.com/mainbranch",
          "status": true,
          "role": "branch",
          "created_at": "2026-01-01T00:00:00.000000Z",
          "updated_at": "2026-10-20T00:00:00.000000Z"
        },
        "cashier": {
          "id": 2,
          "name": "Cashier Device 2",
          "cashier_man_id": 8,
          "branch_id": 1,
          "branch": {
            "id": 1,
            "name": ["Main Branch", "الفرع الرئيسي"],
            "user_name": "main_branch",
            "address": "Downtown, Cairo",
            "location": [30.0444, 31.2357],
            "watts": "+201234567890",
            "facebook": "https://facebook.com/mainbranch",
            "status": true,
            "role": "branch",
            "created_at": "2026-01-01T00:00:00.000000Z",
            "updated_at": "2026-10-20T00:00:00.000000Z"
          },
          "created_at": "2026-01-01T00:00:00.000000Z",
          "updated_at": "2026-10-01T00:00:00.000000Z"
        },
        "shift": {
          "id": 5,
          "name": ["Morning Shift", "وردية الصباح"],
          "start_time": "08:00:00",
          "end_time": "16:00:00",
          "branch_id": 1,
          "is_tomorrow": false,
          "branch": {
            "id": 1,
            "name": ["Main Branch", "الفرع الرئيسي"],
            "user_name": "main_branch",
            "address": "Downtown, Cairo",
            "location": [30.0444, 31.2357],
            "watts": "+201234567890",
            "facebook": "https://facebook.com/mainbranch",
            "status": true,
            "role": "branch",
            "created_at": "2026-01-01T00:00:00.000000Z",
            "updated_at": "2026-10-20T00:00:00.000000Z"
          },
          "created_at": "2026-01-01T00:00:00.000000Z",
          "updated_at": "2026-01-01T00:00:00.000000Z"
        },
        "created_at": "2026-01-01T00:00:00.000000Z",
        "updated_at": "2026-10-21T08:00:00.000000Z"
      },
      
      "hall_table": null,
      
      "products": [
        {
          "id": 501,
          "order_id": 123,
          "product_id": 45,
          "quantity": 2,
          "name": "Margherita Pizza",
          "name_translations": ["Margherita Pizza", "بيتزا مارجريتا"],
          "price": 75.00,
          "note": "Extra cheese",
          "product": {
            "id": 45,
            "name": ["Margherita Pizza", "بيتزا مارجريتا"],
            "description": ["Classic pizza with tomato and cheese", "بيتزا كلاسيكية بالطماطم والجبن"],
            "image": "/products/pizza-margherita.jpg",
            "price": 75.00,
            "tax_id": 1,
            "tax": {
              "id": 1,
              "name": ["VAT", "ضريبة القيمة المضافة"],
              "type": "percentage",
              "amount": 14,
              "status": true,
              "created_at": "2026-01-01T00:00:00.000000Z",
              "updated_at": "2026-01-01T00:00:00.000000Z"
            },
            "discount_id": 2,
            "discount": {
              "id": 2,
              "name": ["Weekend Discount", "خصم عطلة نهاية الأسبوع"],
              "type": "fixed",
              "amount": 5,
              "status": true,
              "created_at": "2026-01-01T00:00:00.000000Z",
              "updated_at": "2026-10-01T00:00:00.000000Z"
            },
            "category_id": 3,
            "category": {
              "id": 3,
              "name": ["Pizzas", "البيتزا"],
              "image": "/categories/pizza.jpg",
              "description": ["Italian pizzas", "بيتزا إيطالية"],
              "category_id": null,
              "type": "product",
              "status": true,
              "parent": null,
              "created_at": "2026-01-01T00:00:00.000000Z",
              "updated_at": "2026-01-01T00:00:00.000000Z"
            },
            "sub_category_id": null,
            "sub_category": null,
            "variations": [
              {
                "id": 10,
                "name": ["Size", "الحجم"],
                "status": true,
                "required": true,
                "product_id": 45,
                "options": [
                  {
                    "id": 25,
                    "name": ["Large", "كبير"],
                    "price": 20,
                    "status": true,
                    "product_id": 45,
                    "variation_id": 10,
                    "created_at": "2026-01-01T00:00:00.000000Z",
                    "updated_at": "2026-01-01T00:00:00.000000Z"
                  }
                ],
                "created_at": "2026-01-01T00:00:00.000000Z",
                "updated_at": "2026-01-01T00:00:00.000000Z"
              }
            ],
            "created_at": "2026-01-01T00:00:00.000000Z",
            "updated_at": "2026-10-15T00:00:00.000000Z"
          },
          "variations": [
            {
              "id": 1001,
              "order_product_id": 501,
              "variation_id": 10,
              "name": "Size",
              "name_translations": ["Size", "الحجم"],
              "variation": {
                "id": 10,
                "name": ["Size", "الحجم"],
                "status": true,
                "required": true,
                "product_id": 45,
                "created_at": "2026-01-01T00:00:00.000000Z",
                "updated_at": "2026-01-01T00:00:00.000000Z"
              },
              "options": [
                {
                  "id": 2001,
                  "order_p_variation_id": 1001,
                  "option_id": 25,
                  "name": "Large",
                  "name_translations": ["Large", "كبير"],
                  "price": 20,
                  "option": {
                    "id": 25,
                    "name": ["Large", "كبير"],
                    "price": "20.00",
                    "status": true,
                    "product_id": 45,
                    "variation_id": 10,
                    "created_at": "2026-01-01T00:00:00.000000Z",
                    "updated_at": "2026-01-01T00:00:00.000000Z"
                  },
                  "created_at": "2026-10-21T10:30:00.000000Z",
                  "updated_at": "2026-10-21T10:30:00.000000Z"
                }
              ],
              "created_at": "2026-10-21T10:30:00.000000Z",
              "updated_at": "2026-10-21T10:30:00.000000Z"
            }
          ],
          "addons": [
            {
              "id": 3001,
              "addon_id": 7,
              "order_product_id": 501,
              "name": "Extra Cheese",
              "name_translations": ["Extra Cheese", "جبن إضافي"],
              "price": 10,
              "addon": {
                "id": 7,
                "name": ["Extra Cheese", "جبن إضافي"],
                "image": "/addons/cheese.jpg",
                "price": "10.00",
                "tax_id": 1,
                "discount_id": null,
                "kitchen_id": 2,
                "created_at": "2026-01-01T00:00:00.000000Z",
                "updated_at": "2026-01-01T00:00:00.000000Z"
              },
              "created_at": "2026-10-21T10:30:00.000000Z",
              "updated_at": "2026-10-21T10:30:00.000000Z"
            }
          ],
          "created_at": "2026-10-21T10:30:00.000000Z",
          "updated_at": "2026-10-21T10:30:00.000000Z"
        }
      ]
    }
  ]
}
```

---

## 2. Get Order Details

Retrieves complete details for a specific order.

**Endpoint:** `GET /api/cashier/orders/{order}`  
**Auth:** `auth:cashier`

### Response (200 OK)

```json
{
  "status": true,
  "data": {
    // Same structure as single order in list above
  }
}
```

---

## 3. Data Models

### Complete TypeScript Interfaces

```typescript
// Main Order Interface
interface Order {
  id: number;
  order_number?: string;
  shift_id: number;
  shift_name: string;
  cashier_id: number;
  cashier_man_id: number;
  hall_table_id: number | null;
  financial_account_id?: number | null;
  financial_id?: number | null;
  financial_account?: FinancialAccountDetail | null;
  payment_method_id?: number | null;
  payment_method?: PaymentMethod | null;
  delivery_id?: number | null;
  delivery?: Delivery | null;
  branch_id?: number;
  module: string;
  status: string;
  paid: boolean;
  address: string | null;
  lat?: number | null;
  lng?: number | null;
  note: string | null;
  phone: string | null;
  name: string | null;
  is_pos: boolean;
  total: number;
  total_tax: number;
  total_discount: number;
  final_price: number;
  branch?: Branch | null;
  shift?: ShiftDetail | null;
  cashier?: CashierDetail | null;
  cashier_man?: CashierManDetail | null;
  hall_table?: HallTableDetail | null;
  products?: OrderProductFull[];
  created_at: string;
  updated_at: string;
}

// Nested Interfaces
interface Branch {
  id: number;
  name?: any[] | null;
  user_name?: string;
  address?: string;
  location?: any[] | null;
  watts?: string;
  facebook?: string;
  status?: boolean;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

interface Delivery {
  id: number;
  name: string;
  phone?: string;
  id_images?: any[] | null;
  branch_id?: number;
  branch?: Branch | null;
  created_at?: string;
  updated_at?: string;
}

interface OrderProductFull {
  id: number;
  order_id?: number;
  product_id?: number;
  quantity?: number;
  name?: any | null;
  name_translations?: any[] | null;
  price?: number;
  note?: string | null;
  product?: ProductDetailFull | null;
  variations?: OrderProductVariation[];
  addons?: OrderProductAddon[];
  created_at?: string;
  updated_at?: string;
}
```

---

## Usage Examples

### Example 1: Get All Orders

```typescript
import { cashierApi } from '@/services/cashierService';

const orders = await cashierApi.getOrders();
console.log(orders.data); // Array of orders
```

### Example 2: Filter by Module and Status

```typescript
const deliveryOrders = await cashierApi.getOrders({
  module: 'delivery',
  status: 'out_of_delivery',
  paid: false
});
```

### Example 3: Search Orders

```typescript
const searchResults = await cashierApi.getOrders({
  search: 'Ahmed',
  date_from: '2026-10-01',
  date_to: '2026-10-21'
});
```

### Example 4: Get Order Details

```typescript
const orderDetail = await cashierApi.getOrderDetail(123);
console.log(orderDetail.data.products); // Full product details
```

### Example 5: With React Query

```typescript
const { data: orders } = useQuery({
  queryKey: ['orders', { module: 'delivery' }],
  queryFn: () => cashierApi.getOrders({ module: 'delivery' })
});
```

---

## Notes

- All multilingual fields (like `name`) return arrays with translations
- Nested relationships are fully loaded in the response
- Geographic coordinates are available in `lat` and `lng` fields
- Product variations and addons include full pricing details
- All timestamps are in ISO 8601 format with timezone
