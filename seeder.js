const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zaarekoh');
        console.log('MongoDB Connected for Seeder');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const products = [
    {
        name: 'Pure Himalayan Shilajit (10g)',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80',
        images: [
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80',
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=700&q=80'
        ],
        description: 'Pure Himalayan Shilajit resin. Rich in fulvic acid and minerals. Boosts natural energy and endurance.',
        category: 'Health',
        size: '10g',
        price: 2500,
        countInStock: 50,
    },
    {
        name: 'Pure Himalayan Shilajit (20g)',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80',
        images: [
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80',
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'
        ],
        description: 'Double the vitality. Premium quality Himalayan Shilajit for extended use.',
        category: 'Health',
        size: '20g',
        price: 4500,
        countInStock: 30,
    },
    {
        name: 'Gold Grade Shilajit (15g)',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80',
        images: [
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80',
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'
        ],
        description: 'The finest gold grade Shilajit for maximum potency and absorption.',
        category: 'Premium',
        size: '15g',
        price: 3500,
        countInStock: 20,
    }
];

const importData = async () => {
    await connectDB();
    try {
        await Product.deleteMany();
        console.log('Existing data cleared');

        await Product.insertMany(products);
        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
