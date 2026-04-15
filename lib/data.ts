import type { Team, Group, Match } from './types'

// Default groups
export const groups: Group[] = [
  { id: 'A', name: 'Group A' },
  { id: 'B', name: 'Group B' },
  { id: 'C', name: 'Group C' },
  { id: 'D', name: 'Group D' },
]

// Sample teams (16 teams, 4 per group)
export const teams: Team[] = [
  // Group A
  { id: '1', name: 'Thunder Smashers', groupId: 'A', createdAt: new Date() },
  { id: '2', name: 'Net Ninjas', groupId: 'A', createdAt: new Date() },
  { id: '3', name: 'Court Kings', groupId: 'A', createdAt: new Date() },
  { id: '4', name: 'Paddle Power', groupId: 'A', createdAt: new Date() },
  // Group B
  { id: '5', name: 'Spin Masters', groupId: 'B', createdAt: new Date() },
  { id: '6', name: 'Volley Vipers', groupId: 'B', createdAt: new Date() },
  { id: '7', name: 'Ace Attackers', groupId: 'B', createdAt: new Date() },
  { id: '8', name: 'Rally Rockets', groupId: 'B', createdAt: new Date() },
  // Group C
  { id: '9', name: 'Drop Shot Demons', groupId: 'C', createdAt: new Date() },
  { id: '10', name: 'Lob Legends', groupId: 'C', createdAt: new Date() },
  { id: '11', name: 'Smash Squad', groupId: 'C', createdAt: new Date() },
  { id: '12', name: 'Baseline Bandits', groupId: 'C', createdAt: new Date() },
  // Group D
  { id: '13', name: 'Glass Warriors', groupId: 'D', createdAt: new Date() },
  { id: '14', name: 'Power Paddlers', groupId: 'D', createdAt: new Date() },
  { id: '15', name: 'Match Point Makers', groupId: 'D', createdAt: new Date() },
  { id: '16', name: 'Court Crushers', groupId: 'D', createdAt: new Date() },
]

// Sample matches with various states
export const matches: Match[] = [
  // Group A matches
  { id: 'm1', team1Id: '1', team2Id: '2', score1: 6, score2: 4, court: 'blue', status: 'completed', createdAt: new Date() },
  { id: 'm2', team1Id: '3', team2Id: '4', score1: 3, score2: 6, court: 'red', status: 'completed', createdAt: new Date() },
  { id: 'm3', team1Id: '1', team2Id: '3', score1: 4, score2: 3, court: 'blue', status: 'live', createdAt: new Date() },
  { id: 'm4', team1Id: '2', team2Id: '4', score1: null, score2: null, court: 'red', status: 'upcoming', createdAt: new Date() },
  // Group B matches
  { id: 'm5', team1Id: '5', team2Id: '6', score1: 6, score2: 2, court: 'blue', status: 'completed', createdAt: new Date() },
  { id: 'm6', team1Id: '7', team2Id: '8', score1: 5, score2: 6, court: 'red', status: 'completed', createdAt: new Date() },
  { id: 'm7', team1Id: '5', team2Id: '7', score1: 2, score2: 1, court: 'red', status: 'live', createdAt: new Date() },
  { id: 'm8', team1Id: '6', team2Id: '8', score1: null, score2: null, court: 'blue', status: 'upcoming', createdAt: new Date() },
  // Group C matches
  { id: 'm9', team1Id: '9', team2Id: '10', score1: 6, score2: 5, court: 'blue', status: 'completed', createdAt: new Date() },
  { id: 'm10', team1Id: '11', team2Id: '12', score1: null, score2: null, court: 'red', status: 'upcoming', createdAt: new Date() },
  // Group D matches
  { id: 'm11', team1Id: '13', team2Id: '14', score1: null, score2: null, court: 'blue', status: 'upcoming', createdAt: new Date() },
  { id: 'm12', team1Id: '15', team2Id: '16', score1: null, score2: null, court: 'red', status: 'upcoming', createdAt: new Date() },
]
