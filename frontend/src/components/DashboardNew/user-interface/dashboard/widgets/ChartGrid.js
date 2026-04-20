import React, {useEffect, useState, useMemo} from 'react'
import {Chart} from 'primereact/chart'

/**
 * ChartGrid — Executive Dashboard Premium
 * - Bar chart with Top 3 violet gradient, medium bars light blue, rest neutral grey
 * - Red dashed average line + label
 * - Clean premium card wrapper (no PrimeReact Card, no legacy gradients)
 */

const TOP_COLOR = '#7C3AED'       // violet-600
const TOP_COLOR_END = '#4F46E5'   // indigo-600
const MID_COLOR = '#93C5FD'       // blue-300
const LOW_COLOR = '#CBD5E1'       // slate-300
const AVG_COLOR = '#EF4444'       // red-500

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
      {formatted.map((item, index) => (
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
          <div style={{marginBottom: 16}}>
            <h3 style={{margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A', fontFamily: "'Manrope', sans-serif", letterSpacing: '-0.01em'}}>
              {item.title}
            </h3>
            <div style={{fontSize: '0.76rem', color: '#64748B', marginTop: 4, display: 'flex', alignItems: 'center', gap: 14}}>
              <span><span style={{display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: TOP_COLOR, marginRight: 6, verticalAlign: 'middle'}}></span>Top 3</span>
              <span><span style={{display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: MID_COLOR, marginRight: 6, verticalAlign: 'middle'}}></span>Moyen</span>
              <span><span style={{display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: LOW_COLOR, marginRight: 6, verticalAlign: 'middle'}}></span>Bas</span>
              <span style={{marginLeft: 'auto'}}><span style={{display: 'inline-block', width: 12, height: 2, background: AVG_COLOR, marginRight: 6, verticalAlign: 'middle'}}></span>Moyenne globale ({item.avg.toFixed(1)})</span>
            </div>
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
      ))}
    </div>
  )
}

export default ChartGrid
