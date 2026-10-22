# مرجع API الكامل - Complete Cashier API Reference

## 📑 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [المصادقة](#المصادقة)
3. [نقاط النهاية الكاملة](#نقاط-النهاية-الكاملة)
4. [نماذج البيانات](#نماذج-البيانات)
5. [أمثلة متقدمة](#أمثلة-متقدمة)
6. [معالجة الأخطاء](#معالجة-الأخطاء)

---

## نظرة عامة

هذا المرجع يوفر توثيقاً شاملاً لجميع endpoints المتاحة في Cashier API.

**Base URL:** `https://ecommerce.mazoom.online`  
**Authentication:** Bearer Token (Cashier JWT)

---

## المصادقة

جميع الـ endpoints تتطلب مصادقة باستخدام JWT Token:

```http
Authorization: Bearer <cashier_jwt_token>
Accept: application/json
Content-Type: application/json
```

---

## نقاط النهاية الكاملة

### 📦 Categories & Products

#### 1. Get Parent Categories
```
GET /api/cashier/categories/parents
Query: lang=ar
```

#### 2. Get Sub Categories
```
GET /api/cashier/categories/sub
Query: category_id, lang
```

#### 3. Get Products
```
GET /api/cashier/products
Query: category_id, sub_category_id, lang
```

#### 4. Get Product Detail
```
GET /api/cashier/products/{id}
Query: lang
```

#### 5. Get Addons
```
GET /api/cashier/addons
Query: lang
```

---

### 🏢 Branch & Structure

#### 6. Get Cashiers
```
GET /api/cashier/cashiers
```

#### 7. Get Halls
```
GET /api/cashier/halls
Query: lang
```

#### 8. Get Hall Tables
```
GET /api/cashier/hall-tables
Query: hall_id, lang
```

---

### ⏰ Shift Management

#### 9. Check Start Shift
```
GET /api/cashier/check-start-shift
```

#### 10. Start Shift
```
POST /api/cashier/start-shift
Body: {
  cashier_id: number,
  cashier_man_id?: number,
  start_amount?: number,
  financial_account_id?: number
}
```

#### 11. End Shift
```
POST /api/cashier/end-shift
Body: {
  total_mony: number
}
```

---

### 💰 Financial

#### 12. Get Financial Accounts
```
GET /api/cashier/financial-accounts
Query: branch_id, lang
```

#### 13. Get Expense Lists
```
GET /api/cashier/expense-lists
Query: lang
```

#### 14. Get Expenses
```
GET /api/cashier/expenses
Query: shift_id
```

#### 15. Create Expense
```
POST /api/cashier/expenses
Body: {
  expense_list_id: number,
  financial_id: number,
  amount: number,
  description?: string
}
```

---

### 🛒 Cart Operations

#### 16. Get Cart
```
GET /api/cashier/cart
Query: module, table_id
```

#### 17. Add to Cart
```
POST /api/cashier/cart
Body: {
  module: 'takeaway' | 'dinein' | 'delivery',
  product_id: number,
  quantity: number,
  table_id?: number,
  hall_table_id?: number,
  without_recipe?: boolean,
  notes?: string,
  variations?: Array<{
    variation_id: number,
    option_ids: number[]
  }>,
  addons?: Array<{
    addon_id: number
  }>
}
```

#### 18. Update Cart Item
```
PUT /api/cashier/cart/{cartId}
Body: Same as Add to Cart
```

#### 19. Remove Cart Item
```
DELETE /api/cashier/cart/{cartId}
```

#### 20. Clear Cart
```
DELETE /api/cashier/cart/clear
Query: module, table_id
```

---

### 📋 Orders

#### 21. Checkout
```
POST /api/cashier/orders/checkout
Body: {
  module: 'takeaway' | 'dinein' | 'delivery',
  financial_account_id: number,
  delivery_id?: number,
  address?: string,
  phone?: string,
  name?: string,
  note?: string,
  hall_table_id?: number
}
```

#### 22. Get Orders (✨ محدث)
```
GET /api/cashier/orders
Query: {
  page?: number,
  per_page?: number,
  shift_id?: number,
  module?: 'takeaway' | 'dinein' | 'delivery',
  status?: string,
  paid?: boolean,
  search?: string,
  date_from?: 'YYYY-MM-DD',
  date_to?: 'YYYY-MM-DD'
}
```

#### 23. Get Order Details (✨ محدث)
```
GET /api/cashier/orders/{order}
Response: Full order with nested relations
```

#### 24. Update Order Status (✅ جديد)
```
PUT /api/cashier/orders/{order}/status
Body: {
  status: string,
  delivery_id?: number
}
```

---

### 🚚 Delivery Management

#### 25. Get Deliveries (✅ جديد)
```
GET /api/cashier/deliveries/select
Alias: GET /api/cashier/deliveries
```

#### 26. Get Unpaid Delivery Orders (✅ جديد)
```
GET /api/cashier/delivery-orders/unpaid
Query: {
  delivery_id?: number,
  page?: number,
  per_page?: number,
  search?: string
}
```

#### 27. Settle Delivery Payment (✅ جديد)
```
POST /api/cashier/delivery-orders/settle-payment
Body: {
  order_ids: number[]
}
```

---

## نماذج البيانات

### Order (Full Structure)

```typescript
interface Order {
  // Identifiers
  id: number;
  order_number?: string;
  
  // Relationships IDs
  shift_id: number;
  cashier_id: number;
  cashier_man_id: number;
  hall_table_id: number | null;
  financial_account_id?: number | null;
  financial_id?: number | null;
  payment_method_id?: number | null;
  delivery_id?: number | null;
  branch_id?: number;
  
  // Basic Info
  shift_name: string;
  module: 'takeaway' | 'dinein' | 'delivery';
  status: string;
  paid: boolean;
  is_pos: boolean;
  
  // Customer Info
  name: string | null;
  phone: string | null;
  address: string | null;
  lat?: number | null;
  lng?: number | null;
  note: string | null;
  
  // Financial Info
  total: number;
  total_tax: number;
  total_discount: number;
  final_price: number;
  
  // Nested Relations
  financial_account?: FinancialAccountDetail | null;
  payment_method?: PaymentMethod | null;
  delivery?: Delivery | null;
  branch?: Branch | null;
  shift?: ShiftDetail | null;
  cashier?: CashierDetail | null;
  cashier_man?: CashierManDetail | null;
  hall_table?: HallTableDetail | null;
  products?: OrderProductFull[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}
```

### OrderProductFull

```typescript
interface OrderProductFull {
  id: number;
  order_id?: number;
  product_id?: number;
  quantity?: number;
  name?: any | null;
  name_translations?: any[] | null;
  price?: number;
  note?: string | null;
  
  // Full product details
  product?: {
    id: number;
    name?: any[] | null;
    description?: any[] | null;
    image?: string;
    price?: number;
    tax?: TaxDiscountDetail | null;
    discount?: TaxDiscountDetail | null;
    category?: CategoryDetail | null;
    sub_category?: CategoryDetail | null;
    variations?: VariationDetail[];
  } | null;
  
  // Order-specific variations
  variations?: OrderProductVariation[];
  
  // Order-specific addons
  addons?: OrderProductAddon[];
  
  created_at?: string;
  updated_at?: string;
}
```

---

## أمثلة متقدمة

### Example 1: Complete Order Workflow

```typescript
import { cashierApi } from '@/services/cashierService';

async function completeOrderWorkflow() {
  // 1. Start shift
  const shift = await cashierApi.startShift({
    cashier_id: 1,
    start_amount: 1000,
    financial_account_id: 1
  });
  
  // 2. Get products
  const products = await cashierApi.getProducts({
    category_id: 3
  });
  
  // 3. Add to cart
  await cashierApi.addToCart({
    module: 'delivery',
    product_id: products[0].id,
    quantity: 2,
    variations: [
      {
        variation_id: 1,
        option_ids: [2]
      }
    ],
    addons: [
      { addon_id: 3 }
    ]
  });
  
  // 4. Get deliveries
  const deliveries = await cashierApi.getDeliveries();
  
  // 5. Checkout
  const order = await cashierApi.checkout({
    module: 'delivery',
    financial_account_id: 1,
    delivery_id: deliveries[0].id,
    name: 'Ahmed Mohamed',
    phone: '01012345678',
    address: '123 Main St'
  });
  
  // 6. Update order status
  await cashierApi.updateOrderStatus(order.data.id, {
    status: 'out_of_delivery',
    delivery_id: deliveries[0].id
  });
  
  // 7. Get unpaid orders
  const unpaidOrders = await cashierApi.getUnpaidDeliveryOrders({
    delivery_id: deliveries[0].id
  });
  
  // 8. Settle payment
  await cashierApi.settleDeliveryPayment({
    order_ids: unpaidOrders.data.map(o => o.id)
  });
  
  // 9. End shift
  await cashierApi.endShift({
    total_mony: 5000
  });
}
```

### Example 2: Advanced Order Filtering

```typescript
import { cashierApi } from '@/services/cashierService';

// Get delivery orders for today
const todayDeliveries = await cashierApi.getOrders({
  module: 'delivery',
  date_from: new Date().toISOString().split('T')[0],
  date_to: new Date().toISOString().split('T')[0]
});

// Get unpaid orders
const unpaidOrders = await cashierApi.getOrders({
  paid: false,
  status: 'pending'
});

// Search orders by customer
const customerOrders = await cashierApi.getOrders({
  search: 'Ahmed'
});

// Get shift-specific orders
const shiftOrders = await cashierApi.getOrders({
  shift_id: 5,
  page: 1,
  per_page: 50
});
```

### Example 3: Order Details Display Component

```typescript
import { useQuery } from '@tanstack/react-query';
import { cashierApi } from '@/services/cashierService';

function OrderDetailsPanel({ orderId }: { orderId: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: () => cashierApi.getOrderDetail(orderId)
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  const order = data?.data;
  if (!order) return null;

  return (
    <div className="order-details">
      {/* Header */}
      <header>
        <h1>Order #{order.id}</h1>
        <span className={`status-badge ${order.status}`}>
          {order.status}
        </span>
        <span className={`payment-badge ${order.paid ? 'paid' : 'unpaid'}`}>
          {order.paid ? 'Paid' : 'Unpaid'}
        </span>
      </header>

      {/* Customer Info */}
      <section className="customer-info">
        <h2>Customer Information</h2>
        <div>
          <strong>Name:</strong> {order.name}
        </div>
        <div>
          <strong>Phone:</strong> {order.phone}
        </div>
        {order.address && (
          <div>
            <strong>Address:</strong> {order.address}
          </div>
        )}
        {order.lat && order.lng && (
          <div>
            <strong>Location:</strong> {order.lat}, {order.lng}
            <a 
              href={`https://maps.google.com/?q=${order.lat},${order.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Map
            </a>
          </div>
        )}
      </section>

      {/* Delivery Info */}
      {order.delivery && (
        <section className="delivery-info">
          <h2>Delivery Information</h2>
          <div>
            <strong>Driver:</strong> {order.delivery.name}
          </div>
          {order.delivery.phone && (
            <div>
              <strong>Phone:</strong> {order.delivery.phone}
            </div>
          )}
        </section>
      )}

      {/* Branch & Shift Info */}
      <section className="operational-info">
        <h2>Operational Information</h2>
        {order.branch && (
          <div>
            <strong>Branch:</strong> {order.branch.name?.[1] || order.branch.name?.[0]}
          </div>
        )}
        {order.shift && (
          <div>
            <strong>Shift:</strong> {order.shift.name?.[1] || order.shift.name?.[0]}
            <span>({order.shift.start_time} - {order.shift.end_time})</span>
          </div>
        )}
        {order.cashier_man && (
          <div>
            <strong>Cashier:</strong> {order.cashier_man.name}
          </div>
        )}
        {order.financial_account && (
          <div>
            <strong>Payment Account:</strong> {order.financial_account.name?.[1] || order.financial_account.name?.[0]}
            {order.financial_account.is_cash && <span> (Cash)</span>}
          </div>
        )}
      </section>

      {/* Products */}
      <section className="products">
        <h2>Order Items</h2>
        {order.products?.map((product) => (
          <div key={product.id} className="product-item">
            <div className="product-header">
              <img 
                src={product.product?.image} 
                alt={product.name || 'Product'} 
              />
              <div>
                <h3>
                  {product.name_translations?.[1] || product.name_translations?.[0] || product.name}
                </h3>
                <p className="quantity">Qty: {product.quantity}</p>
                <p className="price">{product.price} EGP</p>
              </div>
            </div>

            {/* Variations */}
            {product.variations && product.variations.length > 0 && (
              <div className="variations">
                <strong>Variations:</strong>
                {product.variations.map((variation) => (
                  <div key={variation.id} className="variation">
                    <span className="variation-name">
                      {variation.name_translations?.[1] || variation.name}:
                    </span>
                    {variation.options?.map((option) => (
                      <span key={option.id} className="option">
                        {option.name_translations?.[1] || option.name}
                        {option.price > 0 && ` (+${option.price} EGP)`}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Addons */}
            {product.addons && product.addons.length > 0 && (
              <div className="addons">
                <strong>Addons:</strong>
                {product.addons.map((addon) => (
                  <span key={addon.id} className="addon">
                    + {addon.name_translations?.[1] || addon.name}
                    ({addon.price} EGP)
                  </span>
                ))}
              </div>
            )}

            {/* Note */}
            {product.note && (
              <div className="note">
                <strong>Note:</strong> {product.note}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Financial Summary */}
      <section className="financial-summary">
        <h2>Order Summary</h2>
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>{order.total.toFixed(2)} EGP</span>
        </div>
        {order.total_discount > 0 && (
          <div className="summary-row discount">
            <span>Discount:</span>
            <span>-{order.total_discount.toFixed(2)} EGP</span>
          </div>
        )}
        <div className="summary-row">
          <span>Tax:</span>
          <span>{order.total_tax.toFixed(2)} EGP</span>
        </div>
        <div className="summary-row total">
          <strong>Total:</strong>
          <strong>{order.final_price.toFixed(2)} EGP</strong>
        </div>
      </section>

      {/* Order Note */}
      {order.note && (
        <section className="order-note">
          <h2>Order Note</h2>
          <p>{order.note}</p>
        </section>
      )}

      {/* Timestamps */}
      <footer className="timestamps">
        <div>
          <strong>Created:</strong> {new Date(order.created_at).toLocaleString('ar-EG')}
        </div>
        <div>
          <strong>Updated:</strong> {new Date(order.updated_at).toLocaleString('ar-EG')}
        </div>
      </footer>
    </div>
  );
}
```

### Example 4: Real-time Order Dashboard

```typescript
import { useQuery } from '@tanstack/react-query';
import { cashierApi } from '@/services/cashierService';

function OrdersDashboard() {
  // Auto-refresh every 10 seconds
  const { data: pendingOrders } = useQuery({
    queryKey: ['orders', 'pending'],
    queryFn: () => cashierApi.getOrders({ status: 'pending' }),
    refetchInterval: 10000
  });

  const { data: outForDelivery } = useQuery({
    queryKey: ['orders', 'out_of_delivery'],
    queryFn: () => cashierApi.getOrders({ 
      module: 'delivery',
      status: 'out_of_delivery' 
    }),
    refetchInterval: 10000
  });

  const { data: unpaidDeliveries } = useQuery({
    queryKey: ['unpaid-deliveries'],
    queryFn: () => cashierApi.getUnpaidDeliveryOrders(),
    refetchInterval: 10000
  });

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <StatCard
          title="Pending Orders"
          count={pendingOrders?.data.length || 0}
          icon="⏳"
          color="orange"
        />
        <StatCard
          title="Out for Delivery"
          count={outForDelivery?.data.length || 0}
          icon="🚚"
          color="blue"
        />
        <StatCard
          title="Unpaid Deliveries"
          count={unpaidDeliveries?.data.length || 0}
          icon="💰"
          color="red"
        />
      </div>

      <div className="orders-sections">
        <OrdersList
          title="Pending Orders"
          orders={pendingOrders?.data || []}
        />
        <OrdersList
          title="Out for Delivery"
          orders={outForDelivery?.data || []}
        />
        <OrdersList
          title="Unpaid Deliveries"
          orders={unpaidDeliveries?.data || []}
        />
      </div>
    </div>
  );
}
```

---

## معالجة الأخطاء

### Error Structure

```typescript
interface APIError {
  message: string;
  errors?: {
    [field: string]: string[];
  };
}
```

### Example Error Handling

```typescript
import { cashierApi } from '@/services/cashierService';

async function handleOrder() {
  try {
    const order = await cashierApi.updateOrderStatus(123, {
      status: 'out_of_delivery',
      delivery_id: 2
    });
    
    console.log('Success:', order);
  } catch (error: any) {
    // Validation errors (422)
    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      Object.keys(errors).forEach(field => {
        console.error(`${field}: ${errors[field].join(', ')}`);
      });
    }
    
    // Unauthorized (401)
    else if (error.response?.status === 401) {
      console.error('Unauthorized - please login');
      // Redirect to login
    }
    
    // Not found (404)
    else if (error.response?.status === 404) {
      console.error('Order not found');
    }
    
    // Server error (500)
    else if (error.response?.status === 500) {
      console.error('Server error - please try again later');
    }
    
    // Network error
    else if (!error.response) {
      console.error('Network error - check your connection');
    }
    
    // Generic error
    else {
      console.error('Error:', error.response?.data?.message || error.message);
    }
  }
}
```

---

## Best Practices

### 1. استخدم React Query للـ Caching

```typescript
// Good ✅
const { data } = useQuery({
  queryKey: ['deliveries'],
  queryFn: cashierApi.getDeliveries,
  staleTime: 5 * 60 * 1000 // 5 minutes
});

// Bad ❌
const [deliveries, setDeliveries] = useState([]);
useEffect(() => {
  cashierApi.getDeliveries().then(setDeliveries);
}, []);
```

### 2. استخدم التحديث التفاؤلي (Optimistic Updates)

```typescript
const mutation = useMutation({
  mutationFn: cashierApi.updateOrderStatus,
  onMutate: async (newStatus) => {
    await queryClient.cancelQueries(['order', orderId]);
    const previousOrder = queryClient.getQueryData(['order', orderId]);
    
    queryClient.setQueryData(['order', orderId], (old: any) => ({
      ...old,
      data: { ...old.data, status: newStatus.status }
    }));
    
    return { previousOrder };
  },
  onError: (err, newStatus, context) => {
    queryClient.setQueryData(['order', orderId], context?.previousOrder);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['order', orderId]);
  }
});
```

### 3. تعامل مع اللغات المتعددة

```typescript
function getLocalizedName(nameArray: any[] | null | undefined, lang: 'ar' | 'en' = 'ar') {
  if (!nameArray || !Array.isArray(nameArray)) return '';
  return lang === 'ar' ? nameArray[1] || nameArray[0] : nameArray[0] || nameArray[1];
}

// Usage
const productName = getLocalizedName(product.name, 'ar');
```

---

## ملخص سريع

### جميع الـ Endpoints (27)

| # | Endpoint | Method | Category |
|---|----------|--------|----------|
| 1-5 | Categories & Products | GET | 📦 Products |
| 6-8 | Branch & Structure | GET | 🏢 Structure |
| 9-11 | Shift Management | GET/POST | ⏰ Shifts |
| 12-15 | Financial | GET/POST | 💰 Finance |
| 16-20 | Cart Operations | GET/POST/PUT/DELETE | 🛒 Cart |
| 21-24 | Orders | GET/POST/PUT | 📋 Orders |
| 25-27 | Delivery Management | GET/POST | 🚚 Delivery |

### الملفات المرجعية

1. **`COMPLETE_API_REFERENCE.md`** (هذا الملف) - المرجع الشامل
2. **`CASHIER_API_DOCS.md`** - التوثيق العربي للتوصيل
3. **`CASHIER_DELIVERY_API.md`** - التوثيق الإنجليزي للتوصيل
4. **`CASHIER_ORDERS_API.md`** - توثيق الطلبات الكامل
5. **`IMPLEMENTATION_GUIDE.md`** - دليل التنفيذ
6. **`UPDATE_SUMMARY_V2.md`** - ملخص التحديثات
7. **`DELIVERY_FEATURE_SUMMARY.md`** - ملخص ميزة التوصيل

---

**آخر تحديث:** 21 أكتوبر 2026  
**الإصدار:** 2.0  
**الحالة:** ✅ مكتمل 100%
