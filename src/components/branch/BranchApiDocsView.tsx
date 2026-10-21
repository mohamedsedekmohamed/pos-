import React, { useState, useMemo } from 'react';
import {
  FiSearch,
  FiCode,
  FiCopy,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiLock,
} from 'react-icons/fi';

interface ApiEndpoint {
  id: string;
  category: string;
  title: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  auth: string;
  controller?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  requestBody?: any;
  response: any;
  responseStatus?: string;
}

const API_DOCS_DATA: ApiEndpoint[] = [
  // 0. Admin Branches CRUD
  {
    id: 'admin-branches-select-options',
    category: '0. إدارة الفروع (Admin Branches)',
    title: 'خيارات الفروع للقوائم المنسدلة (Select Options)',
    description: 'جلب قائمة الفروع المبسطة (ID والاسم) للاستخدام في القوائم المنسدلة وفلاتر البحث.',
    method: 'GET',
    url: '/api/admin/branches/select-options',
    auth: 'auth:admin, role:admin',
    controller: 'App\\Http\\Controllers\\api\\admin\\BranchController',
    response: {
      status: true,
      data: {
        branches: [
          {
            id: 1,
            name: { ar: 'فرع المعادي', en: 'Maadi Branch' },
          },
        ],
      },
    },
  },
  {
    id: 'admin-branches-list',
    category: '0. إدارة الفروع (Admin Branches)',
    title: 'قائمة الفروع مع الترقيم (List Branches)',
    description: 'استرجاع قائمة الفروع مع دعم الترقيم والبحث وحالة كل فرع وإحداثياته الجغرافية.',
    method: 'GET',
    url: '/api/admin/branches',
    auth: 'auth:admin, role:admin',
    controller: 'App\\Http\\Controllers\\api\\admin\\BranchController',
    params: {
      page: 'رقم الصفحة (افتراضي: 1)',
      per_page: 'عدد العناصر في الصفحة (افتراضي: 15)',
    },
    response: {
      data: [
        {
          id: 1,
          name: { ar: 'فرع المعادي', en: 'Maadi Branch' },
          user_name: 'branch_maadi',
          address: 'شارع النصر، المعادي',
          location: [{ lat: 29.9602, lng: 31.2569 }],
          watts: '01000000000',
          facebook: 'https://facebook.com/branch',
          status: true,
          role: 'branch',
          created_at: '2026-10-12T01:58:00+03:00',
          updated_at: '2026-10-12T01:58:00+03:00',
        },
      ],
      links: { first: '...', last: '...', prev: null, next: null },
      meta: { current_page: 1, from: 1, last_page: 1, per_page: 15, total: 1 },
    },
  },
  {
    id: 'admin-branches-create',
    category: '0. إدارة الفروع (Admin Branches)',
    title: 'إضافة فرع جديد (Create Branch)',
    description: 'إنشاء فرع جديد وتعيين اسم المستخدم وكلمة المرور والعنوان والإحداثيات.',
    method: 'POST',
    url: '/api/admin/branches',
    auth: 'auth:admin, role:admin',
    controller: 'App\\Http\\Controllers\\api\\admin\\BranchController',
    requestBody: {
      name: {
        ar: 'فرع التجمع',
        en: 'Tagamoa Branch',
      },
      user_name: 'branch_tagamoa',
      password: 'Password@123',
      address: 'شارع التسعين',
      location: [{ lat: 30.0298, lng: 31.4721 }],
      watts: '+201012345678',
      facebook: 'https://facebook.com/tagamoa',
      status: true,
    },
    responseStatus: '201 Created',
    response: {
      status: true,
      message: 'Branch created successfully.',
      data: {
        id: 2,
        name: { ar: 'فرع التجمع', en: 'Tagamoa Branch' },
        user_name: 'branch_tagamoa',
        address: 'شارع التسعين',
        location: [{ lat: 30.0298, lng: 31.4721 }],
        watts: '+201012345678',
        facebook: 'https://facebook.com/tagamoa',
        status: true,
        role: 'branch',
        created_at: '2026-10-20T02:00:00+03:00',
        updated_at: '2026-10-20T02:00:00+03:00',
      },
    },
  },
  {
    id: 'admin-branches-show',
    category: '0. إدارة الفروع (Admin Branches)',
    title: 'تفاصيل فرع محدد (Show Branch)',
    description: 'استعراض بيانات الفرع الكاملة عن طريق المعرف الرقمي {id}.',
    method: 'GET',
    url: '/api/admin/branches/{id}',
    auth: 'auth:admin, role:admin',
    controller: 'App\\Http\\Controllers\\api\\admin\\BranchController',
    response: {
      data: {
        id: 1,
        name: { ar: 'فرع المعادي', en: 'Maadi Branch' },
        user_name: 'branch_maadi',
        address: 'شارع النصر، المعادي',
        location: [{ lat: 29.9602, lng: 31.2569 }],
        watts: '01000000000',
        facebook: 'https://facebook.com/branch',
        status: true,
        role: 'branch',
        created_at: '2026-10-12T01:58:00+03:00',
        updated_at: '2026-10-12T01:58:00+03:00',
      },
    },
  },
  {
    id: 'admin-branches-update',
    category: '0. إدارة الفروع (Admin Branches)',
    title: 'تعديل فرع (Update Branch)',
    description: 'تعديل الاسم أو العنوان أو الإحداثيات أو الحالة لأي فرع مسجل.',
    method: 'PUT',
    url: '/api/admin/branches/{id}',
    auth: 'auth:admin, role:admin',
    controller: 'App\\Http\\Controllers\\api\\admin\\BranchController',
    requestBody: {
      name: {
        ar: 'فرع المعادي الجديد',
        en: 'New Maadi Branch',
      },
      address: 'المعادي الجديدة',
    },
    response: {
      status: true,
      message: 'Branch updated successfully.',
      data: {
        id: 1,
        name: { ar: 'فرع المعادي الجديد', en: 'New Maadi Branch' },
        user_name: 'branch_maadi',
        address: 'المعادي الجديدة',
        location: [{ lat: 29.9602, lng: 31.2569 }],
        watts: '01000000000',
        facebook: 'https://facebook.com/branch',
        status: true,
        role: 'branch',
        created_at: '2026-10-12T01:58:00+03:00',
        updated_at: '2026-10-20T02:05:00+03:00',
      },
    },
  },
  {
    id: 'admin-branches-delete',
    category: '0. إدارة الفروع (Admin Branches)',
    title: 'حذف فرع (Delete Branch)',
    description: 'حذف فرع نهائياً من قاعدة البيانات مع فحص الارتباطات السابقة.',
    method: 'DELETE',
    url: '/api/admin/branches/{id}',
    auth: 'auth:admin, role:admin',
    controller: 'App\\Http\\Controllers\\api\\admin\\BranchController',
    response: {
      status: true,
      message: 'Branch deleted successfully.',
    },
  },

  // 1. Auth & Login
  {
    id: 'branch-login',
    category: '1. المصادقة والترويسات (Authentication)',
    title: 'تسجيل دخول الفرع (Branch Login)',
    description: 'تسجيل الدخول بدور الفرع والحصول على JWT Bearer Token.',
    method: 'POST',
    url: '/api/auth/login',
    auth: 'عام (Public)',
    requestBody: {
      name: 'branch_user_name',
      password: 'password123',
      guard: 'branch',
    },
    response: {
      status: true,
      message: 'Successfully authenticated',
      data: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'bearer',
        expires_in: 3600,
        guard: 'branch',
        user: {
          id: 1,
          name: { ar: 'فرع المعادي', en: 'Maadi Branch' },
          user_name: 'branch_user_name',
          address: 'شارع النصر، المعادي',
          role: 'branch',
        },
      },
    },
  },

  // 2. Cashiers
  {
    id: 'branch-cashiers-list',
    category: '2. نقاط الكاشير (Cashiers)',
    title: 'قائمة كاشيرات الفرع (List Cashiers)',
    description: 'استرجاع نقاط بيع وأجهزة الكاشير التابعة للفرع الحالي.',
    method: 'GET',
    url: '/api/branch/cashiers',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\CashierController',
    response: {
      data: [
        {
          id: 1,
          name: 'كاشير الصالة الرئيسي',
          cashier_man_id: 2,
          branch_id: 1,
          branch: { id: 1, name: { ar: 'فرع المعادي', en: 'Maadi Branch' } },
          created_at: '2026-10-16T17:00:00+03:00',
          updated_at: '2026-10-16T17:00:00+03:00',
        },
      ],
      meta: { current_page: 1, per_page: 15, total: 1 },
    },
  },
  {
    id: 'branch-cashiers-create',
    category: '2. نقاط الكاشير (Cashiers)',
    title: 'إضافة كاشير جديد للفرع (Create Cashier)',
    description: 'إنشاء نقطة كاشير جديدة وربطها بموظف كاشير.',
    method: 'POST',
    url: '/api/branch/cashiers',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\CashierController',
    requestBody: {
      name: 'كاشير التيك أواي 2',
      cashier_man_id: 2,
    },
    responseStatus: '201 Created',
    response: {
      status: true,
      message: 'Cashier created successfully.',
      data: {
        id: 3,
        name: 'كاشير التيك أواي 2',
        cashier_man_id: 2,
        branch_id: 1,
      },
    },
  },

  // 3. Cashier Men
  {
    id: 'branch-cashier-men-list',
    category: '3. موظفو الكاشير (Cashier Men)',
    title: 'قائمة موظفي الكاشير (List Cashier Men)',
    description: 'استعراض جميع الموظفين التابعين للفرع والشيفت ونقطة البيع المسندة إليهم.',
    method: 'GET',
    url: '/api/branch/cashier-men',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\CashierManController',
    response: {
      data: [
        {
          id: 2,
          name: 'محمود سعيد',
          cashier_id: 1,
          branch_id: 1,
          shift_id: 1,
          role: 'cashier_man',
        },
      ],
    },
  },

  // 4. Dashboard
  {
    id: 'branch-dashboard',
    category: '4. لوحة التحكم والإحصائيات (Dashboard)',
    title: 'إحصائيات مبيعات الفرع الشهرية والسنوية',
    description: 'مؤشرات الطلبات، الإيرادات، الرسم البياني، والمنتجات الأكثر طلباً في الفرع.',
    method: 'GET',
    url: '/api/branch/dashboard?year=2026',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\DashboardController',
    response: {
      status: true,
      data: {
        year: 2026,
        branch_id: 1,
        total_orders: 2450,
        total_final_price: 75200.0,
        top_products: [
          {
            product_id: 12,
            product_name: { ar: 'وجبة شاورما دجاج', en: 'Chicken Shawarma' },
            total_quantity: 420,
          },
        ],
        chart: {
          months: ['January', 'February', 'March', 'April', 'May'],
          orders_count: [180, 210, 195, 240, 260],
          final_price: [6200.5, 7100.0, 6800.0, 7900.0, 8400.0],
        },
      },
    },
  },

  // 5. Deliveries
  {
    id: 'branch-deliveries',
    category: '5. طيارو التوصيل (Deliveries)',
    title: 'قائمة طياري ومندوبي التوصيل',
    description: 'إدارة وتتبع مناديب التوصيل التابعين للفرع وأرقام هواتفهم وصور الهوية.',
    method: 'GET',
    url: '/api/branch/deliveries',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\DeliveryController',
    response: {
      data: [
        {
          id: 1,
          name: 'أحمد الطيار',
          phone: '01123456789',
          branch_id: 1,
          id_images: ['...'],
        },
      ],
    },
  },

  // 6. Financial Accounts
  {
    id: 'branch-financial-accounts',
    category: '6. الخزن والحسابات المالية (Financial Accounts)',
    title: 'قائمة خزن وحسابات الفرع النقدية والبنكية',
    description: 'إدارة الخزائن وأرصدتها ومطابقتها مع إيرادات الطلبات ومصروفات المشتريات.',
    method: 'GET',
    url: '/api/branch/financial-accounts',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\FinancialAccountController',
    response: {
      data: [
        {
          id: 1,
          name: { ar: 'الخزينة الرئيسية للفرع', en: 'Branch Main Safe' },
          balance: 15000.5,
          status: true,
          branch_id: 1,
        },
      ],
    },
  },

  // 7. Halls & 8. Hall Tables
  {
    id: 'branch-halls',
    category: '7. الصالات والطاولات (Halls & Tables)',
    title: 'صالات الفرع (List Halls)',
    description: 'قائمة صالات تناول الطعام بالفرع (الرئيسية، التراس الخارجي، الـ VIP).',
    method: 'GET',
    url: '/api/branch/halls',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\HallController',
    response: {
      data: [
        {
          id: 1,
          name: { ar: 'الصالة الرئيسية', en: 'Main Dining Area' },
          status: true,
          branch_id: 1,
        },
      ],
    },
  },
  {
    id: 'branch-hall-tables',
    category: '7. الصالات والطاولات (Halls & Tables)',
    title: 'طاولات الصالة ورمز QR (List Hall Tables)',
    description: 'طاولات الفرع مع الكود المخصص ورابط رمز الاستجابة السريعة QR للطلب المباشر.',
    method: 'GET',
    url: '/api/branch/hall-tables',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\HallTableController',
    response: {
      data: [
        {
          id: 1,
          code: 'TAB-001',
          name: 'طاولة رقم 1',
          branch_id: 1,
          hall_id: 1,
          status: true,
          qr: 'http://.../storage/qr_codes/table_1_qr.svg',
        },
      ],
    },
  },

  // 9. Inventory Materials & 10. Inventory Recipes
  {
    id: 'branch-inventory-materials',
    category: '9. جرد المخزون (Inventory)',
    title: 'فتح جرد مواد خام جديد (Start Material Inventory)',
    description: 'بدء عملية جرد فعلي للمخزون ومطابقة الرصيد النظري مع الفعلي.',
    method: 'POST',
    url: '/api/branch/inventory/materials',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\InventoryMaterialController',
    requestBody: {
      name: 'جرد نهاية الأسبوع للمواد الخام',
    },
    responseStatus: '201 Created',
    response: {
      status: true,
      message: 'Inventory created successfully.',
      data: {
        id: 5,
        name: 'جرد نهاية الأسبوع للمواد الخام',
        status: 'pending',
        branch_id: 1,
        items_count: 28,
      },
    },
  },

  // 11. Kitchens & 12. Kitchen Products
  {
    id: 'branch-kitchens',
    category: '11. المطابخ والمنتجات (Kitchens)',
    title: 'قائمة مطابخ الفرع (List Kitchens)',
    description: 'مطابخ الفرع وحسابات شاشات المطبخ (KDS) لكل قسم (مشويات، بارد، مشروبات).',
    method: 'GET',
    url: '/api/branch/kitchens',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\KitchenController',
    response: {
      data: [
        {
          id: 1,
          name: { ar: 'مطبخ المشويات والوجبات الساخنة', en: 'Grill & Hot Kitchen' },
          user_name: 'grill_kitchen_b1',
          branch_id: 1,
          status: true,
        },
      ],
    },
  },
  {
    id: 'branch-kitchen-products-assign',
    category: '11. المطابخ والمنتجات (Kitchens)',
    title: 'تعيين وتوزيع المنتجات على مطابخ الفرع',
    description: 'ربط مجموعة من الأصناف والوجبات بمطبخ محدد لتوجيه طباعة الطلبات والشاشات.',
    method: 'POST',
    url: '/api/branch/kitchen-products/assign',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\KitchenProductController',
    requestBody: {
      kitchen_id: 2,
      product_ids: [14, 18, 22],
    },
    response: {
      status: true,
      message: 'Products assigned to kitchen successfully.',
    },
  },

  // 13. Manufacturing
  {
    id: 'branch-manufacturing',
    category: '13. التصنيع وتشغيل الوصفات (Manufacturing)',
    title: 'تنفيذ أمر تصنيع بالفرع (Execute Manufacturing)',
    description: 'خصم المواد الخام المعيارية وإضافة المنتج/الصلصة الناتجة إلى رصيد الفرع.',
    method: 'POST',
    url: '/api/branch/manufacturing',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\ManufactringController',
    requestBody: {
      product_recipe_id: 4,
      count: 20,
      recipes: [
        { material_id: 1, count: 5 },
        { material_id: 2, count: 2 },
      ],
    },
    responseStatus: '201 Created',
    response: {
      status: true,
      message: 'Manufacturing completed and stock updated successfully.',
      data: {
        id: 11,
        product_recipe_id: 4,
        count: 20,
        branch_id: 1,
      },
    },
  },

  // 14. Orders
  {
    id: 'branch-orders-list',
    category: '14. الطلبات والمبيعات (Orders)',
    title: 'قائمة طلبات الفرع (List Orders)',
    description: 'استعراض وفلترة الطلبات حسب التاريخ أو الوردية أو نوع الطلب (صالة / تيك أواي / توصيل).',
    method: 'GET',
    url: '/api/branch/orders?is_pos=true&module=takeaway',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\OrderController',
    response: {
      data: [
        {
          id: 105,
          shift_id: 1,
          cashier_id: 1,
          module: 'takeaway',
          name: 'كريم أحمد',
          phone: '01012345678',
          final_price: 171.0,
          status: 'preparing',
        },
      ],
    },
  },
  {
    id: 'branch-orders-check-new',
    category: '14. الطلبات والمبيعات (Orders)',
    title: 'فحص الطلبات الجديدة للإشعارات (Check New Orders)',
    description: 'استطلاع دوري (Polling) لتنبيه الفرع بالطلبات الواردة الجديدة فور وصولها.',
    method: 'POST',
    url: '/api/branch/orders/check-new',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\OrderController',
    requestBody: { count: 10 },
    response: {
      status: true,
      server_count: 12,
      client_count: 10,
      difference: 2,
      has_new: true,
      order_ids: [106, 107],
    },
  },

  // 15. Purchases
  {
    id: 'branch-purchases',
    category: '15. المشتريات وإضافة الرصيد (Purchases)',
    title: 'فواتير مشتريات وتوريد الفرع',
    description: 'تسجيل استلام بضاعة ومواد خام من الموردين وتغذية مخزون الفرع تلقائياً.',
    method: 'GET',
    url: '/api/branch/purchases',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\PurchaseController',
    response: {
      status: true,
      data: [
        {
          id: 1,
          supplier_id: 1,
          total_cost: 2500.0,
          total_quantity: 50.0,
          branch_id: 1,
        },
      ],
    },
  },

  // 16. Reports
  {
    id: 'branch-reports-start-shifts',
    category: '16. التقارير والعهد (Reports)',
    title: 'تقرير عهدة وشيفتات الكاشير (Start Shift Report)',
    description: 'ملخص النقدية المستلمة والعجز والزيادة وإجمالي مبيعات كل وردية.',
    method: 'GET',
    url: '/api/branch/reports/start-shifts',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\ReportController',
    response: {
      status: true,
      summary: {
        total_default_amount: 12000.0,
        total_collected_mony: 11950.0,
        total_deficit: 50.0,
        shifts_count: 8,
      },
      data: [
        {
          id: 1,
          cashier_name: 'كاشير 1',
          cashier_man_name: 'أحمد محمود',
          default_amount: 1500.0,
          collected_mony: 1500.0,
          deficit: 0.0,
        },
      ],
    },
  },

  // 17. Shifts
  {
    id: 'branch-shifts',
    category: '17. الشيفتات والورديات (Shifts)',
    title: 'قائمة شيفتات الفرع (List Shifts)',
    description: 'الورديات المتاحة للفرع (صباحي، مسائي، ليلي) ومواعيد البداية والنهاية.',
    method: 'GET',
    url: '/api/branch/shifts',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\ShiftController',
    response: {
      data: [
        {
          id: 1,
          name: { ar: 'الشيفت الصباحي', en: 'Morning Shift' },
          start_time: '08:00',
          end_time: '16:00',
          is_tomorrow: false,
          branch_id: 1,
        },
      ],
    },
  },

  // 18. Wastes
  {
    id: 'branch-wastes',
    category: '18. الهوالك وإهلاك المخزون (Wastes)',
    title: 'تسجيل هالك وخصمه من مخزون الفرع (Record Waste)',
    description: 'توثيق المواد التالفة أو المنتهية وخصمها من الرصيد مع تحديد السبب والكمية.',
    method: 'POST',
    url: '/api/branch/wastes',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\WasteController',
    requestBody: {
      material_id: 2,
      count: 3,
    },
    responseStatus: '201 Created',
    response: {
      status: true,
      message: 'Waste recorded successfully.',
      data: {
        id: 2,
        material_id: 2,
        count: 3,
        branch_id: 1,
      },
    },
  },

  // 19. Addons
  {
    id: 'branch-addons',
    category: '19. الإضافات (Addons)',
    title: 'خيارات وقائمة الإضافات للفرع',
    description: 'قائمة الصوصات والجبن والمقبلات الإضافية وأسعارها ومطابخ تحضيرها.',
    method: 'GET',
    url: '/api/branch/addons',
    auth: 'auth:branch, role:branch',
    controller: 'App\\Http\\Controllers\\api\\branch\\AddonController',
    response: {
      data: [
        {
          id: 1,
          name: 'صوص جبنة شيدر',
          price: 20.0,
          kitchen_id: 1,
        },
      ],
    },
  },
];

