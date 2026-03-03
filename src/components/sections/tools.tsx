'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calculator, Zap } from 'lucide-react'

interface LLMSpec {
    name: string
    parameters: number
    vram_per_param: number // in GB
    inference_vram: number // in GB
}

interface RateLimitConfig {
    requests: number
    timeWindow: number
    allowed: number
}

export function ToolsSection() {
    const [activeTab, setActiveTab] = useState<'llm' | 'ratelimit'>('llm')
    const [llmModel, setLlmModel] = useState<'7b' | '13b' | '70b'>('7b')
    const [rateLimitConfig, setRateLimitConfig] = useState<RateLimitConfig>({
        requests: 100,
        timeWindow: 60,
        allowed: 10,
    })

    const llmSpecs: Record<string, LLMSpec> = {
        '7b': { name: 'Llama 7B', parameters: 7, vram_per_param: 0.002, inference_vram: 16 },
        '13b': { name: 'Llama 13B', parameters: 13, vram_per_param: 0.002, inference_vram: 28 },
        '70b': { name: 'Llama 70B', parameters: 70, vram_per_param: 0.002, inference_vram: 160 },
    }

    const selectedModel = llmSpecs[llmModel]
    const trainingVram = selectedModel.parameters * selectedModel.vram_per_param
    const inferenceVram = selectedModel.inference_vram
    const totalVram = trainingVram + inferenceVram

    const estimatedGPUs = Math.ceil(inferenceVram / 40) // Assuming 40GB GPUs

    const calculateRateLimit = () => {
        const requestsPerSecond = (rateLimitConfig.requests / rateLimitConfig.timeWindow)
        return (requestsPerSecond * 1000).toFixed(2)
    }

    return (
        <section className="py-20 px-4 md:px-8 bg-white dark:bg-slate-950">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-12 text-slate-900 dark:text-white">Custom Tools</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Tool 1: LLM Hardware Calculator */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-8">
                        <div className="flex items-center mb-6">
                            <Calculator className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">LLM Hardware Calculator</h3>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                Select Model
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['7b', '13b', '70b'].map((size) => (
                                    <Button
                                        key={size}
                                        variant={llmModel === size ? 'default' : 'outline'}
                                        onClick={() => setLlmModel(size as '7b' | '13b' | '70b')}
                                        className="w-full"
                                    >
                                        {size.toUpperCase()}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 bg-white dark:bg-slate-950 rounded-lg p-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Model:</span>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{selectedModel.name}</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Parameters:</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedModel.parameters}B</span>
                                </div>
                            </div>

                            <hr className="border-slate-200 dark:border-slate-700" />

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Training VRAM:</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{trainingVram.toFixed(1)} GB</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Inference VRAM:</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{inferenceVram} GB</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Estimated GPUs:</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{estimatedGPUs}x A100 (40GB)</span>
                                </div>
                            </div>

                            <hr className="border-slate-200 dark:border-slate-700" />

                            <div className="bg-blue-100 dark:bg-blue-900/30 rounded p-3">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-slate-900 dark:text-white">Total VRAM:</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">{totalVram.toFixed(1)} GB</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tool 2: API Rate Limiter */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-8">
                        <div className="flex items-center mb-6">
                            <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">API Rate Limiter</h3>
                        </div>

                        <div className="space-y-6 bg-white dark:bg-slate-950 rounded-lg p-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Total Requests
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="1000"
                                    step="10"
                                    value={rateLimitConfig.requests}
                                    onChange={(e) => setRateLimitConfig({ ...rateLimitConfig, requests: parseInt(e.target.value) })}
                                    className="w-full"
                                />
                                <div className="flex justify-between mt-2">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Min</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{rateLimitConfig.requests}</span>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Max</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Time Window (seconds)
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="3600"
                                    step="1"
                                    value={rateLimitConfig.timeWindow}
                                    onChange={(e) => setRateLimitConfig({ ...rateLimitConfig, timeWindow: parseInt(e.target.value) })}
                                    className="w-full"
                                />
                                <div className="flex justify-between mt-2">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">1s</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{rateLimitConfig.timeWindow}s</span>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">3600s</span>
                                </div>
                            </div>

                            <hr className="border-slate-200 dark:border-slate-700" />

                            <div className="bg-purple-100 dark:bg-purple-900/30 rounded p-4">
                                <div className="flex justify-between mb-3">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Configuration:</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Requests/Second:</span>
                                        <span className="font-bold text-purple-600 dark:text-purple-400">{calculateRateLimit()} req/ms</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Burst Window:</span>
                                        <span className="font-bold text-purple-600 dark:text-purple-400">{rateLimitConfig.timeWindow}s</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Max Concurrent:</span>
                                        <span className="font-bold text-purple-600 dark:text-purple-400">{rateLimitConfig.requests}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-100 dark:bg-slate-700/50 rounded p-4 text-xs text-slate-600 dark:text-slate-400">
                                <p className="font-semibold mb-2">💡 Implementation Tips:</p>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Use sliding window algorithm for accuracy</li>
                                    <li>Store counters in Redis for distributed systems</li>
                                    <li>Consider burst allowance for spikes</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
