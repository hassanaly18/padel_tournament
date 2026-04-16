import type { Match, Team } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface MatchCardProps {
  match: Match
  team1: Team
  team2: Team
}

export function MatchCard({ match, team1, team2 }: MatchCardProps) {
  const isLive = match.status === 'live'
  const isCompleted = match.status === 'completed'
  const isUpcoming = match.status === 'upcoming'

  const team1Wins = isCompleted && match.score1 !== null && match.score2 !== null && match.score1 > match.score2
  const team2Wins = isCompleted && match.score1 !== null && match.score2 !== null && match.score2 > match.score1

  const isKnockout = team1.groupId === 'K' || team2.groupId === 'K'

  const parseKnockoutParams = (name: string) => {
    const m = name.match(/^\[(.*?)\]\s*(.*)$/)
    if (m) {
        let prefixLabel = m[1]
        if (prefixLabel.startsWith('A') || prefixLabel.startsWith('B') || prefixLabel.startsWith('C') || prefixLabel.startsWith('D')) {
            prefixLabel = `QF - ${prefixLabel}`
        }
        return { prefix: prefixLabel, cleanName: m[2] }
    }
    return { prefix: null, cleanName: name }
  }

  const t1Info = parseKnockoutParams(team1.name)
  const t2Info = parseKnockoutParams(team2.name)

  return (
    <Card
      className={cn(
        'transition-all duration-200 border-l-4 overflow-hidden',
        isLive ? 'ring-2 ring-[var(--live)] shadow-lg' : '',
        match.court === 'blue' 
          ? 'border-l-[var(--court-blue)] bg-[var(--court-blue)]/5 border-t-[var(--court-blue)]/10 border-r-[var(--court-blue)]/10 border-b-[var(--court-blue)]/10' 
          : 'border-l-[var(--court-red)] bg-[var(--court-red)]/5 border-t-[var(--court-red)]/10 border-r-[var(--court-red)]/10 border-b-[var(--court-red)]/10'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isLive && (
              <Badge className="bg-[var(--live)] text-[var(--live-foreground)] animate-pulse">
                LIVE
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="secondary">Completed</Badge>
            )}
            {isUpcoming && (
              <Badge variant="outline">Upcoming</Badge>
            )}
          </div>
          <Badge
            variant="outline"
            className={cn(
              'font-medium',
              match.court === 'blue' && 'border-[var(--court-blue)] text-[var(--court-blue)]',
              match.court === 'red' && 'border-[var(--court-red)] text-[var(--court-red)]'
            )}
          >
            {match.court === 'blue' ? 'Blue Court' : 'Red Court'}
          </Badge>
        </div>

        <div className="space-y-2">
          <div
            className={cn(
              'flex items-center justify-between rounded-lg p-3 transition-colors',
              team1Wins ? 'bg-[var(--live)]/10' : 'bg-muted/50'
            )}
          >
            <div className="flex items-center gap-2">
              {team1Wins && (
                <span className="text-[var(--live)] text-sm font-bold">W</span>
              )}
              <span
                className={cn(
                  'font-medium',
                  team1Wins && 'text-foreground',
                  team2Wins && 'text-muted-foreground'
                )}
              >
                {t1Info.cleanName}
                {t1Info.prefix && (
                  <Badge variant="outline" className="ml-2 text-[10px] h-5 opacity-70">
                    {t1Info.prefix}
                  </Badge>
                )}
              </span>
            </div>
            <span
              className={cn(
                'text-xl font-bold tabular-nums',
                isLive && 'text-[var(--live)]',
                team1Wins && 'text-foreground',
                team2Wins && 'text-muted-foreground'
              )}
            >
              {match.score1 ?? '-'}
            </span>
          </div>

          <div
            className={cn(
              'flex items-center justify-between rounded-lg p-3 transition-colors',
              team2Wins ? 'bg-[var(--live)]/10' : 'bg-muted/50'
            )}
          >
            <div className="flex items-center gap-2">
              {team2Wins && (
                <span className="text-[var(--live)] text-sm font-bold">W</span>
              )}
              <span
                className={cn(
                  'font-medium',
                  team2Wins && 'text-foreground',
                  team1Wins && 'text-muted-foreground'
                )}
              >
                {t2Info.cleanName}
                {t2Info.prefix && (
                  <Badge variant="outline" className="ml-2 text-[10px] h-5 opacity-70">
                    {t2Info.prefix}
                  </Badge>
                )}
              </span>
            </div>
            <span
              className={cn(
                'text-xl font-bold tabular-nums',
                isLive && 'text-[var(--live)]',
                team2Wins && 'text-foreground',
                team1Wins && 'text-muted-foreground'
              )}
            >
              {match.score2 ?? '-'}
            </span>
          </div>
        </div>

        {isKnockout ? (
          <div className="mt-3">
             <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-amber-500/20">
               Knockout Stage
             </Badge>
          </div>
        ) : (
          <div className="mt-3 text-xs text-muted-foreground">
            Group {team1.groupId}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
