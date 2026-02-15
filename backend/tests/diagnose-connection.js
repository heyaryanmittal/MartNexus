require('dotenv').config();
const net = require('net');

const hosts = [
    { name: 'Pooler 5432', host: 'aws-1-ap-south-1.pooler.supabase.com', port: 5432 },
    { name: 'Pooler 6543', host: 'aws-1-ap-south-1.pooler.supabase.com', port: 6543 },
    { name: 'Direct DB', host: 'db.clxfnnajmgloadpchbrq.supabase.co', port: 5432 },
];

console.log('Testing Supabase connectivity...\n');

hosts.forEach(({ name, host, port }) => {
    const socket = new net.Socket();
    const timeout = 5000;

    socket.setTimeout(timeout);

    socket.on('connect', () => {
        console.log(`✅ ${name} (${host}:${port}) - CONNECTED`);
        socket.destroy();
    });

    socket.on('timeout', () => {
        console.log(`❌ ${name} (${host}:${port}) - TIMEOUT (${timeout}ms)`);
        socket.destroy();
    });

    socket.on('error', (err) => {
        console.log(`❌ ${name} (${host}:${port}) - ERROR: ${err.message}`);
    });

    console.log(`Testing ${name}...`);
    socket.connect(port, host);
});

setTimeout(() => {
    console.log('\n--- Diagnosis Complete ---');
    console.log('\nIf all connections failed:');
    console.log('1. Check if your firewall is blocking PostgreSQL ports');
    console.log('2. Try disabling antivirus temporarily');
    console.log('3. Check if you\'re behind a corporate proxy/firewall');
    console.log('4. Verify your Supabase project is active in the dashboard');
    console.log('5. Consider using Supabase Studio (web UI) to manage your database');
    process.exit(0);
}, 10000);
