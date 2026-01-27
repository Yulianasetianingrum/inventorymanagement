const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting data cleanup...');
    console.log('Excluding: Users, Locations, Suppliers, Projects');

    const tablesToDelete = [
        // Order matters due to foreign key constraints
        'StockInBatch',
        'PicklistEvidence',
        'PicklistEvent',
        'PicklistLine',
        'Picklist',
        'AuditLog',
        'Message',
        'Item'
    ];

    try {
        // 1. StockInBatch (References Item, Supplier)
        console.log('Deleting StockInBatch...');
        await prisma.stockInBatch.deleteMany({});

        // 2. PicklistEvidence (References Picklist)
        console.log('Deleting PicklistEvidence...');
        await prisma.picklistEvidence.deleteMany({});

        // 3. PicklistEvent (References Picklist)
        console.log('Deleting PicklistEvent...');
        await prisma.picklistEvent.deleteMany({});

        // 4. PicklistLine (References Picklist, Item)
        console.log('Deleting PicklistLine...');
        await prisma.picklistLine.deleteMany({});

        // 5. Picklist (References Project, User)
        console.log('Deleting Picklist...');
        await prisma.picklist.deleteMany({});

        // 6. AuditLog (References User)
        console.log('Deleting AuditLog...');
        await prisma.auditLog.deleteMany({});

        // 7. Message (References User)
        console.log('Deleting Message...');
        await prisma.message.deleteMany({});

        // 8. Item (References Location, Supplier)
        // User requested to keep Suppliers and Locations, but didn't exclude Items.
        // "urusan saya mau nyoba input dari awal" implies Items should be gone.
        console.log('Deleting Item...');
        await prisma.item.deleteMany({});

        console.log('✅ Data cleanup complete!');
        console.log('Preserved tables: User, Location, Supplier, Project.');

    } catch (e) {
        console.error('❌ Error during cleanup:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
