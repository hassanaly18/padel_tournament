import { createClient } from '@supabase/supabase-js';

const url = 'https://arxkzhdlcxqukcgqmffs.supabase.co';
const key = 'sb_publishable_kzs1S7RIY4Tl_Q7Mliqh2w_qUDikq69';

const supabase = createClient(url, key);

async function seed() {
    console.log('Clearing old data...');
    // We fetch and delete to ensure it clears
    const { data: mData } = await supabase.from('matches').select('id');
    if (mData && mData.length > 0) {
      await supabase.from('matches').delete().in('id', mData.map(m=>m.id));
    }
    const { data: tData } = await supabase.from('teams').select('id');
    if (tData && tData.length > 0) {
      await supabase.from('teams').delete().in('id', tData.map(t=>t.id));
    }
    const { data: gData } = await supabase.from('groups').select('id');
    if (gData && gData.length > 0) {
      await supabase.from('groups').delete().in('id', gData.map(g=>g.id));
    }

    console.log('Inserting groups...');
    const groupsToInsert = ['A', 'B', 'C', 'D'].map(id => ({ id, name: `Group ${id}` }));
    await supabase.from('groups').insert(groupsToInsert);
    
    console.log('Inserting teams...');
    const teamsData = [];
    const groupIds = ['A', 'B', 'C', 'D'];
    const teamNames = [
      'Thunder Smashers', 'Net Ninjas', 'Court Kings', 'Paddle Power', 'Iron Rackets',
      'Spin Masters', 'Volley Vipers', 'Ace Attackers', 'Rally Rockets', 'Topspin Titans',
      'Drop Shot Demons', 'Lob Legends', 'Smash Squad', 'Baseline Bandits', 'Crosscourt Crushers',
      'Glass Warriors', 'Power Paddlers', 'Match Point Makers', 'Court Crushers', 'Golden Sets'
    ];
    for(let i = 0; i < 20; i++) {
       teamsData.push({
           name: teamNames[i],
           group_id: groupIds[Math.floor(i/5)]
       });
    }
    const { data: insertedTeams, error: teamErr } = await supabase.from('teams').insert(teamsData).select();
    if (teamErr) {
        console.error('Error inserting teams', teamErr);
        return;
    }

    console.log(`Inserted ${insertedTeams.length} teams.`);
    console.log('Generating round robin matches...');
    
    const matchData = [];
    for (const group of groupIds) {
        const gTeams = insertedTeams.filter(t => t.group_id === group);
        for(let i=0; i<gTeams.length; i++) {
          for(let j=i+1; j<gTeams.length; j++) {
              matchData.push({
                 team1_id: gTeams[i].id,
                 team2_id: gTeams[j].id,
                 court: Math.random() > 0.5 ? 'blue' : 'red',
                 status: 'upcoming'
              });
          }
        }
    }
    const { error: matchErr } = await supabase.from('matches').insert(matchData);
    if(matchErr){
        console.error('Error inserting matches', matchErr);
    } else {
        console.log(`Successfully generated and inserted ${matchData.length} matches!`);
    }
}

seed().catch(console.error);
