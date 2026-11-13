export type Script = {
  id: string
  name: string
  description: string
  defaultScript: string
}

// go to scoreboard page for your league `https://fantasy.espn.com/basketball/league/scoreboard?leagueId=xxx`
export const SCOREBOARD_SCRIPT = `
scoreboard = {
  categories: Array.from(
    document
      .querySelector('.Scoreboard__Column .Table .Table__THEAD tr')
      .querySelectorAll('th span')
  ).map(el => {
    // const [abbreviation, ...stats] = scores[index]
    const category = el.innerText
    return category
  }),
  matchups: Array.from(document.querySelectorAll('.Scoreboard__Row')).map(
    el => {
      const teams = Array.from(
        el.querySelectorAll(
          '.ScoreboardScoreCell__Competitors .ScoreCell__TeamName'
        )
      ).map(teamEl => {
        const team = teamEl.innerText
        return team
      })
      const scores = Array.from(
        el.querySelectorAll('.Scoreboard__Column .Table .Table__TBODY tr')
      ).map(rowEl => {
        return Array.from(rowEl.querySelectorAll('td div')).map(scoreEl => {
          const score = scoreEl.innerText
          return score
        })
      })
      return teams.map((team, index) => {
        const [abbreviation, ...stats] = scores[index]
        return {
          name: team,
          abbreviation,
          stats: stats.map(stat => Number(stat)),
        }
      })
    }
  ),
}
`

// go to projections page for your league: `https://fantasy.espn.com/basketball/players/projections?leagueId=xxx`
// or draft strategy page (before draft): `https://fantasy.espn.com/basketball/editdraftstrategy?leagueId=XXX`
export const PLAYERS_SCRIPT = `
players = Array.from(
  document.querySelectorAll('.Table--fixed-left > .Table__TBODY > tr')
).map(el => {
  const nameEl = el.querySelector('.player-column__athlete')
  const name = nameEl.title
  const teamEl = el.querySelector(
    '.player-column__position .playerinfo__playerteam'
  )
  const team = teamEl.innerText
  const positionEl = el.querySelector(
    '.player-column__position .playerinfo__playerpos'
  )
  const position = positionEl.innerText
  return {
    name,
    team,
    position: position.split(', '),
  }
})
`

export const scripts: Script[] = [
  {
    id: 'scoreboard',
    name: 'scoreboard',
    description:
      'go to the scoreboard page for your league: https://fantasy.espn.com/basketball/league/scoreboard?leagueId=xxx',
    defaultScript: SCOREBOARD_SCRIPT,
  },
  {
    id: 'players',
    name: 'players',
    description:
      'go to the projections page for your league: https://fantasy.espn.com/basketball/players/projections?leagueId=xxx or the draft strategy page (before draft): https://fantasy.espn.com/basketball/editdraftstrategy?leagueId=xxx',
    defaultScript: PLAYERS_SCRIPT,
  },
]
