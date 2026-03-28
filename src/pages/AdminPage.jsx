import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './AdminPage.module.css'

function today() {
  return new Date().toISOString().split('T')[0]
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' })
}

const dayMap = { 'Lundi': 'الإثنين', 'Vendredi': 'الجمعة', 'Tnin': 'الإثنين', 'Jem3a': 'الجمعة', 'الإثنين': 'الإثنين', 'الجمعة': 'الجمعة' }
function translateDay(d) { return dayMap[d] || d }

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
    if (error) { setError('حدث خطأ أثناء الحفظ.'); setSaving(false); return }
    setForm({ date: today(), day: 'Lundi', score_jamal: 0, score_hajj: 0, note: '' })
    await fetchMatches()
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('هل تريد حذف هذه المباراة؟')) return
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
          <h1 className={styles.title}>المشرف</h1>
          <p className={styles.sub}>جمال ضد الحاج</p>
        </div>
        <div className={styles.headerRight}>
          <a href="/" className={styles.viewLink}>عرض الموقع ←</a>
          <button onClick={handleLogout} className={styles.logoutBtn}>تسجيل الخروج</button>
        </div>
      </header>

      <div className={styles.statsRow}>
        <div className={styles.stat}><span className={styles.statLbl}>المباريات</span><span className={styles.statVal}>{total}</span></div>
        <div className={styles.stat}><span className={styles.statLbl}>فوز جمال</span><span className={styles.statVal} style={{ color: 'var(--blue)' }}>{jWins}</span></div>
        <div className={styles.stat}><span className={styles.statLbl}>تعادل</span><span className={styles.statVal} style={{ color: 'var(--gray)' }}>{draws}</span></div>
        <div className={styles.stat}><span className={styles.statLbl}>فوز الحاج</span><span className={styles.statVal} style={{ color: 'var(--amber)' }}>{hWins}</span></div>
      </div>

      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>إضافة مباراة</h2>
        <form onSubmit={handleAdd}>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>التاريخ</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required className={styles.input} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>اليوم</label>
              <select value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))} className={styles.input}>
                <option value="Lundi">الإثنين</option>
                <option value="Vendredi">الجمعة</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>ملاحظة (اختياري)</label>
              <input type="text" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="مثال: ديربي، الخ" className={styles.input} />
            </div>
          </div>

          <div className={styles.scoreSection}>
            <div className={styles.playerTag} style={{ background: 'var(--blue-light)', color: 'var(--blue-dark)' }}>جمال</div>
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
            <div className={styles.playerTag} style={{ background: 'var(--amber-light)', color: 'var(--amber-dark)' }}>الحاج</div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.addBtn} disabled={saving}>
            {saving ? 'جاري الحفظ...' : '+ حفظ المباراة'}
          </button>
        </form>
      </div>

      <div className={styles.listHeader}>
        <h2 className={styles.listTitle}>سجل المباريات</h2>
        <span className={styles.listCount}>{total} مباراة</span>
      </div>

      {loading ? (
        <div className={styles.empty}>جاري التحميل...</div>
      ) : total === 0 ? (
        <div className={styles.empty}>لا توجد مباريات بعد - ابدأ بإضافة واحدة.</div>
      ) : (
        matches.map(m => {
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
                  {w === 'jamal' ? 'فوز جمال' : w === 'hajj' ? 'فوز الحاج' : 'تعادل'}
                </span>
              </div>
              <span className={styles.teamName} style={{ textAlign: 'left' }}>الحاج</span>
              <button className={styles.delBtn} onClick={() => handleDelete(m.id)} title="حذف">✕</button>
            </div>
          )
        })
      )}
    </div>
  )
}
