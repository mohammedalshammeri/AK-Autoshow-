
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testEndpoints() {
  const endpoints = [
    'http://localhost:3000/api/admin/auth/check',
    'http://localhost:3000/api/admin/registrations', 
    'http://localhost:3000/api/admin/events'
  ];

  for (const url of endpoints) {
    try {
      console.log(`\nTesting ${url}...`);
      const res = await fetch(url);
      console.log(`Status: ${res.status}`);
      const contentType = res.headers.get('content-type');
      console.log(`Content-Type: ${contentType}`);
      
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        console.log('JSON Response:', JSON.stringify(json).substring(0, 100));
      } catch (e) {
        console.log('Response is NOT JSON. First 200 chars:', text.substring(0, 200));
      }
    } catch (err) {
      console.error('Fetch error:', err.message);
    }
  }
}

testEndpoints();
