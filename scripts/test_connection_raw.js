
const url = 'https://bvebeycfhtikfmcyadiy.supabase.co/rest/v1/';

import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

async function test() {
    console.log(`Resolving bvebeycfhtikfmcyadiy.supabase.co...`);
    try {
        const result = await lookup('bvebeycfhtikfmcyadiy.supabase.co');
        console.log('DNS Resolution:', result);
    } catch (e) {
        console.error('DNS Lookup failed:', e);
    }

    console.log(`\nFetching ${url}...`);
    try {
        const res = await fetch(url);
        console.log('Status:', res.status); 
    } catch (e) {
        console.error('Fetch failed:', e);
        if (e.cause) console.error('Cause:', e.cause);
    }
}

test();
