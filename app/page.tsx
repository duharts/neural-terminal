'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Send, Settings, HelpCircle, History, Trash2, Activity, Sliders, Terminal, Zap } from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  model?: string
}

interface TranscriptionEntry {
  text: string
  timestamp: number
  confidence?: number
}

const LLM_PROVIDERS = {
  'ChatGPT': { endpoint: '/api/chat', model: 'gpt-3.5-turbo' },
  'GPT-4': { endpoint: '/api/chat', model: 'gpt-4' },
  'Perplexity': { endpoint: '/api/chat', model: 'perplexity' }
}

export default function VoiceTerminal() {
  const [isRecording, setIsRecording] = useState(false)
  const [message, setMessage] = useState('')
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([])
  const [selectedLLM, setSelectedLLM] = useState('ChatGPT')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('SYSTEM READY')
  const [settings, setSettings] = useState({
    openaiApiKey: '',
    perplexityApiKey: '',
    temperature: 0.7,
    maxTokens: 1000
  })
  const [showSettings, setShowSettings] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    appendToTerminal('╔══════════════════════════════════════════╗')
    appendToTerminal('║      VOICE TERMINAL v2.1 - WEB EDITION  ║')
    appendToTerminal('╚══════════════════════════════════════════╝')
    appendToTerminal('')
    appendToTerminal('> INITIALIZING NEURAL INTERFACE...')
    appendToTerminal('> VOICE RECOGNITION: ONLINE')
    appendToTerminal('> AI MODELS: READY')
    appendToTerminal(`> ACTIVE MODEL: ${selectedLLM}`)
    appendToTerminal('')
    appendToTerminal('TYPE "help" FOR COMMANDS')
    appendToTerminal('CLICK [MIC] FOR VOICE INPUT')
    appendToTerminal('')
    appendToTerminal('SYSTEM READY > _')
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalOutput])

  const appendToTerminal = (text: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false })
    setTerminalOutput(prev => [...prev, `[${timestamp}] ${text}`])
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        await processAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setStatus('RECORDING ACTIVE')
      appendToTerminal('> VOICE CAPTURE INITIATED')
      appendToTerminal('> SPEAK NOW...')
    } catch (error) {
      appendToTerminal(`> ERROR: MICROPHONE ACCESS DENIED`)
      setStatus('MIC ERROR')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setStatus('PROCESSING...')
      appendToTerminal('> ENDING VOICE CAPTURE')
      appendToTerminal('> PROCESSING AUDIO DATA...')
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    try {
      setStatus('NEURAL TRANSCRIPTION...')
      
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const { text } = await response.json()
        if (text) {
          appendToTerminal(`> TRANSCRIPT: "${text}"`)
          setMessage(text)
          
          const entry: TranscriptionEntry = {
            text,
            timestamp: Date.now(),
            confidence: 0.95
          }
          setTranscriptionHistory(prev => [...prev, entry])
          
          appendToTerminal('> AUTO-SENDING TO AI NEURAL NET...')
          await sendToLLM(text)
        } else {
          appendToTerminal('> NO SPEECH DETECTED')
        }
      } else {
        appendToTerminal('> TRANSCRIPTION FAILED')
      }
    } catch (error) {
      appendToTerminal(`> PROCESSING ERROR: ${error}`)
    } finally {
      setStatus('SYSTEM READY')
    }
  }

  const sendMessage = async () => {
    if (!message.trim()) return

    const cmd = message.toLowerCase().trim()
    if (cmd === 'help') {
      showHelp()
      setMessage('')
      return
    }
    if (cmd === 'clear') {
      setTerminalOutput([])
      appendToTerminal('> TERMINAL CLEARED')
      setMessage('')
      return
    }
    if (cmd === 'status') {
      showStatus()
      setMessage('')
      return
    }
    if (cmd === 'history') {
      showHistory()
      setMessage('')
      return
    }

    appendToTerminal(`> USER: ${message}`)
    const userMessage = message
    setMessage('')
    
    await sendToLLM(userMessage)
  }

  const sendToLLM = async (text: string) => {
    setIsLoading(true)
    setStatus(`NEURAL LINK: ${selectedLLM}`)

    try {
      const provider = LLM_PROVIDERS[selectedLLM as keyof typeof LLM_PROVIDERS]
      
      const response = await fetch(provider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          model: provider.model,
          history: chatHistory.slice(-10),
          settings
        }),
      })

      if (response.ok) {
        const { reply } = await response.json()
        
        const userMsg: ChatMessage = { role: 'user', content: text, timestamp: Date.now() }
        const assistantMsg: ChatMessage = { role: 'assistant', content: reply, timestamp: Date.now(), model: selectedLLM }
        
        setChatHistory(prev => [...prev, userMsg, assistantMsg])
        appendToTerminal(`> ${selectedLLM}: ${reply}`)
        appendToTerminal('> RESPONSE COPIED TO CLIPBOARD')
        
        navigator.clipboard.writeText(reply).catch(() => {})
      } else {
        appendToTerminal(`> ERROR: CONNECTION FAILED [${response.status}]`)
      }
    } catch (error) {
      appendToTerminal(`> NEURAL LINK ERROR: ${error}`)
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
    appendToTerminal('║ history  │ Show neural conversation log   ║')
    appendToTerminal('║ [MIC]    │ Voice neural interface         ║')
    appendToTerminal('╚══════════════════════════════════════════╝')
  }

  const showStatus = () => {
    appendToTerminal('╔══════════════════════════════════════════╗')
    appendToTerminal('║            SYSTEM DIAGNOSTICS            ║')
    appendToTerminal('╠══════════════════════════════════════════╣')
    appendToTerminal(`║ VERSION     │ Voice Terminal v2.1 Web    ║`)
    appendToTerminal(`║ AI MODEL    │ ${selectedLLM.padEnd(23)} ║`)
    appendToTerminal(`║ TEMPERATURE │ ${settings.temperature.toFixed(1).padEnd(23)} ║`)
    appendToTerminal(`║ MAX TOKENS  │ ${settings.maxTokens.toString().padEnd(23)} ║`)
    appendToTerminal(`║ OPENAI API  │ ${(settings.openaiApiKey ? 'CONNECTED' : 'OFFLINE').padEnd(23)} ║`)
    appendToTerminal(`║ PERPLEXITY  │ ${(settings.perplexityApiKey ? 'CONNECTED' : 'OFFLINE').padEnd(23)} ║`)
    appendToTerminal(`║ CHAT LOGS   │ ${chatHistory.length.toString().padEnd(23)} ║`)
    appendToTerminal(`║ VOICE LOGS  │ ${transcriptionHistory.length.toString().padEnd(23)} ║`)
    appendToTerminal('╚══════════════════════════════════════════╝')
  }

  const showHistory = () => {
    appendToTerminal('╔══════════════════════════════════════════╗')
    appendToTerminal('║             NEURAL HISTORY LOG           ║')
    appendToTerminal('╚══════════════════════════════════════════╝')
    if (chatHistory.length === 0) {
      appendToTerminal('> NO CONVERSATION DATA FOUND')
    } else {
      appendToTerminal(`> TOTAL NEURAL EXCHANGES: ${chatHistory.length}`)
      chatHistory.slice(-5).forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleTimeString('en-US', { hour12: false })
        const role = msg.role === 'user' ? 'USER' : msg.model || 'AI'
        appendToTerminal(`> [${time}] ${role}: ${msg.content.substring(0, 40)}...`)
      })
    }
    appendToTerminal(`> VOICE TRANSCRIPTS: ${transcriptionHistory.length}`)
  }

  return (
    <div className="min-h-screen bg-terminal-black p-6 font-mono">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Terminal className="text-terminal-green" size={32} />
            <h1 className="text-2xl font-bold text-terminal-green terminal-text">
              NEURAL TERMINAL
            </h1>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="button-glow px-4 py-2 rounded-lg text-terminal-green font-medium"
          >
            <Settings className="inline mr-2" size={16} />
            CONFIG
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="terminal-glow mb-6 p-6 rounded-lg bg-terminal-black-light">
            <h3 className="text-lg font-bold text-terminal-green mb-4 flex items-center gap-2">
              <Zap size={20} />
              NEURAL INTERFACE CONFIG
            </h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-terminal-green-dim mb-2">OPENAI API KEY</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={settings.openaiApiKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                  className="w-full p-3 bg-terminal-black border border-terminal-green-border rounded text-terminal-green input-glow font-mono"
                />
              </div>
              <div>
                <label className="block text-sm text-terminal-green-dim mb-2">PERPLEXITY API KEY</label>
                <input
                  type="password"
                  placeholder="pplx-..."
                  value={settings.perplexityApiKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, perplexityApiKey: e.target.value }))}
                  className="w-full p-3 bg-terminal-black border border-terminal-green-border rounded text-terminal-green input-glow font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-terminal-green-dim mb-2">TEMPERATURE</label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full p-3 bg-terminal-black border border-terminal-green-border rounded text-terminal-green input-glow font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm text-terminal-green-dim mb-2">MAX TOKENS</label>
                  <input
                    type="number"
                    min="100"
                    max="4000"
                    value={settings.maxTokens}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                    className="w-full p-3 bg-terminal-black border border-terminal-green-border rounded text-terminal-green input-glow font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Model Selector & Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <label className="text-terminal-green-dim">NEURAL MODEL:</label>
            <select
              value={selectedLLM}
              onChange={(e) => setSelectedLLM(e.target.value)}
              className="px-4 py-2 bg-terminal-black border border-terminal-green-border rounded text-terminal-green button-glow font-mono"
            >
              {Object.keys(LLM_PROVIDERS).map(llm => (
                <option key={llm} value={llm} className="bg-terminal-black">{llm}</option>
              ))}
            </select>
          </div>
          <div className="text-terminal-green terminal-text font-medium">
            {isLoading ? (
              <span className="loading-dots">PROCESSING...</span>
            ) : (
              `STATUS: ${status}`
            )}
          </div>
        </div>

        {/* Terminal Output */}
        <div 
          ref={terminalRef}
          className="terminal-glow h-96 bg-terminal-black p-4 rounded-lg mb-4 overflow-y-auto terminal-scrollbar font-mono text-sm"
        >
          {terminalOutput.map((line, index) => (
            <div key={index} className="text-terminal-green whitespace-pre-wrap break-words terminal-text">
              {line}
            </div>
          ))}
          {isLoading && (
            <div className="text-terminal-green-dim loading-dots">
              > NEURAL PROCESSING...
            </div>
          )}
        </div>

        {/* Command Buttons */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          <button
            onClick={showHelp}
            className="button-glow flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-terminal-green font-medium"
          >
            <HelpCircle size={16} />
            HELP
          </button>
          <button
            onClick={showHistory}
            className="button-glow flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-terminal-green font-medium"
          >
            <History size={16} />
            LOGS
          </button>
          <button
            onClick={() => { setTerminalOutput([]); appendToTerminal('> TERMINAL CLEARED'); }}
            className="button-glow flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-terminal-green font-medium"
          >
            <Trash2 size={16} />
            CLEAR
          </button>
          <button
            onClick={showStatus}
            className="button-glow flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-terminal-green font-medium"
          >
            <Activity size={16} />
            STATUS
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="button-glow flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-terminal-green font-medium bg-terminal-green-border"
          >
            <Sliders size={16} />
            CONFIG
          </button>
        </div>

        {/* Input */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="ENTER COMMAND OR MESSAGE..."
            className="flex-1 p-4 bg-terminal-black border border-terminal-green-border rounded-lg text-terminal-green placeholder-terminal-green-dim input-glow font-mono"
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || isLoading}
            className="button-glow flex items-center gap-2 px-6 py-4 rounded-lg text-terminal-green font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            SEND
          </button>
        </div>

        {/* Voice Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full py-6 rounded-xl font-bold text-xl transition-all duration-300 ${
            isRecording 
              ? 'mic-recording text-red-400' 
              : 'mic-button text-terminal-green'
          }`}
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
      </div>
    </div>
  )
}
