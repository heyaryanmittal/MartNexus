const prisma = require('./src/utils/prismaClient');

async function testCustomerDiscount() {
    try {
        
        const customers = await prisma.customer.findMany();
        console.log('=== All Customers ===');
        customers.forEach(c => {
            console.log(`ID: ${c.id}`);
            console.log(`Name: ${c.name}`);
            console.log(`Discount: ${c.discountPercentage}`);
            console.log('---');
        });

        if (customers.length > 0) {
            
            const updated = await prisma.customer.update({
                where: { id: customers[0].id },
                data: { discountPercentage: 15.5 }
            });
            console.log('\n=== Updated Customer ===');
            console.log(`Name: ${updated.name}`);
            console.log(`Discount: ${updated.discountPercentage}`);
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testCustomerDiscount();
