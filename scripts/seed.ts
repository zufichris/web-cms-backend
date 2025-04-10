import 'dotenv/config';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { assert } from 'console';

const users = [
    {
        name: 'Test Admin',
        email: 'admin@webcms.com',
        password: 'Admin@123',
        role: "ADMIN",
        isActive: true,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
    },
    {
        name: 'Test Editor',
        email: 'editor@webcms.com',
        password: 'Editor@123',
        role: "EDITOR",
        isActive: true,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
    },
    {
        name: 'Test Viewer',
        email: 'viewer@webcms.com',
        password: 'Viewer@123',
        role: "USER",
        isActive: true,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
    }
];

async function prepare() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI!);
        return conn
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

export async function seedUsers() {
    const conn = await prepare();
    assert(conn.connection.db, 'Database connection failed');

    try {
        const UserModel = conn.connection.db?.collection('users') || await conn.connection.db?.createCollection('users');

        const existingUsers = await UserModel?.find({
            email: { $in: users.map(u => u.email) }
        }).toArray()

        if (existingUsers?.length) {
            console.log('Users already seeded', existingUsers);
            process.exit(0);
        }


        const hashedUsers = await Promise.all(
            users.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, 10),
            }))
        );

        const inserted = await UserModel?.insertMany(hashedUsers);

        console.log('Users seeded successfully', inserted);
    } catch (error) {
        console.error('Error seeding users:', error);
        throw error;
    } finally {
        await conn?.connection.close();
    }
}

seedUsers();