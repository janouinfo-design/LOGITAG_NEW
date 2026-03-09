import {useState} from 'react'
import {Card} from 'primereact/card'
import {Button} from 'primereact/button'
import {InputText} from 'primereact/inputtext'
import {Dialog} from 'primereact/dialog'
import {Dropdown} from 'primereact/dropdown'
import {Calendar} from 'primereact/calendar'
import {DataTable} from 'primereact/datatable'
import {Column} from 'primereact/column'

const FacturePermanente = () => {
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedFacture, setSelectedFacture] = useState(null)
  const [clientDialogVisible, setClientDialogVisible] = useState(false)
  const [factureDetailsDialogVisible, setFactureDetailsDialogVisible] = useState(false)
  const [visibleCreate, setVisibleCreate] = useState(false)

  const facturesLiees = [
    {
      id: 1,
      numero: 'F2024-001',
      date: '01/01/2024',
      montant: '500 €',
      statut: 'Payée',
      details: {
        nbPalettes: 5,
        prixUnitaire: '100 €',
        description: 'Location de palettes - Janvier 2024',
        formule: '5 palettes × 100 € = 500 €',
        typePrestation: 'location-palettes',
      },
    },
    {
      id: 2,
      numero: 'F2024-002',
      date: '01/02/2024',
      montant: '750 €',
      statut: 'Payée',
      details: {
        heures: 15,
        tauxHoraire: '50 €',
        description: 'Maintenance équipement - Février 2024',
        formule: '15 heures × 50 € = 750 €',
        typePrestation: 'maintenance',
      },
    },
    {
      id: 3,
      numero: 'F2024-003',
      date: '01/03/2024',
      montant: '1200 €',
      statut: 'En attente',
      details: {
        surface: 60,
        prixM2: '20 €',
        description: 'Nettoyage industriel - Mars 2024',
        formule: '60 m² × 20 € = 1200 €',
        typePrestation: 'nettoyage',
      },
    },
    {
      id: 4,
      numero: 'F2024-004',
      date: '01/04/2024',
      montant: '2000 €',
      statut: 'En attente',
      details: {
        nbContainers: 4,
        prixContainer: '500 €',
        description: 'Stockage containers - Avril 2024',
        formule: '4 containers × 500 € = 2000 €',
        typePrestation: 'stockage-containers',
      },
    },
    {
      id: 5,
      numero: 'F2024-005',
      date: '01/05/2024',
      montant: '3600 €',
      statut: 'À générer',
      details: {
        poidsTotal: 1200,
        prixKg: '3 €',
        description: 'Transport marchandises - Mai 2024',
        formule: '1200 kg × 3 € = 3600 €',
        typePrestation: 'transport',
      },
    },
    {
      id: 6,
      numero: 'F2024-006',
      date: '01/06/2024',
      montant: '900 €',
      statut: 'À générer',
      details: {
        nbPersonnes: 6,
        prixPersonne: '150 €',
        description: 'Formation sécurité - Juin 2024',
        formule: '6 personnes × 150 € = 900 €',
        typePrestation: 'formation',
      },
    },
    {
      id: 7,
      numero: 'F2024-007',
      date: '01/07/2024',
      montant: '1500 €',
      statut: 'À générer',
      details: {
        nbMachines: 3,
        prixMaintenance: '500 €',
        description: 'Maintenance préventive - Juillet 2024',
        formule: '3 machines × 500 € = 1500 €',
        typePrestation: 'maintenance-machines',
      },
    },
    {
      id: 8,
      numero: 'F2024-008',
      date: '01/08/2024',
      montant: '4000 €',
      statut: 'À générer',
      details: {
        puissance: 2000,
        prixKw: '2 €',
        description: 'Consommation électrique - Août 2024',
        formule: '2000 kW × 2 € = 4000 €',
        typePrestation: 'electricite',
      },
    },
    {
      id: 9,
      numero: 'F2024-009',
      date: '01/09/2024',
      montant: '2500 €',
      statut: 'À générer',
      details: {
        volume: 50,
        prixM3: '50 €',
        description: 'Location espace stockage - Septembre 2024',
        formule: '50 m³ × 50 € = 2500 €',
        typePrestation: 'stockage-espace',
      },
    },
    {
      id: 10,
      numero: 'F2024-010',
      date: '01/10/2024',
      montant: '1800 €',
      statut: 'À générer',
      details: {
        distance: 600,
        prixKm: '3 €',
        description: 'Service livraison - Octobre 2024',
        formule: '600 km × 3 € = 1800 €',
        typePrestation: 'livraison',
      },
    },
  ]

  const clientsList = [
    {
      nom: 'Client A',
      description: 'Maintenance mensuelle',
      periodicite: '1 mois',
      prochaine: '01/04/2024',
      fin: '-',
      statut: 'Actif',
    },
    {
      nom: 'Client B',
      description: 'Location matériel',
      periodicite: '3 mois',
      prochaine: '15/04/2024',
      fin: '31/12/2024',
      statut: 'Actif',
    },
    {
      nom: 'Client C',
      description: 'Support technique',
      periodicite: '15 jours',
      prochaine: '01/04/2024',
      fin: '-',
      statut: 'Actif',
    },
    {
      nom: 'Client D',
      description: 'Hébergement web',
      periodicite: '1 an',
      prochaine: '01/01/2025',
      fin: '-',
      statut: 'Actif',
    },
    {
      nom: 'Client E',
      description: 'Maintenance serveurs',
      periodicite: '1 mois',
      prochaine: '05/04/2024',
      fin: '31/12/2024',
      statut: 'Actif',
    },
    {
      nom: 'Client F',
      description: 'Consulting',
      periodicite: '6 mois',
      prochaine: '30/06/2024',
      fin: '-',
      statut: 'Actif',
    },
    {
      nom: 'Client G',
      description: 'Formation',
      periodicite: '3 mois',
      prochaine: '15/05/2024',
      fin: '31/12/2024',
      statut: 'Actif',
    },
  ]

  const typePrestations = [
    {label: 'Location de palettes', value: 'location-palettes'},
    {label: 'Services de maintenance', value: 'maintenance'},
    {label: 'Nettoyage industriel', value: 'nettoyage'},
    {label: 'Stockage de containers', value: 'stockage-containers'},
    {label: 'Transport de marchandises', value: 'transport'},
    {label: 'Formation', value: 'formation'},
    {label: 'Maintenance de machines', value: 'maintenance-machines'},
    {label: 'Consommation électrique', value: 'electricite'},
    {label: "Location d'espace de stockage", value: 'stockage-espace'},
    {label: 'Service de livraison', value: 'livraison'},
  ]

  const periodes = [
    {label: '15 jours', value: '15j'},
    {label: '1 mois', value: '1m'},
    {label: '3 mois', value: '3m'},
    {label: '6 mois', value: '6m'},
    {label: '1 an', value: '1a'},
  ]

  const moments = [
    {label: 'Avant la période', value: 'avant'},
    {label: 'Après la période', value: 'apres'},
  ]

  const renderDetailsFields = (facture) => {
    const details = facture.details

    switch (details.typePrestation) {
      case 'location-palettes':
        return (
          <>
            <p>
              <span className='text-muted-foreground'>Description :</span> {details.description}
            </p>
            <p>
              <span className='text-muted-foreground'>Nombre de palettes :</span>{' '}
              {details.nbPalettes}
            </p>
            <p>
              <span className='text-muted-foreground'>Prix unitaire :</span> {details.prixUnitaire}
            </p>
          </>
        )
      case 'maintenance':
        return (
          <>
            <p>
              <span className='text-muted-foreground'>Description :</span> {details.description}
            </p>
            <p>
              <span className='text-muted-foreground'>Heures de travail :</span> {details.heures}
            </p>
            <p>
              <span className='text-muted-foreground'>Taux horaire :</span> {details.tauxHoraire}
            </p>
          </>
        )
      case 'nettoyage':
        return (
          <>
            <p>
              <span className='text-muted-foreground'>Description :</span> {details.description}
            </p>
            <p>
              <span className='text-muted-foreground'>Surface nettoyée :</span> {details.surface} m²
            </p>
            <p>
              <span className='text-muted-foreground'>Prix au m² :</span> {details.prixM2}
            </p>
          </>
        )
      case 'stockage-containers':
        return (
          <>
            <p>
              <span className='text-muted-foreground'>Description :</span> {details.description}
            </p>
            <p>
              <span className='text-muted-foreground'>Nombre de containers :</span>{' '}
              {details.nbContainers}
            </p>
            <p>
              <span className='text-muted-foreground'>Prix par container :</span>{' '}
              {details.prixContainer}
            </p>
          </>
        )
      case 'transport':
        return (
          <>
            <p>
              <span className='text-muted-foreground'>Description :</span> {details.description}
            </p>
            <p>
              <span className='text-muted-foreground'>Poids total :</span> {details.poidsTotal} kg
            </p>
            <p>
              <span className='text-muted-foreground'>Prix au kg :</span> {details.prixKg}
            </p>
          </>
        )
      case 'formation':
        return (
          <>
            <p>
              <span className='text-muted-foreground'>Description :</span> {details.description}
            </p>
            <p>
              <span className='text-muted-foreground'>Nombre de participants :</span>{' '}
              {details.nbPersonnes}
            </p>
            <p>
              <span className='text-muted-foreground'>Prix par personne :</span>{' '}
              {details.prixPersonne}
            </p>
          </>
        )
      case 'maintenance-machines':
        return (
          <>
            <p>
              <span className='text-muted-foreground'>Description :</span> {details.description}
            </p>
            <p>
              <span className='text-muted-foreground'>Nombre de machines :</span>{' '}
              {details.nbMachines}
            </p>
            <p>
              <span className='text-muted-foreground'>Prix par machine :</span>{' '}
              {details.prixMaintenance}
            </p>
          </>
        )
      case 'electricite':
        return (
          <>
            <p>
              <span className='text-muted-foreground'>Description :</span> {details.description}
            </p>
            <p>
              <span className='text-muted-foreground'>Puissance consommée :</span>{' '}
              {details.puissance} kW
            </p>
            <p>
              <span className='text-muted-foreground'>Prix au kW :</span> {details.prixKw}
            </p>
          </>
        )
      case 'stockage-espace':
        return (
          <>
            <p>
              <span className='text-muted-foreground'>Description :</span> {details.description}
            </p>
            <p>
              <span className='text-muted-foreground'>Volume :</span> {details.volume} m³
            </p>
            <p>
              <span className='text-muted-foreground'>Prix au m³ :</span> {details.prixM3}
            </p>
          </>
        )
      case 'livraison':
        return (
          <>
            <p>
              <span className='text-muted-foreground'>Description :</span> {details.description}
            </p>
            <p>
              <span className='text-muted-foreground'>Distance parcourue :</span> {details.distance}{' '}
              km
            </p>
            <p>
              <span className='text-muted-foreground'>Prix au km :</span> {details.prixKm}
            </p>
          </>
        )
      default:
        return (
          <p>
            <span className='text-muted-foreground'>Description :</span> {details.description}
          </p>
        )
    }
  }

  const statutBodyTemplate = (rowData) => {
    let bgClass = 'bg-gray-100 text-gray-800'

    if (rowData.statut === 'Actif') {
      bgClass = 'bg-green-100 text-green-800'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgClass}`}>
        {rowData.statut}
      </span>
    )
  }

  const statutFactureBodyTemplate = (rowData) => {
    let bgClass = 'bg-gray-100 text-gray-800'

    if (rowData.statut === 'Payée') {
      bgClass = 'bg-green-100 text-green-800'
    } else if (rowData.statut === 'En attente') {
      bgClass = 'bg-yellow-100 text-yellow-800'
    } else if (rowData.statut === 'À générer') {
      bgClass = 'bg-blue-100 text-blue-800'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgClass}`}>
        {rowData.statut}
      </span>
    )
  }

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className='space-x-2'>
        <Button icon={'pi pi-print'} label='Générer' className='p-button-secondary p-button-sm' />
        <Button
          icon={'pi pi-eye'}
          label='Voir'
          className='p-button-secondary p-button-sm'
          onClick={() => {
            setSelectedClient(rowData.nom)
            setClientDialogVisible(true)
          }}
        />
      </div>
    )
  }

  const factureActionsBodyTemplate = (rowData) => {
    return (
      <Button
        icon={'pi pi-eye'}
        label='Détails'
        className='p-button-text p-button-sm'
        onClick={() => {
          setSelectedFacture(rowData)
          setFactureDetailsDialogVisible(true)
        }}
      />
    )
  }

  const footerNewFactureDialog = (
    <div className='flex justify-end'>
      <Button
        label='Annuler'
        icon='pi pi-times'
        className='p-button-outlined mr-2'
        onClick={() => {
          /* action d'annulation */
        }}
      />
      <Button
        label="Créer l'abonnement"
        icon={'pi pi-check'}
        className='p-button'
        onClick={() => {
          /* action de création */
        }}
      />
    </div>
  )

  return (
    <div>
      <div className='space-y-6'>
        <header className='mb-8'>
          <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
            Factures Permanentes
          </h1>
          <p className='text-muted-foreground mt-2'>
            Gérez vos abonnements et facturations périodiques
          </p>
        </header>

        <div className='flex justify-between items-center mb-6'>
          <Button
            label='Nouvelle facture permanente'
            icon={'pi pi-plus'}
            className='p-button'
            onClick={() => {
              // Ouvrir le dialogue pour nouvelle facture
              setVisibleCreate(true)
            }}
          />

          <div className='w-64'>
            <InputText placeholder='Rechercher...' className='w-full' />
          </div>
        </div>

        <Card className='shadow-sm'>
          <div className='flex flex-col space-y-1.5 p-6 border-b'>
            <h3 className='text-2xl font-semibold leading-none tracking-tight'>
              Liste des factures permanentes
            </h3>
          </div>
          <div className='p-6'>
            <DataTable
              value={clientsList}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              tableStyle={{minWidth: '50rem'}}
              className='p-datatable-sm'
            >
              <Column field='nom' header='Client' />
              <Column field='description' header='Description' />
              <Column field='periodicite' header='Périodicité' />
              <Column field='prochaine' header='Prochaine facture' />
              <Column field='fin' header='Date de fin' />
              <Column field='statut' header='Statut' body={statutBodyTemplate} />
              <Column body={actionsBodyTemplate} header='Actions' style={{width: '200px'}} />
            </DataTable>
          </div>
        </Card>

        <Dialog
          header={`Factures liées - ${selectedClient}`}
          visible={clientDialogVisible}
          style={{width: '800px'}}
          onHide={() => setClientDialogVisible(false)}
          className='p-fluid'
        >
          <div className='mt-4'>
            <DataTable
              value={facturesLiees}
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 25]}
              tableStyle={{minWidth: '40rem'}}
              className='p-datatable-sm'
            >
              <Column field='numero' header='Numéro' />
              <Column field='date' header='Date' />
              <Column field='montant' header='Montant' />
              <Column field='statut' header='Statut' body={statutFactureBodyTemplate} />
              <Column body={factureActionsBodyTemplate} header='Actions' style={{width: '150px'}} />
            </DataTable>
          </div>
        </Dialog>

        <Dialog
          header={`Détails de la facture ${selectedFacture?.numero || ''}`}
          visible={factureDetailsDialogVisible}
          style={{width: '600px'}}
          onHide={() => setFactureDetailsDialogVisible(false)}
          className='p-fluid'
        >
          {selectedFacture && (
            <div className='mt-4 space-y-4'>
              <div>
                <h3 className='font-medium mb-2'>Informations générales</h3>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <p className='text-muted-foreground'>Numéro</p>
                    <p>{selectedFacture.numero}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>Date</p>
                    <p>{selectedFacture.date}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>Statut</p>
                    <p>{selectedFacture.statut}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>Montant total</p>
                    <p>{selectedFacture.montant}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className='font-medium mb-2'>Détails de la prestation</h3>
                <div className='space-y-2 text-sm'>
                  {renderDetailsFields(selectedFacture)}
                  <div className='mt-4 p-3 bg-muted rounded-md'>
                    <p className='font-medium'>Formule de calcul :</p>
                    <p>{selectedFacture.details.formule}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Dialog>

        <Dialog
          header='Créer une facture permanente'
          visible={visibleCreate}
          style={{width: '450px'}}
          footer={footerNewFactureDialog}
          onHide={() => {
            setVisibleCreate(false)
          }}
          className='p-fluid'
        >
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Client</label>
              <InputText placeholder='Nom du client' className='w-full' />
            </div>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Description de la prestation
              </label>
              <InputText placeholder='Description' className='w-full' />
            </div>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Type de prestation</label>
              <Dropdown
                options={typePrestations}
                placeholder='Choisir un type'
                className='w-full'
              />
            </div>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Périodicité</label>
              <Dropdown
                options={periodes}
                placeholder='Choisir une périodicité'
                className='w-full'
              />
            </div>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Moment de facturation
              </label>
              <Dropdown options={moments} placeholder='Choisir le moment' className='w-full' />
            </div>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Date de début</label>
              <Calendar showIcon placeholder='Sélectionner une date' className='w-full' />
            </div>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Date de fin (optionnelle)
              </label>
              <Calendar showIcon placeholder='Sélectionner une date' className='w-full' />
              <p className='text-xs text-muted-foreground'>
                Laissez vide pour un abonnement sans date de fin
              </p>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  )
}

export default FacturePermanente
