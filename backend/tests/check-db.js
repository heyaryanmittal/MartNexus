const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const productsCount = await prisma.product.count();
    const billsCount = await prisma.bill.count();
    const shops = await prisma.shop.findMany();

    console.log('Products Count:', productsCount);
    console.log('Bills Count:', billsCount);
    console.log('Shops:', JSON.stringify(shops, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
