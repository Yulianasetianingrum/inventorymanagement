
const mysql = require('mysql2/promise');

async function check() {
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        const [rows] = await connection.execute('DESCRIBE picklist_lines');
        console.log("Columns in picklist_lines:");
        rows.forEach(r => console.log(`- ${r.Field} (${r.Type})`));
    } catch (e) {
        console.error("DB Error:", e.message);
    } finally {
        await connection.end();
    }
}

check();
