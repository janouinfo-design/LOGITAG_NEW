const renderMultiline = (data, fields, labels) => {
  const lines = fields.map((field, index) => {
    const value = data[field] ? data[field] : 'N/A';  // Utiliser 'N/A' si la valeur est nulle
    return `${labels[index]}: ${value}`;
  });

  return (
    <div>
      {lines.map((line, index) => (
        <div key={index}>
          {line}
          {index === 0 && <hr />} {/* Ajouter une ligne de séparation après la première ligne */}
        </div>
      ))}
    </div>
  );
};

export const columnsTarif = [
  {
    header: 'Prestation',
    field: 'prestation',
    olang: 'Prestation',
    body: (data) => renderMultiline(data, ['prestationAchat', 'prestationVente'], ['Achat', 'Vente']),
  },
  {
    header: 'Code',
    olang: 'Code',
    body: (data) => renderMultiline(data, ['codeAchat', 'codeVente'], ['Achat', 'Vente']),
  },
  {
    header: 'Description',
    olang: 'Description',
    body: (data) => renderMultiline(data, ['descriptionAchat', 'descriptionVente'], ['Achat', 'Vente']),
  },
  {
    header: 'Etat',
    olang: 'Etat',
    body: (data) => renderMultiline(data, ['etatAchat', 'etatVente'], ['Achat', 'Vente']),
  },

  {
    header: 'Formule condition',
    olang: 'Formule condition',
    body: (data) => renderMultiline(data, ['formuleConditionAchat', 'formuleConditionVente'], ['Achat', 'Vente']),
  },
  {
    header: 'Formule calculée',
    olang: 'Formule calculée',
    body: (data) => renderMultiline(data, ['formuleCalculeAchat', 'formuleCalculeVente'], ['Achat', 'Vente']),
  },
];


export const columnsMatrice = [
  {
    header: 'Code',
    olang: 'Code',
    field: 'Code',
  },
  {
    header: 'Description',
    field: 'Description',
    olang: 'Description ',
  },
  {
    header: 'Dimension',
    field: 'Dimension',
    olang: 'Dimension ',
  },
  {
    header: 'Field name',
    field: 'XFieldName',
    olang: 'Field name',
  },
  {
    header: 'XUnit',
    field: 'XUnit',
    olang: 'XUnit',
  },
  {
    header: 'YField name',
    field: 'YFieldName',
    olang: 'YField name',
  },
  {
    header: 'YUnit',
    field: 'YUnit',
    olang: 'YUnit',
  },
]

export const ColumnsNiveauSrcDataDossier = [
  {
    header: 'OTDestinNom',
    olang: 'OTDestinNom',
    field: 'OTDestinNom',
  },
  {
    header: 'OTID',
    olang: 'OTID',
    field: 'OTID',
  },
  {
    header: 'OTNoBL',
    olang: 'OTNoBL',
    field: 'OTNoBL',
  },
]

export const ColumnsNiveauSrcDataClient = [
  {
    header: 'ClientID',
    olang: 'ClientID',
    field: 'ClientID',
  },
  {
    header: 'Nom',
    olang: 'Nom',
    field: 'Nom',
  },
]

export const ColumnsPrestation = [
  {
    header: 'Produit',
    olang: 'Produit',
    field: 'Produit',
  },
]

export const ColumnsEtat = [
  {
    header: 'Etat',
    olang: 'Etat',
    field: 'Etat',
  },
  {
    header: 'Description',
    olang: 'Description',
    field: 'Description',
  },
]

export const ColumnsParameters = [
  {
    header: 'Field Name',
    olang: 'Field Name',
    field: 'FieldName',
  },
  {
    header: 'Unit',
    olang: 'Unit',
    field: 'Unit',
  },
  {
    header: 'Description',
    olang: 'Description',
    field: 'Description',
  },
]
