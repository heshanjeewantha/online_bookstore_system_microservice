import { processPayment } from './payments';

// Initial hardcoded data
let ordersData = [
    {
        _id: "order_1001",
        userId: "admin_1", // Placeholder, will map to actual users
        items: [
            { bookId: "book_1", title: "Madol Doova", quantity: 2, price: 1200 },
            { bookId: "book_3", title: "The Seven Moons of Maali Almeida", quantity: 1, price: 3500 }
        ],
        totalPrice: 5900,
        orderStatus: "delivered", // pending, processing, shipped, delivered, cancelled
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
    },
     {
        _id: "order_1002",
        userId: "user_2", 
        items: [
            { bookId: "book_2", title: "Gamperaliya", quantity: 1, price: 1500 }
        ],
        totalPrice: 1500,
        orderStatus: "shipped",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
    }
];

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const getOrders = async () => {
  await delay();
  return { data: [...ordersData].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) };
};

export const getOrdersByUser = async (userId) => {
    await delay();
    return { data: ordersData.filter(o => o.userId === userId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) };
}

export const getOrderById = async (id) => {
  await delay();
  const order = ordersData.find(o => o._id === id);
  if (!order) throw new Error("Order not found");
  return { data: { ...order } };
};

export const createOrder = async (userId, items) => {
    await delay();

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
        if (!item.bookId || !item.title) throw new Error('Invalid book item supplied');
        if (item.stock < item.quantity) throw new Error(`Insufficient stock for ${item.title}`);

        totalPrice += (item.price * item.quantity);
        orderItems.push({
            bookId: item.bookId,
            title: item.title,
            quantity: item.quantity,
            price: item.price
        });
    }

    const newOrder = {
        _id: `ord_${Math.floor(Math.random() * 100000)}`,
        userId,
        items: orderItems,
        totalPrice,
        orderStatus: "pending",
        createdAt: new Date().toISOString()
    };
    
    // 2. Process Payment (Order -> Payment Service)
    try {
        await processPayment(newOrder._id, userId, totalPrice);
        newOrder.orderStatus = "processing"; // Payment successful
    } catch (paymentError) {
        newOrder.orderStatus = "cancelled"; // Payment failed
        console.error("Payment failed for order, marked as cancelled:", paymentError);
        // Continue to save the cancelled order
    }

    ordersData.push(newOrder);
    return { data: newOrder };
};


export const updateOrderStatus = async (id, status) => {
  await delay();
  const index = ordersData.findIndex(o => o._id === id);
  if (index === -1) throw new Error("Order not found");
  
  ordersData[index] = { ...ordersData[index], orderStatus: status };
  return { data: ordersData[index] };
};
