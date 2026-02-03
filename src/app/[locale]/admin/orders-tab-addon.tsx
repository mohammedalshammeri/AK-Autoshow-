'use client';

import { useState } from 'react';
import { RefreshCw, Package, User, Phone, Calendar, DollarSign, Eye, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface Order {
  id: number;
  product_id: number;
  customer_name: string;
  customer_phone: string;
  size: string | null;
  quantity: number;
  price: number;
  total_price: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  products?: {
    name_ar: string;
    name_en: string;
    image_url: string;
    video_url: string;
  };
}

interface OrdersTabProps {
  orders: Order[];
  loadingOrders: boolean;
  onUpdateOrderStatusAction: (orderId: number, newStatus: 'pending' | 'processing' | 'completed' | 'cancelled') => void;
  onRefreshOrdersAction: () => void;
}

export function OrdersTab({ orders, loadingOrders, onUpdateOrderStatusAction, onRefreshOrdersAction }: OrdersTabProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'completed' | 'cancelled'>('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'processing': return 'قيد المعالجة';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'processing': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' ? true : order.status === filterStatus
  );

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">إدارة الطلبات</h2>
          <p className="text-gray-400">
            إجمالي الطلبات: {orders.length} | 
            قيد الانتظار: {orderStats.pending} | 
            قيد المعالجة: {orderStats.processing} | 
            مكتمل: {orderStats.completed}
          </p>
        </div>
          <button
          onClick={onRefreshOrdersAction}
          disabled={loadingOrders}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'الكل', count: orderStats.total },
          { key: 'pending', label: 'قيد الانتظار', count: orderStats.pending },
          { key: 'processing', label: 'قيد المعالجة', count: orderStats.processing },
          { key: 'completed', label: 'مكتمل', count: orderStats.completed },
          { key: 'cancelled', label: 'ملغي', count: orderStats.cancelled },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === key
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {loadingOrders ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-300">جاري تحميل الطلبات...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {filterStatus === 'all' ? 'لا توجد طلبات' : `لا توجد طلبات ${getStatusText(filterStatus)}`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between mb-4">                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-400">#{String(order.id).slice(-8)}</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {getStatusText(order.status)}
                </div>
              </div>

              {/* Product Info */}
              <div className="flex items-center gap-3 mb-4">
                {order.products?.image_url && (
                  <img
                    src={order.products.image_url}
                    alt="Product"
                    className="w-12 h-12 object-contain bg-gray-700 rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-white font-medium line-clamp-1">
                    {order.products?.name_ar || `منتج #${order.product_id}`}
                  </h3>
                  {order.size && (
                    <p className="text-gray-400 text-sm">المقاس: {order.size}</p>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{order.customer_phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">
                    {new Date(order.created_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>

              {/* Price & Quantity */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-400">
                  الكمية: <span className="text-white font-medium">{order.quantity}</span>
                </div>
                <div className="flex items-center gap-1 text-lg font-bold text-green-400">
                  <DollarSign className="w-4 h-4" />
                  {order.total_price} د.ب
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  عرض التفاصيل
                </button>
                  <select
                  value={order.status}
                  onChange={(e) => onUpdateOrderStatusAction(order.id, e.target.value as any)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg text-sm focus:border-purple-500 focus:outline-none"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="processing">قيد المعالجة</option>
                  <option value="completed">مكتمل</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatusAction={onUpdateOrderStatusAction}
        />
      )}
    </div>
  );
}

function OrderDetailsModal({ 
  order, 
  onClose, 
  onUpdateStatusAction 
}: { 
  order: Order; 
  onClose: () => void; 
  onUpdateStatusAction: (orderId: number, newStatus: any) => void;
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing': return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `مرحباً ${order.customer_name}،\n\nبخصوص طلبك #${String(order.id).slice(-8)}\nالمنتج: ${order.products?.name_ar}\nالحالة: ${order.status}\nالمجموع: ${order.total_price} د.ب\n\nشكراً لتعاملكم معنا!`
    );
    window.open(`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-purple-500 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">
                تفاصيل الطلب #{String(order.id).slice(-8)}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-3xl transition-colors"
            >
              ×
            </button>
          </div>

          {/* Status */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">حالة الطلب:</span>
              <div className="flex items-center gap-2 text-lg font-medium">
                {getStatusIcon(order.status)}
                <span className="text-white">
                  {order.status === 'pending' ? 'قيد الانتظار' :
                   order.status === 'processing' ? 'قيد المعالجة' :
                   order.status === 'completed' ? 'مكتمل' :
                   order.status === 'cancelled' ? 'ملغي' : order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">تفاصيل المنتج</h3>
            
            <div className="flex items-center gap-4 mb-4">
              {order.products?.image_url && (
                <img
                  src={order.products.image_url}
                  alt="Product"
                  className="w-20 h-20 object-contain bg-gray-700 rounded-lg"
                />
              )}
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">
                  {order.products?.name_ar || `منتج #${order.product_id}`}
                </h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>السعر الواحد: {order.price} د.ب</div>
                  <div>الكمية: {order.quantity}</div>
                  {order.size && <div>المقاس: {order.size}</div>}
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="bg-gray-700/50 rounded-lg p-3">
                <span className="text-gray-400 text-sm">ملاحظات إضافية:</span>
                <p className="text-white mt-1">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Customer Details */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">بيانات العميل</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">الاسم:</span>
                <span className="text-white">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">الهاتف:</span>
                <span className="text-white">{order.customer_phone}</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 border border-green-500/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-white">المجموع الإجمالي:</span>
              <div className="flex items-center gap-1 text-2xl font-bold text-green-400">
                <DollarSign className="w-5 h-5" />
                {order.total_price} د.ب
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">التواريخ</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">تاريخ الطلب:</span>
                <div className="text-white mt-1">
                  {new Date(order.created_at).toLocaleString('ar-SA')}
                </div>
              </div>
              <div>
                <span className="text-gray-400">آخر تحديث:</span>
                <div className="text-white mt-1">
                  {new Date(order.updated_at).toLocaleString('ar-SA')}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4" />
              التواصل عبر واتساب
            </button>            <select
              value={order.status}
              onChange={(e) => {
                onUpdateStatusAction(order.id, e.target.value as any);
                onClose();
              }}
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option value="pending">قيد الانتظار</option>
              <option value="processing">قيد المعالجة</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
