import type { Team, Group, Match, TeamStanding } from './types'
import { teams as initialTeams, groups as initialGroups, matches as initialMatches } from './data'

// In-memory store (can be replaced with Supabase later)
let teamsStore: Team[] = [...initialTeams]
let groupsStore: Group[] = [...initialGroups]
let matchesStore: Match[] = [...initialMatches]

// Teams
export function getTeams(): Team[] {
  return [...teamsStore]
}

export function getTeamById(id: string): Team | undefined {
  return teamsStore.find(t => t.id === id)
}

export function getTeamsByGroup(groupId: string): Team[] {
  return teamsStore.filter(t => t.groupId === groupId)
}

export function addTeam(team: Omit<Team, 'id' | 'createdAt'>): Team {
  const newTeam: Team = {
    ...team,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  }
  teamsStore.push(newTeam)
  return newTeam
}

export function updateTeam(id: string, updates: Partial<Pick<Team, 'name' | 'groupId'>>): Team | null {
  const index = teamsStore.findIndex(t => t.id === id)
  if (index === -1) return null
  teamsStore[index] = { ...teamsStore[index], ...updates }
  return teamsStore[index]
}

export function deleteTeam(id: string): boolean {
  const initialLength = teamsStore.length
  teamsStore = teamsStore.filter(t => t.id !== id)
  // Also delete matches involving this team
  matchesStore = matchesStore.filter(m => m.team1Id !== id && m.team2Id !== id)
  return teamsStore.length < initialLength
}

// Groups
export function getGroups(): Group[] {
  return [...groupsStore]
}

export function regenerateGroups(teamCount: number): void {
  // Calculate number of groups needed (4 teams per group ideally)
  const groupCount = Math.ceil(teamCount / 4)
  const groupNames = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  
  groupsStore = Array.from({ length: groupCount }, (_, i) => ({
    id: groupNames[i],
    name: `Group ${groupNames[i]}`,
  }))
  
  // Redistribute teams across new groups
  const teamsPerGroup = Math.ceil(teamsStore.length / groupCount)
  teamsStore = teamsStore.map((team, index) => ({
    ...team,
    groupId: groupNames[Math.floor(index / teamsPerGroup)] || groupNames[groupCount - 1],
  }))
}

// Matches
export function getMatches(): Match[] {
  return [...matchesStore]
}

export function getMatchById(id: string): Match | undefined {
  return matchesStore.find(m => m.id === id)
}

export function getMatchesByStatus(status: Match['status']): Match[] {
  return matchesStore.filter(m => m.status === status)
}

export function getMatchesByGroup(groupId: string): Match[] {
  const teamIds = getTeamsByGroup(groupId).map(t => t.id)
  return matchesStore.filter(m => teamIds.includes(m.team1Id) || teamIds.includes(m.team2Id))
}

export function getMatchesByCourt(court: Match['court']): Match[] {
  return matchesStore.filter(m => m.court === court)
}

export function addMatch(match: Omit<Match, 'id' | 'createdAt'>): Match | { error: string } {
  // Check for duplicate match
  const exists = matchesStore.some(
    m => (m.team1Id === match.team1Id && m.team2Id === match.team2Id) ||
         (m.team1Id === match.team2Id && m.team2Id === match.team1Id)
  )
  if (exists) {
    return { error: 'This match already exists' }
  }
  
  // Check if same team selected twice
  if (match.team1Id === match.team2Id) {
    return { error: 'Cannot create a match with the same team' }
  }
  
  const newMatch: Match = {
    ...match,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  }
  matchesStore.push(newMatch)
  return newMatch
}

export function updateMatch(id: string, updates: Partial<Omit<Match, 'id' | 'createdAt'>>): Match | null {
  const index = matchesStore.findIndex(m => m.id === id)
  if (index === -1) return null
  matchesStore[index] = { ...matchesStore[index], ...updates }
  return matchesStore[index]
}

export function deleteMatch(id: string): boolean {
  const initialLength = matchesStore.length
  matchesStore = matchesStore.filter(m => m.id !== id)
  return matchesStore.length < initialLength
}

// Standings calculation
export function getStandingsByGroup(groupId: string): TeamStanding[] {
  const groupTeams = getTeamsByGroup(groupId)
  const groupMatches = getMatchesByGroup(groupId).filter(m => m.status === 'completed')
  
  const standings: TeamStanding[] = groupTeams.map(team => {
    const teamMatches = groupMatches.filter(
      m => m.team1Id === team.id || m.team2Id === team.id
    )
    
    let played = 0
    let won = 0
    let lost = 0
    let pointsFor = 0
    let pointsAgainst = 0
    
    for (const match of teamMatches) {
      if (match.score1 === null || match.score2 === null) continue
      
      played++
      const isTeam1 = match.team1Id === team.id
      const myScore = isTeam1 ? match.score1 : match.score2
      const oppScore = isTeam1 ? match.score2 : match.score1
      
      pointsFor += myScore
      pointsAgainst += oppScore
      
      if (myScore > oppScore) {
        won++
      } else {
        lost++
      }
    }
    
    return {
      team,
      played,
      won,
      lost,
      pointsFor,
      pointsAgainst,
      pointsDiff: pointsFor - pointsAgainst,
      points: won * 3, // 3 points for a win
    }
  })
  
  // Sort by points, then by point difference
  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    return b.pointsDiff - a.pointsDiff
  })
}

// Reset to initial state (useful for testing)
export function resetStore(): void {
  teamsStore = [...initialTeams]
  groupsStore = [...initialGroups]
  matchesStore = [...initialMatches]
}
