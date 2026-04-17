import React, {useMemo, useState, useCallback} from 'react'
import {useAppSelector} from '../../../hooks'
import {getDataRapport, getSelectedRapport} from '../slice/rapports.slice'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const RapportDisplay = () => {
  const rapportList = useAppSelector(getDataRapport)
  const selectedRapport = useAppSelector(getSelectedRapport)
  const [expandedGroups, setExpandedGroups] = useState({})

  const isEnginReport = selectedRapport?.decs === 'engin'

  /* Group data for summary */
  const groupedData = useMemo(() => {
    if (!rapportList?.length) return {groups: {}, totalDuration: ''}
    const groups = {}
    rapportList.forEach(item => {
      const key = isEnginReport
        ? (item.reference || item.label || 'Inconnu')
        : (item.Resource || item.worksiteLabel || item.address || 'Inconnu')
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })
    return groups
  }, [rapportList, isEnginReport])

  /* Calculate total duration from all entries */
  const totalMinutes = useMemo(() => {
    if (!rapportList?.length) return 0
    let total = 0
    rapportList.forEach(item => {
      const dur = item.DurationFormatted || ''
      const dayMatch = dur.match(/(\d+)\s*day/i) || dur.match(/(\d+)\s*jour/i)
      const hrMatch = dur.match(/(\d+)\s*h/i)
      const minMatch = dur.match(/(\d+)\s*min/i)
      total += (dayMatch ? parseInt(dayMatch[1]) * 1440 : 0) + (hrMatch ? parseInt(hrMatch[1]) * 60 : 0) + (minMatch ? parseInt(minMatch[1]) : 0)
    })
    return total
  }, [rapportList])

  const formatMinutes = (mins) => {
    const days = Math.floor(mins / 1440)
    const hours = Math.floor((mins % 1440) / 60)
    const minutes = mins % 60
    let parts = []
    if (days > 0) parts.push(`${days}j`)
    if (hours > 0) parts.push(`${hours}h`)
    parts.push(`${minutes}min`)
    return parts.join(' ')
  }

  const calcGroupMinutes = (items) => {
    let total = 0
    items.forEach(item => {
      const dur = item.DurationFormatted || ''
      const dayMatch = dur.match(/(\d+)\s*day/i) || dur.match(/(\d+)\s*jour/i)
      const hrMatch = dur.match(/(\d+)\s*h/i)
      const minMatch = dur.match(/(\d+)\s*min/i)
      total += (dayMatch ? parseInt(dayMatch[1]) * 1440 : 0) + (hrMatch ? parseInt(hrMatch[1]) * 60 : 0) + (minMatch ? parseInt(minMatch[1]) : 0)
    })
    return total
  }

  const toggleGroup = (key) => {
    setExpandedGroups(prev => ({...prev, [key]: !prev[key]}))
  }

  const groupKeys = Object.keys(groupedData)

  /* ── PDF Export ── */
  const [exporting, setExporting] = useState(false)

  const handleExportPDF = useCallback(() => {
    if (!rapportList?.length) return
    setExporting(true)

    try {
      const doc = new jsPDF({orientation: 'portrait', unit: 'mm', format: 'a4'})
      const pageW = doc.internal.pageSize.getWidth()
      const margin = 16
      let y = 20

      /* ── Header Band ── */
      doc.setFillColor(15, 23, 42) // #0F172A
      doc.rect(0, 0, pageW, 36, 'F')
      doc.setFillColor(59, 130, 246) // accent bar
      doc.rect(0, 36, pageW, 1.5, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('LOGITAG', margin, 15)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('IoT Asset Tracking', margin, 21)

      /* Report title on the right */
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      const title = rapportList[0]?.title || 'Rapport de présence'
      doc.text(title, pageW - margin, 15, {align: 'right'})
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      const dateStr = new Date().toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'})
      doc.text(`Généré le ${dateStr}`, pageW - margin, 21, {align: 'right'})

      /* Type badge */
      doc.setFontSize(7)
      doc.setTextColor(148, 163, 184)
      doc.text(isEnginReport ? 'RAPPORT PAR ENGIN' : 'RAPPORT PAR SITE', pageW - margin, 27, {align: 'right'})

      y = 44

      /* ── Summary Cards Row ── */
      const cardW = (pageW - margin * 2 - 10) / 3
      const cards = [
        {label: isEnginReport ? 'Engins' : 'Sites', value: String(groupKeys.length), color: [99, 102, 241]},
        {label: 'Entrées', value: String(rapportList.length), color: [16, 185, 129]},
        {label: 'Temps total', value: formatMinutes(totalMinutes), color: [59, 130, 246]},
      ]
      cards.forEach((card, i) => {
        const cx = margin + i * (cardW + 5)
        doc.setFillColor(248, 250, 252) // #F8FAFC
        doc.roundedRect(cx, y, cardW, 20, 3, 3, 'F')
        doc.setDrawColor(226, 232, 240)
        doc.roundedRect(cx, y, cardW, 20, 3, 3, 'S')

        /* Color accent left bar */
        doc.setFillColor(...card.color)
        doc.rect(cx, y, 1.5, 20, 'F')

        doc.setTextColor(...card.color)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(13)
        doc.text(card.value, cx + 8, y + 10)
        doc.setTextColor(100, 116, 139)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.text(card.label, cx + 8, y + 16)
      })

      y += 28

      /* ── Main Table ── */
      const tableRows = []
      groupKeys.forEach(key => {
        const items = groupedData[key]
        const groupMins = calcGroupMinutes(items)

        /* Group header row */
        tableRows.push({
          type: 'group',
          data: [
            key,
            '',
            String(items.length),
            formatMinutes(groupMins),
          ],
        })

        /* Detail rows */
        items.forEach(item => {
          const loc = isEnginReport
            ? (item.Resource || item.worksiteLabel || item.address || '-')
            : (item.reference || item.label || '-')
          const period = `${item.start || '-'} → ${item.end || '-'}`
          tableRows.push({
            type: 'detail',
            data: [
              `    ${period}`,
              loc,
              '',
              item.DurationFormatted || '-',
            ],
          })
        })
      })

      doc.autoTable({
        startY: y,
        margin: {left: margin, right: margin},
        head: [[
          isEnginReport ? 'Engin / Période' : 'Site / Période',
          isEnginReport ? 'Site / Adresse' : 'Engin',
          'Entrées',
          'Durée',
        ]],
        body: tableRows.map(r => r.data),
        theme: 'plain',
        styles: {
          font: 'helvetica',
          fontSize: 7.5,
          cellPadding: {top: 3, bottom: 3, left: 4, right: 4},
          lineColor: [241, 245, 249],
          lineWidth: 0.3,
          textColor: [15, 23, 42],
        },
        headStyles: {
          fillColor: [248, 250, 252],
          textColor: [100, 116, 139],
          fontStyle: 'bold',
          fontSize: 7,
          cellPadding: {top: 4, bottom: 4, left: 4, right: 4},
        },
        columnStyles: {
          0: {cellWidth: 'auto'},
          1: {cellWidth: 'auto'},
          2: {halign: 'center', cellWidth: 22},
          3: {halign: 'right', cellWidth: 30, fontStyle: 'bold'},
        },
        willDrawCell: (data) => {
          if (data.section === 'body') {
            const row = tableRows[data.row.index]
            if (row?.type === 'group') {
              doc.setFillColor(240, 245, 255) // light blue for group rows
              doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F')
              data.cell.styles.fontStyle = 'bold'
              data.cell.styles.textColor = [15, 23, 42]
            } else {
              data.cell.styles.textColor = [100, 116, 139]
              data.cell.styles.fontStyle = 'normal'
            }
          }
        },
        didDrawPage: (data) => {
          /* Footer on each page */
          const pageH = doc.internal.pageSize.getHeight()
          doc.setFillColor(248, 250, 252)
          doc.rect(0, pageH - 12, pageW, 12, 'F')
          doc.setTextColor(148, 163, 184)
          doc.setFontSize(6.5)
          doc.setFont('helvetica', 'normal')
          doc.text(`LOGITAG - Rapport de présence B2B`, margin, pageH - 5)
          doc.text(`Page ${data.pageNumber}`, pageW - margin, pageH - 5, {align: 'right'})
        },
      })

      /* ── Total Row ── */
      const finalY = doc.lastAutoTable.finalY + 6
      if (finalY < doc.internal.pageSize.getHeight() - 30) {
        doc.setFillColor(15, 23, 42)
        doc.roundedRect(margin, finalY, pageW - margin * 2, 16, 3, 3, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.text('TOTAL', margin + 8, finalY + 10)
        doc.text(`${groupKeys.length} ${isEnginReport ? 'engins' : 'sites'}`, margin + 50, finalY + 10)
        doc.text(`${rapportList.length} entrées`, margin + 90, finalY + 10)
        doc.setTextColor(96, 165, 250) // light blue
        doc.setFontSize(11)
        doc.text(formatMinutes(totalMinutes), pageW - margin - 8, finalY + 10, {align: 'right'})
      }

      /* Save */
      const fileName = `${(rapportList[0]?.title || 'Rapport_Logitag').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`
      doc.save(fileName)
    } catch (err) {
      console.error('PDF export error:', err)
    } finally {
      setExporting(false)
    }
  }, [rapportList, groupedData, groupKeys, isEnginReport, totalMinutes, formatMinutes, calcGroupMinutes])

  if (!rapportList?.length) {
    return (
      <div className='lt-rpt-display-empty' data-testid="rapport-display-empty">
        <i className='pi pi-chart-bar' style={{fontSize: '3rem', color: '#E2E8F0'}}></i>
        <h3 style={{color: 'var(--lt-text-primary)', fontFamily: 'var(--lt-font-heading)', margin: '12px 0 4px'}}>
          {rapportList[0]?.title || <OlangItem olang='Rapport.list' />}
        </h3>
        <p style={{color: 'var(--lt-text-muted)', fontSize: '0.85rem'}}>Sélectionnez un rapport ou générez-en un nouveau</p>
      </div>
    )
  }

  return (
    <div className='lt-rpt-display' data-testid="rapport-display">
      {/* Header */}
      <div className='lt-rpt-display-header' data-testid="rapport-display-header">
        <div>
          <h2 className='lt-rpt-display-title'>
            <i className={isEnginReport ? 'pi pi-box' : 'pi pi-building'} style={{color: '#3B82F6'}}></i>
            {rapportList[0]?.title || 'Rapport de présence'}
          </h2>
          <p className='lt-rpt-display-sub'>
            {isEnginReport ? 'Temps de présence par engin' : 'Temps de présence par site'}
            {' • '}{rapportList.length} entrées • {groupKeys.length} {isEnginReport ? 'engins' : 'sites'}
          </p>
        </div>
        <div className='lt-rpt-display-tabs'>
          <div className='lt-rpt-tab lt-rpt-tab--active'>Résumé</div>
          <button
            className='lt-rpt-export-btn'
            onClick={handleExportPDF}
            disabled={exporting}
            data-testid="rapport-export-pdf-btn"
          >
            {exporting ? (
              <><i className='pi pi-spin pi-spinner' style={{fontSize: '0.75rem'}}></i> Export...</>
            ) : (
              <><i className='pi pi-file-pdf' style={{fontSize: '0.8rem'}}></i> Export PDF</>
            )}
          </button>
        </div>
      </div>

      {/* Summary Table */}
      <div className='lt-rpt-summary-table' data-testid="rapport-summary-table">
        <div className='lt-rpt-summary-thead'>
          <div className='lt-rpt-summary-th' style={{flex: 3}}>{isEnginReport ? 'Engin' : 'Site / Adresse'}</div>
          <div className='lt-rpt-summary-th' style={{flex: 2}}>{isEnginReport ? 'Site / Adresse' : 'Engin'}</div>
          <div className='lt-rpt-summary-th' style={{flex: 1, textAlign: 'center'}}>Entrées</div>
          <div className='lt-rpt-summary-th' style={{flex: 2, textAlign: 'right'}}>Durée totale</div>
        </div>

        {groupKeys.map((key, idx) => {
          const items = groupedData[key]
          const groupMins = calcGroupMinutes(items)
          const isExpanded = expandedGroups[key]
          return (
            <div key={idx} className='lt-rpt-group' data-testid="rapport-group">
              {/* Group Header */}
              <div className='lt-rpt-group-header' onClick={() => toggleGroup(key)}>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, flex: 3}}>
                  <i className={`pi ${isExpanded ? 'pi-chevron-down' : 'pi-chevron-right'}`} style={{fontSize: '0.7rem', color: '#94A3B8'}}></i>
                  <i className={isEnginReport ? 'pi pi-box' : 'pi pi-building'} style={{color: '#6366F1', fontSize: '0.85rem'}}></i>
                  <strong>{key}</strong>
                </div>
                <div style={{flex: 2}}></div>
                <div style={{flex: 1, textAlign: 'center'}}>
                  <span className='lt-rpt-count-pill'>{items.length}</span>
                </div>
                <div style={{flex: 2, textAlign: 'right'}}>
                  <span className='lt-rpt-duration-pill'>{formatMinutes(groupMins)}</span>
                </div>
              </div>

              {/* Group Detail Rows */}
              {isExpanded && items.map((item, ri) => (
                <div key={ri} className='lt-rpt-detail-row'>
                  <div style={{flex: 3, paddingLeft: 38}}>
                    <div style={{fontSize: '0.72rem', color: 'var(--lt-text-muted)'}}>
                      {item.start} → {item.end}
                    </div>
                  </div>
                  <div style={{flex: 2}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                      <i className='pi pi-map-marker' style={{fontSize: '0.65rem', color: '#10B981'}}></i>
                      <span style={{fontSize: '0.78rem', color: 'var(--lt-text-primary)'}}>
                        {isEnginReport
                          ? (item.Resource || item.worksiteLabel || item.address || 'Adresse inconnue')
                          : (item.reference || item.label || 'Engin inconnu')}
                      </span>
                    </div>
                  </div>
                  <div style={{flex: 1}}></div>
                  <div style={{flex: 2, textAlign: 'right'}}>
                    <span style={{fontSize: '0.78rem', fontWeight: 600, color: 'var(--lt-text-primary)', fontFamily: 'var(--lt-font)'}}>
                      {item.DurationFormatted || '---'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Au Total Card */}
      <div className='lt-rpt-total-card' data-testid="rapport-total-card">
        <div className='lt-rpt-total-label'>Au total</div>
        <div className='lt-rpt-total-grid'>
          <div className='lt-rpt-total-item'>
            <div className='lt-rpt-total-value'>{groupKeys.length}</div>
            <div className='lt-rpt-total-desc'>{isEnginReport ? 'Engins' : 'Sites'}</div>
          </div>
          <div className='lt-rpt-total-item'>
            <div className='lt-rpt-total-value'>{rapportList.length}</div>
            <div className='lt-rpt-total-desc'>Entrées</div>
          </div>
          <div className='lt-rpt-total-item'>
            <div className='lt-rpt-total-value lt-rpt-total-value--accent'>{formatMinutes(totalMinutes)}</div>
            <div className='lt-rpt-total-desc'>Temps total</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RapportDisplay
