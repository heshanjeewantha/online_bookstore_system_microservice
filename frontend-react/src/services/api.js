/**
 * Unified API module — re-exports everything from the individual service files.
 * Pages import from here so they require NO changes when services move.
 *
 * Inter-service communication summary (handled entirely by the backends):
 *  User Service   → Order Service + Payment Service  (checks before user delete)
 *  Book Service   → Order Service                    (checks before book delete)
 *  Order Service  → User Service + Book Service      (validates on order create/update)
 *  Payment Service→ Order Service                    (validates/updates order status)
 */
import { userApi, bookApi, orderApi, paymentApi } from '../api/axiosSetup';

// ── User Service  (http://164.92.92.45:5001) ─────────────────────────────────
export const registerUser        = (data)        => userApi.post('/register', data);
export const loginUser           = (data)        => userApi.post('/login', data);
export const getProfile          = ()            => userApi.get('/profile');
export const updateProfile       = (data)        => userApi.put('/profile', data);
export const getUsers            = ()            => userApi.get('/');
export const deleteUser          = (id)          => userApi.delete(`/${id}`);

// ── Book Service  (http://159.223.106.87:5002) ────────────────────────────────
export const getBooks            = (params = {}) => bookApi.get('/', { params });
export const getBookById         = (id)          => bookApi.get(`/${id}`);
export const createBook          = (data)        => bookApi.post('/', data);
export const updateBook          = (id, data)    => bookApi.put(`/${id}`, data);
export const deleteBook          = (id)          => bookApi.delete(`/${id}`);

// ── Order Service  (http://159.223.63.71:5003) ────────────────────────────────
export const createOrder         = (data)        => orderApi.post('/', data);
export const getMyOrders         = ()            => orderApi.get('/my-orders');
export const getAllOrders         = (params = {}) => orderApi.get('/', { params });
export const getOrderById        = (id)          => orderApi.get(`/${id}`);
export const approveOrder        = (id, data={}) => orderApi.put(`/${id}/approve`, data);
export const cancelOrder         = (id, data={}) => orderApi.put(`/${id}/cancel`, data);
export const updateShipmentStatus= (id, data)    => orderApi.put(`/${id}/shipment`, data);
export const updateOrderStatus   = (id, data)    => orderApi.put(`/${id}/status`, data);
export const getPendingPaymentCount = ()         => orderApi.get('/pending-payment-count');

// ── Payment Service  (http://129.212.233.148:5004) ───────────────────────────
export const processPayment      = (data)        => paymentApi.post('/', data);
export const getPaymentsByUser   = (userId)      => paymentApi.get(`/${userId}`);
export const getAllPayments       = ()            => paymentApi.get('/');
export const getPaymentStatus    = (orderId)     => paymentApi.get(`/order/${orderId}`);

export default { userApi, bookApi, orderApi, paymentApi };
