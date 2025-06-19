import { combineRgb, type CompanionFeedbackDefinitions, type CompanionFeedbackInfo } from '@companion-module/base'
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

// Helper function to get input label by number
function getInputLabel(self: ModuleInstance, inputNumber: number): string {
	const labelKey = `input_${inputNumber}_label` as keyof typeof self.config
	return (self.config[labelKey] as string) || `Input ${inputNumber}`
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	const feedbacks: CompanionFeedbackDefinitions = {
		// Check if specific input is routed to specific output
		input_routed_to_output: {
			type: 'boolean' as const,
			name: 'Input Routed to Output',
			description: 'Shows if a specific input is routed to a specific output',
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
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(255, 255, 255),
			},
			callback: (feedback: CompanionFeedbackInfo) => {
				const input = (feedback.options.input as number) - 1 // Convert to 0-based
				const output = (feedback.options.output as number) - 1 // Convert to 0-based

				const inputCount = self.getInputCount()
				const outputCount = self.getOutputCount()

				if (input >= 0 && input < inputCount && output >= 0 && output < outputCount) {
					return self.matrixState[output][input] === 1
				}
				return false
			},
		},

		// Check connection status
		connection_status: {
			type: 'boolean' as const,
			name: 'Connection Status',
			description: 'Shows if device is connected',
			options: [],
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(255, 255, 255),
			},
			callback: () => {
				return self.isConnected
			},
		},

		// Show current input for an output
		output_source: {
			type: 'advanced' as const,
			name: 'Output Source Display',
			description: 'Shows which input is currently routed to an output',
			options: [
				{
					id: 'output',
					type: 'dropdown' as const,
					label: 'Output',
					default: 1,
					choices: getOutputChoices(self),
				},
			],
			callback: (feedback: CompanionFeedbackInfo) => {
				const output = (feedback.options.output as number) - 1 // Convert to 0-based

				const inputCount = self.getInputCount()
				const outputCount = self.getOutputCount()

				if (output >= 0 && output < outputCount) {
					// Find which input is routed to this output
					for (let input = 0; input < inputCount; input++) {
						if (self.matrixState[output][input] === 1) {
							const inputLabel = getInputLabel(self, input + 1)
							return {
								text: inputLabel,
								bgcolor: combineRgb(0, 150, 255),
								color: combineRgb(255, 255, 255),
							}
						}
					}
					// No input routed
					return {
						text: 'No Input',
						bgcolor: combineRgb(100, 100, 100),
						color: combineRgb(255, 255, 255),
					}
				}

				return {
					text: 'Error',
					bgcolor: combineRgb(255, 0, 0),
					color: combineRgb(255, 255, 255),
				}
			},
		},

		// Show device model
		device_model: {
			type: 'advanced' as const,
			name: 'Device Model',
			description: 'Shows the device model information',
			options: [],
			callback: () => {
				return {
					text: self.deviceInfo.model || 'Unknown',
					bgcolor: combineRgb(50, 50, 50),
					color: combineRgb(255, 255, 255),
				}
			},
		},

		// Check if output is disconnected
		output_disconnected: {
			type: 'boolean' as const,
			name: 'Output Disconnected',
			description: 'Shows if an output has no input routed to it',
			options: [
				{
					id: 'output',
					type: 'dropdown' as const,
					label: 'Output',
					default: 1,
					choices: getOutputChoices(self),
				},
			],
			defaultStyle: {
				bgcolor: combineRgb(255, 165, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: (feedback: CompanionFeedbackInfo) => {
				const output = (feedback.options.output as number) - 1 // Convert to 0-based

				const inputCount = self.getInputCount()
				const outputCount = self.getOutputCount()

				if (output >= 0 && output < outputCount) {
					// Check if any input is routed to this output
					for (let input = 0; input < inputCount; input++) {
						if (self.matrixState[output][input] === 1) {
							return false // Input is routed
						}
					}
					return true // No input routed
				}
				return false
			},
		},

		// Multi-output routing feedback
		input_routing_count: {
			type: 'advanced' as const,
			name: 'Input Routing Count',
			description: 'Shows how many outputs an input is routed to',
			options: [
				{
					id: 'input',
					type: 'dropdown' as const,
					label: 'Input',
					default: 1,
					choices: getInputChoices(self),
				},
			],
			callback: (feedback: CompanionFeedbackInfo) => {
				const input = (feedback.options.input as number) - 1 // Convert to 0-based

				const inputCount = self.getInputCount()
				const outputCount = self.getOutputCount()

				if (input >= 0 && input < inputCount) {
					let count = 0
					for (let output = 0; output < outputCount; output++) {
						if (self.matrixState[output][input] === 1) {
							count++
						}
					}

					let bgcolor = combineRgb(100, 100, 100)
					if (count === 0) {
						bgcolor = combineRgb(80, 80, 80)
					} else if (count === 1) {
						bgcolor = combineRgb(0, 150, 255)
					} else {
						bgcolor = combineRgb(255, 150, 0)
					}

					return {
						text: count.toString(),
						bgcolor,
						color: combineRgb(255, 255, 255),
					}
				}

				return {
					text: '?',
					bgcolor: combineRgb(255, 0, 0),
					color: combineRgb(255, 255, 255),
				}
			},
		},
	}

	self.setFeedbackDefinitions(feedbacks)
}
