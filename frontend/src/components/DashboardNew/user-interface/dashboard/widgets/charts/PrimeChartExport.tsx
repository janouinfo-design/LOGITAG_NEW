
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Fonction pour exporter les données en CSV
export const downloadCSV = (data: any[], filename: string) => {
  // Obtenir les en-têtes
  const headers = Object.keys(data[0]);
  
  // Créer les lignes de données
  const csvRows = [];
  
  // Ajouter les en-têtes
  csvRows.push(headers.join(','));
  
  // Ajouter les lignes de données
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      return `"${val}"`;
    });
    csvRows.push(values.join(','));
  }
  
  // Combiner en une seule chaîne CSV
  const csvString = csvRows.join('\n');
  
  // Créer un lien de téléchargement
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
  a.download = `${filename}.csv`;
  a.click();
};

// Fonction pour télécharger en PDF
export const downloadPDF = async (elementRef: React.RefObject<HTMLDivElement>, filename: string) => {
  if (!elementRef.current) return;
  
  try {
    const canvas = await html2canvas(elementRef.current, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm'
    });
    
    const imgWidth = 280;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
  }
};

export default {
  downloadCSV,
  downloadPDF
};
