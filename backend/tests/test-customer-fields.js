const prisma = require('./src/utils/prismaClient');

async function testCustomerFields() {
    try {
        const customers = await prisma.customer.findMany({ take: 1 });
        console.log('Customer data:', JSON.stringify(customers, null, 2));
        console.log('\nField names:', customers.length > 0 ? Object.keys(customers[0]) : 'No customers found');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testCustomerFields();
