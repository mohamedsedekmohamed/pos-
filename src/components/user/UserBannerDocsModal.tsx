import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiX,
  FiCode,
  FiCopy,
  FiCheck,
  FiTerminal,
  FiInfo,
  FiCheckCircle,
  FiPlay,
  FiRefreshCw,
} from 'react-icons/fi';
import { userAxios, USER_API_BASE_URL } from '../../services/userService';

interface UserBannerDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserBannerDocsModal: React.FC<UserBannerDocsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'flutter' | 'curl' | 'js' | 'react'>('flutter');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live API Test State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: number;
    timeMs: number;
    data: any;
  } | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleTestApi = async () => {
    setIsTesting(true);
    setTestError(null);
    const start = performance.now();
    try {
      const res = await userAxios.get('/api/user/banners', {
        headers: { Accept: 'application/json' },
      });
      const end = performance.now();
      setTestResult({
        status: res.status,
        timeMs: Math.round(end - start),
        data: res.data,
      });
    } catch (err: any) {
      setTestError(err.message || 'حدث خطأ أثناء فحص الواجهة');
    } finally {
      setIsTesting(false);
    }
  };

  const sampleSuccessJson = JSON.stringify(
    {
      status: true,
      data: [
        {
          id: 13,
          image: "https://ecommerce.mazoom.online/storage/banners/promo_weekend.webp",
          created_at: "2026-10-23T20:00:00.000000Z"
        },
        {
          id: 12,
          image: "https://ecommerce.mazoom.online/storage/banners/coffee_offer.webp",
          created_at: "2026-10-23T19:30:00.000000Z"
        }
      ]
    },
    null,
    2
  );

  const flutterCode = `import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';

// 1. Model Class
class BannerModel {
  final int id;
  final String image;
  final String? createdAt;

  BannerModel({
    required this.id, 
    required this.image,
    this.createdAt,
  });

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    return BannerModel(
      id: json['id'],
      image: json['image'],
      createdAt: json['created_at'],
    );
  }
}

// 2. Fetch Function (No Token Required)
Future<List<BannerModel>> fetchBanners({String lang = 'ar'}) async {
  final url = Uri.parse('https://ecommerce.mazoom.online/api/user/banners?lang=\$lang');
  final response = await http.get(
    url,
    headers: {
      'Accept': 'application/json',
      'lang': lang,
    },
  );

  if (response.statusCode == 200) {
    final Map<String, dynamic> body = jsonDecode(response.body);
    final List<dynamic> data = body['data'] ?? [];
    return data.map((item) => BannerModel.fromJson(item)).toList();
  } else {
    throw Exception('فشل في جلب البانرات الإعلانية');
  }
}

// 3. Carousel Slider Widget Example
Widget buildBannersCarousel(List<BannerModel> bannersList) {
  if (bannersList.isEmpty) return const SizedBox.shrink();

  return CarouselSlider(
    options: CarouselOptions(
      height: 180,
      autoPlay: true,
      autoPlayInterval: const Duration(seconds: 4),
      enlargeCenterPage: true,
      viewportFraction: 0.92,
      aspectRatio: 16 / 9,
    ),
    items: bannersList.map((banner) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Image.network(
          banner.image,
          fit: BoxFit.cover,
          width: double.infinity,
          loadingBuilder: (context, child, progress) {
            if (progress == null) return child;
            return const Center(child: CircularProgressIndicator());
          },
          errorBuilder: (context, error, stackTrace) =>
              Container(
                color: Colors.grey[200],
                child: const Icon(Icons.broken_image, size: 50, color: Colors.grey),
              ),
        ),
      );
    }).toList(),
  );
}`;

  const curlCode = `curl -X GET "https://ecommerce.mazoom.online/api/user/banners" \\
  -H "Accept: application/json" \\
  -H "lang: ar"`;

  const jsCode = `// جلب البانرات باستخدام Fetch API في JavaScript / TypeScript
async function getBanners(lang = 'ar') {
  try {
    const response = await fetch(\`https://ecommerce.mazoom.online/api/user/banners?lang=\${lang}\`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'lang': lang
      }
    });

    const result = await response.json();
    if (result.status) {
      console.log('✅ تم جلب البانرات بنجاح:', result.data);
      // استخراج روابط الصور المباشرة
      const bannerImages = result.data.map(b => b.image);
      return result.data;
    } else {
      console.warn('تنبيه: الاستجابة غير ناجحة', result);
      return [];
    }
  } catch (error) {
    console.error('❌ خطأ في جلب البانرات:', error);
    return [];
  }
}`;

  const reactCode = `import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface UserBanner {
  id: number;
  image: string;
  created_at?: string;
}

export const useBanners = (lang = 'ar') => {
  return useQuery<UserBanner[]>({
    queryKey: ['user-banners', lang],
    queryFn: async () => {
      const { data } = await axios.get('https://ecommerce.mazoom.online/api/user/banners', {
        params: { lang },
        headers: { Accept: 'application/json' },
      });
      return data.data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
};`;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#0f0f15] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-primary/10 via-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/15 dark:bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm shrink-0">
              <FiCode className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-bold">
                  Public Endpoint
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold">
                  بدون تسجيل دخول (No Token)
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                توثيق واجهة عرض البانرات للعملاء (User Banners API)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-all shrink-0"
            title="إغلاق"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-700 dark:text-neutral-300 text-xs sm:text-sm">
          
          {/* Subtitle / Intro */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 flex items-start gap-3">
            <FiInfo className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed text-xs sm:text-sm">
              دليل تقني مخصص لمطوري تطبيقات الموبايل (Flutter/React Native) والويب لجلب البانرات الإعلانية بدون توكن (Public Endpoint) لعرضها في السلايدر أو الكاروسيل (Carousel).
            </p>
          </div>

          {/* Quick Stats / Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#15151e] border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase">المصادقة</span>
              <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <FiCheckCircle className="w-4 h-4 shrink-0" />
                عامة (No Token Required)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#15151e] border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase">نوع الروابط</span>
              <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                روابط كاملة مباشرة (Full CDN URL)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#15151e] border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase">الترتيب الزمني</span>
              <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                تلقائي من الأحدث إلى الأقدم
              </p>
            </div>
          </div>

          {/* Section 1: Endpoint & Live Tester */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                3. واجهة جلب البانرات (Endpoint Details)
              </h3>
              
              <button
                type="button"
                onClick={handleTestApi}
                disabled={isTesting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الاختبار...</span>
                  </>
                ) : (
                  <>
                    <FiPlay className="w-3.5 h-3.5" />
                    <span>جرّب الـ API مباشرة</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 text-white font-mono text-xs flex flex-wrap items-center justify-between gap-2 border border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-bold text-[10px]">
                  GET
                </span>
                <span className="text-emerald-400 truncate">
                  https://ecommerce.mazoom.online/api/user/banners
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy('endpoint-url', 'https://ecommerce.mazoom.online/api/user/banners')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                title="نسخ الرابط"
              >
                {copiedKey === 'endpoint-url' ? (
                  <FiCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <FiCopy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Live Test Output (if tested) */}
            {testResult && (
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <FiCheckCircle className="w-4 h-4" />
                    تم الاتصال بنجاح ({testResult.status} OK)
                  </span>
                  <span>زمن الاستجابة: {testResult.timeMs}ms</span>
                </div>
                <div className="relative">
                  <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 text-[11px] font-mono overflow-x-auto max-h-48" dir="ltr">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopy('live-test', JSON.stringify(testResult.data, null, 2))}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] flex items-center gap-1"
                  >
                    {copiedKey === 'live-test' ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiCopy className="w-3 h-3" />}
                    <span>نسخ</span>
                  </button>
                </div>
              </div>
            )}

            {testError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                {testError}
              </div>
            )}
          </div>

          {/* Section 2: Headers Table */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              2. الهيدرز والمعاملات (Headers & Parameters)
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-white/[0.03] text-slate-600 dark:text-neutral-400 font-bold border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="p-3">الهيدر / المعامل</th>
                    <th className="p-3">النوع</th>
                    <th className="p-3">إلزامي؟</th>
                    <th className="p-3">الوصف</th>
                    <th className="p-3">القيمة الافتراضية / مثال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  <tr>
                    <td className="p-3 font-mono text-primary font-bold">Accept</td>
                    <td className="p-3 font-mono">String</td>
                    <td className="p-3 font-bold text-rose-500">نعم</td>
                    <td className="p-3">صيغة الاستجابة المطلوبة</td>
                    <td className="p-3 font-mono">application/json</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-indigo-400 font-bold">lang</td>
                    <td className="p-3 font-mono">String</td>
                    <td className="p-3 text-slate-400">اختياري</td>
                    <td className="p-3">لغة الاستجابة المطلوبة</td>
                    <td className="p-3 font-mono">ar أو en</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Response Structure Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              4. هيكل البيانات المستلمة (Response Structure)
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 dark:bg-white/[0.03] text-slate-600 dark:text-neutral-400 font-bold border-b border-slate-200 dark:border-white/10">
                    <tr>
                      <th className="p-2.5">الحقل (Field)</th>
                      <th className="p-2.5">النوع</th>
                      <th className="p-2.5">الوصف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                    <tr>
                      <td className="p-2.5 font-mono text-primary font-bold">status</td>
                      <td className="p-2.5 font-mono">Boolean</td>
                      <td className="p-2.5">حالة العملية (true دائماً في حال النجاح).</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-primary font-bold">data</td>
                      <td className="p-2.5 font-mono">Array</td>
                      <td className="p-2.5">مصفوفة تحتوي على كائنات البانرات.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-primary font-bold">data[].id</td>
                      <td className="p-2.5 font-mono">Integer</td>
                      <td className="p-2.5">المعرف الفريد للبانر الإعلاني.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-primary font-bold">data[].image</td>
                      <td className="p-2.5 font-mono">String (URL)</td>
                      <td className="p-2.5">رابط الـ URL المباشر والكامل لصورة البانر.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-primary font-bold">data[].created_at</td>
                      <td className="p-2.5 font-mono">String (ISO 8601)</td>
                      <td className="p-2.5">تاريخ ووقت إنشاء البانر.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Sample Success JSON */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3 space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>استجابة نموذجية (200 OK)</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('sample-json', sampleSuccessJson)}
                    className="p-1 rounded bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 text-[10px]"
                  >
                    {copiedKey === 'sample-json' ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiCopy className="w-3 h-3" />}
                    <span>نسخ</span>
                  </button>
                </div>
                <pre className="text-slate-300 font-mono text-[11px] overflow-x-auto p-2" dir="ltr">
                  {sampleSuccessJson}
                </pre>
              </div>
            </div>
          </div>

          {/* Section 4: Interactive Code Examples */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              5. أمثلة كود للتكامل (Flutter & Web Examples)
            </h3>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('flutter')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'flutter'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📱 Flutter (Dart + Carousel)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('curl')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'curl'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                💻 cURL
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('js')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'js'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🌐 JavaScript (Fetch)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('react')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'react'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ⚛️ React Query
              </button>
            </div>

            {/* Code Block Container */}
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400 text-xs font-mono">
                <span className="flex items-center gap-1.5">
                  <FiTerminal className="w-3.5 h-3.5 text-primary" />
                  {activeTab === 'flutter' && 'BannerModel.dart & CarouselSlider'}
                  {activeTab === 'curl' && 'Terminal / cURL Request'}
                  {activeTab === 'js' && 'api_banners.js'}
                  {activeTab === 'react' && 'useBanners.ts'}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const code =
                      activeTab === 'flutter'
                        ? flutterCode
                        : activeTab === 'curl'
                        ? curlCode
                        : activeTab === 'js'
                        ? jsCode
                        : reactCode;
                    handleCopy(`tab-${activeTab}`, code);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
                >
                  {copiedKey === `tab-${activeTab}` ? (
                    <>
                      <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-3.5 h-3.5" />
                      <span>نسخ الكود</span>
                    </>
                  )}
                </button>
              </div>

              <pre
                className="p-4 text-slate-200 font-mono text-[11px] sm:text-xs overflow-x-auto max-h-[360px] leading-relaxed"
                dir="ltr"
              >
                {activeTab === 'flutter' && flutterCode}
                {activeTab === 'curl' && curlCode}
                {activeTab === 'js' && jsCode}
                {activeTab === 'react' && reactCode}
              </pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#14141d]">
          <div className="text-xs text-slate-500 dark:text-neutral-400">
            النظام جاهز ومتاح على: <code className="text-primary font-mono">{USER_API_BASE_URL}</code>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-slate-900 font-bold text-xs sm:text-sm transition-all"
          >
            إغلاق التوثيق
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
