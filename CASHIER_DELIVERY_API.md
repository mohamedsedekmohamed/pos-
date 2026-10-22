# Cashier Delivery Management API

This document describes the new and updated API endpoints for managing delivery operations in the Cashier module (`auth:cashier`).

---

## Overview

The delivery management system allows cashiers to:
- View available delivery personnel
- Assign delivery personnel to orders
- Track unpaid delivery orders
- Settle payments when delivery personnel return

---

## Table of Contents

1. [Get Delivery Personnel List](#1-get-delivery-personnel-list)
2. [Update Order Status](#2-update-order-status)
3. [Checkout with Delivery Assignment](#3-checkout-with-delivery-assignment)
4. [List Unpaid Delivery Orders](#4-list-unpaid-delivery-orders)
5. [Settle Delivery Payments](#5-settle-delivery-payments)

---

## 1. Get Delivery Personnel List

Returns a list of available delivery personnel for the cashier's branch.

**Endpoint:** `GET /api/cashier/deliveries/select`  
**Alias:** `GET /api/cashier/deliveries`  
**Auth:** `auth:cashier`

### Headers

```
Authorization: Bearer <cashier_jwt_token>
Accept: application/json
```

### Response (200 OK)

```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "name": "Captain Ahmed Mohamed"
    },
    {
      "id": 2,
      "name": "Captain Mahmoud Ali"
    }
  ]
}
```

### TypeScript Usage

```typescript
import { cashierApi } from '@/services/cashierService';

const deliveries = await cashierApi.getDeliveries();
```

---

## 2. Update Order Status

Updates order status and assigns delivery personnel when transitioning to `out_of_delivery` status.

**Endpoint:** `PUT /api/cashier/orders/{order}/status`  
**Methods:** `PUT`, `PATCH`, `POST`  
**Auth:** `auth:cashier`

### Headers

```
Authorization: Bearer <cashier_jwt_token>
Content-Type: application/json
Accept: application/json
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `order` | integer | Yes | Order ID |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | New order status. Valid values depend on module:<br>• **delivery**: `done`, `out_of_delivery`, `delivered`, `return`, `failed_to_delivered`<br>• **takeaway**: `done`, `pickup`, `return`<br>• **dinein**: `return` |
| `delivery_id` | integer | Conditional | Required when `status` is `out_of_delivery` for delivery orders |

### Request Examples

**Out for Delivery:**
```json
{
  "status": "out_of_delivery",
  "delivery_id": 2
}
```

**Other Status:**
```json
{
  "status": "delivered"
}
```

### Response (200 OK)

```json
{
  "status": true,
  "message": "Order status updated successfully.",
  "data": {
    "id": 45,
    "status": "out_of_delivery",
    "delivery_id": 2
  }
}
```

### Error Response (422)

```json
{
  "message": "The delivery id field is required when status is out of delivery.",
  "errors": {
    "delivery_id": [
      "The delivery id field is required when status is out of delivery."
    ]
  }
}
```

### TypeScript Usage

```typescript
import { cashierApi } from '@/services/cashierService';

await cashierApi.updateOrderStatus(45, {
  status: 'out_of_delivery',
  delivery_id: 2
});
```

---

## 3. Checkout with Delivery Assignment

Create an order with optional delivery personnel assignment.

**Endpoint:** `POST /api/cashier/orders/checkout`  
**Auth:** `auth:cashier`

### Headers

```
Authorization: Bearer <cashier_jwt_token>
Content-Type: application/json
Accept: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `module` | string | Yes | Order type: `takeaway`, `dinein`, `delivery` |
| `financial_account_id` | integer | Yes | Financial account (cash register) ID |
| `delivery_id` | integer | No | Delivery personnel ID (for immediate assignment) |
| `address` | string | Conditional | Customer address (required for `delivery`) |
| `phone` | string | No | Customer phone |
| `name` | string | No | Customer name |
| `note` | string | No | Order notes |
| `hall_table_id` | integer | Conditional | Table ID (for `dinein`) |

### Payment Status Logic

- If financial account is cash (`is_cash = true`) AND module is `delivery`:
  - `paid = false` (will be collected by delivery personnel)
- Otherwise:
  - `paid = true` (already paid)

### Response (201 Created)

```json
{
  "status": true,
  "message": "Order created successfully from cart",
  "data": {
    "id": 50,
    "status": "pending",
    "module": "delivery",
    "delivery_id": 2,
    "delivery": {
      "id": 2,
      "name": "Captain Mahmoud Ali"
    },
    "financial_account_id": 3,
    "paid": false,
    "total": 180,
    "final_price": 180,
    "created_at": "2026-10-20T21:50:00.000000Z"
  }
}
```

### TypeScript Usage

```typescript
import { cashierApi } from '@/services/cashierService';

const order = await cashierApi.checkout({
  module: 'delivery',
  financial_account_id: 3,
  delivery_id: 2,
  address: '123 Main St',
  phone: '01012345678',
  name: 'Ahmed Ibrahim'
});
```

---

## 4. List Unpaid Delivery Orders

Lists all unpaid delivery orders with pagination and filtering support.

**Endpoint:** `GET /api/cashier/delivery-orders/unpaid`  
**Auth:** `auth:cashier`

### Headers

```
Authorization: Bearer <cashier_jwt_token>
Accept: application/json
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `delivery_id` | integer | No | - | Filter by delivery personnel |
| `page` | integer | No | `1` | Page number |
| `per_page` | integer | No | `15` | Items per page |
| `search` | string | No | - | Search by order number, customer name, or phone |

### Response (200 OK)

```json
{
  "status": true,
  "data": [
    {
      "id": 101,
      "order_number": "#101",
      "status": "out_of_delivery",
      "module": "delivery",
      "paid": false,
      "total": 150.00,
      "final_price": 150.00,
      "name": "Ahmed Ibrahim",
      "phone": "01012345678",
      "address": "123 Main St, Building 12, Floor 2",
      "delivery_id": 2,
      "delivery": {
        "id": 2,
        "name": "Captain Mahmoud Ali"
      },
      "created_at": "2026-10-20T21:40:00.000000Z"
    }
  ],
  "links": {
    "first": "http://example.com/api/cashier/delivery-orders/unpaid?page=1",
    "last": "http://example.com/api/cashier/delivery-orders/unpaid?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "per_page": 15,
    "to": 1,
    "total": 1
  }
}
```

### TypeScript Usage

```typescript
import { cashierApi } from '@/services/cashierService';

// Get all unpaid delivery orders
const orders = await cashierApi.getUnpaidDeliveryOrders();

// Filter by delivery personnel
const ordersForDelivery = await cashierApi.getUnpaidDeliveryOrders({
  delivery_id: 2
});

// Search orders
const searchResults = await cashierApi.getUnpaidDeliveryOrders({
  search: '101'
});

// Pagination
const page2 = await cashierApi.getUnpaidDeliveryOrders({
  page: 2,
  per_page: 20
});
```

---

## 5. Settle Delivery Payments

Settles payments for multiple delivered orders when delivery personnel returns with collected cash.

**Endpoint:** `POST /api/cashier/delivery-orders/settle-payment`  
**Auth:** `auth:cashier`

### What Happens

For each order in the request, the system updates:
- `paid = true`
- `cashier_id = auth()->cashier_id`
- `cashier_man_id = auth()->id`
- `shift_id = auth()->shift_id`

### Headers

```
Authorization: Bearer <cashier_jwt_token>
Content-Type: application/json
Accept: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order_ids` | integer[] | Yes | Array of order IDs to settle |

### Request Example

```json
{
  "order_ids": [101, 102, 105]
}
```

### Response (200 OK)

```json
{
  "status": true,
  "message": "Delivery orders payment settled successfully",
  "data": {
    "settled_count": 3,
    "settled_order_ids": [101, 102, 105],
    "total_amount_collected": 450.00,
    "cashier_id": 1,
    "cashier_man_id": 4,
    "shift_id": 2
  }
}
```

### Error Responses

**422 Unprocessable Content:**
```json
{
  "message": "The order ids field is required.",
  "errors": {
    "order_ids": ["The order ids field is required."]
  }
}
```

**404 Not Found:**
```json
{
  "status": false,
  "message": "No unpaid delivery orders found for this branch."
}
```

### TypeScript Usage

```typescript
import { cashierApi } from '@/services/cashierService';

const result = await cashierApi.settleDeliveryPayment({
  order_ids: [101, 102, 105]
});

console.log(`Settled ${result.data.settled_count} orders`);
console.log(`Total collected: ${result.data.total_amount_collected}`);
```

---

## Implementation Summary

### Added Type Definitions

```typescript
// Delivery personnel
interface Delivery {
  id: number;
  name: string;
}

// Update order status
interface UpdateOrderStatusPayload {
  status: 'done' | 'out_of_delivery' | 'delivered' | 'return' | 'failed_to_delivered' | 'pickup';
  delivery_id?: number;
}

// Unpaid orders query
interface UnpaidDeliveryOrdersParams {
  delivery_id?: number;
  page?: number;
  per_page?: number;
  search?: string;
}

// Settle payment
interface SettlePaymentPayload {
  order_ids: number[];
}

interface SettlePaymentResponse {
  status: boolean;
  message: string;
  data: {
    settled_count: number;
    settled_order_ids: number[];
    total_amount_collected: number;
    cashier_id: number;
    cashier_man_id: number;
    shift_id: number;
  };
}

// Updated Order interface
interface Order {
  // ... existing fields
  delivery_id?: number | null;
  delivery?: Delivery | null;
  status: string;
  paid: boolean;
  order_number?: string;
}

// Updated CheckoutPayload
interface CheckoutPayload {
  // ... existing fields
  delivery_id?: number | null;
}
```

### Added Service Methods

```typescript
export const cashierApi = {
  // ... existing methods

  // Get delivery personnel
  getDeliveries: async (): Promise<Delivery[]> => {},

  // Update order status
  updateOrderStatus: async (
    orderId: number,
    payload: UpdateOrderStatusPayload
  ): Promise<{ status: boolean; message: string; data: Order }> => {},

  // Get unpaid delivery orders
  getUnpaidDeliveryOrders: async (
    params?: UnpaidDeliveryOrdersParams
  ): Promise<OrderListResponse> => {},

  // Settle delivery payments
  settleDeliveryPayment: async (
    payload: SettlePaymentPayload
  ): Promise<SettlePaymentResponse> => {},
};
```

---

## Workflow Example

### Complete Delivery Order Workflow

```typescript
import { cashierApi } from '@/services/cashierService';

// 1. Get available delivery personnel
const deliveries = await cashierApi.getDeliveries();

// 2. Create delivery order with assigned personnel
const order = await cashierApi.checkout({
  module: 'delivery',
  financial_account_id: 1,
  delivery_id: deliveries[0].id,
  address: '123 Main St',
  phone: '01012345678',
  name: 'John Doe'
});

// 3. Update order to out for delivery
await cashierApi.updateOrderStatus(order.id, {
  status: 'out_of_delivery',
  delivery_id: deliveries[0].id
});

// 4. Later: Get unpaid orders for the delivery personnel
const unpaidOrders = await cashierApi.getUnpaidDeliveryOrders({
  delivery_id: deliveries[0].id
});

// 5. When delivery personnel returns, settle payments
const settlement = await cashierApi.settleDeliveryPayment({
  order_ids: unpaidOrders.data.map(o => o.id)
});

console.log(`Collected: ${settlement.data.total_amount_collected}`);
```

---

## Notes

- All endpoints require cashier authentication (`auth:cashier`)
- Delivery personnel are automatically filtered by branch
- Orders can only be settled if they belong to the cashier's branch
- Payment status is automatically determined based on financial account type
- Order status transitions follow strict validation rules per module type
