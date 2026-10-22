# دليل تنفيذ ميزات التوصيل (Delivery Features Implementation Guide)

## نظرة عامة

تم تنفيذ كافة المتطلبات الواردة في التوثيق الخاص بواجهات برمجة التطبيقات لإدارة التوصيل في نظام الكاشير.

---

## ✅ التحديثات المنفذة

### 1. تعريفات الأنواع (Types) - `src/types/cashier.ts`

#### الواجهات الجديدة:

```typescript
// واجهة مندوب التوصيل
export interface Delivery {
  id: number;
  name: string;
}

// حمولة تحديث حالة الطلب
export interface UpdateOrderStatusPayload {
  status: 'done' | 'out_of_delivery' | 'delivered' | 'return' | 'failed_to_delivered' | 'pickup';
  delivery_id?: number;
}

// معاملات استعلام الطلبات غير المدفوعة
export interface UnpaidDeliveryOrdersParams {
  delivery_id?: number;
  page?: number;
  per_page?: number;
  search?: string;
}

// حمولة تسوية الدفع
export interface SettlePaymentPayload {
  order_ids: number[];
}

// استجابة تسوية الدفع
export interface SettlePaymentResponse {
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
```

#### التحديثات على الواجهات الموجودة:

```typescript
// تحديث واجهة Order
export interface Order {
  // ... الحقول الموجودة
  delivery_id?: number | null;        // ✅ جديد
  delivery?: Delivery | null;         // ✅ جديد
  status: string;                     // ✅ جديد
  paid: boolean;                      // ✅ جديد
  order_number?: string;              // ✅ جديد
}

// تحديث CheckoutPayload
export interface CheckoutPayload {
  // ... الحقول الموجودة
  delivery_id?: number | null;        // ✅ جديد
}

// تحديث OrderListResponse
export interface OrderListResponse {
  data: Order[];
  links?: {                           // ✅ جديد للـ pagination
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta?: {                            // ✅ جديد للـ pagination
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}
```

---

### 2. خدمات API - `src/services/cashierService.ts`

#### الدوال الجديدة:

```typescript
export const cashierApi = {
  // ... الدوال الموجودة

  // 1. جلب قائمة مناديب التوصيل
  getDeliveries: async (): Promise<Delivery[]> => {
    const { data } = await api.get<{ status: boolean; data: Delivery[] }>(
      '/api/cashier/deliveries/select'
    );
    return data.data;
  },

  // 2. تحديث حالة الطلب
  updateOrderStatus: async (
    orderId: number,
    payload: UpdateOrderStatusPayload
  ): Promise<{ status: boolean; message: string; data: Order }> => {
    const { data } = await api.put(
      `/api/cashier/orders/${orderId}/status`,
      payload
    );
    return data;
  },

  // 3. جلب طلبات التوصيل غير المدفوعة
  getUnpaidDeliveryOrders: async (
    params?: UnpaidDeliveryOrdersParams
  ): Promise<OrderListResponse> => {
    const { data } = await api.get<OrderListResponse>(
      '/api/cashier/delivery-orders/unpaid',
      { params }
    );
    return data;
  },

  // 4. تسوية دفعات التوصيل
  settleDeliveryPayment: async (
    payload: SettlePaymentPayload
  ): Promise<SettlePaymentResponse> => {
    const { data } = await api.post<SettlePaymentResponse>(
      '/api/cashier/delivery-orders/settle-payment',
      payload
    );
    return data;
  },
};
```

---

### 3. الملفات الإضافية

#### أ. التوثيق العربي - `CASHIER_API_DOCS.md`
- توثيق شامل بالعربية لجميع الـ endpoints الجديدة
- أمثلة كاملة للطلبات والاستجابات
- شرح الترويسات والمعاملات والأخطاء

#### ب. التوثيق الإنجليزي - `CASHIER_DELIVERY_API.md`
- توثيق تقني مفصل باللغة الإنجليزية
- أمثلة استخدام TypeScript
- مخطط تدفق العمل الكامل

#### ج. أمثلة التنفيذ - `src/examples/DeliveryManagementExample.tsx`
- 8 أمثلة كاملة لمكونات React
- Custom hooks للاستخدام المتكرر
- أمثلة على التكامل مع React Query
- لوحة تحكم كاملة لإدارة التوصيل

---

## 📋 قائمة التحقق من التنفيذ

### واجهات API المطلوبة:

