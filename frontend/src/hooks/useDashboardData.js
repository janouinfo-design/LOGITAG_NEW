import { useState, useEffect } from "react";

const useDashboardData = (selectedDashboard) => {
  const [dashboardTitle, setDashboardTitle] = useState("");
  const [kpiData, setKpiData] = useState(null);

  useEffect(() => {
    generateDashboardData(selectedDashboard);
  }, [selectedDashboard]);

  const generateDashboardData = (dashboardId) => {

    let dashboardData = {
      title: "",
      kpiCards: [],
      charts: [],
    };

    switch (dashboardId) {
      case "duree-presence":
        dashboardData.title = "Durée de présence des engins";
        dashboardData.kpiCards = [
          {
            title: "Durée moyenne",
            value: "18.5 jours",
            trend: "+5.2%",
            description: "Durée moyenne de présence des engins chez un client",
          },
          {
            title: "Camions en retard",
            value: "15",
            trend: "-12.5%",
            description: "Nombre de camions dépassant la durée prévue",
          },
          {
            title: "Bouteilles en attente",
            value: "257",
            trend: "+8.3%",
            description: "Nombre de bouteilles en attente de retour",
          },
          {
            title: "Taux de rotation",
            value: "3.7x",
            trend: "+10.2%",
            description: "Taux de rotation mensuel des équipements",
          },
        ];
        dashboardData.charts = [
          {
            title: "Durée moyenne de présence par type d'engin",
            type: "bar",
            data: [
              { name: "Camions", "Durée (jours)": 18 },
              { name: "Bouteilles", "Durée (jours)": 25 },
              { name: "Équipements", "Durée (jours)": 12 },
              { name: "Machines", "Durée (jours)": 7 },
            ],
            colors: ["#4CAF50"],
          },
          {
            title: "Évolution de la durée de présence (mois)",
            type: "line",
            data: [
              { name: "Jan", Camions: 20, Bouteilles: 28, Équipements: 14 },
              { name: "Fév", Camions: 19, Bouteilles: 27, Équipements: 13 },
              { name: "Mar", Camions: 18, Bouteilles: 26, Équipements: 12 },
              { name: "Avr", Camions: 17, Bouteilles: 25, Équipements: 11 },
              { name: "Mai", Camions: 16, Bouteilles: 24, Équipements: 10 },
              { name: "Juin", Camions: 15, Bouteilles: 23, Équipements: 9 },
            ],
            colors: ["#1E88E5", "#FFC107", "#F44336"],
          },
        ];
        break;

      case "classement-clients":
        dashboardData.title = "Classement des clients par temps d'occupation";
        dashboardData.kpiCards = [
          {
            title: "Client principal",
            value: "Acme Inc.",
            trend: null,
            description: "25% du temps total d'occupation",
          },
          {
            title: "Durée totale",
            value: "12,450h",
            trend: "+7.2%",
            description: "Temps cumulé chez tous les clients",
          },
          {
            title: "Nombre de clients",
            value: "87",
            trend: "+5.1%",
            description: "Total des clients actifs ce mois",
          },
          {
            title: "Taux d'engagement",
            value: "84%",
            trend: "+3.8%",
            description: "Pourcentage de clients réguliers",
          },
        ];
        dashboardData.charts = [
          {
            title: "Top 10 des clients par temps d’occupation",
            type: "bar",
            data: [
              { name: "Acme Inc.", Heures: 2380 },
              { name: "Global Tech", Heures: 1950 },
              { name: "BTP Express", Heures: 1720 },
              { name: "Construct+", Heures: 1540 },
              { name: "TechBuild", Heures: 1380 },
              { name: "EcoBTP", Heures: 1240 },
              { name: "Bâtir Pro", Heures: 1100 },
              { name: "MégaConstruct", Heures: 980 },
              { name: "BuildAll", Heures: 890 },
              { name: "Express TP", Heures: 780 },
            ],
            colors: ["#2196F3"],
          },
          {
            title: "Répartition des clients par secteur",
            type: "pie",
            data: [
              { name: "BTP", value: 45 },
              { name: "Industrie", value: 25 },
              { name: "Logistique", value: 15 },
              { name: "Services", value: 10 },
              { name: "Autres", value: 5 },
            ],
            colors: ["#4CAF50", "#FFC107", "#F44336", "#9C27B0", "#795548"],
          },
        ];
        break;

      case "utilisation-engins":
        dashboardData.title = "Suivi de l'utilisation des engins";
        dashboardData.kpiCards = [
          {
            title: "Distance totale",
            value: "156,240 km",
            trend: "+12.3%",
            description: "Distance totale parcourue par tous les engins",
          },
          {
            title: "Engin le plus utilisé",
            value: "Bulldozer XR7",
            trend: null,
            description: "12,450 km parcourus",
          },
          {
            title: "Utilisation moyenne",
            value: "65%",
            trend: "+5.4%",
            description: "Taux d’utilisation moyen de la flotte",
          },
          {
            title: "Coût kilométrique",
            value: "0.45€/km",
            trend: "-2.1%",
            description: "Coût moyen par kilomètre parcouru",
          },
        ];
        dashboardData.charts = [
          {
            title: "Distance parcourue par semaine (km)",
            type: "line",
            data: [
              { name: "Semaine 1", Distance: 25600 },
              { name: "Semaine 2", Distance: 28400 },
              { name: "Semaine 3", Distance: 30200 },
              { name: "Semaine 4", Distance: 32800 },
              { name: "Semaine 5", Distance: 35600 },
              { name: "Semaine 6", Distance: 32400 },
            ],
            colors: ["#FF5722"],
          },
          {
            title: "Top 5 des engins par distance (km)",
            type: "bar",
            data: [
              { name: "Bulldozer XR7", Distance: 12450 },
              { name: "Pelle mécanique M8", Distance: 10200 },
              { name: "Chargeuse L5", Distance: 8900 },
              { name: "Camion benne T9", Distance: 7800 },
              { name: "Niveleuse G3", Distance: 6500 },
            ],
            colors: ["#3F51B5"],
          },
        ];
        break;

      case "analyse-stocks":
        dashboardData.title =
          "Analyse des stocks et mouvements dans les dépôts";
        dashboardData.kpiCards = [
          {
            title: "Produits entrants (mois)",
            value: "3,845 unités",
            trend: "+3.2%",
            description: "Nombre total d’unités entrées ce mois",
          },
          {
            title: "Produits sortants (mois)",
            value: "3,610 unités",
            trend: "+5.7%",
            description: "Nombre total d’unités expédiées ce mois",
          },
          {
            title: "Temps moyen stockage",
            value: "14.2 jours",
            trend: "-5.1%",
            description: "Temps moyen en stock avant expédition",
          },
          {
            title: "Produits inactifs",
            value: "247 unités",
            trend: "+12.8%",
            description: "Produits sans mouvement depuis 30+ jours",
          },
        ];
        dashboardData.charts = [
          {
            title: "Mouvements quotidiens des stocks (7 derniers jours)",
            type: "bar",
            data: [
              { name: "Lundi", Entrées: 510, Sorties: 480 },
              { name: "Mardi", Entrées: 520, Sorties: 490 },
              { name: "Mercredi", Entrées: 530, Sorties: 495 },
              { name: "Jeudi", Entrées: 540, Sorties: 500 },
              { name: "Vendredi", Entrées: 560, Sorties: 510 },
              { name: "Samedi", Entrées: 420, Sorties: 380 },
              { name: "Dimanche", Entrées: 320, Sorties: 290 },
            ],
            colors: ["#4CAF50", "#F44336"],
          },
          {
            title: "Évolution du temps de stockage par catégorie (jours)",
            type: "line",
            data: [
              {
                name: "Jan",
                "Matières premières": 16,
                "Produits finis": 12,
                Consommables: 7,
              },
              {
                name: "Fév",
                "Matières premières": 15.5,
                "Produits finis": 11.5,
                Consommables: 6.5,
              },
              {
                name: "Mar",
                "Matières premières": 15,
                "Produits finis": 11,
                Consommables: 6,
              },
              {
                name: "Avr",
                "Matières premières": 14.5,
                "Produits finis": 10.5,
                Consommables: 5.5,
              },
              {
                name: "Mai",
                "Matières premières": 14,
                "Produits finis": 10,
                Consommables: 5,
              },
              {
                name: "Juin",
                "Matières premières": 14.2,
                "Produits finis": 10.2,
                Consommables: 5.2,
              },
            ],
            colors: ["#9C27B0", "#FF9800", "#03A9F4"],
          },
          {
            title: "Produits inactifs par dépôt",
            type: "bar",
            data: [
              { name: "Dépôt A", "Produits inactifs": 85 },
              { name: "Dépôt B", "Produits inactifs": 62 },
              { name: "Dépôt C", "Produits inactifs": 47 },
              { name: "Dépôt D", "Produits inactifs": 32 },
              { name: "Dépôt E", "Produits inactifs": 21 },
            ],
            colors: ["#E91E63"],
          },
          {
            title: "Répartition des temps de stockage",
            type: "pie",
            data: [
              { name: "< 7 jours", value: 45 },
              { name: "7-14 jours", value: 30 },
              { name: "15-30 jours", value: 15 },
              { name: "31-60 jours", value: 7 },
              { name: "> 60 jours", value: 3 },
            ],
            colors: ["#4CAF50", "#8BC34A", "#FFC107", "#FF9800", "#F44336"],
          },
        ];
        break;

      case "frequence-visite":
        dashboardData.title = "Fréquence de visite chez les clients";
        dashboardData.kpiCards = [
          {
            title: "Visites mensuelles",
            value: "1,245",
            trend: "+9.7%",
            description: "Nombre total de visites par mois",
          },
          {
            title: "Client le plus visité",
            value: "TechBuild",
            trend: null,
            description: "45 visites au cours du dernier mois",
          },
          {
            title: "Moyenne par client",
            value: "14.3",
            trend: "+4.2%",
            description: "Nombre moyen de visites par client",
          },
          {
            title: "Clients inactifs",
            value: "12",
            trend: "-15.3%",
            description: "Clients sans visite depuis plus de 30 jours",
          },
        ];
        dashboardData.charts = [
          {
            title: "Top 6 des clients les plus visités",
            type: "bar",
            data: [
              { name: "TechBuild", Visites: 45 },
              { name: "Acme Inc.", Visites: 38 },
              { name: "Global Tech", Visites: 32 },
              { name: "BTP Express", Visites: 28 },
              { name: "Construct+", Visites: 25 },
              { name: "EcoBTP", Visites: 22 },
            ],
            colors: ["#673AB7"],
          },
          {
            title: "Clients sans visite récente (jours depuis dernière visite)",
            type: "bar",
            data: [
              { name: "MiniConst", Jours: 45 },
              { name: "MatBat", Jours: 38 },
              { name: "UrbanDev", Jours: 35 },
              { name: "TopBuild", Jours: 32 },
              { name: "ConceptBTP", Jours: 30 },
            ],
            colors: ["#E91E63"],
          },
        ];
        break;

      default:
        // fallback is 'analyse-stocks' block (same as above)
        generateDashboardData("analyse-stocks");
        return;
    }

    setDashboardTitle(dashboardData.title);
    setKpiData(dashboardData);
  };

  return { dashboardTitle, kpiData };
};

export default useDashboardData;
