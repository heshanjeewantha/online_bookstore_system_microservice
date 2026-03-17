// src/mocks/payments.js
// Mock Payment Service

let paymentsData = [
    {
        _id: "pay_1001",
        orderId: "order_1001",
        userId: "admin_1",
        amount: 5900,
        paymentStatus: "success",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
        _id: "pay_1002",
        orderId: "order_1002",
        userId: "user_2",
        amount: 1500,
        paymentStatus: "success",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
];

const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

export const getPayments = async () => {
    await delay();
    return { data: [...paymentsData].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) };
}

export const getPaymentsByUser = async (userId) => {
    await delay();
     return { data: paymentsData.filter(p => p.userId === userId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) };
}

export const processPayment = async (orderId, userId, amount) => {
    await delay(); // Simulate network/gateway delay

    // Simulate occasional random failures (e.g. 5% chance) for realism
    const isSuccessful = Math.random() > 0.05;

    const newPayment = {
         _id: `pay_${Math.floor(Math.random() * 1000000)}`,
         orderId,
         userId,
         amount,
         paymentStatus: isSuccessful ? "success" : "failed",
         createdAt: new Date().toISOString()
    };

    paymentsData.push(newPayment);

    if (!isSuccessful) {
        throw new Error("Payment gateway declined the transaction.");
    }

    return { data: newPayment };
}
