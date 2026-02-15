const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting...");
        
        const shop = await prisma.shop.findFirst();
        if (!shop) {
            console.log("No shop found, cannot test bill creation.");
            return;
        }
        console.log("Found shop:", shop.id);

        
        const product = await prisma.product.findFirst({ where: { shopId: shop.id } });
        if (!product) {
            console.log("No product found for shop, cannot test bill creation.");
            return;
        }
        console.log("Found product:", product.id);

        
        const billData = {
            shopId: shop.id,
            
            billNumber: "TEST-" + Date.now(),
            customerName: "Test Customer",
            customerMobile: "1234567890",
            paymentMode: "CASH",
            status: "PAID",
            subTotal: 100,
            taxAmount: 18,
            cgst: 9,
            sgst: 9,
            igst: 0,
            grandTotal: 118,
            items: {
                create: [
                    {
                        productId: product.id,
                        quantity: 1,
                        price: 100,
                        taxAmount: 18
                    }
                ]
            }
        };

        console.log("Attempting to create bill WITHOUT customer...");
        const bill = await prisma.bill.create({
            data: billData,
            include: { items: true }
        });
        console.log("Created bill successfully:", bill.id);

        
        const customer = await prisma.customer.findFirst({ where: { shopId: shop.id } });
        if (customer) {
            console.log("Found customer:", customer.id);
            const billDataWithCustomer = {
                ...billData,
                billNumber: "TEST-CUST-" + Date.now(),
                
                customer: { connect: { id: customer.id } }
            };

            console.log("Attempting to create bill WITH customer...");
            const billWithCust = await prisma.bill.create({
                data: billDataWithCustomer,
                include: { items: true }
            });
            console.log("Created bill with customer successfully:", billWithCust.id);
        } else {
            console.log("No customer found due to empty DB, skipping customer test.");
        }

    } catch (error) {
        console.error("Error creating bill:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
