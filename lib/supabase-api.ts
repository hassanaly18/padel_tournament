import { createClient } from '@/utils/supabase/client'
import type { Team, Group, Match } from './types'

export async function fetchMatches(): Promise<Match[]> {
   const supabase = createClient()
   const { data } = await supabase.from('matches').select('*')
   return (data || []).map(m => ({
       id: m.id,
       team1Id: m.team1_id,
       team2Id: m.team2_id,
       score1: m.score1,
       score2: m.score2,
       court: m.court,
       status: m.status,
       createdAt: m.created_at
   }))
}

export async function fetchTeams(): Promise<Team[]> {
   const supabase = createClient()
   const { data } = await supabase.from('teams').select('*')
   return (data || []).map(t => ({
       id: t.id,
       name: t.name,
       groupId: t.group_id,
       createdAt: t.created_at
   }))
}

export async function fetchGroups(): Promise<Group[]> {
   const supabase = createClient()
   const { data } = await supabase.from('groups').select('*')
   return data || []
}

export async function updateMatchScore(matchId: string, score1: number | null, score2: number | null, status: 'upcoming' | 'live' | 'completed') {
    const supabase = createClient()
    const { data, error } = await supabase.from('matches').update({
        score1,
        score2,
        status
    }).eq('id', matchId).select()
    if (error) console.error(error)

    if (status === 'completed') {
        autoFillQuarterFinals().catch(console.error)
    }

    return data
}

export async function addTeam(team: Omit<Team, 'id' | 'createdAt'>): Promise<Team | null> {
    const supabase = createClient()
    const { data, error } = await supabase.from('teams').insert({
        name: team.name,
        group_id: team.groupId
    }).select().single()
    if (error) { console.error(error); return null; }
    return { id: data.id, name: data.name, groupId: data.group_id, createdAt: data.created_at }
}

export async function updateTeam(id: string, updates: Partial<Pick<Team, 'name' | 'groupId'>>): Promise<Team | null> {
    const supabase = createClient()
    const updatePayload: any = {}
    if (updates.name !== undefined) updatePayload.name = updates.name
    if (updates.groupId !== undefined) updatePayload.group_id = updates.groupId
    const { data, error } = await supabase.from('teams').update(updatePayload).eq('id', id).select().single()
    if (error) { console.error(error); return null; }
    return { id: data.id, name: data.name, groupId: data.group_id, createdAt: data.created_at }
}

export async function deleteTeam(id: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (error) { console.error(error); return false; }
    return true
}

export function calculateStandings(groupTeams: Team[], groupMatches: Match[]) {
  const standings = groupTeams.map(team => {
    const teamMatches = groupMatches.filter(m => m.team1Id === team.id || m.team2Id === team.id)
    let played = 0, won = 0, lost = 0, pointsFor = 0, pointsAgainst = 0
    
    for (const match of teamMatches) {
      if (match.score1 === null || match.score2 === null) continue
      played++
      const isTeam1 = match.team1Id === team.id
      const myScore = isTeam1 ? match.score1 : match.score2
      const oppScore = isTeam1 ? match.score2 : match.score1
      
      pointsFor += myScore
      pointsAgainst += oppScore
      
      if (myScore > oppScore) won++
      else lost++
    }
    
    return {
      team,
      played,
      won,
      lost,
      pointsFor,
      pointsAgainst,
      pointsDiff: pointsFor - pointsAgainst,
      points: won * 3,
    }
  })
  
  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    return b.pointsDiff - a.pointsDiff
  })
}

export async function addMatch(match: Partial<Match>): Promise<Match | { error: string }> {
   const supabase = createClient()
   const { data, error } = await supabase.from('matches').insert({
       team1_id: match.team1Id,
       team2_id: match.team2Id,
       court: match.court,
       status: match.status,
       score1: match.score1,
       score2: match.score2
   }).select().single()
   if (error) return { error: error.message }
   return { ...match, id: data.id } as Match
}

export async function updateMatch(id: string, updates: Partial<Match>): Promise<Match | null> {
   const supabase = createClient()
   const payload: any = {}
   if (updates.court !== undefined) payload.court = updates.court
   if (updates.status !== undefined) payload.status = updates.status
   if (updates.score1 !== undefined) payload.score1 = updates.score1
   if (updates.score2 !== undefined) payload.score2 = updates.score2

   const { data, error } = await supabase.from('matches').update(payload).eq('id', id).select().single()
   if (error) { console.error(error); return null; }

   if (updates.status === 'completed') {
       autoFillQuarterFinals().catch(console.error)
   }

   return { id: data.id } as Match 
}

export async function deleteMatch(id: string): Promise<boolean> {
   const supabase = createClient()
   const { error } = await supabase.from('matches').delete().eq('id', id)
   if (error) return false
   return true
}

