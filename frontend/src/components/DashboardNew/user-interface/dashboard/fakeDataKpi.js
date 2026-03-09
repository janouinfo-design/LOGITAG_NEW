export const enginKpiData = {
    "annotations": {
      "list": [
        {
          "builtIn": 1,
          "datasource": {
            "type": "grafana",
            "uid": "-- Grafana --"
          },
          "enable": true,
          "hide": true,
          "iconColor": "rgba(0, 211, 255, 1)",
          "name": "Annotations & Alerts",
          "target": {
            "limit": 100,
            "matchAny": false,
            "tags": [],
            "type": "dashboard"
          },
          "type": "dashboard"
        }
      ]
    },
    "editable": true,
    "fiscalYearStartMonth": 0,
    "graphTooltip": 0,
    "id": 6,
    "links": [],
    "liveNow": false,
    "panels": [
      {
        "datasource": {
          "type": "mssql",
          "uid": "YEcYsr0Nk"
        },
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "continuous-BlPu"
            },
            "custom": {
              "axisCenteredZero": false,
              "axisColorMode": "text",
              "axisLabel": "",
              "axisPlacement": "auto",
              "fillOpacity": 80,
              "gradientMode": "none",
              "hideFrom": {
                "legend": false,
                "tooltip": false,
                "viz": false
              },
              "lineWidth": 1,
              "scaleDistribution": {
                "type": "linear"
              }
            },
            "mappings": [],
            "thresholds": {
              "mode": "absolute",
              "steps": [
                {
                  "color": "green",
                  "value": null
                },
                {
                  "color": "semi-dark-purple",
                  "value": 90
                },
                {
                  "color": "dark-purple",
                  "value": 100
                }
              ]
            },
            "unit": "short"
          },
          "overrides": []
        },
        "gridPos": {
          "h": 9,
          "w": 12,
          "x": 0,
          "y": 0
        },
        "id": 2,
        "options": {
          "barRadius": 0,
          "barWidth": 0.97,
          "groupWidth": 0.7,
          "legend": {
            "calcs": [],
            "displayMode": "list",
            "placement": "right",
            "showLegend": true
          },
          "orientation": "horizontal",
          "showValue": "never",
          "stacking": "normal",
          "tooltip": {
            "mode": "single",
            "sort": "none"
          },
          "xTickLabelRotation": 0,
          "xTickLabelSpacing": 0
        },
        "pluginVersion": "9.2.2",
        "targets": [
          {
            "datasource": {
              "type": "mssql",
              "uid": "YEcYsr0Nk"
            },
            "editorMode": "code",
            "format": "table",
            "rawQuery": true,
            "rawSql": "WITH DeliveryEvents AS (\r\n     \r\n    SELECT \r\n        srcId,\r\n        srcLocationId as locationID,\r\n        satDate AS DeliveryDate\r\n    FROM sat\r\n    WHERE status = 26\r\n    and srcLocationId!=0\r\n),\r\nSubsequentEvents AS (\r\n     \r\n    SELECT \r\n        d.srcId,\r\n        d.locationID,\r\n        d.DeliveryDate,\r\n        LEAD(s.satDate) OVER (PARTITION BY d.srcId ORDER BY s.satDate) AS DepartureDate\r\n    FROM DeliveryEvents d\r\n    LEFT JOIN sat s\r\n        ON d.srcId = s.srcId\r\n        AND s.satDate > d.DeliveryDate\r\n)\r\n-- Step 3: Calculate the total presence duration for each worksite\r\nSELECT \r\n    locationID,\r\n    work.label,\r\n    SUM(\r\n        CASE \r\n            WHEN DepartureDate IS NULL THEN CAST(DATEDIFF(HOUR, DeliveryDate, GETDATE()) AS BIGINT) -- Still present\r\n            ELSE CAST(DATEDIFF(HOUR, DeliveryDate, DepartureDate) AS BIGINT) -- Duration until departure\r\n        END\r\n    ) AS TotalPresenceDurationInHours\r\nFROM SubsequentEvents subEv\r\ninner join worksite work on subEv.locationID = work.uid and work.sysActive!=-1\r\n GROUP BY locationID,work.label\r\nORDER BY locationID,work.label;",
            "refId": "A",
            "sql": {
              "columns": [
                {
                  "parameters": [],
                  "type": "function"
                }
              ],
              "groupBy": [
                {
                  "property": {
                    "type": "string"
                  },
                  "type": "groupBy"
                }
              ],
              "limit": 50
            }
          }
        ],
        "title": "durée de présence des engins dans chaque worksite",
        "type": "barchart"
      }
    ],
    "refresh": "1m",
    "schemaVersion": 37,
    "style": "dark",
    "tags": [],
    "templating": {
      "list": []
    },
    "time": {
      "from": "2025-04-15T06:21:39.646Z",
      "to": "2025-04-15T12:21:39.647Z"
    },
    "timepicker": {},
    "timezone": "",
    "title": "Durée de présence des engins dans chaque workiste",
    "uid": "ft_h26AHk",
    "version": 1,
    "weekStart": ""
  }
  