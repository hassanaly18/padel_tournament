'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  getTeams,
  getGroups,
  getMatches,
  regenerateGroups,
  resetStore,
} from '@/lib/store'
import { Settings, RefreshCw, AlertTriangle, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

export default function AdminSettingsPage() {
  const [teams, setTeams] = useState(getTeams())
  const [groups, setGroups] = useState(getGroups())
  const [matches, setMatches] = useState(getMatches())
  const { toast } = useToast()

  const [teamCount, setTeamCount] = useState(teams.length.toString())

  const refreshData = () => {
    setTeams(getTeams())
    setGroups(getGroups())
    setMatches(getMatches())
  }

  const handleRegenerateGroups = () => {
    const count = parseInt(teamCount)
    if (isNaN(count) || count < 4) {
      toast({
        title: 'Error',
        description: 'Please enter at least 4 teams.',
        variant: 'destructive',
      })
      return
    }

    if (confirm(`This will redistribute ${teams.length} teams into ${Math.ceil(count / 4)} groups. Continue?`)) {
      regenerateGroups(count)
      refreshData()
      toast({
        title: 'Groups regenerated',
        description: `Teams have been redistributed into ${Math.ceil(count / 4)} groups.`,
      })
    }
  }

  const handleResetData = () => {
    if (confirm('This will reset all data to the initial sample state. This cannot be undone. Continue?')) {
      resetStore()
      refreshData()
      setTeamCount(getTeams().length.toString())
      toast({
        title: 'Data reset',
        description: 'All data has been restored to the initial state.',
      })
    }
  }

  return (
    <div className="space-y-6">
      <Toaster />

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

      {/* Group Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Configuration
          </CardTitle>
          <CardDescription>
            Automatically redistribute teams into groups based on team count
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-xs space-y-2">
              <label className="text-sm font-medium">Target team count</label>
              <Input
                type="number"
                min="4"
                step="4"
                value={teamCount}
                onChange={(e) => setTeamCount(e.target.value)}
                placeholder="16"
              />
              <p className="text-xs text-muted-foreground">
                Teams will be distributed into {Math.ceil(parseInt(teamCount) / 4) || 1} groups (4 teams each)
              </p>
            </div>
            <Button onClick={handleRegenerateGroups}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate Groups
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions - proceed with caution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
            <div>
              <p className="font-medium">Reset all data</p>
              <p className="text-sm text-muted-foreground">
                Restore all teams, groups, and matches to sample data
              </p>
            </div>
            <Button variant="destructive" onClick={handleResetData}>
              Reset Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