- [x] ✅ **GET /api/cashier/deliveries/select** - جلب قائمة المناديب
- [x] ✅ **PUT /api/cashier/orders/{order}/status** - تحديث حالة الطلب
- [x] ✅ **POST /api/cashier/orders/checkout** - دعم delivery_id في الـ checkout
- [x] ✅ **GET /api/cashier/delivery-orders/unpaid** - جلب الطلبات غير المدفوعة
- [x] ✅ **POST /api/cashier/delivery-orders/settle-payment** - تسوية الدفعات

### التعريفات والأنواع:

- [x] ✅ واجهة `Delivery`
- [x] ✅ واجهة `UpdateOrderStatusPayload`
- [x] ✅ واجهة `UnpaidDeliveryOrdersParams`
- [x] ✅ واجهة `SettlePaymentPayload`
- [x] ✅ واجهة `SettlePaymentResponse`
- [x] ✅ تحديث واجهة `Order`
- [x] ✅ تحديث واجهة `CheckoutPayload`
- [x] ✅ تحديث واجهة `OrderListResponse`

### الخدمات:

- [x] ✅ دالة `getDeliveries()`
- [x] ✅ دالة `updateOrderStatus()`
- [x] ✅ دالة `getUnpaidDeliveryOrders()`
- [x] ✅ دالة `settleDeliveryPayment()`

### التوثيق:

- [x] ✅ توثيق API بالعربية
- [x] ✅ توثيق API بالإنجليزية
- [x] ✅ أمثلة تطبيقية شاملة
- [x] ✅ دليل التنفيذ (هذا الملف)

---

## 🚀 كيفية الاستخدام

### 1. استخدام بسيط

```typescript
import { cashierApi } from '@/services/cashierService';

// جلب قائمة المناديب
const deliveries = await cashierApi.getDeliveries();

// تحديث حالة طلب
await cashierApi.updateOrderStatus(123, {
  status: 'out_of_delivery',
  delivery_id: 2
});

// جلب الطلبات غير المدفوعة
const unpaidOrders = await cashierApi.getUnpaidDeliveryOrders({
  delivery_id: 2,
  page: 1
});

// تسوية الدفعات
await cashierApi.settleDeliveryPayment({
  order_ids: [101, 102, 103]
});
```

### 2. استخدام مع React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { cashierApi } from '@/services/cashierService';

function MyComponent() {
  // جلب المناديب
  const { data: deliveries } = useQuery({
    queryKey: ['deliveries'],
    queryFn: cashierApi.getDeliveries,
  });

  // تحديث حالة الطلب
  const updateStatus = useMutation({
    mutationFn: ({ orderId, payload }) =>
      cashierApi.updateOrderStatus(orderId, payload),
  });

  // استخدام
  const handleUpdate = () => {
    updateStatus.mutate({
      orderId: 123,
      payload: { status: 'out_of_delivery', delivery_id: 2 }
    });
  };
}
```

### 3. استخدام Custom Hooks

راجع ملف `src/examples/DeliveryManagementExample.tsx` للأمثلة الكاملة:

```typescript
import {
  useDeliveries,
  useUnpaidDeliveryOrders,
  useUpdateOrderStatus,
  useSettlePayment
} from '@/examples/DeliveryManagementExample';

function MyComponent() {
  const { data: deliveries } = useDeliveries();
  const { data: orders } = useUnpaidDeliveryOrders();
  const updateStatus = useUpdateOrderStatus();
  const settlePayment = useSettlePayment();
}
```

---

## 🔄 سير العمل الكامل

### سيناريو: إنشاء طلب توصيل وتحصيل الدفع

```typescript
// 1. جلب المناديب المتاحين
const deliveries = await cashierApi.getDeliveries();

// 2. إنشاء طلب مع تعيين المندوب
const order = await cashierApi.checkout({
  module: 'delivery',
  financial_account_id: 1,
  delivery_id: deliveries[0].id,
  address: 'شارع النصر 123',
  phone: '01012345678',
  name: 'أحمد محمد'
});

// 3. تحديث حالة الطلب (خارج للتوصيل)
await cashierApi.updateOrderStatus(order.data.id, {
  status: 'out_of_delivery',
  delivery_id: deliveries[0].id
});

// 4. عند عودة المندوب، جلب الطلبات غير المدفوعة
const unpaidOrders = await cashierApi.getUnpaidDeliveryOrders({
  delivery_id: deliveries[0].id
});

// 5. تسوية الدفعات
const settlement = await cashierApi.settleDeliveryPayment({
  order_ids: unpaidOrders.data.map(o => o.id)
});

