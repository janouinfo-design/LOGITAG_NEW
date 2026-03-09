import React from 'react'
import {Button} from 'primereact/button'
import {InputTextarea} from 'primereact/inputtextarea'
import {Card} from 'primereact/card'
import {Message} from 'primereact/message'
import ChartWidget from './widgets/ChartWidget'
import {useAIAnalysisController} from '../../../../hooks/useAIAnalysisController'

/**
 * Component for AI analysis functionality in dashboard
 */
const AIAnalysisSection = ({isAIConfigured, errorMessage}) => {
  // Using the controller to handle business logic
  const {
    userPrompt,
    setUserPrompt,
    isProcessingPrompt,
    aiRemarks,
    customDashboard,
    handlePromptSubmit,
  } = useAIAnalysisController(isAIConfigured)

  return (
    <>
      {errorMessage && <Message severity='error' text={errorMessage} className='mb-4 w-full' />}

      <div className='flex gap-4'>
        <div className='w-2/3 space-y-4'>
          <div className='flex gap-2'>
            <InputTextarea
              placeholder="Exemple: Je veux voir les engins qui sont en retard l'année précédente"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className='min-h-24 w-full'
              rows={4}
            />
          </div>
          <Button
            className='ml-auto flex items-center'
            onClick={handlePromptSubmit}
            disabled={isProcessingPrompt || !userPrompt.trim() || isAIConfigured === false}
            icon={isProcessingPrompt ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
            label={isProcessingPrompt ? 'Analyse en cours...' : 'Générer le tableau de bord'}
          />

          {customDashboard && customDashboard.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-6'>
              {customDashboard.map((chart, index) => (
                <Card key={index}>
                  <ChartWidget
                    title={chart.title || ''}
                    data={Array.isArray(chart.data) ? chart.data : []}
                    type={chart.type || 'bar'}
                    colors={Array.isArray(chart.colors) ? chart.colors : ['#1E88E5']}
                    height={240}
                  />
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className='w-1/3 bg-muted/20 rounded-lg p-4 space-y-3 h-64 overflow-y-auto border'>
          <h3 className='text-sm font-medium'>Remarques de l'IA</h3>
          {aiRemarks && aiRemarks.length > 0 ? (
            <div className='space-y-2'>
              {aiRemarks.map((remark, index) => (
                <div key={index} className='p-2 bg-background border rounded-md text-xs'>
                  {remark}
                </div>
              ))}
            </div>
          ) : (
            <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
              Les remarques de l'IA apparaîtront ici après votre demande
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AIAnalysisSection
