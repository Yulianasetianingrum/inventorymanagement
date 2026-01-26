
const mysql = require('mysql2/promise');

async function fix() {
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        console.log("Checking if stockMode column exists...");
        const [rows] = await connection.execute('DESCRIBE picklist_lines');
        const hasStockMode = rows.some(r => r.Field === 'stockMode');

        if (!hasStockMode) {
            console.log("Adding stockMode column...");
            await connection.execute("ALTER TABLE picklist_lines ADD COLUMN stockMode VARCHAR(191) NOT NULL DEFAULT 'baru'");
            console.log("Column added successfully.");
        } else {
            console.log("Column already exists.");
        }
    } catch (e) {
        console.error("DB Error:", e.message);
    } finally {
        await connection.end();
    }
}

fix();