console.log(`تم تحصيل: ${settlement.data.total_amount_collected} جنيه`);
```

---

## 📁 هيكل الملفات المحدثة

```
d:\Free\pos\
├── CASHIER_API_DOCS.md              # ✅ توثيق API بالعربية
├── CASHIER_DELIVERY_API.md          # ✅ توثيق API بالإنجليزية
├── IMPLEMENTATION_GUIDE.md          # ✅ هذا الملف
│
└── src/
    ├── types/
    │   └── cashier.ts               # ✅ محدث - إضافة تعريفات جديدة
    │
    ├── services/
    │   └── cashierService.ts        # ✅ محدث - إضافة 4 دوال جديدة
    │
    └── examples/
        └── DeliveryManagementExample.tsx  # ✅ جديد - أمثلة شاملة
```

---

## 🎯 الخطوات التالية

### للتطوير:

1. **إنشاء مكونات واجهة المستخدم:**
   - صفحة إدارة التوصيل
   - نموذج اختيار المندوب
   - جدول الطلبات غير المدفوعة
   - زر تسوية الدفعات

2. **التكامل مع الصفحات الموجودة:**
   - إضافة خيار المندوب في صفحة الـ Checkout
   - تحديث صفحة الطلبات لعرض معلومات التوصيل
   - إضافة فلاتر حسب المندوب

3. **التحسينات:**
   - إضافة إشعارات عند تحديث الحالة
   - تحديث تلقائي للطلبات كل فترة
   - إحصائيات لكل مندوب

### للاختبار:

1. اختبار جلب قائمة المناديب
2. اختبار تحديث حالة الطلب بدون مندوب
3. اختبار تحديث حالة الطلب مع تعيين مندوب
4. اختبار التحقق من إلزامية `delivery_id` عند `out_of_delivery`
5. اختبار فلترة الطلبات غير المدفوعة
6. اختبار البحث في الطلبات
7. اختبار التصفح بالصفحات
8. اختبار تسوية دفعات متعددة
9. اختبار الأخطاء المحتملة

---

## 📝 ملاحظات مهمة

### 1. التحقق من البيانات:

- عند اختيار `out_of_delivery`، يجب إرسال `delivery_id` إلزامياً
- الـ Backend يتحقق من صحة `delivery_id` والفرع
- حالات الطلب محددة حسب نوع الطلب (module)

### 2. حالة الدفع (paid):

- طلبات التوصيل النقدية تكون `paid: false` حتى التسوية
- الطلبات الأخرى تكون `paid: true` مباشرة

### 3. الأمان:

- جميع الـ endpoints محمية بـ `auth:cashier`
- الكاشير يرى فقط طلبات فرعه
- تسوية الدفع تحدث معلومات الكاشير والوردية تلقائياً

### 4. الأداء:

- استخدم التصفح بالصفحات للطلبات الكثيرة
- فلتر حسب المندوب لتقليل البيانات
- يمكن استخدام `staleTime` في React Query للـ caching

---

## 🐛 حل المشاكل الشائعة

### المشكلة: "delivery_id is required"
**الحل:** تأكد من إرسال `delivery_id` عند اختيار `out_of_delivery`

### المشكلة: لا تظهر الطلبات
**الحل:** تحقق من أن الطلبات من نوع `delivery` و `paid: false` وتتبع فرع الكاشير

### المشكلة: فشل التسوية
**الحل:** تأكد من أن جميع الطلبات موجودة وغير مدفوعة وتتبع الفرع

### المشكلة: لا يتم تحديث القائمة
**الحل:** استخدم `refetch()` من React Query أو قم بتحديث `queryKey`

---

## 📞 الدعم

للمزيد من المعلومات:
- راجع `CASHIER_API_DOCS.md` للتوثيق الكامل بالعربية
- راجع `CASHIER_DELIVERY_API.md` للتوثيق التقني بالإنجليزية
- راجع `src/examples/DeliveryManagementExample.tsx` للأمثلة العملية

---

## ✨ الخلاصة

تم تنفيذ جميع المتطلبات الواردة في التوثيق بنجاح:

✅ جميع الـ Types معرفة  
✅ جميع الـ API Services جاهزة  
✅ التوثيق الكامل متوفر  
✅ أمثلة عملية شاملة  

المشروع جاهز الآن لبدء بناء واجهات المستخدم وتكامل الميزات في الصفحات الموجودة.
