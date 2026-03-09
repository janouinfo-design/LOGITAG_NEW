import {useState} from 'react'
// import { analyzeWithAI } from '@/services/aiService';
// import { toast } from 'sonner';

/**
 * Controller for AI Analysis functionality
 * Separates business logic from UI components
 */
export const useAIAnalysisController = (isAIConfigured) => {
  const [userPrompt, setUserPrompt] = useState('')
  const [isProcessingPrompt, setIsProcessingPrompt] = useState(false)
  const [aiRemarks, setAiRemarks] = useState([])
  const [customDashboard, setCustomDashboard] = useState([])
  const [aiResponse, setAIResponse] = useState(null)

  /**
   * Handles the prompt submission and AI analysis
   */
  const handlePromptSubmit = async () => {
    if (!userPrompt.trim()) return

    if (!isAIConfigured) {
      return
    }

    setIsProcessingPrompt(true)

    try {

      const result = []

      if (!result || !result.remarks || !result.customInsights) {
        console.error('Format de réponse inattendu:', result)
        throw new Error('Format de réponse inattendu')
      }

      setAIResponse(result)
      setAiRemarks(Array.isArray(result.remarks) ? result.remarks : [])
      setCustomDashboard(Array.isArray(result.customInsights) ? result.customInsights : [])

    } catch (error) {
      console.error("Erreur lors de l'analyse:", error)

      if (error.code === 'ERR_NETWORK') {
      } else if (error.response && error.response.data && error.response.data.error) {
      } else {
      }

      setAIResponse(null)
      setAiRemarks([])
      setCustomDashboard([])
    } finally {
      setIsProcessingPrompt(false)
    }
  }

  return {
    userPrompt,
    setUserPrompt,
    isProcessingPrompt,
    aiRemarks,
    customDashboard,
    aiResponse,
    handlePromptSubmit,
  }
}
