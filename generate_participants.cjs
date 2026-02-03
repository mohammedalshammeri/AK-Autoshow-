const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// --- Connection Setup (Same as run-neon-sql.cjs) ---
let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envFile = fs.readFileSync(envPath, 'utf8');
            const match = envFile.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
            if (match) {
                connectionString = match[1].trim();
                console.log('Found DATABASE_URL in .env.local');
            }
        }
    } catch (e) {
        console.log('Could not read .env.local:', e.message);
    }
}

if (!connectionString) {
    console.error('❌ Error: DATABASE_URL not found. Make sure .env.local exists and has DATABASE_URL for Neon.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

// --- Data Generation Helpers ---
const firstNamesEn = ['Ahmed', 'Mohammed', 'Ali', 'Omar', 'Fatima', 'Aisha', 'Khaled', 'Yousef', 'Sara', 'Noor', 'Ibrahim', 'Hassan', 'Zainab', 'Mariam', 'Layla', 'Abdullah', 'Fahad', 'Salman', 'Reem', 'Huda'];
const lastNamesEn = ['Al-Sayed', 'Al-Harbi', 'Al-Ghamdi', 'Al-Dosari', 'Al-Qahtani', 'Al-Amri', 'Al-Shehri', 'Al-Zahrani', 'Al-Mutairi', 'Al-Otaibi', 'Khan', 'Ahmed', 'Ali', 'Saleh', 'Hussain'];

const carBrands = ['Toyota', 'Nissan', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Lexus', 'Hyundai', 'Kia'];
const carModels = {
    'Toyota': ['Camry', 'Land Cruiser', 'Corolla', 'Hilux'],
    'Nissan': ['Patrol', 'Altima', 'Maxima', 'Sunny'],
    'Ford': ['Mustang', 'F-150', 'Explorer'],
    'Chevrolet': ['Tahoe', 'Caprice', 'Corvette'],
    'BMW': ['X5', '7 Series', '3 Series'],
    'Mercedes': ['S-Class', 'G-Class', 'E-Class'],
    'Audi': ['Q7', 'A8', 'A6'],
    'Lexus': ['LX', 'ES', 'RX'],
    'Hyundai': ['Sonata', 'Elantra', 'Tucson'],
    'Kia': ['K5', 'Sportage', 'Sorento']
};

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone() {
    return '+9665' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
}

// --- Main Script ---

async function generateData() {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting sample data generation...');

        // 1. Get an Event ID
        let eventId;
        const eventRes = await client.query('SELECT id FROM events ORDER BY created_at DESC LIMIT 1');
        if (eventRes.rows.length > 0) {
            eventId = eventRes.rows[0].id;
            console.log(`Using existing event ID: ${eventId}`);
        } else {
            console.log('No events found. Creating a sample event...');
            const newEvent = await client.query(`
                INSERT INTO events (title, event_date_start, event_date_end, location, description, registration_start, registration_end, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `, ['Saudi Auto Show 2026', '2026-06-01', '2026-06-05', 'Riyadh Front', 'The biggest auto show in the region.', '2026-01-01', '2026-05-30', true]);
            eventId = newEvent.rows[0].id;
            console.log(`Created new event ID: ${eventId}`);
        }

        // 2. Generate 100 Registrations
        const targetCount = 100;
        let insertedCount = 0;

        for (let i = 0; i < targetCount; i++) {
            const firstName = getRandom(firstNamesEn);
            const lastName = getRandom(lastNamesEn);
            const fullName = `${firstName} ${lastName}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace('-', '')}${Math.floor(Math.random() * 999)}@example.com`;
            const phone = generatePhone();
            const carBrand = getRandom(carBrands);
            const carModel = getRandom(carModels[carBrand]);
            const carYear = 2010 + Math.floor(Math.random() * 17); // 2010-2026
            const plateNumber = `${String.fromCharCode(65+Math.floor(Math.random()*26))}${String.fromCharCode(65+Math.floor(Math.random()*26))}${String.fromCharCode(65+Math.floor(Math.random()*26))} ${Math.floor(Math.random()*9999)}`;
            
            // Random status (mostly pending or approved)
            const statusOptions = ['pending', 'approved', 'rejected', 'payment_pending'];
            // Weighted random: 60% pending, 20% approved, 10% payment_pending, 10% rejected
            let status = 'pending';
            const r = Math.random();
            if (r > 0.60) status = 'approved';
            else if (r > 0.80) status = 'payment_pending';
            else if (r > 0.90) status = 'rejected';

            // Insert Registration
            const regQuery = `
                INSERT INTO registrations (
                    event_id, 
                    full_name, 
                    email, 
                    phone_number, 
                    car_make, 
                    car_model, 
                    car_year, 
                    status,
                    registration_type,
                    car_count,
                    created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'individual', 1, NOW())
                RETURNING id
            `;
            
            try {
                const regResult = await client.query(regQuery, [
                    eventId, fullName, email, phone, carBrand, carModel, carYear, status
                ]);
                const regId = regResult.rows[0].id;

                // Insert 1-3 Dummy Car Images for this registration
                const numImages = 1 + Math.floor(Math.random() * 3);
                for (let j = 0; j < numImages; j++) {
                    const imgUrl = `https://placehold.co/600x400?text=${carBrand}+${carModel}+${j+1}`;
                    await client.query(`
                        INSERT INTO car_images (registration_id, image_url, file_name, created_at, uploaded_at)
                        VALUES ($1, $2, $3, NOW(), NOW())
                    `, [regId, imgUrl, `dummy/path/${regId}/${j}.jpg`]);
                }

                insertedCount++;
                if (insertedCount % 10 === 0) {
                    process.stdout.write('.');
                }
            } catch (err) {
                console.error(`\nFailed to insert participant ${email}:`, err.message);
            }
        }

        console.log(`\n✅ Successfully generated ${insertedCount} participants with car images.`);

        // Verification
        const countRes = await client.query('SELECT COUNT(*) FROM registrations WHERE event_id = $1', [eventId]);
        console.log(`Total registrations for event ${eventId}: ${countRes.rows[0].count}`);

    } catch (err) {
        console.error('❌ Script failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

generateData();