export async function generateKnockoutBracket() {
   const supabase = createClient()
   
   // 1. Create Group 'K'
   const { data: existingGroup } = await supabase.from('groups').select('*').eq('id', 'K').single()
   if (!existingGroup) {
      await supabase.from('groups').insert({ id: 'K', name: 'Knockouts' })
   }

   // 2. Insert placeholders
   const teamNames = [
      '[A1] TBD', '[A2] TBD', '[B1] TBD', '[B2] TBD', 
      '[C1] TBD', '[C2] TBD', '[D1] TBD', '[D2] TBD', 
      '[Semi 1] TBD', '[Semi 2] TBD', '[Semi 3] TBD', '[Semi 4] TBD', 
      '[Final 1] TBD', '[Final 2] TBD'
   ]
   
   // Check what already exists to prevent duplicates
   const { data: existingTeams } = await supabase.from('teams').select('*').eq('group_id', 'K')
   const existingNames = new Set((existingTeams || []).map(t => t.name))
   
   const teamsToInsert = teamNames
      .filter(name => !existingNames.has(name))
      .map(name => ({ name, group_id: 'K' }))

   if (teamsToInsert.length > 0) {
      await supabase.from('teams').insert(teamsToInsert)
   }

   // Refetch all knockout teams
   const { data: knTeams } = await supabase.from('teams').select('id, name').eq('group_id', 'K')
   if (!knTeams) return false

   const getT = (prefix: string) => knTeams.find(t => t.name.startsWith(prefix))?.id

   // 3. Create Knockout Matches if they don't exist
   // We will just fetch to see if we already have a match with [Semi 1] vs [Semi 2]
   const { data: existingKnockoutMatches } = await supabase.from('matches').select('*').eq('team1_id', getT('[Semi 1]') || '').single()
   
   if (!existingKnockoutMatches) {
       const matchesToInsert = [
          { team1_id: getT('[A1]'), team2_id: getT('[C2]'), status: 'upcoming', court: 'blue' },
          { team1_id: getT('[A2]'), team2_id: getT('[C1]'), status: 'upcoming', court: 'red' },
          { team1_id: getT('[B1]'), team2_id: getT('[D2]'), status: 'upcoming', court: 'blue' },
          { team1_id: getT('[B2]'), team2_id: getT('[D1]'), status: 'upcoming', court: 'red' },
          { team1_id: getT('[Semi 1]'), team2_id: getT('[Semi 2]'), status: 'upcoming', court: 'blue' },
          { team1_id: getT('[Semi 3]'), team2_id: getT('[Semi 4]'), status: 'upcoming', court: 'red' },
          { team1_id: getT('[Final 1]'), team2_id: getT('[Final 2]'), status: 'upcoming', court: 'blue' },
       ]

       // remove matches if `getT` failed for some reason
       const validMatches = matchesToInsert.filter(m => m.team1_id && m.team2_id)
       
       if (validMatches.length > 0) {
           const { error } = await supabase.from('matches').insert(validMatches)
           if (error) {
               console.error("Error inserting knockouts", error)
               return false
           }
       }
   }
   return true
}

export async function autoFillQuarterFinals() {
    const supabase = createClient()
    const { data: rawTeams } = await supabase.from('teams').select('*')
    const { data: rawMatches } = await supabase.from('matches').select('*')
    if (!rawTeams || !rawMatches) return

    const teams = rawTeams.map(t => ({ id: t.id, name: t.name, groupId: t.group_id, createdAt: t.created_at })) as Team[]
    const matches = rawMatches.map(m => ({
        id: m.id, team1Id: m.team1_id, team2Id: m.team2_id,
        score1: m.score1, score2: m.score2, court: m.court,
        status: m.status, createdAt: m.created_at
    })) as Match[]

    const standardGroups = ['A', 'B', 'C', 'D']
    const groupTeams = teams.filter(t => t.groupId && standardGroups.includes(t.groupId))
    const groupTeamIds = new Set(groupTeams.map(t => t.id))
    
    const groupMatches = matches.filter(m => groupTeamIds.has(m.team1Id) && groupTeamIds.has(m.team2Id))
    
    if (groupMatches.length < 10) return
    const allCompleted = groupMatches.every(m => m.status === 'completed')
    if (!allCompleted) return

    const topTeams: Record<string, Team[]> = {}
    for (const gId of standardGroups) {
        const gTeams = groupTeams.filter(t => t.groupId === gId)
        const gMatches = groupMatches.filter(m => gTeams.some(t => t.id === m.team1Id || t.id === m.team2Id))
        const standings = calculateStandings(gTeams, gMatches)
        topTeams[gId] = [standings[0]?.team, standings[1]?.team]
    }

    const knTeams = teams.filter(t => t.groupId === 'K')
    const getT = (prefix: string) => knTeams.find(t => t.name.startsWith(prefix))?.id

    const mappings: Record<string, Team | undefined> = {
        '[A1]': topTeams['A']?.[0], '[A2]': topTeams['A']?.[1],
        '[B1]': topTeams['B']?.[0], '[B2]': topTeams['B']?.[1],
        '[C1]': topTeams['C']?.[0], '[C2]': topTeams['C']?.[1],
        '[D1]': topTeams['D']?.[0], '[D2]': topTeams['D']?.[1],
    }

    // We do NOT modify the matches' team_id, but rather we rename the placeholder team
    // e.g., "[A1] TBD" -> "[A1] Thunder Smashers"
    for (const [prefix, actualTeam] of Object.entries(mappings)) {
        if (!actualTeam) continue
        const placeholderId = getT(prefix)
        if (!placeholderId) continue

        // Update name if different
        const newName = `${prefix} ${actualTeam.name}`
        const currentPlaceholder = knTeams.find(t => t.id === placeholderId)
        if (currentPlaceholder?.name !== newName) {
            await supabase.from('teams').update({ name: newName }).eq('id', placeholderId)
        }
    }
}

