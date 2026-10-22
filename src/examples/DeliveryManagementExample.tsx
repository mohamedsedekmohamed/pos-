/**
 * Delivery Management Example Component
 * 
 * This file demonstrates how to use the new delivery management APIs
 * in a React component with TypeScript.
 */

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { cashierApi } from '../services/cashierService';
import type { UnpaidDeliveryOrdersParams } from '../types/cashier';

/**
 * Example 1: Delivery Personnel Selector
 * A dropdown component to select delivery personnel
 */
export function DeliverySelector({
  value,
  onChange,
}: {
  value?: number | null;
  onChange?: (id: number | null) => void;
}) {
  const [internalId, setInternalId] = useState<number | null>(null);
  const selectedDeliveryId = value !== undefined ? value : internalId;
  const setSelectedDeliveryId = onChange || setInternalId;

  // Fetch delivery personnel list
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['deliveries'],
    queryFn: cashierApi.getDeliveries,
  });

  return (
    <div>
      <label htmlFor="delivery-select">اختر مندوب التوصيل:</label>
      <select
        id="delivery-select"
        value={selectedDeliveryId || ''}
        onChange={(e) => setSelectedDeliveryId(e.target.value ? Number(e.target.value) : null)}
        disabled={isLoading}
      >
        <option value="">-- اختر مندوب --</option>
        {deliveries?.map((delivery) => (
          <option key={delivery.id} value={delivery.id}>
            {delivery.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Example 2: Checkout with Delivery Assignment
 * Creating an order with delivery personnel assignment
 */
export function DeliveryCheckoutForm() {
  const [deliveryId, setDeliveryId] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  const checkoutMutation = useMutation({
    mutationFn: cashierApi.checkout,
    onSuccess: (data) => {
      console.log('Order created:', data);
      alert(`تم إنشاء الطلب رقم ${data.data.id} بنجاح`);
    },
    onError: (error) => {
      console.error('Checkout error:', error);
      alert('حدث خطأ أثناء إنشاء الطلب');
    },
  });

  const handleCheckout = async () => {
    await checkoutMutation.mutateAsync({
      module: 'delivery',
      financial_account_id: 1, // Use appropriate account
      delivery_id: deliveryId,
      address,
      phone,
      name,
    });
  };

  return (
    <div>
      <h3>إنشاء طلب توصيل</h3>
      <input
        type="text"
        placeholder="اسم العميل"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="tel"
        placeholder="رقم الهاتف"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        type="text"
        placeholder="العنوان"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      
      <DeliverySelector value={deliveryId} onChange={setDeliveryId} />
      
      <button
        onClick={handleCheckout}
        disabled={!address || checkoutMutation.isPending}
      >
        {checkoutMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء الطلب'}
      </button>
    </div>
  );
}

/**
 * Example 3: Update Order Status
 * Changing order status and assigning delivery personnel
 */
export function OrderStatusUpdater({ orderId }: { orderId: number }) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [deliveryId, setDeliveryId] = useState<number | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, payload }: { orderId: number; payload: any }) =>
      cashierApi.updateOrderStatus(orderId, payload),
    onSuccess: (data) => {
      alert(`تم تحديث حالة الطلب إلى: ${data.data.status}`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'حدث خطأ';
      alert(message);
    },
  });

  const handleStatusUpdate = async () => {
    const payload: any = { status: selectedStatus };
    
    // Add delivery_id if status is out_of_delivery
    if (selectedStatus === 'out_of_delivery' && deliveryId) {
      payload.delivery_id = deliveryId;
    }

    await updateStatusMutation.mutateAsync({ orderId, payload });
  };

  return (
    <div>
      <h3>تحديث حالة الطلب #{orderId}</h3>
      
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
      >
        <option value="">-- اختر الحالة --</option>
        <option value="done">تم التحضير</option>
        <option value="out_of_delivery">خارج للتوصيل</option>
        <option value="delivered">تم التسليم</option>
        <option value="return">مرتجع</option>
        <option value="failed_to_delivered">فشل التسليم</option>
      </select>

      {selectedStatus === 'out_of_delivery' && (
        <DeliverySelector value={deliveryId} onChange={setDeliveryId} />
      )}

      <button
        onClick={handleStatusUpdate}
        disabled={!selectedStatus || updateStatusMutation.isPending}
      >
        {updateStatusMutation.isPending ? 'جاري التحديث...' : 'تحديث الحالة'}
      </button>
    </div>
  );
}

/**
 * Example 4: Unpaid Delivery Orders List
 * Display and filter unpaid delivery orders
 */
export function UnpaidDeliveryOrdersList() {
  const [filters, setFilters] = useState<UnpaidDeliveryOrdersParams>({
    page: 1,
    per_page: 15,
  });
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  // Fetch unpaid orders
  const { data: ordersResponse, isLoading, refetch } = useQuery({
    queryKey: ['unpaid-delivery-orders', filters],
    queryFn: () => cashierApi.getUnpaidDeliveryOrders(filters),
  });

  // Filter by delivery personnel
  const handleDeliveryFilter = (deliveryId: number | null) => {
    setFilters((prev) => ({
      ...prev,
      delivery_id: deliveryId || undefined,
      page: 1, // Reset to first page
    }));
  };

  // Search orders
  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm || undefined,
      page: 1,
    }));
  };

  // Toggle order selection
  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  return (
    <div>
      <h2>طلبات التوصيل غير المدفوعة</h2>

      {/* Filters */}
      <div>
        <input
          type="text"
          placeholder="بحث برقم الطلب أو اسم العميل أو الهاتف"
          onChange={(e) => handleSearch(e.target.value)}
        />
        
        <select onChange={(e) => handleDeliveryFilter(Number(e.target.value) || null)}>
          <option value="">جميع المناديب</option>
          {/* Populate with delivery personnel */}
        </select>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <p>جاري التحميل...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(ordersResponse?.data.map((o) => o.id) || []);
                      } else {
                        setSelectedOrders([]);
                      }
                    }}
                  />
                </th>
                <th>رقم الطلب</th>
                <th>العميل</th>
                <th>الهاتف</th>
                <th>العنوان</th>
                <th>المندوب</th>
                <th>المبلغ</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {ordersResponse?.data.map((order) => (
                <tr key={order.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleOrderSelection(order.id)}
                    />
                  </td>
                  <td>{order.order_number}</td>
                  <td>{order.name}</td>
                  <td>{order.phone}</td>
                  <td>{order.address}</td>
                  <td>{order.delivery?.name}</td>
                  <td>{order.final_price.toFixed(2)}</td>
                  <td>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {ordersResponse?.meta && (
            <div>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))}
                disabled={ordersResponse.meta.current_page === 1}
              >
                السابق
              </button>
              <span>
                صفحة {ordersResponse.meta.current_page} من {ordersResponse.meta.last_page}
              </span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
                disabled={ordersResponse.meta.current_page === ordersResponse.meta.last_page}
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}

      {/* Settle Button */}
      {selectedOrders.length > 0 && (
        <SettlePaymentButton
          orderIds={selectedOrders}
          onSuccess={() => {
            setSelectedOrders([]);
            refetch();
          }}
        />
      )}
    </div>
  );
}

