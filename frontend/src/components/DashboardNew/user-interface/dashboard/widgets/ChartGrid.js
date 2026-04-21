import React, {useEffect, useState, useMemo} from 'react'
import {Chart} from 'primereact/chart'

/**
 * ChartGrid — Executive Dashboard Premium
 * - Bar chart with Top 3 violet gradient, medium bars light blue, rest neutral grey
 * - Red dashed average line + label
 * - Clean premium card wrapper (no PrimeReact Card, no legacy gradients)
 */

const TOP_COLOR = '#2563EB'       // violet-600
const TOP_COLOR_END = '#4F46E5'   // indigo-600
const MID_COLOR = '#93C5FD'       // blue-300
const LOW_COLOR = '#CBD5E1'       // slate-300
const AVG_COLOR = '#EF4444'       // red-500

/* Metadata map to describe each chart with human-readable explanations.
   Keys are matched by lowercase substring on chart.label/title. */
const CHART_META = {
  'fréquence': {
    icon: 'pi pi-calendar',
    subtitle: `Nombre moyen de visites d'engins par client sur la période. Plus c'est haut, plus le client est actif.`,
    tooltipInsight: (item) => {
      const sorted = [...(item.data.datasets[0].data || [])].map((v, i) => ({v, lbl: item.labels[i]})).sort((a,b) => b.v - a.v)
      const top = sorted.slice(0, 3).filter((o) => o.v > 0)
      return {
        howTo: `Lecture : chaque barre = un client. La hauteur = nombre de visites.`,
        readings: [
          top.length ? `Top 3 clients (bleu foncé) : ${top.map(o => o.lbl).join(', ')}` : 'Pas encore de top 3 distinct',
          `Moyenne : ${item.avg.toFixed(1)} visites/client`,
          `Objectif : monter les clients sous la moyenne (ligne rouge) vers le haut`,
        ],
      }
    },
  },
  'répartition': {
    icon: 'pi pi-chart-bar',
    subtitle: `Volume de bouteilles / assets déployés par client. Mesure la couverture commerciale de chaque compte.`,
    tooltipInsight: (item) => {
      const sorted = [...(item.data.datasets[0].data || [])].map((v, i) => ({v, lbl: item.labels[i]})).sort((a,b) => b.v - a.v)
      const top = sorted.slice(0, 3).filter((o) => o.v > 0)
      return {
        howTo: `Lecture : chaque barre = volume d'assets chez un client.`,
        readings: [
          top.length ? `Top 3 (bleu foncé) : ${top.map(o => `${o.lbl} (${o.v})`).join(', ')}` : 'Données insuffisantes',
          `Moyenne : ${item.avg.toFixed(1)} assets par client`,
          `Action : identifier les clients < moyenne pour opportunité d'upsell`,
        ],
      }
    },
  },
  'engins par status': {
    icon: 'pi pi-tags',
    subtitle: `Distribution du parc selon leur statut opérationnel actuel (Disponible, Livré, Réservé, Panne…).`,
    tooltipInsight: (item) => ({
      howTo: `Lecture : chaque barre = nombre d'engins ayant ce statut.`,
      readings: [
        `Un pic sur "Disponible" = bonne capacité de déploiement`,
        `Un pic sur "En panne" ou "Réservé" = goulot d'étranglement`,
        `Moyenne : ${item.avg.toFixed(1)} engins par statut`,
      ],
    }),
  },
  'engins par etat': {
    icon: 'pi pi-sliders-h',
    subtitle: `Répartition selon l'état physique : neuf, en service, hors service, maintenance…`,
    tooltipInsight: (item) => ({
      howTo: `Lecture : chaque barre = nombre d'engins dans cet état physique.`,
      readings: [
        `Un pic sur "hors service" = besoin d'intervention maintenance`,
        `Comparer avec la fréquence des visites pour identifier les engins sous-utilisés`,
      ],
    }),
  },
  'engins par famille': {
    icon: 'pi pi-sitemap',
    subtitle: `Distribution du parc par famille d'engins (Compacteur, Remorque, PC, Tag, etc.).`,
    tooltipInsight: (item) => ({
      howTo: `Lecture : chaque barre = nombre d'engins de cette famille.`,
      readings: [
        `Identifier les familles sous-représentées pour compléter le parc`,
        `Moyenne : ${item.avg.toFixed(1)} engins par famille`,
      ],
    }),
  },
}

