import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { 
  VisualizationState, 
  ProcessingState, 
  ProcessingFile,
  VisualizationFilters,
  ConnectionStatus 
} from '../types/visualization'

interface VisualizationStore extends VisualizationState {
  // Connection state
  connectionStatus: ConnectionStatus
  
  // Actions
  setConnectionStatus: (status: ConnectionStatus) => void
  addFile: (file: ProcessingFile) => void
  updateFileProcessingState: (fileId: string, state: ProcessingState) => void
  removeFile: (fileId: string) => void
  setSelectedStep: (stepId: string | null) => void
  setViewMode: (mode: 'detailed' | 'simplified') => void
  setAnimationSpeed: (speed: number) => void
  setShowMetrics: (show: boolean) => void
  updateFilters: (filters: Partial<VisualizationFilters>) => void
  
  // Computed getters
  getActiveFileCount: () => number
  getCompletedFileCount: () => number
  getErrorFileCount: () => number
  getOverallProgress: () => number
}

const initialFilters: VisualizationFilters = {
  showOnlyErrors: false,
  hideCompletedSteps: false,
  agentTypes: [],
  timeRange: { 
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    end: new Date() 
  }
}

export const useVisualizationStore = create<VisualizationStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    activeFiles: new Map(),
    selectedStep: null,
    viewMode: 'detailed',
    animationSpeed: 1,
    showMetrics: true,
    filters: initialFilters,
    connectionStatus: {
      connected: false,
      reconnecting: false
    },

    // Actions
    setConnectionStatus: (status: ConnectionStatus) => {
      set({ connectionStatus: status })
    },

    addFile: (file: ProcessingFile) => {
      set((state) => {
        const newActiveFiles = new Map(state.activeFiles)
        newActiveFiles.set(file.id, file.processingState)
        return { activeFiles: newActiveFiles }
      })
    },

    updateFileProcessingState: (fileId: string, processingState: ProcessingState) => {
      set((state) => {
        const newActiveFiles = new Map(state.activeFiles)
        newActiveFiles.set(fileId, processingState)
        return { activeFiles: newActiveFiles }
      })
    },

    removeFile: (fileId: string) => {
      set((state) => {
        const newActiveFiles = new Map(state.activeFiles)
        newActiveFiles.delete(fileId)
        return { activeFiles: newActiveFiles }
      })
    },

    setSelectedStep: (stepId: string | null) => {
      set({ selectedStep: stepId })
    },

    setViewMode: (mode: 'detailed' | 'simplified') => {
      set({ viewMode: mode })
    },

    setAnimationSpeed: (speed: number) => {
      set({ animationSpeed: Math.max(0.1, Math.min(3, speed)) }) // Clamp between 0.1 and 3
    },

    setShowMetrics: (show: boolean) => {
      set({ showMetrics: show })
    },

    updateFilters: (filterUpdates: Partial<VisualizationFilters>) => {
      set((state) => ({
        filters: { ...state.filters, ...filterUpdates }
      }))
    },

    // Computed getters
    getActiveFileCount: () => {
      const { activeFiles } = get()
      return Array.from(activeFiles.values()).filter(state => 
        state.overallProgress < 100 && state.errors.length === 0
      ).length
    },

    getCompletedFileCount: () => {
      const { activeFiles } = get()
      return Array.from(activeFiles.values()).filter(state => 
        state.overallProgress === 100
      ).length
    },

    getErrorFileCount: () => {
      const { activeFiles } = get()
      return Array.from(activeFiles.values()).filter(state => 
        state.errors.length > 0
      ).length
    },

    getOverallProgress: () => {
      const { activeFiles } = get()
      const states = Array.from(activeFiles.values())
      
      if (states.length === 0) return 0
      
      const totalProgress = states.reduce((sum, state) => sum + state.overallProgress, 0)
      return Math.round(totalProgress / states.length)
    }
  }))
)

// Selectors for common use cases
export const useConnectionStatus = () => useVisualizationStore(state => state.connectionStatus)
export const useActiveFiles = () => useVisualizationStore(state => state.activeFiles)
export const useSelectedStep = () => useVisualizationStore(state => state.selectedStep)
export const useViewMode = () => useVisualizationStore(state => state.viewMode)
export const useAnimationSpeed = () => useVisualizationStore(state => state.animationSpeed)
export const useShowMetrics = () => useVisualizationStore(state => state.showMetrics)
export const useFilters = () => useVisualizationStore(state => state.filters)

// Action selectors
export const useVisualizationActions = () => useVisualizationStore(state => ({
  setConnectionStatus: state.setConnectionStatus,
  addFile: state.addFile,
  updateFileProcessingState: state.updateFileProcessingState,
  removeFile: state.removeFile,
  setSelectedStep: state.setSelectedStep,
  setViewMode: state.setViewMode,
  setAnimationSpeed: state.setAnimationSpeed,
  setShowMetrics: state.setShowMetrics,
  updateFilters: state.updateFilters
}))

// Computed selectors
export const useFileStats = () => useVisualizationStore(state => ({
  active: state.getActiveFileCount(),
  completed: state.getCompletedFileCount(),
  errors: state.getErrorFileCount(),
  overall: state.getOverallProgress()
}))