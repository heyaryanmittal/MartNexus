require('dotenv').config();
const prisma = require('./src/utils/prismaClient');

async function main() {
    console.log('Testing connection to Supabase...');
    try {
        const shops = await prisma.shop.findMany();
        console.log(`Successfully connected. Found ${shops.length} shops.`);

        for (const shop of shops) {
            const billCount = await prisma.bill.count({ where: { shopId: shop.id } });
            console.log(`Shop: ${shop.name} (${shop.id}) - Bills: ${billCount}`);

            if (billCount > 0) {
                const latestBill = await prisma.bill.findFirst({
                    where: { shopId: shop.id },
                    orderBy: { createdAt: 'desc' },
                    include: { items: true }
                });
                console.log(`  Latest Bill: ${latestBill.billNumber} on ${latestBill.createdAt}`);
            }
        }
    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
