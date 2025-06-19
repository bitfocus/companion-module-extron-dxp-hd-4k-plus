import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

// Define supported DXP HD 4K Plus models
export const DXP_MODELS = {
	dxp44: { name: 'DXP 44 HD 4K Plus', inputs: 4, outputs: 4 },
	dxp66: { name: 'DXP 66 HD 4K Plus', inputs: 6, outputs: 6 },
	dxp84: { name: 'DXP 84 HD 4K Plus', inputs: 8, outputs: 4 },
	dxp88: { name: 'DXP 88 HD 4K Plus', inputs: 8, outputs: 8 },
	dxp1212: { name: 'DXP 1212 HD 4K Plus', inputs: 12, outputs: 12 },
	dxp1616: { name: 'DXP 1616 HD 4K Plus', inputs: 16, outputs: 16 },
} as const

export type DXPModel = keyof typeof DXP_MODELS

export interface ModuleConfig {
	host: string
	port: number
	reconnect_interval: number
	device_model: DXPModel
	// Dynamic input labels - will be generated based on model
	[key: `input_${number}_label`]: string
	// Dynamic output labels - will be generated based on model
	[key: `output_${number}_label`]: string
}

// Helper function to get model info
export function getModelInfo(model: DXPModel): { name: string; inputs: number; outputs: number } {
	return DXP_MODELS[model]
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	const fields: SomeCompanionConfigField[] = [
		{
			type: 'dropdown',
			id: 'device_model',
			label: 'Device Model',
			width: 6,
			default: 'dxp88',
			choices: Object.entries(DXP_MODELS).map(([id, info]) => ({
				id,
				label: info.name,
			})),
			tooltip: 'Select your specific DXP HD 4K Plus model',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Extron DXP IP Address',
			width: 8,
			regex: Regex.IP,
			default: '192.168.1.100',
		},
		{
			type: 'number',
			id: 'port',
			label: 'TCP Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 23,
			tooltip: 'Extron devices typically use port 23 (Telnet)',
		},
		{
			type: 'number',
			id: 'reconnect_interval',
			label: 'Reconnect Interval (ms)',
			width: 6,
			min: 1000,
			max: 30000,
			default: 5000,
			tooltip: 'Time between reconnection attempts',
		},
		{
			type: 'static-text',
			id: 'labels_info',
			label: 'Custom Labels Information',
			value:
				'Only configure labels for the inputs and outputs that your selected device model actually has. Labels for non-existent inputs/outputs will be ignored.',
			width: 12,
		},
		{
			type: 'static-text',
			id: 'input_labels_header',
			label: 'Input Labels',
			value:
				'• DXP 44: Inputs 1-4  • DXP 66: Inputs 1-6  • DXP 84/88: Inputs 1-8  • DXP 1212: Inputs 1-12  • DXP 1616: Inputs 1-16',
			width: 12,
		},
	]

	// Add input label fields with model indicators
	for (let i = 1; i <= 16; i++) {
		const applicableModels = Object.entries(DXP_MODELS)
			.filter(([, info]) => info.inputs >= i)
			.map(([, info]) => info.name.replace(' HD 4K Plus', ''))

		if (applicableModels.length > 0) {
			const label =
				applicableModels.length === Object.keys(DXP_MODELS).length
					? `Input ${i} Label`
					: `Input ${i} Label (${applicableModels.join(', ')})`

			fields.push({
				type: 'textinput' as const,
				id: `input_${i}_label`,
				label,
				width: 6,
				default: `Input ${i}`,
				tooltip: `Custom name for input ${i}. Available on: ${applicableModels.join(', ')}`,
			})
		}
	}

	fields.push({
		type: 'static-text',
		id: 'output_labels_header',
		label: 'Output Labels',
		value:
			'• DXP 44: Outputs 1-4  • DXP 66: Outputs 1-6  • DXP 84: Outputs 1-4  • DXP 88: Outputs 1-8  • DXP 1212: Outputs 1-12  • DXP 1616: Outputs 1-16',
		width: 12,
	})

	// Add output label fields with model indicators
	for (let i = 1; i <= 16; i++) {
		const applicableModels = Object.entries(DXP_MODELS)
			.filter(([, info]) => info.outputs >= i)
			.map(([, info]) => info.name.replace(' HD 4K Plus', ''))

		if (applicableModels.length > 0) {
			const label =
				applicableModels.length === Object.keys(DXP_MODELS).length
					? `Output ${i} Label`
					: `Output ${i} Label (${applicableModels.join(', ')})`

			fields.push({
				type: 'textinput' as const,
				id: `output_${i}_label`,
				label,
				width: 6,
				default: `Output ${i}`,
				tooltip: `Custom name for output ${i}. Available on: ${applicableModels.join(', ')}`,
			})
		}
	}

	return fields
}