const getChartMeta = (title) => {
  const t = (title || '').toLowerCase()
  for (const key of Object.keys(CHART_META)) {
    if (t.includes(key)) return CHART_META[key]
  }
  return {
    icon: 'pi pi-chart-bar',
    subtitle: 'Visualisation des données selon la période et les filtres appliqués.',
    tooltipInsight: (item) => ({
      howTo: `Lecture : chaque barre représente une valeur.`,
      readings: [`Moyenne : ${item.avg.toFixed(1)}`],
    }),
  }
}

const getBarColors = (values) => {
  if (!Array.isArray(values) || values.length === 0) return []
  const sorted = [...values].map((v, i) => ({v: Number(v) || 0, i})).sort((a, b) => b.v - a.v)
  const top3Indices = new Set(sorted.slice(0, 3).map((o) => o.i))
  const midCount = Math.max(3, Math.ceil(values.length * 0.35))
  const midIndices = new Set(sorted.slice(3, 3 + midCount).map((o) => o.i))

  return values.map((_, i) => {
    if (top3Indices.has(i)) return TOP_COLOR
    if (midIndices.has(i)) return MID_COLOR
    return LOW_COLOR
  })
}

const average = (arr) => {
  const nums = (arr || []).map((v) => Number(v) || 0)
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

// Chart.js plugin — horizontal dashed line + label pill
const averageLinePlugin = {
  id: 'averageLine',
  afterDatasetsDraw(chart, args, options) {
    const avg = options?.value
    const label = options?.label
    if (avg == null) return
    const {ctx, chartArea: {left, right, top, bottom}, scales: {y}} = chart
    if (!y) return
    const yPos = y.getPixelForValue(avg)
    if (yPos < top || yPos > bottom) return
    ctx.save()
    ctx.strokeStyle = AVG_COLOR
    ctx.lineWidth = 1.5
    ctx.setLineDash([5, 4])
    ctx.beginPath()
    ctx.moveTo(left, yPos)
    ctx.lineTo(right, yPos)
    ctx.stroke()
    ctx.setLineDash([])
    // Label pill
    if (label) {
      ctx.font = '700 10px Inter, sans-serif'
      const text = label
      const padX = 8, padY = 4
      const w = ctx.measureText(text).width + padX * 2
      const h = 18
      const x = right - w - 6
      const yP = yPos - h - 4
      ctx.fillStyle = AVG_COLOR
      const r = 6
      ctx.beginPath()
      ctx.moveTo(x + r, yP)
      ctx.lineTo(x + w - r, yP)
      ctx.quadraticCurveTo(x + w, yP, x + w, yP + r)
      ctx.lineTo(x + w, yP + h - r)
      ctx.quadraticCurveTo(x + w, yP + h, x + w - r, yP + h)
      ctx.lineTo(x + r, yP + h)
      ctx.quadraticCurveTo(x, yP + h, x, yP + h - r)
      ctx.lineTo(x, yP + r)
      ctx.quadraticCurveTo(x, yP, x + r, yP)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#FFF'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, x + padX, yP + h / 2 + 1)
    }
    ctx.restore()
  },
}

const ChartGrid = ({charts}) => {
  const [openInsight, setOpenInsight] = useState(null) // chart id currently showing insight

  const formatted = useMemo(() => {
    if (!Array.isArray(charts)) return []
    return charts.map((chart) => {
      const values = (chart.values || []).map((v) => Number(v) || 0)
      const colors = getBarColors(values)
      const avg = average(values)

      return {
        id: chart.code || chart.id,
        title: chart.label || chart.title,
        labels: chart.labels,
        avg,
        data: {
          labels: chart.labels,
          datasets: [
            {
              type: 'bar',
              label: chart.label || chart.title,
              backgroundColor: colors,
              hoverBackgroundColor: colors.map((c) => c === TOP_COLOR ? TOP_COLOR_END : c),
              data: values,
              borderRadius: 6,
              borderSkipped: false,
              borderWidth: 0,
              maxBarThickness: 38,
            },
          ],
        },
      }
    })
  }, [charts])

  const buildOptions = (avg) => ({
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {display: false},
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#FFF',
        bodyColor: '#FFF',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
      },
      averageLine: {value: avg, label: `Moy. ${avg.toFixed(1)}`},
    },
    scales: {
      x: {
        ticks: {color: '#64748B', font: {size: 10, weight: '600'}, maxRotation: 45, minRotation: 0, autoSkip: false},
        grid: {display: false},
      },
      y: {
        ticks: {color: '#94A3B8', font: {size: 10}},
        grid: {color: '#F1F5F9', drawBorder: false},
        beginAtZero: true,
      },
    },
  })

  if (!formatted || formatted.length === 0) return null

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 14, width: '100%'}} data-testid='status-charts'>
      {formatted.map((item, index) => {
        const meta = getChartMeta(item.title)
        const insight = meta.tooltipInsight ? meta.tooltipInsight(item) : null
        const isOpen = openInsight === (item.id || index)
        return (
          <div
            key={item.id || index}
            style={{
              background: '#FFF',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              padding: 22,
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            }}
          >
            {/* ══ Rich header with icon, title, subtitle, info btn ══ */}
            <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14}}>
              <div style={{display: 'flex', gap: 14, flex: 1, minWidth: 0}}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#EFF6FF', color: '#1D4ED8',
                  flexShrink: 0,
                }}>
                  <i className={meta.icon} style={{fontSize: '1.1rem'}} />
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                  <h3 style={{margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', fontFamily: "'Manrope', sans-serif", letterSpacing: '-0.015em', lineHeight: 1.25}}>
                    {item.title}
                  </h3>
                  <p style={{margin: '4px 0 0', fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4}}>
                    {meta.subtitle}
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setOpenInsight(isOpen ? null : (item.id || index))}
                aria-label='Comment lire ce graphique ?'
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: isOpen ? '#EFF6FF' : 'transparent',
                  color: isOpen ? '#1D4ED8' : '#94A3B8',
                  border: 0, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s, color 0.15s',
                  flexShrink: 0,
                }}
                data-testid={`chart-info-btn-${index}`}
              >
                <i className='pi pi-info-circle' style={{fontSize: '1rem'}} />
              </button>
            </div>

            {/* ══ Insight panel (toggleable) ══ */}
            {isOpen && insight && (
              <div style={{
                background: '#F0F7FF',
                border: '1px solid #BFDBFE',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 14,
                fontSize: '0.82rem',
                color: '#1E3A8A',
                lineHeight: 1.55,
              }} data-testid={`chart-insight-${index}`}>
                <div style={{display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 6, color: '#1D4ED8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em'}}>
                  <i className='pi pi-lightbulb' /> Comment interpréter
                </div>
                <div style={{color: '#334155', marginBottom: 8}}>{insight.howTo}</div>
                <ul style={{margin: 0, paddingLeft: 18}}>
                  {insight.readings.map((r, i) => (
                    <li key={i} style={{marginBottom: 3, color: '#334155'}}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ══ Legend ══ */}
            <div style={{fontSize: '0.78rem', color: '#475569', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap'}}>
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                <span style={{display: 'inline-block', width: 11, height: 11, borderRadius: 3, background: TOP_COLOR}}></span>
                <strong style={{color: '#0F172A', fontWeight: 700}}>Top 3</strong>
                <span style={{color: '#94A3B8', fontSize: '0.72rem'}}>(meilleurs)</span>
              </span>
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                <span style={{display: 'inline-block', width: 11, height: 11, borderRadius: 3, background: MID_COLOR}}></span>
                <strong style={{color: '#0F172A', fontWeight: 700}}>Moyen</strong>
              </span>
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                <span style={{display: 'inline-block', width: 11, height: 11, borderRadius: 3, background: LOW_COLOR}}></span>
                <strong style={{color: '#0F172A', fontWeight: 700}}>Bas</strong>
              </span>
              <span style={{marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6}}>
                <span style={{display: 'inline-block', width: 14, height: 2, background: AVG_COLOR, borderRadius: 2}}></span>
                <span style={{color: '#64748B'}}>Moyenne&nbsp;:&nbsp;</span>
                <strong style={{color: '#0F172A', fontWeight: 800}}>{item.avg.toFixed(1)}</strong>
              </span>
            </div>
            <div style={{height: 280}}>
              <Chart
                type='bar'
                data={item.data}
                options={buildOptions(item.avg)}
                plugins={[averageLinePlugin]}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ChartGrid
