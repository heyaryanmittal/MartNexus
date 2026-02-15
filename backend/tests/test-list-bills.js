require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');


const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Connecting to database...');
    try {
        const shops = await prisma.shop.findMany();
        console.log(`Found ${shops.length} shops.`);

        for (const shop of shops) {
            const billsCount = await prisma.bill.count({ where: { shopId: shop.id } });
            console.log(`Shop: ${shop.name} (${shop.id}) - Bills: ${billsCount}`);
        }

        const allBillsCount = await prisma.bill.count();
        console.log(`Total bills in DB: ${allBillsCount}`);

    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