/**
 * Example 5: Settle Delivery Payments
 * Button to settle multiple orders
 */
export function SettlePaymentButton({
  orderIds,
  onSuccess,
}: {
  orderIds: number[];
  onSuccess?: () => void;
}) {
  const settleMutation = useMutation({
    mutationFn: cashierApi.settleDeliveryPayment,
    onSuccess: (data) => {
      alert(
        `تم تحصيل ${data.data.settled_count} طلب بإجمالي ${data.data.total_amount_collected} جنيه`
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'حدث خطأ أثناء التسوية';
      alert(message);
    },
  });

  const handleSettle = async () => {
    if (window.confirm(`هل تريد تسوية ${orderIds.length} طلب؟`)) {
      await settleMutation.mutateAsync({ order_ids: orderIds });
    }
  };

  return (
    <button
      onClick={handleSettle}
      disabled={settleMutation.isPending}
      style={{
        backgroundColor: '#10b981',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {settleMutation.isPending
        ? 'جاري التسوية...'
        : `تسوية ${orderIds.length} طلب`}
    </button>
  );
}

/**
 * Example 6: Complete Workflow
 * Full delivery management workflow in one component
 */
export function DeliveryManagementDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'checkout'>('orders');

  return (
    <div style={{ padding: '20px' }}>
      <h1>إدارة التوصيل</h1>

      {/* Tabs */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'orders' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'orders' ? 'white' : 'black',
            border: 'none',
            marginRight: '10px',
          }}
        >
          الطلبات غير المدفوعة
        </button>
        <button
          onClick={() => setActiveTab('checkout')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'checkout' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'checkout' ? 'white' : 'black',
            border: 'none',
          }}
        >
          إنشاء طلب جديد
        </button>
      </div>

      {/* Content */}
      {activeTab === 'orders' ? (
        <UnpaidDeliveryOrdersList />
      ) : (
        <DeliveryCheckoutForm />
      )}
    </div>
  );
}

