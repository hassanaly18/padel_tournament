export interface Team {
  id: string
  name: string
  groupId: string
  createdAt: Date
}

export interface Group {
  id: string
  name: string
}

export interface Match {
  id: string
  team1Id: string
  team2Id: string
  score1: number | null
  score2: number | null
  court: 'blue' | 'red'
  status: 'upcoming' | 'live' | 'completed'
  createdAt: Date
}

export interface TeamStanding {
  team: Team
  played: number
  won: number
  lost: number
  pointsFor: number
  pointsAgainst: number
  pointsDiff: number
  points: number
}
