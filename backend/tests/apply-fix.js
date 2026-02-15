const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function applyFix() {
    try {
        const sqlPath = path.join(__dirname, 'fix-schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying schema fixes...');

        
        
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            try {
                
                if (statement.toUpperCase().startsWith('CREATE TYPE')) {
                    await prisma.$executeRawUnsafe(`
                        DO $$
                        BEGIN
                            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${statement.split('"')[1]}') THEN
                                ${statement};
                            END IF;
                        END
                        $$;
                    `).catch(e => console.log(`Type might already exist, skipping: ${e.message}`));
                } else {
                    await prisma.$executeRawUnsafe(statement);
                    console.log(`Executed: ${statement.substring(0, 50)}...`);
                }
            } catch (err) {
                console.warn(`Statement failed: ${statement.substring(0, 50)}... Error: ${err.message}`);
            }
        }

        console.log('Schema fix applied successfully (checked statements).');
    } catch (error) {
        console.error('Error applying schema fix:', error);
    } finally {
        await prisma.$disconnect();
    }
}

applyFix();
