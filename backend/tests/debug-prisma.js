const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking Bill model fields...');
    
    

    
    console.log('Bill Delegate keys:', Object.keys(prisma.bill));

    
    

    
    

    
    const dmmf = prisma._baseDmmf || prisma._dmmf;
    if (dmmf) {
        const billModel = dmmf.datamodel.models.find(m => m.name === 'Bill');
        if (billModel) {
            console.log('Bill Model Fields:', billModel.fields.map(f => f.name));
        } else {
            console.log('Bill Model not found in DMMF');
        }
    } else {
        console.log('DMMF not accessible directly');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