export const BranchApiDocsView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(API_DOCS_DATA[0].id);
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    API_DOCS_DATA.forEach((ep) => set.add(ep.category));
    return ['all', ...Array.from(set)];
  }, []);

  // Filtered endpoints
  const filtered = useMemo(() => {
    return API_DOCS_DATA.filter((ep) => {
      const matchCat = selectedCategory === 'all' || ep.category === selectedCategory;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        ep.title.toLowerCase().includes(q) ||
        ep.url.toLowerCase().includes(q) ||
        ep.description.toLowerCase().includes(q) ||
        ep.method.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, selectedCategory]);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMap((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const getMethodBadgeClass = (m: string) => {
    switch (m) {
      case 'GET':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'POST':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'PUT':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Info Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-primary/10 via-indigo-500/10 to-violet-500/10 border border-primary/20 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold mb-2">
            <FiCode className="w-3.5 h-3.5" />
            <span>توثيق شامل لكافة واجهات الـ APIs</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            دليل واجهات برمجة التطبيقات لنظام الفرع والفروع (20 قسماً)
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            توثيق تفصيلي ومباشر يشمل إدارة الفروع بالـ Admin مسار (<code className="text-primary font-mono font-bold">/api/admin/branches</code>)، بالإضافة لجميع خدمات الفرع التشغيلية (<code className="text-indigo-400 font-mono font-bold">/api/branch/*</code>).
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-neutral-300 bg-white/70 dark:bg-black/30 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 shrink-0">
          <FiLock className="w-3.5 h-3.5 text-primary" />
          <span>Bearer JWT Token</span>
        </div>
      </div>

      {/* Search & Category Pills */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالرابط أو اسم الواجهة أو الوصف (مثال: branches, cashiers, dashboard)..."
            className="w-full pr-11 pl-4 py-3.5 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-neutral-500"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
              }`}
            >
              {cat === 'all' ? 'جميع الواجهات (الكل)' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Endpoints Accordion List */}
      <div className="space-y-4">
        {filtered.map((ep) => {
          const isExpanded = expandedId === ep.id;
          return (
            <div
              key={ep.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-white dark:bg-[#121216] border-primary/40 shadow-lg shadow-primary/5'
                  : 'bg-white/70 dark:bg-[#101014]/80 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
              }`}
            >
              {/* Endpoint Header Bar */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : ep.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border ${getMethodBadgeClass(
                      ep.method
                    )}`}
                  >
                    {ep.method}
                  </span>

                  <span className="font-mono text-sm font-bold text-slate-800 dark:text-white dir-ltr">
                    {ep.url}
                  </span>

                  <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                    — {ep.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-neutral-400 border border-slate-200 dark:border-white/5">
                    {ep.category.split('(')[0].trim()}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center text-slate-400 dark:text-neutral-400">
                    {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Endpoint Details Accordion Body */}
              {isExpanded && (
                <div className="p-4 sm:p-6 pt-0 border-t border-slate-100 dark:border-white/5 space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                    {ep.description}
                  </p>

                  {/* Controller & Auth Meta */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-neutral-500 font-semibold block mb-0.5">
                        الصلاحيات المطلوبة (Auth):
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-white">
                        {ep.auth}
                      </span>
                    </div>
                    {ep.controller && (
                      <div>
                        <span className="text-slate-400 dark:text-neutral-500 font-semibold block mb-0.5">
                          الـ Controller المسؤول:
                        </span>
                        <span className="font-mono text-[11px] font-bold text-primary truncate block" dir="ltr">
                          {ep.controller}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Copy URL */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 font-mono text-xs" dir="ltr">
                    <span className="text-slate-700 dark:text-neutral-300 select-all font-bold truncate">
                      {ep.url}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`url-${ep.id}`, ep.url)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.12] border border-slate-300 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-neutral-200 transition-colors shrink-0 cursor-pointer"
                    >
                      {copiedMap[`url-${ep.id}`] ? (
                        <>
                          <FiCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <FiCopy className="w-3.5 h-3.5" />
                          <span>نسخ المسار</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Parameters (if any) */}
                  {ep.params && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-neutral-300 mb-2">
                        المعاملات (Query Parameters):
                      </h4>
                      <div className="space-y-1 text-xs font-mono">
                        {Object.entries(ep.params).map(([k, v]) => (
                          <div
                            key={k}
                            className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 flex items-center justify-between"
                          >
                            <span className="text-primary font-bold">{k}</span>
                            <span className="text-slate-500 dark:text-neutral-400 font-sans">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Body (if any) */}
                  {ep.requestBody && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-neutral-300">
                          جسم الطلب (Request Body JSON):
                        </h4>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(`req-${ep.id}`, JSON.stringify(ep.requestBody, null, 2))
                          }
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                        >
                          <FiCopy className="w-3 h-3" />
                          <span>{copiedMap[`req-${ep.id}`] ? 'تم النسخ!' : 'نسخ الـ JSON'}</span>
                        </button>
                      </div>
                      <pre
                        className="p-4 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto max-h-60"
                        dir="ltr"
                      >
                        {JSON.stringify(ep.requestBody, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Response Sample */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-neutral-300">
                          نموذج الاستجابة (Success Response):
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-mono font-bold">
                          {ep.responseStatus || '200 OK'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(`res-${ep.id}`, JSON.stringify(ep.response, null, 2))
                        }
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                      >
                        <FiCopy className="w-3 h-3" />
                        <span>{copiedMap[`res-${ep.id}`] ? 'تم النسخ!' : 'نسخ الاستجابة'}</span>
                      </button>
                    </div>
                    <pre
                      className="p-4 rounded-xl bg-slate-900 text-blue-300 text-xs font-mono overflow-x-auto max-h-64"
                      dir="ltr"
                    >
                      {JSON.stringify(ep.response, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
