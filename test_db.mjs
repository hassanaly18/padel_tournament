
const url = 'https://arxkzhdlcxqukcgqmffs.supabase.co';
const key = 'sb_publishable_kzs1S7RIY4Tl_Q7Mliqh2w_qUDikq69';

async function testTable(tableName) {
  try {
    const res = await fetch(`${url}/rest/v1/${tableName}?select=*&limit=1`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    console.log(`Table ${tableName}:`, res.status, res.statusText);
    if (res.ok) {
        console.log(await res.json());
    }
  } catch (e) {
    console.error(`Error on ${tableName}:`, e.message);
  }
}

testTable('teams');
testTable('groups');
testTable('matches');
