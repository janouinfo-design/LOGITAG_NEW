import React, {useEffect, useMemo, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {Toast} from 'primereact/toast'
import {InputText} from 'primereact/inputtext'
import {Dropdown} from 'primereact/dropdown'
import {Calendar} from 'primereact/calendar'
import {getEngines, fetchEngines} from '../../../Engin/slice/engin.slice'
import {useAppDispatch} from '../../../../hooks'
import {REPORT_CATALOG, FLAT_REPORTS, BADGE_LABELS, BADGE_COLORS} from './reportCatalog'
import {renderers} from './reportRenderers'
import './ReportsHub.css'

const norm = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const FREQ_OPTIONS = [
  {label: 'Quotidien', value: 'daily'},
  {label: 'Hebdomadaire', value: 'weekly'},
  {label: 'Mensuel', value: 'monthly'},
]

const SUGGESTIONS = [
  {reportId: 'idle-assets', text: "Vous devriez consulter le rapport « Outils immobilisés »", icon: 'fa-lightbulb'},
  {reportId: 'alerts-global', text: "Avez-vous vu vos alertes de la semaine ?", icon: 'fa-bell'},
  {reportId: 'last-position', text: "Visualisez la dernière position de tous vos outils", icon: 'fa-location-crosshairs'},
]

const ReportsHub = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const engines = useSelector(getEngines) || []
  const toast = useRef(null)

  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(FLAT_REPORTS[0]?.id || null)
  const [config, setConfig] = useState({from: null, to: null, zone: null, threshold: 14})
  const [results, setResults] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleFreq, setScheduleFreq] = useState('weekly')
  const [scheduleEmail, setScheduleEmail] = useState('')

  /* Lazy fetch engines if needed */
  useEffect(() => {
    if (!engines || engines.length === 0) {
      dispatch(fetchEngines({page: 1, PageSize: 5000, SortDirection: 'DESC', SortColumn: 'lastSeenAt'}))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedReport = useMemo(() => FLAT_REPORTS.find((r) => r.id === selectedId), [selectedId])

  /* Filter catalog with search */
  const filteredCatalog = useMemo(() => {
    const q = norm(search.trim())
    if (!q) return REPORT_CATALOG
    return REPORT_CATALOG
      .map((c) => ({
        ...c,
        reports: c.reports.filter((r) => norm(r.name).includes(q) || norm(r.desc).includes(q) || norm(c.label).includes(q)),
      }))
      .filter((c) => c.reports.length > 0)
  }, [search])

  /* Available zones for filter dropdown */
  const zoneOptions = useMemo(() => {
    const set = new Set()
    engines.forEach((e) => {
      const z = e.LocationObjectname || e.zoneName
      if (z && z !== '—') set.add(z)
    })
    return [{label: 'Toutes les zones', value: null}, ...[...set].sort().map((v) => ({label: v, value: v}))]
  }, [engines])

  const handleSelectReport = (id) => {
    setSelectedId(id)
    setResults(null)
  }

  const handleGenerate = () => {
    if (!selectedReport) return
    /* Reports that redirect to dedicated module */
    if (selectedReport.renderer === 'redirect' && selectedReport.navigate) {
      navigate(selectedReport.navigate)
      return
    }
    if (selectedReport.renderer === 'navixy') {
      /* Open the legacy Navixy report module via dedicated route */
      navigate('/rapports/legacy')
      return
    }
    setGenerating(true)
    setTimeout(() => {
      const fn = renderers[selectedReport.renderer]
      const r = fn ? fn(engines, config) : {kpis: [], columns: [], rows: []}
      setResults(r)
      setGenerating(false)
      toast.current?.show({severity: 'success', summary: 'Rapport généré', detail: `${r.total || r.rows.length} ligne(s)`, life: 2000})
    }, 350)
  }

  const exportPdf = () => {
    if (!results || results.rows.length === 0) {
      toast.current?.show({severity: 'warn', summary: 'Aucune donnée à exporter', life: 2200})
      return
    }
    const doc = new jsPDF({orientation: 'landscape', unit: 'pt', format: 'a4'})
    doc.setFontSize(18); doc.text(selectedReport.name, 40, 50)
    doc.setFontSize(10); doc.setTextColor(120)
    doc.text(`Total: ${results.total || results.rows.length} · Généré le ${new Date().toLocaleString('fr-FR')}`, 40, 68)
    autoTable(doc, {
      startY: 90,
      head: [results.columns.map((c) => c.label)],
      body: results.rows.map((r) => results.columns.map((c) => r[c.key] ?? '—')),
      headStyles: {fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 9},
      styles: {fontSize: 8, cellPadding: 5, overflow: 'linebreak'},
    })
    doc.save(`${selectedReport.id}-${new Date().toISOString().slice(0, 10)}.pdf`)
    toast.current?.show({severity: 'success', summary: 'PDF exporté', life: 2000})
  }

  const exportExcel = () => {
    if (!results || results.rows.length === 0) {
      toast.current?.show({severity: 'warn', summary: 'Aucune donnée à exporter', life: 2200})
      return
    }
    const data = results.rows.map((r) => {
      const obj = {}
      results.columns.forEach((c) => { obj[c.label] = r[c.key] ?? '' })
      return obj
    })
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, selectedReport.id.slice(0, 30))
    XLSX.writeFile(wb, `${selectedReport.id}-${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.current?.show({severity: 'success', summary: 'Excel exporté', life: 2000})
  }

  const sendEmail = () => {
    if (!results) {
      toast.current?.show({severity: 'warn', summary: 'Générez le rapport d\'abord', life: 2200})
      return
    }
    toast.current?.show({severity: 'info', summary: 'Envoi par email', detail: 'Le rapport a été envoyé (simulation, SMTP non configuré)', life: 2800})
  }

  const saveSchedule = () => {
    if (!selectedReport) return
    const list = JSON.parse(localStorage.getItem('lt-scheduled-reports') || '[]')
    const item = {
      id: `${selectedReport.id}-${Date.now()}`,
      reportId: selectedReport.id,
      reportName: selectedReport.name,
      frequency: scheduleFreq,
      email: scheduleEmail,
      createdAt: new Date().toISOString(),
    }
    list.push(item)
    localStorage.setItem('lt-scheduled-reports', JSON.stringify(list))
    toast.current?.show({severity: 'success', summary: 'Planification enregistrée', detail: `${item.reportName} · ${scheduleFreq}`, life: 2500})
    setScheduleOpen(false)
    setScheduleEmail('')
  }

  /* Pick first 3 displayed engines as scope choices */
  const scopeOptions = useMemo(() => {
    return [{label: 'Tous les engins', value: null}, ...engines.slice(0, 200).map((e) => ({label: e.reference || e.label || e.id, value: e.id}))]
  }, [engines])

  return (
    <div className='lt-page lt-rh-root' data-testid='reports-hub'>
      <Toast ref={toast} position='top-right' />

      {/* Header */}
      <div className='lt-rh-header'>
        <div className='lt-rh-header-left'>
          <div className='lt-rh-header-icon'>
            <i className='fa-solid fa-chart-column' />
          </div>
          <div>
            <h1 className='lt-rh-title'>Rapports disponibles</h1>
            <p className='lt-rh-subtitle'>
              Trouvez, générez et planifiez vos rapports en quelques clics
            </p>
          </div>
        </div>
      </div>

      {/* Suggestion banner */}
      <div className='lt-rh-suggest' data-testid='reports-hub-suggestion'>
        <i className={`fa-solid ${SUGGESTIONS[0].icon}`} />
        <span>{SUGGESTIONS[0].text}</span>
        <button className='lt-rh-suggest-cta' onClick={() => handleSelectReport(SUGGESTIONS[0].reportId)}>
          Ouvrir <i className='fa-solid fa-arrow-right' />
        </button>
      </div>

      {/* Layout */}
      <div className='lt-rh-layout'>
        {/* ── LEFT: Catalog ── */}
        <div className='lt-rh-catalog' data-testid='reports-hub-catalog'>
          <div className='lt-rh-search-wrap'>
            <i className='fa-solid fa-magnifying-glass' />
            <InputText
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Recherche rapide…'
              className='lt-rh-search'
              data-testid='reports-hub-search'
            />
          </div>

          <div className='lt-rh-catalog-list'>
            {filteredCatalog.length === 0 && (
              <div className='lt-rh-catalog-empty'>
                <i className='fa-solid fa-inbox' /> Aucun rapport ne correspond
              </div>
            )}
            {filteredCatalog.map((cat) => (
              <div key={cat.id} className='lt-rh-cat'>
                <div className='lt-rh-cat-head'>
                  <div className='lt-rh-cat-ico' style={{background: `${cat.color}15`, color: cat.color}}>
                    <i className={`fa-solid ${cat.icon}`} />
                  </div>
                  <div className='lt-rh-cat-meta'>
                    <div className='lt-rh-cat-label'>{cat.label}</div>
                    <div className='lt-rh-cat-desc'>{cat.desc}</div>
                  </div>
                </div>
                <div className='lt-rh-cat-items'>
                  {cat.reports.map((r) => {
                    const active = selectedId === r.id
                    return (
                      <button
                        key={r.id}
                        className={`lt-rh-item ${active ? 'is-active' : ''}`}
                        onClick={() => handleSelectReport(r.id)}
                        data-testid={`reports-hub-item-${r.id}`}
                      >
                        <span className='lt-rh-item-ico' style={{color: cat.color}}>
                          <i className={`fa-solid ${r.icon}`} />
                        </span>
                        <span className='lt-rh-item-body'>
                          <span className='lt-rh-item-name'>
                            {r.name}
                            {(r.badges || []).map((b) => (
                              <span
                                key={b}
                                className='lt-rh-badge'
                                style={{background: BADGE_COLORS[b].bg, color: BADGE_COLORS[b].fg}}
                              >
                                {BADGE_LABELS[b]}
                              </span>
                            ))}
                          </span>
                          <span className='lt-rh-item-desc'>{r.desc}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Detail ── */}
        <div className='lt-rh-detail' data-testid='reports-hub-detail'>
          {!selectedReport && (
            <div className='lt-rh-detail-empty'>
              <i className='fa-solid fa-arrow-left-long' />
              <p>Sélectionnez un rapport dans la liste</p>
            </div>
          )}

          {selectedReport && (
            <>
              {/* Header */}
              <div className='lt-rh-detail-head'>
                <div className='lt-rh-detail-headleft'>
                  <div className='lt-rh-detail-ico' style={{background: `${selectedReport.categoryColor}15`, color: selectedReport.categoryColor}}>
                    <i className={`fa-solid ${selectedReport.icon}`} />
                  </div>
                  <div>
                    <div className='lt-rh-detail-cat'>{selectedReport.categoryLabel}</div>
                    <h2 className='lt-rh-detail-name'>
                      {selectedReport.name}
                      {(selectedReport.badges || []).map((b) => (
                        <span
                          key={b}
                          className='lt-rh-badge'
                          style={{background: BADGE_COLORS[b].bg, color: BADGE_COLORS[b].fg}}
                        >
                          {BADGE_LABELS[b]}
                        </span>
                      ))}
                    </h2>
                    <p className='lt-rh-detail-desc'>{selectedReport.desc}</p>
                  </div>
                </div>
              </div>

              {/* Config form */}
              <div className='lt-rh-config' data-testid='reports-hub-config'>
                <div className='lt-rh-config-title'>
                  <i className='fa-solid fa-sliders' /> Configuration
                </div>
                <div className='lt-rh-config-grid'>
                  <div className='lt-rh-field'>
                    <label>Date début</label>
                    <Calendar
                      value={config.from}
                      onChange={(e) => setConfig({...config, from: e.value})}
                      dateFormat='dd/mm/yy'
                      placeholder='—'
                      showIcon
                      className='lt-rh-cal'
                      data-testid='reports-hub-from'
                    />
                  </div>
                  <div className='lt-rh-field'>
                    <label>Date fin</label>
                    <Calendar
                      value={config.to}
                      onChange={(e) => setConfig({...config, to: e.value})}
                      dateFormat='dd/mm/yy'
                      placeholder='—'
                      showIcon
                      className='lt-rh-cal'
                      data-testid='reports-hub-to'
                    />
                  </div>
                  <div className='lt-rh-field'>
                    <label>Zone</label>
                    <Dropdown
                      value={config.zone}
                      options={zoneOptions}
                      onChange={(e) => setConfig({...config, zone: e.value})}
                      placeholder='Toutes'
                      filter
                      className='lt-rh-dd'
                      data-testid='reports-hub-zone'
                    />
                  </div>
                  <div className='lt-rh-field'>
                    <label>Engin / Outil</label>
                    <Dropdown
                      value={config.scopeIds?.[0] || null}
                      options={scopeOptions}
                      onChange={(e) => setConfig({...config, scopeIds: e.value ? [e.value] : []})}
                      placeholder='Tous'
                      filter
                      className='lt-rh-dd'
                      data-testid='reports-hub-scope'
                    />
                  </div>
                </div>
                <div className='lt-rh-actions'>
                  <button
                    className='lt-rh-btn lt-rh-btn--primary'
                    onClick={handleGenerate}
                    disabled={generating}
                    data-testid='reports-hub-generate'
                  >
                    {generating ? (
                      <><i className='fa-solid fa-spinner fa-spin' /> Génération…</>
                    ) : (
                      <><i className='fa-solid fa-bolt' /> Générer rapport</>
                    )}
                  </button>
                  <button
                    className='lt-rh-btn lt-rh-btn--ghost'
                    onClick={() => setScheduleOpen((v) => !v)}
                    data-testid='reports-hub-schedule-toggle'
                  >
                    <i className='fa-solid fa-clock-rotate-left' /> Planifier
                  </button>
                </div>

                {scheduleOpen && (
                  <div className='lt-rh-schedule' data-testid='reports-hub-schedule'>
                    <div className='lt-rh-schedule-title'>
                      <i className='fa-solid fa-calendar' /> Planifier l'envoi automatique
                    </div>
                    <div className='lt-rh-schedule-grid'>
                      <div className='lt-rh-field'>
                        <label>Fréquence</label>
                        <Dropdown
                          value={scheduleFreq}
                          options={FREQ_OPTIONS}
                          onChange={(e) => setScheduleFreq(e.value)}
                          className='lt-rh-dd'
                          data-testid='reports-hub-freq'
                        />
                      </div>
                      <div className='lt-rh-field'>
                        <label>Email destinataire</label>
                        <InputText
                          value={scheduleEmail}
                          onChange={(e) => setScheduleEmail(e.target.value)}
                          placeholder='ops@entreprise.com'
                          className='lt-rh-text'
                          data-testid='reports-hub-email-input'
                        />
                      </div>
                    </div>
                    <div className='lt-rh-actions'>
                      <button
                        className='lt-rh-btn lt-rh-btn--primary'
                        onClick={saveSchedule}
                        disabled={!scheduleEmail}
                        data-testid='reports-hub-save-schedule'
                      >
                        <i className='fa-solid fa-floppy-disk' /> Enregistrer
                      </button>
                      <button className='lt-rh-btn lt-rh-btn--ghost' onClick={() => setScheduleOpen(false)}>
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Results */}
              {results && (
                <div className='lt-rh-results' data-testid='reports-hub-results'>
                  {/* KPIs */}
                  <div className='lt-rh-kpis'>
                    {results.kpis.map((k, i) => (
                      <div key={i} className='lt-rh-kpi' style={{'--ac': k.color}}>
                        <div className='lt-rh-kpi-ico' style={{background: `${k.color}15`, color: k.color}}>
                          <i className={`fa-solid ${k.icon}`} />
                        </div>
                        <div className='lt-rh-kpi-num' style={{color: k.color}}>{k.value}</div>
                        <div className='lt-rh-kpi-lbl'>{k.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Bar chart (CSS-only) */}
                  {results.chart && results.chart.data.length > 0 && (
                    <div className='lt-rh-chart' data-testid='reports-hub-chart'>
                      <div className='lt-rh-chart-title'>
                        <i className='fa-solid fa-chart-column' /> {results.chart.label}
                      </div>
                      <div className='lt-rh-chart-bars'>
                        {(() => {
                          const max = Math.max(...results.chart.data, 1)
                          return results.chart.labels.map((lbl, idx) => (
                            <div key={idx} className='lt-rh-chart-row'>
                              <div className='lt-rh-chart-lbl' title={lbl}>{lbl}</div>
                              <div className='lt-rh-chart-bar-wrap'>
                                <div
                                  className='lt-rh-chart-bar'
                                  style={{width: `${(results.chart.data[idx] / max) * 100}%`, background: results.chart.color}}
                                />
                              </div>
                              <div className='lt-rh-chart-val'>{results.chart.data[idx]}</div>
                            </div>
                          ))
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Result actions */}
                  <div className='lt-rh-result-bar'>
                    <div className='lt-rh-result-count'>
                      <strong>{results.total ?? results.rows.length}</strong> résultat{(results.total ?? results.rows.length) > 1 ? 's' : ''}
                    </div>
                    <div className='lt-rh-result-actions'>
                      <button className='lt-rh-btn lt-rh-btn--ghost' onClick={sendEmail} data-testid='reports-hub-email'>
                        <i className='fa-solid fa-envelope' /> Email
                      </button>
                      <button className='lt-rh-btn lt-rh-btn--secondary' onClick={exportExcel} data-testid='reports-hub-excel'>
                        <i className='fa-solid fa-file-excel' /> Excel
                      </button>
                      <button className='lt-rh-btn lt-rh-btn--primary' onClick={exportPdf} data-testid='reports-hub-pdf'>
                        <i className='fa-solid fa-file-pdf' /> PDF
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className='lt-rh-table-wrap'>
                    <table className='lt-rh-table' data-testid='reports-hub-table'>
                      <thead>
                        <tr>
                          {results.columns.map((c) => (
                            <th key={c.key} style={{textAlign: c.align || 'left'}}>{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.rows.length === 0 && (
                          <tr>
                            <td colSpan={results.columns.length} className='lt-rh-empty'>
                              <i className='fa-solid fa-inbox' /> Aucune donnée pour cette configuration
                            </td>
                          </tr>
                        )}
                        {results.rows.map((r, i) => (
                          <tr key={r.id || i}>
                            {results.columns.map((c) => (
                              <td key={c.key} style={{textAlign: c.align || 'left'}}>{r[c.key] ?? '—'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(results.total ?? 0) > results.rows.length && (
                      <div className='lt-rh-table-more'>
                        <i className='fa-solid fa-circle-info' /> Affichage limité à {results.rows.length} lignes — exportez en PDF/Excel pour la liste complète ({results.total} lignes).
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!results && !generating && (
                <div className='lt-rh-cta-empty' data-testid='reports-hub-cta-empty'>
                  <i className='fa-solid fa-bolt' />
                  <p>Configurez les filtres puis cliquez sur <strong>Générer rapport</strong></p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportsHub
