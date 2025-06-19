import type { CompanionActionEvent, CompanionActionDefinitions } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

// Helper functions to get choices with custom labels based on device model
function getInputChoices(self: ModuleInstance) {
	const inputCount = self.getInputCount()
	return Array.from({ length: inputCount }, (_, i) => {
		const labelKey = `input_${i + 1}_label` as keyof typeof self.config
		const customLabel = (self.config[labelKey] as string) || `Input ${i + 1}`
		return {
			id: i + 1,
			label: customLabel,
		}
	})
}

function getOutputChoices(self: ModuleInstance) {
	const outputCount = self.getOutputCount()
	return Array.from({ length: outputCount }, (_, i) => {
		const labelKey = `output_${i + 1}_label` as keyof typeof self.config
		const customLabel = (self.config[labelKey] as string) || `Output ${i + 1}`
		return {
			id: i + 1,
			label: customLabel,
		}
	})
}

export function UpdateActions(self: ModuleInstance): void {
	const actions: CompanionActionDefinitions = {
		// Route specific input to specific output
		route_input_output: {
			name: 'Route Input to Output',
			options: [
				{
					id: 'input',
					type: 'dropdown' as const,
					label: 'Input',
					default: 1,
					choices: getInputChoices(self),
				},
				{
					id: 'output',
					type: 'dropdown' as const,
					label: 'Output',
					default: 1,
					choices: getOutputChoices(self),
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const input = event.options.input as number
				const output = event.options.output as number
				const command = `${input}*${output}!`
				self.sendCommand(command)
			},
		},

		// Route input to all outputs
		route_input_all: {
			name: 'Route Input to All Outputs',
			options: [
				{
					id: 'input',
					type: 'dropdown' as const,
					label: 'Input',
					default: 1,
					choices: getInputChoices(self),
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const input = event.options.input as number
				const command = `${input}*!`
				self.sendCommand(command)
			},
		},

		// Disconnect output
		disconnect_output: {
			name: 'Disconnect Output',
			options: [
				{
					id: 'output',
					type: 'dropdown' as const,
					label: 'Output',
					default: 1,
					choices: getOutputChoices(self),
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const output = event.options.output as number
				const command = `0*${output}!`
				self.sendCommand(command)
			},
		},

		// Save preset
		save_preset: {
			name: 'Save Preset',
			options: [
				{
					id: 'preset',
					type: 'number' as const,
					label: 'Preset Number',
					default: 1,
					min: 1,
					max: 32,
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const preset = event.options.preset as number
				const command = `${preset},`
				self.sendCommand(command)
			},
		},

		// Recall preset
		recall_preset: {
			name: 'Recall Preset',
			options: [
				{
					id: 'preset',
					type: 'number' as const,
					label: 'Preset Number',
					default: 1,
					min: 1,
					max: 32,
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const preset = event.options.preset as number
				const command = `${preset}.`
				self.sendCommand(command)
			},
		},

		// Get device info
		get_device_info: {
			name: 'Get Device Information',
			options: [],
			callback: async () => {
				self.sendCommand('I')
			},
		},

		// Get current routing status
		get_routing_status: {
			name: 'Get Routing Status',
			options: [],
			callback: async () => {
				self.sendCommand('0*!')
			},
		},

		// Reset device
		reset_device: {
			name: 'Reset Device',
			options: [
				{
					id: 'confirm',
					type: 'checkbox' as const,
					label: 'Confirm Reset (This will reboot the device)',
					default: false,
				},
			],
			callback: async (event: CompanionActionEvent) => {
				if (event.options.confirm) {
					self.sendCommand('1Z')
				}
			},
		},

		// Front panel lock
		front_panel_lock: {
			name: 'Front Panel Lock',
			options: [
				{
					id: 'lock',
					type: 'dropdown' as const,
					label: 'Lock State',
					default: 'unlock',
					choices: [
						{ id: 'lock', label: 'Lock' },
						{ id: 'unlock', label: 'Unlock' },
					],
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const command = event.options.lock === 'lock' ? '1X' : '0X'
				self.sendCommand(command)
			},
		},

		// Volume control for audio outputs (if supported)
		set_volume: {
			name: 'Set Audio Volume',
			options: [
				{
					id: 'output',
					type: 'dropdown' as const,
					label: 'Audio Output',
					default: 1,
					choices: getOutputChoices(self),
				},
				{
					id: 'volume',
					type: 'number' as const,
					label: 'Volume Level',
					default: 50,
					min: 0,
					max: 100,
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const output = event.options.output as number
				const volume = event.options.volume as number
				// Convert 0-100 to Extron's volume range (typically 0-64)
				const extronVolume = Math.round((volume / 100) * 64)
				const command = `${extronVolume}*${output}V`
				self.sendCommand(command)
			},
		},

		// Mute/Unmute audio output
		mute_output: {
			name: 'Mute/Unmute Audio Output',
			options: [
				{
					id: 'output',
					type: 'dropdown' as const,
					label: 'Audio Output',
					default: 1,
					choices: getOutputChoices(self),
				},
				{
					id: 'mute',
					type: 'dropdown' as const,
					label: 'Mute State',
					default: 'mute',
					choices: [
						{ id: 'mute', label: 'Mute' },
						{ id: 'unmute', label: 'Unmute' },
					],
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const output = event.options.output as number
				const command = event.options.mute === 'mute' ? `${output}*Z` : `${output}*z`
				self.sendCommand(command)
			},
		},
	}

	self.setActionDefinitions(actions)
}
