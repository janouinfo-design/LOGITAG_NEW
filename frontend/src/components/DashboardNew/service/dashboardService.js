/**
 * Service pour la gestion des tableaux de bord
 */

import {request} from '../../../api'

// Stockage local pour les dashboards (simulé)
const DASHBOARD_STORAGE_KEY = 'dashboards'

// Récupérer tous les tableaux de bord
export const getDashboards = () => {
  try {
    const dashboardsJson = localStorage.getItem(DASHBOARD_STORAGE_KEY)
    return dashboardsJson ? JSON.parse(dashboardsJson) : []
  } catch (error) {
    console.error('Error getting dashboards:', error)
    return []
  }
}

// Récupérer un tableau de bord spécifique
export const getDashboard = (id) => {
  try {
    const dashboards = getDashboards()
    return dashboards.find((dashboard) => dashboard.id === id) || null
  } catch (error) {
    console.error(`Error getting dashboard ${id}:`, error)
    return null
  }
}

// Sauvegarder un tableau de bord
export const saveDashboard = (dashboard) => {
  try {
    const dashboards = getDashboards()
    const existingIndex = dashboards.findIndex((d) => d.id === dashboard.id)

    if (existingIndex >= 0) {
      // Mettre à jour un dashboard existant
      dashboards[existingIndex] = dashboard
    } else {
      // Ajouter un nouveau dashboard
      dashboards.push(dashboard)
    }

    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(dashboards))
    return true
  } catch (error) {
    console.error('Error saving dashboard:', error)
    return false
  }
}

// Supprimer un tableau de bord
export const deleteDashboard = (id) => {
  try {
    const dashboards = getDashboards()
    const filteredDashboards = dashboards.filter((dashboard) => dashboard.id !== id)
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(filteredDashboards))
    return true
  } catch (error) {
    console.error(`Error deleting dashboard ${id}:`, error)
    return false
  }
}

// Initialiser avec quelques données de démonstration si aucun dashboard n'existe
export const initializeDashboards = () => {
  const dashboards = getDashboards()

  if (dashboards.length === 0) {
    // Créer un dashboard de démonstration
    const demoDashboard = {
      id: 'dashboard-demo-1',
      name: 'Tableau de bord de démonstration',
      lastModified: new Date(),
      widgets: [
        {
          id: 'widget-kpi-1',
          type: 'kpi',
          title: "Taux d'utilisation",
          sourceData: 'usage_metrics',
          size: [1, 1],
          position: [0, 0],
          config: {
            value: '85%',
            trend: '+5%',
            description: 'Moyenne mensuelle',
          },
        },
        {
          id: 'widget-chart-1',
          type: 'chart',
          title: 'Performance par mois',
          sourceData: 'monthly_performance',
          size: [2, 1],
          position: [1, 0],
          config: {
            type: 'bar',
            data: [
              {name: 'Jan', value: 65},
              {name: 'Fév', value: 75},
              {name: 'Mar', value: 85},
              {name: 'Avr', value: 78},
              {name: 'Mai', value: 90},
            ],
            colors: ['#1E88E5'],
          },
        },
        {
          id: 'widget-chart-2',
          type: 'chart',
          title: 'Répartition par type',
          sourceData: 'equipment_types',
          size: [1, 1],
          position: [0, 1],
          config: {
            type: 'pie',
            data: [
              {name: 'Type A', value: 40},
              {name: 'Type B', value: 30},
              {name: 'Type C', value: 20},
              {name: 'Type D', value: 10},
            ],
            colors: ['#4CAF50', '#FFC107', '#F44336', '#9C27B0'],
          },
        },
      ],
    }

    saveDashboard(demoDashboard)
    return [demoDashboard]
  }

  return dashboards
}

export async function fetchAllDashboards(filter) {
  return await request('engin/grafanadashboards', {
    method: 'post',
    data: filter 
  })
}
