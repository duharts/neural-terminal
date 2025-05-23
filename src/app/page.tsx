'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Mic, MicOff, Send, Settings, HelpCircle, History, Trash2, 
  Activity, Sliders, Terminal, Zap, Volume2, VolumeX, 
  Download, Upload, Copy, Eye, EyeOff, Cpu, Brain, 
  Wifi, WifiOff, Power, RotateCcw, AlertTriangle, CheckCircle
} from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  model?: string
  tokens?: number
}

interface TranscriptionEntry {
  text: string
  timestamp: number
  confidence?: number
}

interface SystemStats {
  totalChats: number
  totalTokens: number
  avgResponseTime: number
  uptime: number
  errors: number
}

interface ErrorLog {
  timestamp: number
  level: 'ERROR' | 'WARN' | 'INFO'
  message: string
  details?: any
}

const LLM_PROVIDERS = {
  'ChatGPT': { endpoint: '/api/chat', model: 'gpt-3.5-turbo', color: 'text-blue-400' },
  'GPT-4': { endpoint: '/api/chat', model: 'gpt-4', color: 'text-purple-400' },
  'Perplexity': { endpoint: '/api/chat', model: 'perplexity', color: 'text-orange-400' }
}

export default function NeuralTerminal() {
  const [isRecording, setIsRecording] = useState(false)
  const [message, setMessage] = useState('')
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([])
  const [selectedLLM, setSelectedLLM] = useState('ChatGPT')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('SYSTEM READY')
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoSend, setAutoSend] = useState(true)
  const [showTokens, setShowTokens] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([])
  
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalChats: 0,
    totalTokens: 0,
    avgResponseTime: 0,
    uptime: Date.now(),
    errors: 0
  })

  const [settings, setSettings] = useState({
    openaiApiKey: '',
    perplexityApiKey: '',
    temperature: 0.9,
    maxTokens: 3000,
    conversationMemory: true,
    smartContext: true,
    voiceAutoSend: true,
    showTimestamps: true,
    darkMode: true,
    soundEffects: true,
    debugMode: false
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    initializeTerminal()
    loadSettings()
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalOutput])

  const logError = (level: 'ERROR' | 'WARN' | 'INFO', message: string, details?: any) => {
    const errorEntry: ErrorLog = {
      timestamp: Date.now(),
      level,
      message,
      details
    }
    setErrorLogs(prev => [...prev.slice(-99), errorEntry]) // Keep last 100 errors
    
    if (level === 'ERROR') {
      setSystemStats(prev => ({ ...prev, errors: prev.errors + 1 }))
    }
    
    if (settings.debugMode) {
      console.log(`[${level}] ${message}`, details)
    }
  }

  const initializeTerminal = () => {
    appendToTerminal('╔══════════════════════════════════════════╗')
    appendToTerminal('║      NEURAL TERMINAL v2.1 - ENHANCED    ║')
    appendToTerminal('║        AI VOICE INTERFACE SYSTEM        ║')
    appendToTerminal('╚══════════════════════════════════════════╝')
    appendToTerminal('')
    appendToTerminal('> INITIALIZING NEURAL MATRIX...')
    appendToTerminal('> VOICE RECOGNITION: ONLINE')
    appendToTerminal('> AI MODELS: READY')
    appendToTerminal('> ENHANCED PROMPTS: LOADED')
    appendToTerminal(`> ACTIVE MODEL: ${selectedLLM}`)
    appendToTerminal('> CONVERSATION MEMORY: ENABLED')
    appendToTerminal('> SMART CONTEXT: ACTIVE')
    appendToTerminal('> ERROR LOGGING: INITIALIZED')
    appendToTerminal('')
    appendToTerminal('╔════════════════════════════════════════╗')
    appendToTerminal('║ AVAILABLE COMMANDS:                   ║')
    appendToTerminal('║ help    │ show command matrix          ║')
    appendToTerminal('║ status  │ system diagnostics           ║')
    appendToTerminal('║ clear   │ clear terminal               ║')
    appendToTerminal('║ history │ conversation logs            ║')
    appendToTerminal('║ errors  │ error log viewer             ║')
    appendToTerminal('║ export  │ export chat history          ║')
    appendToTerminal('║ stats   │ usage statistics             ║')
    appendToTerminal('║ debug   │ toggle debug mode            ║')
    appendToTerminal('╚════════════════════════════════════════╝')
    appendToTerminal('')
    appendToTerminal('NEURAL INTERFACE READY > _')
    
    logError('INFO', 'Neural Terminal initialized successfully')
    playSystemSound('startup')
  }

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('neural-terminal-settings')
      if (saved) {
        const loadedSettings = JSON.parse(saved)
        setSettings({ ...settings, ...loadedSettings })
        logError('INFO', 'Settings loaded from localStorage')
      }
    } catch (error) {
      logError('ERROR', 'Failed to load settings', error)
    }
  }

  const saveSettings = () => {
    try {
      localStorage.setItem('neural-terminal-settings', JSON.stringify(settings))
      appendToTerminal('> SETTINGS SAVED TO LOCAL STORAGE')
      logError('INFO', 'Settings saved successfully')
    } catch (error) {
      appendToTerminal('> ERROR: FAILED TO SAVE SETTINGS')
      logError('ERROR', 'Failed to save settings', error)
    }
  }

  const appendToTerminal = (text: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false })
    const prefix = settings.showTimestamps ? `[${timestamp}] ` : ''
    setTerminalOutput(prev => [...prev.slice(-199), `${prefix}${text}`]) // Keep last 200 lines
  }

  const playSystemSound = (type: 'startup' | 'beep' | 'error' | 'success') => {
    if (!soundEnabled || !settings.soundEffects) return
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }
      
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      switch (type) {
        case 'startup':
          oscillator.frequency.setValueAtTime(800, ctx.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3)
          break
        case 'beep':
          oscillator.frequency.setValueAtTime(600, ctx.currentTime)
          break
        case 'error':
          oscillator.frequency.setValueAtTime(200, ctx.currentTime)
          break
        case 'success':
          oscillator.frequency.setValueAtTime(800, ctx.currentTime)
          break
      }
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.3)
    } catch (error) {
      logError('WARN', 'Audio system error', error)
    }
  }

  const startRecording = async () => {
    try {
      logError('INFO', 'Starting voice recording')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        await processAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setStatus('NEURAL CAPTURE ACTIVE')
      appendToTerminal('> VOICE CAPTURE INITIATED')
      appendToTerminal('> NEURAL PROCESSING READY...')
      playSystemSound('beep')
      logError('INFO', 'Voice recording started successfully')
    } catch (error) {
      appendToTerminal('> ERROR: MICROPHONE ACCESS DENIED')
      appendToTerminal('> CHECK BROWSER PERMISSIONS')
      setStatus('MIC ERROR')
      playSystemSound('error')
      logError('ERROR', 'Failed to start voice recording', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setStatus('NEURAL PROCESSING...')
      appendToTerminal('> ENDING VOICE CAPTURE')
      appendToTerminal('> WHISPER AI TRANSCRIBING...')
      logError('INFO', 'Voice recording stopped')
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    const startTime = Date.now()
    
    try {
      setStatus('WHISPER AI PROCESSING...')
      logError('INFO', `Processing audio blob: ${audioBlob.size} bytes`)
      
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const { text, confidence, debug } = await response.json()
        const processingTime = Date.now() - startTime
        
        if (text) {
          appendToTerminal(`> TRANSCRIPT: "${text}"`)
          appendToTerminal(`> CONFIDENCE: ${Math.round((confidence || 0.95) * 100)}%`)
          appendToTerminal(`> PROCESSING TIME: ${processingTime}ms`)
          
          setMessage(text)
          
          const entry: TranscriptionEntry = {
            text,
            timestamp: Date.now(),
            confidence: confidence || 0.95
          }
          setTranscriptionHistory(prev => [...prev, entry])
          
          if (autoSend && settings.voiceAutoSend) {
            appendToTerminal('> AUTO-SENDING TO NEURAL NETWORK...')
            await sendToLLM(text)
          } else {
            appendToTerminal('> READY TO SEND (PRESS ENTER)')
          }
          
          playSystemSound('success')
          logError('INFO', `Transcription successful: ${text.length} characters`)
        } else {
          appendToTerminal('> NO SPEECH DETECTED')
          appendToTerminal('> TRY SPEAKING LOUDER OR CLOSER TO MIC')
          playSystemSound('error')
          logError('WARN', 'No speech detected in audio')
        }
      } else {
        const errorData = await response.json()
        appendToTerminal(`> TRANSCRIPTION FAILED: ${response.status}`)
        appendToTerminal(`> ERROR: ${errorData.error}`)
        playSystemSound('error')
        logError('ERROR', 'Transcription API error', { status: response.status, error: errorData })
      }
    } catch (error) {
      appendToTerminal(`> PROCESSING ERROR: ${error}`)
      playSystemSound('error')
      logError('ERROR', 'Audio processing failed', error)
    } finally {
      setStatus('SYSTEM READY')
    }
  }

  const sendMessage = async () => {
    if (!message.trim()) return

    const cmd = message.toLowerCase().trim()
    
    // Handle system commands
    if (cmd === 'help') {
      showHelp()
      setMessage('')
      return
    }
    if (cmd === 'clear') {
      setTerminalOutput([])
      appendToTerminal('> TERMINAL BUFFER CLEARED')
      setMessage('')
      return
    }
    if (cmd === 'status') {
      showStatus()
      setMessage('')
      return
    }
    if (cmd === 'history') {
      showChatHistory()
      setMessage('')
      return
    }
    if (cmd === 'errors') {
      setShowLogs(!showLogs)
      appendToTerminal('> ERROR LOG VIEWER TOGGLED')
      setMessage('')
      return
    }
    if (cmd === 'export') {
      exportChatHistory()
      setMessage('')
      return
    }
    if (cmd === 'stats') {
      showStats()
      setMessage('')
      return
    }
    if (cmd === 'debug') {
      setSettings(prev => ({ ...prev, debugMode: !prev.debugMode }))
      appendToTerminal(`> DEBUG MODE: ${!settings.debugMode ? 'ENABLED' : 'DISABLED'}`)
      setMessage('')
      return
    }
    if (cmd === 'reset') {
      resetSystem()
      setMessage('')
      return
    }

    appendToTerminal(`> USER: ${message}`)
    const userMessage = message
    setMessage('')
    
    await sendToLLM(userMessage)
  }

  const sendToLLM = async (text: string) => {
    const startTime = Date.now()
    setIsLoading(true)
    setStatus(`NEURAL LINK: ${selectedLLM}`)

    try {
      logError('INFO', `Sending message to ${selectedLLM}: ${text.length} characters`)
      const provider = LLM_PROVIDERS[selectedLLM as keyof typeof LLM_PROVIDERS]
      
      const response = await fetch(provider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          model: provider.model,
          history: settings.conversationMemory ? chatHistory.slice(-20) : [],
          settings
        }),
      })

      const processingTime = Date.now() - startTime

      if (response.ok) {
        const { reply, debug } = await response.json()
        
        const estimatedTokens = Math.ceil((text.length + reply.length) / 4)
        
        const userMsg: ChatMessage = { 
          role: 'user', 
          content: text, 
          timestamp: Date.now(),
          tokens: Math.ceil(text.length / 4)
        }
        const assistantMsg: ChatMessage = { 
          role: 'assistant', 
          content: reply, 
          timestamp: Date.now(), 
          model: selectedLLM,
          tokens: Math.ceil(reply.length / 4)
        }
        
        setChatHistory(prev => [...prev, userMsg, assistantMsg])
        
        setSystemStats(prev => ({
          ...prev,
          totalChats: prev.totalChats + 1,
          totalTokens: prev.totalTokens + estimatedTokens,
          avgResponseTime: (prev.avgResponseTime + processingTime) / 2
        }))
        
        appendToTerminal(`> ${selectedLLM}: ${reply}`)
        
        if (showTokens) {
          appendToTerminal(`> TOKENS: ~${estimatedTokens} | TIME: ${processingTime}ms`)
        }
        
        if (settings.debugMode && debug) {
          appendToTerminal(`> DEBUG: ${JSON.stringify(debug)}`)
        }
        
        appendToTerminal('> RESPONSE COPIED TO CLIPBOARD')
        
        navigator.clipboard.writeText(reply).catch(() => {
          appendToTerminal('> CLIPBOARD COPY FAILED')
        })
        
        playSystemSound('success')
        logError('INFO', `Response received successfully from ${selectedLLM}`)
      } else {
        const errorData = await response.json()
        appendToTerminal(`> ERROR: CONNECTION FAILED [${response.status}]`)
        appendToTerminal(`> ${errorData.error}`)
        if (settings.debugMode && errorData.debug) {
          appendToTerminal(`> DEBUG: ${JSON.stringify(errorData.debug)}`)
        }
        playSystemSound('error')
        logError('ERROR', `API request failed`, { status: response.status, error: errorData })
      }
    } catch (error) {
      appendToTerminal(`> NEURAL LINK ERROR: ${error}`)
      playSystemSound('error')
      logError('ERROR', 'Neural link failed', error)
    } finally {
      setIsLoading(false)
      setStatus('SYSTEM READY')
    }
  }

  const showHelp = () => {
    appendToTerminal('╔══════════════════════════════════════════╗')
    appendToTerminal('║              COMMAND MATRIX              ║')
    appendToTerminal('╠══════════════════════════════════════════╣')
    appendToTerminal('║ help     │ Display this command matrix   ║')
    appendToTerminal('║ status   │ Show system diagnostics       ║')
    appendToTerminal('║ clear    │ Clear terminal buffer          ║')
    appendToTerminal('║ history  │ Show conversation log          ║')
    appendToTerminal('║ errors   │ Show error log viewer          ║')
    appendToTerminal('║ export   │ Export chat history            ║')
    appendToTerminal('║ stats    │ Usage statistics               ║')
    appendToTerminal('║ debug    │ Toggle debug mode              ║')
    appendToTerminal('║ reset    │ Reset neural interface         ║')
    appendToTerminal('║ [MIC]    │ Voice neural interface         ║')
    appendToTerminal('╚══════════════════════════════════════════╝')
  }

  const showStatus = () => {
    const uptime = Math.floor((Date.now() - systemStats.uptime) / 1000)
    const hours = Math.floor(uptime / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    const seconds = uptime % 60
    
    appendToTerminal('╔══════════════════════════════════════════╗')
    appendToTerminal('║            SYSTEM DIAGNOSTICS            ║')
    appendToTerminal('╠══════════════════════════════════════════╣')
    appendToTerminal(`║ VERSION     │ Neural Terminal v2.1       ║`)
    appendToTerminal(`║ AI MODEL    │ ${selectedLLM.padEnd(23)} ║`)
    appendToTerminal(`║ TEMPERATURE │ ${settings.temperature.toFixed(1).padEnd(23)} ║`)
    appendToTerminal(`║ MAX TOKENS  │ ${settings.maxTokens.toString().padEnd(23)} ║`)
    appendToTerminal(`║ MEMORY      │ ${(settings.conversationMemory ? 'ENABLED' : 'DISABLED').padEnd(23)} ║`)
    appendToTerminal(`║ CONTEXT     │ ${(settings.smartContext ? 'SMART' : 'BASIC').padEnd(23)} ║`)
    appendToTerminal(`║ DEBUG MODE  │ ${(settings.debugMode ? 'ENABLED' : 'DISABLED').padEnd(23)} ║`)
    appendToTerminal(`║ VOICE AUTO  │ ${(settings.voiceAutoSend ? 'ENABLED' : 'DISABLED').padEnd(23)} ║`)
    appendToTerminal(`║ SOUND FX    │ ${(settings.soundEffects ? 'ENABLED' : 'DISABLED').padEnd(23)} ║`)
    appendToTerminal(`║ OPENAI API  │ ${(settings.openaiApiKey ? 'CONNECTED' : 'OFFLINE').padEnd(23)} ║`)
    appendToTerminal(`║ PERPLEXITY  │ ${(settings.perplexityApiKey ? 'CONNECTED' : 'OFFLINE').padEnd(23)} ║`)
    appendToTerminal(`║ UPTIME      │ ${`${hours}h ${minutes}m ${seconds}s`.padEnd(23)} ║`)
    appendToTerminal(`║ ERRORS      │ ${systemStats.errors.toString().padEnd(23)} ║`)
    appendToTerminal(`║ CONNECTION  │ ${(isConnected ? 'ONLINE' : 'OFFLINE').padEnd(23)} ║`)
    appendToTerminal('╚══════════════════════════════════════════╝')
  }

  const showChatHistory = () => {
    setShowHistory(!showHistory)
    if (!showHistory) {
      appendToTerminal('> OPENING NEURAL HISTORY VIEWER...')
    } else {
      appendToTerminal('> CLOSING HISTORY VIEWER')
    }
  }

  const showStats = () => {
    const uptime = Math.floor((Date.now() - systemStats.uptime) / 1000)
    
    appendToTerminal('╔══════════════════════════════════════════╗')
    appendToTerminal('║             USAGE STATISTICS             ║')
    appendToTerminal('╠══════════════════════════════════════════╣')
    appendToTerminal(`║ TOTAL CHATS │ ${systemStats.totalChats.toString().padEnd(23)} ║`)
    appendToTerminal(`║ TOTAL TOKENS│ ${systemStats.totalTokens.toString().padEnd(23)} ║`)
    appendToTerminal(`║ AVG RESPONSE│ ${Math.round(systemStats.avgResponseTime)}ms`.padEnd(23) + ' ║')
    appendToTerminal(`║ VOICE TRANS │ ${transcriptionHistory.length.toString().padEnd(23)} ║`)
    appendToTerminal(`║ ERROR COUNT │ ${systemStats.errors.toString().padEnd(23)} ║`)
    appendToTerminal(`║ SESSION TIME│ ${Math.floor(uptime / 60)}m ${uptime % 60}s`.padEnd(23) + ' ║')
    appendToTerminal('╚══════════════════════════════════════════╝')
  }

  const exportChatHistory = () => {
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        chatHistory,
        transcriptionHistory,
        errorLogs,
        settings: { ...settings, openaiApiKey: '', perplexityApiKey: '' },
        stats: systemStats
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `neural-terminal-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      appendToTerminal('> CHAT HISTORY EXPORTED SUCCESSFULLY')
      appendToTerminal('> FILE DOWNLOADED TO DEFAULT FOLDER')
      logError('INFO', 'Chat history exported successfully')
    } catch (error) {
      appendToTerminal('> EXPORT FAILED: ' + error)
      logError('ERROR', 'Export failed', error)
    }
  }

  const resetSystem = () => {
    setChatHistory([])
    setTranscriptionHistory([])
    setTerminalOutput([])
    setErrorLogs([])
    setSystemStats({
      totalChats: 0,
      totalTokens: 0,
      avgResponseTime: 0,
      uptime: Date.now(),
      errors: 0
    })
    
    setTimeout(() => {
      initializeTerminal()
      appendToTerminal('> NEURAL INTERFACE RESET COMPLETE')
    }, 100)
  }

  return (
    <div className="min-h-screen bg-black text-terminal-green font-mono">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Terminal className="text-terminal-green glow-effect" size={32} />
            <h1 className="text-3xl font-bold text-terminal-green glow-text">
              NEURAL TERMINAL
            </h1>
            <div className="flex items-center gap-2 ml-4">
              {isConnected ? (
                <Wifi className="text-green-400" size={20} />
              ) : (
                <WifiOff className="text-red-400" size={20} />
              )}
              <div className="text-sm text-terminal-green opacity-70">v2.1</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 border border-terminal-green border-opacity-30 rounded text-terminal-green hover:border-opacity-60 hover:bg-terminal-green hover:bg-opacity-10 transition-all"
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button
              onClick={() => setShowTokens(!showTokens)}
              className="p-2 border border-terminal-green border-opacity-30 rounded text-terminal-green hover:border-opacity-60 hover:bg-terminal-green hover:bg-opacity-10 transition-all"
            >
              {showTokens ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className={`p-2 border rounded text-terminal-green transition-all ${
                systemStats.errors > 0 
                  ? 'border-red-400 text-red-400 animate-pulse' 
                  : 'border-terminal-green border-opacity-30 hover:border-opacity-60'
              }`}
            >
              {systemStats.errors > 0 ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 border border-terminal-green border-opacity-30 rounded text-terminal-green font-medium hover:border-opacity-60 hover:bg-terminal-green hover:bg-opacity-10 transition-all"
            >
              <Settings className="inline mr-2" size={16} />
              CONFIG
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-6 border border-terminal-green border-opacity-30 rounded-lg bg-gray-900 bg-opacity-30 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-terminal-green mb-4 flex items-center gap-2">
              <Brain size={20} />
              NEURAL CONFIGURATION MATRIX
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* API Keys */}
              <div className="space-y-4">
                <h4 className="text-terminal-green opacity-70 font-semibold">API CREDENTIALS</h4>
                <div>
                  <label className="block text-sm text-terminal-green opacity-70 mb-2">OPENAI API KEY</label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={settings.openaiApiKey}
                    onChange={(e) => setSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                    className="w-full p-3 bg-black border border-terminal-green border-opacity-30 rounded text-terminal-green font-mono focus:border-opacity-60 focus:bg-opacity-5 focus:bg-terminal-green transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-terminal-green opacity-70 mb-2">PERPLEXITY API KEY</label>
                  <input
                    type="password"
                    placeholder="pplx-..."
                    value={settings.perplexityApiKey}
                    onChange={(e) => setSettings(prev => ({ ...prev, perplexityApiKey: e.target.value }))}
                    className="w-full p-3 bg-black border border-terminal-green border-opacity-30 rounded text-terminal-green font-mono focus:border-opacity-60 focus:bg-opacity-5 focus:bg-terminal-green transition-all"
                  />
                </div>
              </div>

              {/* Model Settings */}
              <div className="space-y-4">
                <h4 className="text-terminal-green opacity-70 font-semibold">NEURAL PARAMETERS</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-terminal-green opacity-70 mb-2">TEMPERATURE</label>
                    <input
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      className="w-full p-3 bg-black border border-terminal-green border-opacity-30 rounded text-terminal-green font-mono focus:border-opacity-60 focus:bg-opacity-5 focus:bg-terminal-green transition-all"
                    />
                    <div className="text-xs text-terminal-green opacity-50 mt-1">Creativity level</div>
                  </div>
                  <div>
                    <label className="block text-sm text-terminal-green opacity-70 mb-2">MAX TOKENS</label>
                    <input
                      type="number"
                      min="1000"
                      max="8000"
                      step="500"
                      value={settings.maxTokens}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                      className="w-full p-3 bg-black border border-terminal-green border-opacity-30 rounded text-terminal-green font-mono focus:border-opacity-60 focus:bg-opacity-5 focus:bg-terminal-green transition-all"
                    />
                    <div className="text-xs text-terminal-green opacity-50 mt-1">Response length</div>
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'conversationMemory', label: 'Conversation Memory' },
                    { key: 'smartContext', label: 'Smart Context' },
                    { key: 'voiceAutoSend', label: 'Voice Auto-Send' },
                    { key: 'showTimestamps', label: 'Show Timestamps' },
                    { key: 'soundEffects', label: 'Sound Effects' },
                    { key: 'debugMode', label: 'Debug Mode' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={key}
                        checked={settings[key as keyof typeof settings] as boolean}
                        onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="w-4 h-4 accent-terminal-green"
                      />
                      <label htmlFor={key} className="text-sm text-terminal-green opacity-70">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={saveSettings}
                className="px-4 py-2 border border-terminal-green border-opacity-30 rounded text-terminal-green font-medium hover:border-opacity-60 hover:bg-terminal-green hover:bg-opacity-10 transition-all"
              >
                <Download className="inline mr-2" size={16} />
                SAVE CONFIG
              </button>
              <button
                onClick={loadSettings}
                className="px-4 py-2 border border-terminal-green border-opacity-30 rounded text-terminal-green font-medium hover:border-opacity-60 hover:bg-terminal-green hover:bg-opacity-10 transition-all"
              >
                <Upload className="inline mr-2" size={16} />
                LOAD CONFIG
              </button>
            </div>
          </div>
        )}

        {/* Error Log Panel */}
        {showLogs && (
          <div className="mb-6 p-4 border border-red-400 border-opacity-50 rounded-lg bg-red-900 bg-opacity-10">
            <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} />
              ERROR LOG VIEWER ({errorLogs.length})
            </h3>
            <div className="max-h-40 overflow-y-auto space-y-1 text-sm font-mono">
              {errorLogs.slice(-20).map((log, index) => (
                <div key={index} className={`${
                  log.level === 'ERROR' ? 'text-red-400' : 
                  log.level === 'WARN' ? 'text-yellow-400' : 
                  'text-terminal-green opacity-70'
                }`}>
                  [{new Date(log.timestamp).toLocaleTimeString()}] [{log.level}] {log.message}
                  {settings.debugMode && log.details && (
                    <div className="text-xs opacity-50 ml-4">
                      {JSON.stringify(log.details, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model Selector & Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="text-terminal-green" size={20} />
              <label className="text-terminal-green opacity-70">NEURAL MODEL:</label>
            </div>
            <select
              value={selectedLLM}
              onChange={(e) => setSelectedLLM(e.target.value)}
              className="px-4 py-2 bg-black border border-terminal-green border-opacity-30 rounded text-terminal-green font-mono focus:border-opacity-60 focus:bg-opacity-5 focus:bg-terminal-green transition-all"
            >
              {Object.entries(LLM_PROVIDERS).map(([name, config]) => (
                <option key={name} value={name} className="bg-black">
                  {name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-terminal-green font-medium">
              {isLoading ? (
                <span className="animate-pulse">NEURAL PROCESSING...</span>
              ) : (
                `STATUS: ${status}`
              )}
            </div>
            {isLoading && (
              <div className="animate-spin">
                <Cpu className="text-terminal-green" size={20} />
              </div>
            )}
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Terminal Output */}
          <div className="lg:col-span-2">
            <div 
              ref={terminalRef}
              className="h-96 bg-black border border-terminal-green border-opacity-30 p-4 rounded-lg overflow-y-auto font-mono text-sm terminal-glow"
              style={{
                boxShadow: '0 0 20px rgba(0, 255, 65, 0.1), inset 0 0 20px rgba(0, 255, 65, 0.05)'
              }}
            >
              {terminalOutput.map((line, index) => (
                <div key={index} className="text-terminal-green whitespace-pre-wrap break-words mb-1 glow-text">
                  {line}
                </div>
              ))}
              {isLoading && (
                <div className="text-terminal-green opacity-70 animate-pulse">
                  {'> NEURAL MATRIX COMPUTING...'}
                </div>
              )}
            </div>
          </div>

          {/* History/Stats Panel */}
          <div className="lg:col-span-1">
            {showHistory ? (
              <div className="h-96 bg-black border border-terminal-green border-opacity-30 p-4 rounded-lg overflow-y-auto">
                <h4 className="text-terminal-green font-bold mb-3 flex items-center gap-2">
                  <History size={16} />
                  NEURAL HISTORY
                </h4>
                <div className="space-y-2 text-sm">
                  {chatHistory.slice(-10).map((msg, index) => (
                    <div key={index} className="border-l-2 border-terminal-green border-opacity-30 pl-3">
                      <div className="text-terminal-green opacity-50 text-xs">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                        {msg.model && ` • ${msg.model}`}
                        {msg.tokens && showTokens && ` • ${msg.tokens}t`}
                      </div>
                      <div className={`${msg.role === 'user' ? 'text-blue-400' : 'text-terminal-green'} text-xs mt-1`}>
                        {msg.content.substring(0, 100)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-96 bg-black border border-terminal-green border-opacity-30 p-4 rounded-lg">
                <h4 className="text-terminal-green font-bold mb-3 flex items-center gap-2">
                  <Activity size={16} />
                  SYSTEM METRICS
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-terminal-green opacity-70">Chats:</span>
                    <span className="text-terminal-green">{systemStats.totalChats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-green opacity-70">Tokens:</span>
                    <span className="text-terminal-green">{systemStats.totalTokens}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-green opacity-70">Avg Response:</span>
                    <span className="text-terminal-green">{Math.round(systemStats.avgResponseTime)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-green opacity-70">Voice Logs:</span>
                    <span className="text-terminal-green">{transcriptionHistory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-green opacity-70">Errors:</span>
                    <span className={systemStats.errors > 0 ? 'text-red-400' : 'text-terminal-green'}>
                      {systemStats.errors}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-green opacity-70">Uptime:</span>
                    <span className="text-terminal-green">
                      {Math.floor((Date.now() - systemStats.uptime) / 60000)}m
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Command Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-6 mb-4">
          {[
            { icon: HelpCircle, label: 'HELP', action: () => showHelp() },
            { icon: History, label: 'LOGS', action: () => showChatHistory() },
            { icon: Trash2, label: 'CLEAR', action: () => { setTerminalOutput([]); appendToTerminal('> TERMINAL CLEARED'); } },
            { icon: Activity, label: 'STATUS', action: () => showStatus() },
            { icon: Download, label: 'EXPORT', action: () => exportChatHistory() },
            { icon: RotateCcw, label: 'RESET', action: () => resetSystem() }
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-terminal-green border-opacity-30 rounded-lg text-terminal-green font-medium hover:border-opacity-60 hover:bg-terminal-green hover:bg-opacity-10 transition-all"
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="ENTER NEURAL COMMAND OR MESSAGE..."
            className="flex-1 p-4 bg-black border border-terminal-green border-opacity-30 rounded-lg text-terminal-green placeholder-terminal-green placeholder-opacity-50 font-mono focus:border-opacity-60 focus:bg-opacity-5 focus:bg-terminal-green transition-all"
            style={{
              boxShadow: 'inset 0 0 10px rgba(0, 255, 65, 0.1)'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || isLoading}
            className="flex items-center gap-2 px-6 py-4 border border-terminal-green border-opacity-30 rounded-lg text-terminal-green font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-opacity-60 hover:bg-terminal-green hover:bg-opacity-10 transition-all"
          >
            <Send size={18} />
            SEND
          </button>
        </div>

        {/* Voice Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full py-6 rounded-xl font-bold text-xl transition-all duration-300 border-2 ${
            isRecording 
              ? 'border-red-400 text-red-400 bg-red-900 bg-opacity-20 animate-pulse' 
              : 'border-terminal-green text-terminal-green hover:bg-terminal-green hover:bg-opacity-10'
          }`}
          style={{
            boxShadow: isRecording 
              ? '0 0 30px rgba(255, 0, 0, 0.3)' 
              : '0 0 20px rgba(0, 255, 65, 0.2)'
          }}
        >
          {isRecording ? (
            <>
              <MicOff className="inline mr-3" size={24} />
              NEURAL RECORDING ACTIVE - CLICK TO STOP
            </>
          ) : (
            <>
              <Mic className="inline mr-3" size={24} />
              ACTIVATE VOICE NEURAL INTERFACE
            </>
          )}
        </button>

        {/* Stats Footer */}
        <div className="mt-6 text-center text-terminal-green opacity-50 text-sm">
          <div className="flex justify-center items-center gap-6">
            <span>CHATS: {systemStats.totalChats}</span>
            <span>TOKENS: {systemStats.totalTokens}</span>
            <span>AVG: {Math.round(systemStats.avgResponseTime)}ms</span>
            <span>ERRORS: {systemStats.errors}</span>
            <span>UPTIME: {Math.floor((Date.now() - systemStats.uptime) / 60000)}m</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glow-effect {
          filter: drop-shadow(0 0 10px #00ff41);
        }
        .glow-text {
          text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
        }
        .terminal-glow {
          box-shadow: 0 0 20px rgba(0, 255, 65, 0.1), inset 0 0 20px rgba(0, 255, 65, 0.05);
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #000;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 65, 0.3);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 65, 0.5);
        }
      `}</style>
    </div>
  )
}
