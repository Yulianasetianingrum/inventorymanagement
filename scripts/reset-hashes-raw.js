const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'inventory_db'
    });

    try {
        // Cari user yang password-nya ter-hash (mulai dengan $2)
        const [rows] = await connection.execute('SELECT id, employeeId, name FROM user WHERE passwordHash LIKE "$2%"');

        console.log(`Found ${rows.length} users with hashed passwords.`);

        for (const user of rows) {
            console.log(`Resetting password for: ${user.name} (${user.employeeId})`);
            await connection.execute('UPDATE user SET passwordHash = ? WHERE id = ?', [user.employeeId, user.id]);
        }

        console.log("Password reset completed successfully using raw SQL.");
    } catch (error) {
        console.error("Error during SQL reset:", error);
    } finally {
        await connection.end();
    }
}

main();
