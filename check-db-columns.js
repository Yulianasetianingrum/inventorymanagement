
const mysql = require('mysql2/promise');

async function check() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        const [rows] = await connection.execute('DESCRIBE picklist_lines');
        console.log("Columns in picklist_lines:");
        console.table(rows);
        const hasStockMode = rows.some(r => r.Field === 'stockMode');
        console.log("Has stockMode column:", hasStockMode);
    } catch (e) {
        console.error("DB Error:", e.message);
    } finally {
        await connection.end();
    }
}

check();
