import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './PublicPage.module.css'

function fmtDate(d) {
  return new Date(d).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getWinner(m) {
  if (m.score_jamal > m.score_hajj) return 'jamal'
  if (m.score_hajj > m.score_jamal) return 'hajj'
  return 'draw'
}

export default function PublicPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('matches')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data }) => { setMatches(data || []); setLoading(false) })
  }, [])

  const total = matches.length
  const jWins = matches.filter(m => m.score_jamal > m.score_hajj).length
  const hWins = matches.filter(m => m.score_hajj > m.score_jamal).length
  const draws = matches.filter(m => m.score_jamal === m.score_hajj).length
  const jGoals = matches.reduce((a, m) => a + (m.score_jamal || 0), 0)
  const hGoals = matches.reduce((a, m) => a + (m.score_hajj || 0), 0)

  const grouped = matches.reduce((acc, m) => {
    const month = new Date(m.date).toLocaleDateString('fr-MA', { month: 'long', year: 'numeric' })
    if (!acc[month]) acc[month] = []
    acc[month].push(m)
    return acc
  }, {})

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Jamal vs Hajj</h1>
          <p className={styles.sub}>Chaque lundi et vendredi</p>
        </div>
        <a href="/login" className={styles.adminLink}>Admin ↗</a>
      </header>

      <div className={styles.vsBar}>
        <div className={styles.playerBlock}>
          <div className={styles.avatar} style={{ background: 'var(--blue-light)', color: 'var(--blue-dark)' }}>JM</div>
          <span className={styles.playerName}>Jamal</span>
          <span className={styles.playerSub}>{jWins} victoires · {jGoals} buts</span>
        </div>
        <div className={styles.vsSep}>
          <span className={styles.vsText}>VS</span>
          <span className={styles.vsRecord}>{jWins} – {draws} – {hWins}</span>
        </div>
        <div className={styles.playerBlock}>
          <div className={styles.avatar} style={{ background: 'var(--amber-light)', color: 'var(--amber-dark)' }}>HJ</div>
          <span className={styles.playerName}>Hajj</span>
          <span className={styles.playerSub}>{hWins} victoires · {hGoals} buts</span>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.stat}><span className={styles.statLbl}>Matchs</span><span className={styles.statVal}>{total}</span></div>
        <div className={styles.stat}><span className={styles.statLbl}>Jamal</span><span className={styles.statVal} style={{ color: 'var(--blue)' }}>{jWins}</span></div>
        <div className={styles.stat}><span className={styles.statLbl}>Nuls</span><span className={styles.statVal} style={{ color: 'var(--gray)' }}>{draws}</span></div>
        <div className={styles.stat}><span className={styles.statLbl}>Hajj</span><span className={styles.statVal} style={{ color: 'var(--amber)' }}>{hWins}</span></div>
      </div>

      {loading ? (
        <div className={styles.empty}>Chargement...</div>
      ) : total === 0 ? (
        <div className={styles.empty}>Aucun match enregistré pour l'instant.</div>
      ) : (
        Object.entries(grouped).map(([month, list]) => (
          <div key={month} className={styles.group}>
            <div className={styles.groupLabel}>{month}</div>
            {list.map(m => {
              const w = getWinner(m)
              return (
                <div key={m.id} className={styles.card}>
                  <div className={`${styles.bar} ${styles['bar_' + w]}`} />
                  <div className={styles.dateCol}>
                    <span className={styles.dateText}>{fmtDate(m.date)}</span>
                    <span className={styles.dayText}>{m.day}</span>
                    {m.note && <span className={styles.noteText}>{m.note}</span>}
                  </div>
                  <span className={styles.teamName}>Jamal</span>
                  <div className={styles.scoreCol}>
                    <span className={styles.score}>{m.score_jamal} – {m.score_hajj}</span>
                    <span className={`${styles.badge} ${styles['badge_' + w]}`}>
                      {w === 'jamal' ? 'Jamal' : w === 'hajj' ? 'Hajj' : 'Nul'}
                    </span>
                  </div>
                  <span className={styles.teamName} style={{ textAlign: 'right' }}>Hajj</span>
                </div>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}
