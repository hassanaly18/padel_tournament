'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings } from 'lucide-react'
import { fetchTeams, fetchGroups, fetchMatches } from '@/lib/supabase-api'
import type { Team, Group, Match } from '@/lib/types'

export default function AdminSettingsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchTeams(), fetchGroups(), fetchMatches()]).then(([t, g, m]) => {
      setTeams(t)
      setGroups(g)
      setMatches(m)
      setLoading(false)
    })
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure tournament settings</p>
      </div>

      {/* Current Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tournament Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Total Teams</p>
              <p className="text-2xl font-bold">{teams.length}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Groups</p>
              <p className="text-2xl font-bold">{groups.length}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Total Matches</p>
              <p className="text-2xl font-bold">{matches.length}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Teams per group:</p>
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => {
                const count = teams.filter((t) => t.groupId === group.id).length
                return (
                  <Badge key={group.id} variant="outline">
                    {group.name}: {count} teams
                  </Badge>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
