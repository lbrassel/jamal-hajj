import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './AdminPage.module.css'

function today() {
  return new Date().toISOString().split('T')[0]
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getWinner(m) {
  if (m.score_jamal > m.score_hajj) return 'jamal'
  if (m.score_hajj > m.score_jamal) return 'hajj'
  return 'draw'
}

export default function AdminPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ date: today(), day: 'Lundi', score_jamal: 0, score_hajj: 0, note: '' })
  const [error, setError] = useState('')

  async function fetchMatches() {
    const { data } = await supabase.from('matches').select('*').order('date', { ascending: false })
    setMatches(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchMatches() }, [])

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const { error } = await supabase.from('matches').insert([{
      date: form.date,
      day: form.day,
      score_jamal: parseInt(form.score_jamal) || 0,
      score_hajj: parseInt(form.score_hajj) || 0,
      note: form.note.trim() || null,
    }])
    if (error) { setError('Erreur lors de l\'enregistrement.'); setSaving(false); return }
    setForm({ date: today(), day: 'Lundi', score_jamal: 0, score_hajj: 0, note: '' })
    await fetchMatches()
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce match ?')) return
    await supabase.from('matches').delete().eq('id', id)
    setMatches(prev => prev.filter(m => m.id !== id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  const total = matches.length
  const jWins = matches.filter(m => m.score_jamal > m.score_hajj).length
  const hWins = matches.filter(m => m.score_hajj > m.score_jamal).length
  const draws = matches.filter(m => m.score_jamal === m.score_hajj).length

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin</h1>
          <p className={styles.sub}>Jamal vs Hajj</p>
        </div>
        <div className={styles.headerRight}>
          <a href="/" className={styles.viewLink}>Voir le site →</a>
          <button onClick={handleLogout} className={styles.logoutBtn}>Déconnexion</button>
        </div>
      </header>

      <div className={styles.statsRow}>
        <div className={styles.stat}><span className={styles.statLbl}>Matchs</span><span className={styles.statVal}>{total}</span></div>
        <div className={styles.stat}><span className={styles.statLbl}>Jamal gagne</span><span className={styles.statVal} style={{ color: 'var(--blue)' }}>{jWins}</span></div>
        <div className={styles.stat}><span className={styles.statLbl}>Nuls</span><span className={styles.statVal} style={{ color: 'var(--gray)' }}>{draws}</span></div>
        <div className={styles.stat}><span className={styles.statLbl}>Hajj gagne</span><span className={styles.statVal} style={{ color: 'var(--amber)' }}>{hWins}</span></div>
      </div>

      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>Ajouter un match</h2>
        <form onSubmit={handleAdd}>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required className={styles.input} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Jour</label>
              <select value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))} className={styles.input}>
                <option>Lundi</option>
                <option>Vendredi</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Note (optionnel)</label>
              <input type="text" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="ex: Derby, etc." className={styles.input} />
            </div>
          </div>

          <div className={styles.scoreSection}>
            <div className={styles.playerTag} style={{ background: 'var(--blue-light)', color: 'var(--blue-dark)' }}>Jamal</div>
            <div className={styles.scoreInputRow}>
              <input
                type="number" min="0" max="99" value={form.score_jamal}
                onChange={e => setForm(f => ({ ...f, score_jamal: e.target.value }))}
                className={styles.scoreInput}
              />
              <span className={styles.scoreDash}>–</span>
              <input
                type="number" min="0" max="99" value={form.score_hajj}
                onChange={e => setForm(f => ({ ...f, score_hajj: e.target.value }))}
                className={styles.scoreInput}
              />
            </div>
            <div className={styles.playerTag} style={{ background: 'var(--amber-light)', color: 'var(--amber-dark)' }}>Hajj</div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.addBtn} disabled={saving}>
            {saving ? 'Enregistrement...' : '+ Enregistrer le match'}
          </button>
        </form>
      </div>

      <div className={styles.listHeader}>
        <h2 className={styles.listTitle}>Historique</h2>
        <span className={styles.listCount}>{total} match{total !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className={styles.empty}>Chargement...</div>
      ) : total === 0 ? (
        <div className={styles.empty}>Aucun match encore — commencez par en ajouter un.</div>
      ) : (
        matches.map(m => {
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
                  {w === 'jamal' ? 'Jamal gagne' : w === 'hajj' ? 'Hajj gagne' : 'Nul'}
                </span>
              </div>
              <span className={styles.teamName} style={{ textAlign: 'right' }}>Hajj</span>
              <button className={styles.delBtn} onClick={() => handleDelete(m.id)} title="Supprimer">✕</button>
            </div>
          )
        })
      )}
    </div>
  )
}
