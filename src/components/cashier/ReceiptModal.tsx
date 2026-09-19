import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { FiPrinter, FiPlusCircle, FiX, FiCheckCircle, FiShoppingBag, FiCoffee, FiTruck } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import type { ApiCartItem, ApiCartGrandTotals } from '../../types/cashier';

export interface ReceiptOrderData {
  orderId?: number | string;
  orderType: 'takeaway' | 'dinein' | 'delivery';
  orderTypeLabel: string;
  customerName?: string | null;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
  tableName?: string | null;
  orderNote?: string | null;
  items: ApiCartItem[];
  totals: ApiCartGrandTotals;
  createdAt: string;
  cashierName?: string;
  deviceName?: string;
  branchName?: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: ReceiptOrderData | null;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, orderData }) => {
  const { language, dir, t } = useLanguage();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orderData) return;

    const qrPayload = [
      `Store: Mazoom Restaurant`,
      `Tax ID: 300987654300003`,
      `Order: #${orderData.orderId || 'NEW'}`,
      `Date: ${orderData.createdAt}`,
      `Total: ${Number(orderData.totals?.grand_final_price || 0).toFixed(2)} SAR`,
      `VAT (15%): ${Number(orderData.totals?.grand_total_tax || 0).toFixed(2)} SAR`,
    ].join('\n');

    QRCode.toDataURL(qrPayload, {
      width: 140,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Error generating receipt QR code:', err));
  }, [orderData]);

  if (!isOpen || !orderData) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = orderData.createdAt
    ? new Date(orderData.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" dir={dir}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm no-print transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-slate-900/90 text-white rounded-3xl shadow-2xl border border-slate-700/50 backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {t('order_success_title')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('receipt_preview')} - {t('order_no')}: <span className="text-emerald-400 font-mono font-bold">#{orderData.orderId || '---'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title={t('close')}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Receipt Paper Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-950/40">
          
          {/* ══════════ REAL THERMAL RECEIPT SLIP ══════════ */}
          <div
            id="pos-receipt-print"
            ref={receiptRef}
            className="w-full max-w-[360px] bg-white text-black p-5 shadow-2xl rounded-sm font-sans text-xs leading-relaxed border-t-8 border-dashed border-slate-300"
            style={{ minHeight: '450px' }}
          >
            {/* Header: Store & Tax Info */}
            <div className="text-center pb-3 border-b-2 border-dashed border-gray-400 space-y-1">
              <h1 className="text-lg font-black tracking-wider text-black uppercase">
                {language === 'ar' ? 'مطاعم مازوم' : 'MAZOOM RESTAURANT'}
              </h1>
              <p className="text-[10px] font-semibold text-gray-700">
                {t('tax_invoice')}
              </p>
              <p className="text-[10px] text-gray-600">
                {t('tax_number')}: <span className="font-mono font-bold">300987654300003</span>
              </p>
              <p className="text-[10px] text-gray-600">
                {t('branch_label')}: {orderData.branchName || t('main_branch')}
              </p>
            </div>

            {/* Order Metadata */}
            <div className="py-2.5 border-b border-dashed border-gray-300 space-y-1 text-[11px]">
              <div className="flex justify-between items-center font-bold">
                <span>{t('order_no')}:</span>
                <span className="font-mono text-sm font-black text-black">#{orderData.orderId || '---'}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span>{t('date_time')}:</span>
                <span className="font-mono text-[10px]">{formattedDate}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span>{t('cashier_label')}:</span>
                <span>{orderData.cashierName || 'Cashier'}</span>
              </div>
              {orderData.deviceName && (
                <div className="flex justify-between items-center text-gray-700">
                  <span>{t('pos_device')}:</span>
                  <span>{orderData.deviceName}</span>
                </div>
              )}

              {/* Order Type Highlight */}
              <div className="mt-2 pt-1.5 border-t border-gray-200 flex justify-between items-center font-bold bg-gray-100 px-2 py-1 rounded">
                <span className="flex items-center gap-1.5">
                  {orderData.orderType === 'takeaway' && <FiShoppingBag className="w-3.5 h-3.5" />}
                  {orderData.orderType === 'dinein' && <FiCoffee className="w-3.5 h-3.5" />}
                  {orderData.orderType === 'delivery' && <FiTruck className="w-3.5 h-3.5" />}
                  {t('order_type_label')}:
                </span>
                <span className="uppercase text-black underline decoration-2 underline-offset-2">
                  {orderData.orderTypeLabel}
                </span>
              </div>

              {/* Dine-in Table */}
              {orderData.orderType === 'dinein' && orderData.tableName && (
                <div className="flex justify-between items-center font-bold text-indigo-900 bg-indigo-50 px-2 py-1 rounded">
                  <span>{t('table_label')}:</span>
                  <span className="font-black text-sm">{orderData.tableName}</span>
                </div>
              )}

              {/* Customer Details */}
              {(orderData.customerName || orderData.customerPhone) && (
                <div className="pt-1 text-[10px] text-gray-800 space-y-0.5">
                  {orderData.customerName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('customer_label')}:</span>
                      <span className="font-semibold">{orderData.customerName}</span>
                    </div>
                  )}
                  {orderData.customerPhone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('phone_label')}:</span>
                      <span className="font-mono font-semibold">{orderData.customerPhone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Address */}
              {orderData.orderType === 'delivery' && orderData.deliveryAddress && (
                <div className="pt-1 text-[10px] bg-amber-50/70 p-1.5 rounded border border-amber-200/60">
                  <span className="text-gray-500 block font-semibold">{t('address_label')}:</span>
                  <span className="font-bold text-gray-900 break-words">{orderData.deliveryAddress}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b-2 border-dashed border-gray-400">
              <table className="w-full text-left text-[10.5px]">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-600">
                    <th className="pb-1 font-bold text-start w-[50%]">{t('item_header')}</th>
                    <th className="pb-1 font-bold text-center w-[15%]">{t('qty_header')}</th>
                    <th className="pb-1 font-bold text-end w-[17%]">{t('price_header')}</th>
                    <th className="pb-1 font-bold text-end w-[18%]">{t('total_header')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orderData.items.map((item, idx) => {
                    const productName = typeof item.product?.name === 'string'
                      ? item.product.name
                      : (language === 'ar' ? (item.product?.name as any)?.ar || (item.product?.name as any)?.en : (item.product?.name as any)?.en || (item.product?.name as any)?.ar) || 'Product';
                    const qty = typeof item.quantity === 'number' ? item.quantity : 1;
                    const itemTotal = Number(item.total_final_price || item.total_price || 0).toFixed(2);
                    const unitPrice = (Number(itemTotal) / qty).toFixed(2);

                    return (
                      <tr key={item.id || idx} className="align-top py-1">
                        <td className="py-1 text-start">
                          <div className="font-bold text-gray-900">{productName}</div>
                          
                          {/* Variations */}
                          {item.variations && item.variations.length > 0 && (
                            <div className="text-[9.5px] text-gray-600 pl-1">
                              {item.variations.map((v, vIdx) => (
                                <div key={vIdx}>
                                  • {v.name}: {v.options?.map((o) => `${o.name} (${Number(o.price || 0).toFixed(2)})`).join(', ')}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Addons */}
                          {item.addons && item.addons.length > 0 && (
                            <div className="text-[9.5px] text-gray-600 pl-1">
                              {item.addons.map((a, aIdx) => (
                                <div key={aIdx}>
                                  + {a.name} ({Number(a.price || 0).toFixed(2)})
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Item Notes */}
                          {item.notes && (
                            <div className="text-[9px] italic text-amber-700 bg-amber-50 px-1 py-0.5 mt-0.5 rounded inline-block">
                              *{item.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-1 text-center font-bold text-gray-800">
                          {qty}
                        </td>
                        <td className="py-1 text-end font-mono text-gray-700">
                          {unitPrice}
                        </td>
                        <td className="py-1 text-end font-mono font-bold text-gray-900">
                          {itemTotal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Totals */}
            <div className="py-2.5 border-b-2 border-dashed border-gray-400 space-y-1 text-xs">
              <div className="flex justify-between items-center text-gray-700">
                <span>{t('subtotal')}</span>
                <span className="font-mono">
                  {Number(orderData.totals?.grand_total_price || 0).toFixed(2)} SAR
                </span>
              </div>

              {Number(orderData.totals?.grand_total_discount || 0) > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-semibold">
                  <span>{t('discount')}</span>
                  <span className="font-mono">
                    -{Number(orderData.totals?.grand_total_discount).toFixed(2)} SAR
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-gray-700">
                <span>{t('tax_15')}</span>
                <span className="font-mono">
                  {Number(orderData.totals?.grand_total_tax || 0).toFixed(2)} SAR
                </span>
              </div>

              <div className="flex justify-between items-center pt-1.5 border-t border-gray-300 text-sm font-black text-black">
                <span>{t('total')}</span>
                <span className="font-mono text-base font-extrabold text-black">
                  {Number(orderData.totals?.grand_final_price || 0).toFixed(2)} SAR
                </span>
              </div>
            </div>

            {/* General Order Notes */}
            {orderData.orderNote && (
              <div className="py-2 border-b border-dashed border-gray-300 text-[10px]">
                <span className="font-bold text-gray-700 block">{t('notes_label')}:</span>
                <p className="bg-gray-100 p-1.5 rounded font-medium text-gray-800 break-words">
                  {orderData.orderNote}
                </p>
              </div>
            )}

            {/* QR Code & Footer */}
            <div className="pt-4 text-center flex flex-col items-center space-y-2">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="ZATCA Tax QR Code"
                  className="w-28 h-28 object-contain border border-gray-200 p-1 rounded"
                />
              ) : (
                <div className="w-24 h-24 border border-dashed border-gray-300 flex items-center justify-center text-[9px] text-gray-400">
                  QR Code
                </div>
              )}
              
              <div className="space-y-0.5 text-[9.5px] text-gray-600">
                <p className="font-bold text-gray-800">{t('thank_you_visit')}</p>
                <p className="text-[8.5px] text-gray-400">Mazoom Cloud POS System</p>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="no-print p-4 bg-slate-800/80 border-t border-slate-700/60 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiPrinter className="w-5 h-5" />
            <span>{t('print_receipt')}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiPlusCircle className="w-4 h-4" />
            <span>{t('new_order_btn')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReceiptModal;
