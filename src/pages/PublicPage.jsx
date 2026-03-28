import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './PublicPage.module.css'

function fmtDate(d) {
  return new Date(d).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' })
}

const dayMap = { 'Lundi': 'الإثنين', 'Vendredi': 'الجمعة', 'Tnin': 'الإثنين', 'Jem3a': 'الجمعة' }
function translateDay(d) { return dayMap[d] || d }

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
          <h1 className={styles.title}>جمال ضد الحاج</h1>
          <p className={styles.sub}>كل يوم إثنين وجمعة</p>
        </div>
        <a href="/login" className={styles.adminLink}>المشرف ↗</a>
      </header>

      <div className={styles.vsBar}>
        <div className={styles.playerBlock}>
          <div className={styles.avatar} style={{ background: 'var(--blue-light)', color: 'var(--blue-dark)' }}>JM</div>
          <span className={styles.playerName}>جمال</span>
          <span className={styles.playerSub}>{jWins} انتصارات · {jGoals} أهداف</span>
        </div>
        <div className={styles.vsSep}>
          <span className={styles.vsText}>ضد</span>
          <span className={styles.vsRecord}>{jWins} – {draws} – {hWins}</span>
        </div>
        <div className={styles.playerBlock}>
          <div className={styles.avatar} style={{ background: 'var(--amber-light)', color: 'var(--amber-dark)' }}>HJ</div>
          <span className={styles.playerName}>الحاج</span>
          <span className={styles.playerSub}>{hWins} انتصارات · {hGoals} أهداف</span>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.stat}><span className={styles.statLbl}>المباريات</span><span className={styles.statVal}>{total}</span></div>
        <div className={styles.stat}><span className={styles.statLbl}>جمال</span><span className={styles.statVal} style={{ color: 'var(--blue)' }}>{jWins}</span></div>
        <div className={styles.stat}><span className={styles.statLbl}>تعادل</span><span className={styles.statVal} style={{ color: 'var(--gray)' }}>{draws}</span></div>
        <div className={styles.stat}><span className={styles.statLbl}>الحاج</span><span className={styles.statVal} style={{ color: 'var(--amber)' }}>{hWins}</span></div>
      </div>

      {loading ? (
        <div className={styles.empty}>جاري التحميل...</div>
      ) : total === 0 ? (
        <div className={styles.empty}>لا توجد مباريات مسجلة حتى الآن.</div>
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
                    <span className={styles.dayText}>{translateDay(m.day)}</span>
                    {m.note && <span className={styles.noteText}>{m.note}</span>}
                  </div>
                  <span className={styles.teamName}>جمال</span>
                  <div className={styles.scoreCol}>
                    <span className={styles.score}>{m.score_jamal} – {m.score_hajj}</span>
                    <span className={`${styles.badge} ${styles['badge_' + w]}`}>
                      {w === 'jamal' ? 'جمال' : w === 'hajj' ? 'الحاج' : 'تعادل'}
                    </span>
                  </div>
                  <span className={styles.teamName} style={{ textAlign: 'left' }}>الحاج</span>
                </div>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}
