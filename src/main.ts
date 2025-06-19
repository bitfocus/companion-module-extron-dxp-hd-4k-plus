import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig, getModelInfo } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import * as net from 'net'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	private socket: net.Socket | null = null
	private reconnectTimeout: NodeJS.Timeout | null = null
	private commandQueue: string[] = []
	public isConnected = false

	// Dynamic matrix state tracking based on device model
	public matrixState: number[][] = []
	public deviceInfo = {
		model: '',
		version: '',
		serialNumber: '',
	}

	// Helper methods to get matrix dimensions
	public getInputCount(): number {
		return this.config?.device_model ? getModelInfo(this.config.device_model).inputs : 8
	}

	public getOutputCount(): number {
		return this.config?.device_model ? getModelInfo(this.config.device_model).outputs : 8
	}

	public initializeMatrix(): void {
		const inputCount = this.getInputCount()
		const outputCount = this.getOutputCount()
		this.matrixState = Array(outputCount)
			.fill(null)
			.map(() => Array(inputCount).fill(0))
	}

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateStatus(InstanceStatus.Connecting, 'Connecting to Extron DXP')

		// Initialize matrix based on device model
		this.initializeMatrix()

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions

		this.initConnection()
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'Destroying module')
		this.disconnect()
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config

		// Reinitialize matrix if device model changed
		this.initializeMatrix()

		// Update actions and feedbacks to use new model/labels
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()

		this.disconnect()
		this.initConnection()
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	private initConnection(): void {
		this.disconnect()

		if (!this.config.host || !this.config.port) {
			this.updateStatus(InstanceStatus.BadConfig, 'IP and Port must be configured')
			return
		}

		this.socket = new net.Socket()

		this.socket.on('connect', () => {
			const modelInfo = getModelInfo(this.config.device_model)
			this.log('info', `Connected to ${modelInfo.name} at ${this.config.host}:${this.config.port}`)
			this.isConnected = true
			this.updateStatus(InstanceStatus.Ok)

			// Send initial commands to get device info and current state
			this.sendCommand('I') // Get device info
			this.sendCommand('0*!') // Get all route status
		})

		this.socket.on('data', (data) => {
			this.handleResponse(data.toString())
		})

		this.socket.on('error', (err) => {
			this.log('error', `Socket error: ${err.message}`)
			this.isConnected = false
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
			this.scheduleReconnect()
		})

		this.socket.on('close', () => {
			this.log('warn', 'Connection closed')
			this.isConnected = false
			this.updateStatus(InstanceStatus.Disconnected)
			this.scheduleReconnect()
		})

		this.socket.connect(this.config.port, this.config.host)
	}

	private disconnect(): void {
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout)
			this.reconnectTimeout = null
		}

		if (this.socket) {
			this.socket.removeAllListeners()
			this.socket.destroy()
			this.socket = null
		}

		this.isConnected = false
	}

	private scheduleReconnect(): void {
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout)
		}

		this.reconnectTimeout = setTimeout(() => {
			this.log('info', 'Attempting to reconnect...')
			this.initConnection()
		}, this.config.reconnect_interval || 5000)
	}

	public sendCommand(command: string): void {
		if (this.isConnected && this.socket) {
			this.log('debug', `Sending command: ${command}`)
			this.socket.write(command + '\r\n')
		} else {
			this.log('warn', `Cannot send command "${command}" - not connected`)
			this.commandQueue.push(command)
		}
	}

	private handleResponse(data: string): void {
		this.log('debug', `Received: ${data}`)

		const lines = data.trim().split('\r\n')

		for (const line of lines) {
			if (!line) continue

			// Parse different response types
			if (line.includes('Out') && line.includes('In')) {
				// Route response: "Out01 In03" means output 1 is connected to input 3
				this.parseRouteResponse(line)
			} else if (line.startsWith('DXP')) {
				// Device info response
				this.parseDeviceInfo(line)
			}
		}

		this.checkFeedbacks()
		this.updateVariables()
	}

	private parseRouteResponse(response: string): void {
		// Parse "Out01 In03" format
		const match = response.match(/Out(\d+)\s+In(\d+)/)
		if (match) {
			const output = parseInt(match[1]) - 1 // Convert to 0-based
			const input = parseInt(match[2]) - 1 // Convert to 0-based

			const inputCount = this.getInputCount()
			const outputCount = this.getOutputCount()

			if (output >= 0 && output < outputCount && input >= 0 && input < inputCount) {
				this.matrixState[output][input] = 1
				// Clear other inputs for this output
				for (let i = 0; i < inputCount; i++) {
					if (i !== input) {
						this.matrixState[output][i] = 0
					}
				}
			}
		}
	}

	private parseDeviceInfo(response: string): void {
		// Parse device info from response
		if (response.includes('DXP')) {
			this.deviceInfo.model = response
		}
	}

	private updateVariables(): void {
		const variables: { [key: string]: string | number } = {
			connection_status: this.isConnected ? 'Connected' : 'Disconnected',
			device_model: this.deviceInfo.model || 'Unknown',
			device_version: this.deviceInfo.version || 'Unknown',
			device_serial: this.deviceInfo.serialNumber || 'Unknown',
		}

		// Calculate routing information using dynamic matrix size
		let totalActiveRoutes = 0
		let disconnectedOutputs = 0
		const inputCount = this.getInputCount()
		const outputCount = this.getOutputCount()

		for (let output = 0; output < outputCount; output++) {
			let outputHasInput = false
			for (let input = 0; input < inputCount; input++) {
				if (this.matrixState[output][input] === 1) {
					// Use custom input label
					const inputLabelKey = `input_${input + 1}_label` as keyof typeof this.config
					const inputLabel = (this.config[inputLabelKey] as string) || `Input ${input + 1}`
					variables[`output_${output + 1}_source`] = inputLabel
					totalActiveRoutes++
					outputHasInput = true
					break
				}
			}
			if (!outputHasInput) {
				variables[`output_${output + 1}_source`] = 'None'
				disconnectedOutputs++
			}
		}

		// Calculate input usage using dynamic matrix size
		for (let input = 0; input < inputCount; input++) {
			let usageCount = 0
			for (let output = 0; output < outputCount; output++) {
				if (this.matrixState[output][input] === 1) {
					usageCount++
				}
			}
			variables[`input_${input + 1}_usage_count`] = usageCount
		}

		variables.total_active_routes = totalActiveRoutes
		variables.disconnected_outputs = disconnectedOutputs

		this.setVariableValues(variables)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