/**
 * Example 7: Using with React Query Hooks
 * Custom hooks for better reusability
 */

// Custom hook for delivery personnel
export function useDeliveries() {
  return useQuery({
    queryKey: ['deliveries'],
    queryFn: cashierApi.getDeliveries,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Custom hook for unpaid orders
export function useUnpaidDeliveryOrders(params?: UnpaidDeliveryOrdersParams) {
  return useQuery({
    queryKey: ['unpaid-delivery-orders', params],
    queryFn: () => cashierApi.getUnpaidDeliveryOrders(params),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Custom hook for order status update
export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: number; payload: any }) =>
      cashierApi.updateOrderStatus(orderId, payload),
  });
}

// Custom hook for settle payment
export function useSettlePayment() {
  return useMutation({
    mutationFn: cashierApi.settleDeliveryPayment,
  });
}

/**
 * Example 8: Usage with custom hooks
 */
export function SimpleDeliveryManager() {
  const { data: deliveries } = useDeliveries();
  const { data: unpaidOrders } = useUnpaidDeliveryOrders();
  const updateStatus = useUpdateOrderStatus();
  const settlePayment = useSettlePayment();

  const handleAssignDelivery = async (orderId: number, deliveryId: number) => {
    await updateStatus.mutateAsync({
      orderId,
      payload: {
        status: 'out_of_delivery',
        delivery_id: deliveryId,
      },
    });
  };

  const handleSettleAll = async () => {
    if (!unpaidOrders?.data) return;
    
    const orderIds = unpaidOrders.data.map((order) => order.id);
    await settlePayment.mutateAsync({ order_ids: orderIds });
  };

  return (
    <div>
      <h2>مدير التوصيل البسيط</h2>
      
      <div>
        <h3>المناديب المتاحين: {deliveries?.length || 0}</h3>
        <h3>طلبات غير مدفوعة: {unpaidOrders?.data.length || 0}</h3>
        
        {unpaidOrders?.data && unpaidOrders.data.map((order) => (
          <div key={order.id} style={{ display: 'flex', gap: '8px', margin: '4px 0' }}>
            <span>طلب #{order.id}</span>
            {deliveries?.[0] && (
              <button onClick={() => handleAssignDelivery(order.id, deliveries[0].id)}>
                إسناد إلى {deliveries[0].name}
              </button>
            )}
          </div>
        ))}

        {unpaidOrders?.data && unpaidOrders.data.length > 0 && (
          <button onClick={handleSettleAll}>
            تسوية جميع الطلبات
          </button>
        )}
      </div>
    </div>
  );
}
