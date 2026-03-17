// src/mocks/books.js
import { v4 as uuidv4 } from 'uuid'; // Simulate MongoDB ObjectIDs

// Initial hardcoded data
let booksData = [
  {
    _id: "book_1",
    title: "Madol Doova",
    author: "Martin Wickramasinghe",
    price: 1200,
    category: "Sinhala Literature",
    description: "A classic Sri Lankan novel about the adventures of Upali Giniwella and his friend Jinna on the island of Madol Doova.",
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop" // Generic book cover 1
  },
  {
    _id: "book_2",
    title: "Gamperaliya",
    author: "Martin Wickramasinghe",
    price: 1500,
    category: "Sinhala Literature",
    description: "The first novel of Wickramasinghe's acclaimed trilogy, depicting the transformation of a rural Sinhalese village.",
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop" // Generic book cover 2
  },
  {
    _id: "book_3",
    title: "The Seven Moons of Maali Almeida",
    author: "Shehan Karunatilaka",
    price: 3500,
    category: "English Fiction",
    description: "Winner of the 2022 Booker Prize. A searing, mordantly funny satire set amid the murderous mayhem of a Sri Lanka beset by civil war.",
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop" // Generic book cover 3
  },
  {
    _id: "book_4",
    title: "Ape Gama",
    author: "Martin Wickramasinghe",
    price: 800,
    category: "Sinhala Literature",
    description: "Recollections of the author's childhood in the southern coastal village of Koggala.",
    stock: 5,
    imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop" // Generic book cover 4
  },
  {
    _id: "book_5",
    title: "Funny Boy",
    author: "Shyam Selvadurai",
    price: 2200,
    category: "English Fiction",
    description: "A coming-of-age novel set in Colombo, exploring themes of identity and sexuality against the backdrop of the 1983 riots.",
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop" // Generic book cover 5
  },
  {
    _id: "book_6",
    title: "Viragaya",
    author: "Martin Wickramasinghe",
    price: 1350,
    category: "Sinhala Literature",
    description: "Considered the pinnacle of Sinhalese fiction, exploring the psychological depths of its protagonist Aravinda.",
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop" // Generic book cover 6
  },
  {
    _id: "book_7",
    title: "Anil's Ghost",
    author: "Michael Ondaatje",
    price: 2800,
    category: "English Fiction",
    description: "A novel by Booker Prize-winning author Michael Ondaatje, following a forensic anthropologist returning to her native Sri Lanka.",
    stock: 8,
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop" // Generic book cover 7
  },
  {
    _id: "book_8",
    title: "Poth Gula",
    author: "Various Authors",
    price: 950,
    category: "Children's Books",
    description: "A collection of beloved Sinhalese children's stories and folklore.",
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop" // Generic book cover 8
  }
];


// Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const getBooks = async () => {
  await delay();
  return { data: [...booksData] }; // Return a copy
};

export const getBookById = async (id) => {
  await delay();
  const book = booksData.find(b => b._id === id);
  if (!book) throw new Error("Book not found");
  return { data: { ...book } };
};

export const addBook = async (bookData) => {
  await delay();
  const newBook = {
    ...bookData,
    _id: `book_${Date.now()}` // Simple mock ID generator
  };
  booksData.push(newBook);
  return { data: newBook };
};

export const updateBook = async (id, updateData) => {
  await delay();
  const index = booksData.findIndex(b => b._id === id);
  if (index === -1) throw new Error("Book not found");
  
  booksData[index] = { ...booksData[index], ...updateData };
  return { data: booksData[index] };
};

export const deleteBook = async (id) => {
  await delay();
  const initialLength = booksData.length;
  booksData = booksData.filter(b => b._id !== id);
  
  if (booksData.length === initialLength) throw new Error("Book not found");
  return { data: { success: true } };
};

// Helper for other mocks (like Orders) to check stock/price
export const getInternalBookData = () => booksData;
export const updateInternalBookStock = (id, quantityAssigned) => {
     const book = booksData.find(b => b._id === id);
     if(book) book.stock -= quantityAssigned;
}
