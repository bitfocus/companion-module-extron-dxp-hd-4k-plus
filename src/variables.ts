import type { ModuleInstance } from './main.js'

// Helper function to get input label by number
function getInputLabel(self: ModuleInstance, inputNumber: number): string {
	const labelKey = `input_${inputNumber}_label` as keyof typeof self.config
	return (self.config[labelKey] as string) || `Input ${inputNumber}`
}

// Helper function to get output label by number
function getOutputLabel(self: ModuleInstance, outputNumber: number): string {
	const labelKey = `output_${outputNumber}_label` as keyof typeof self.config
	return (self.config[labelKey] as string) || `Output ${outputNumber}`
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const inputCount = self.getInputCount()
	const outputCount = self.getOutputCount()

	const variables = [
		// Connection status
		{
			variableId: 'connection_status',
			name: 'Connection Status',
		},

		// Device information
		{
			variableId: 'device_model',
			name: 'Device Model',
		},
		{
			variableId: 'device_version',
			name: 'Device Version',
		},
		{
			variableId: 'device_serial',
			name: 'Device Serial Number',
		},

		// Current routing for each output using custom labels (dynamic based on device model)
		...Array.from({ length: outputCount }, (_, i) => {
			const outputLabel = getOutputLabel(self, i + 1)
			return {
				variableId: `output_${i + 1}_source`,
				name: `${outputLabel} Source Input`,
			}
		}),

		// Input usage count using custom labels (dynamic based on device model)
		...Array.from({ length: inputCount }, (_, i) => {
			const inputLabel = getInputLabel(self, i + 1)
			return {
				variableId: `input_${i + 1}_usage_count`,
				name: `${inputLabel} Usage Count`,
			}
		}),

		// Matrix overview
		{
			variableId: 'total_active_routes',
			name: 'Total Active Routes',
		},
		{
			variableId: 'disconnected_outputs',
			name: 'Number of Disconnected Outputs',
		},
		{
			variableId: 'matrix_size',
			name: 'Matrix Size',
		},
	]

	self.setVariableDefinitions(variables)

	// Set initial variable values
	const initialValues: { [key: string]: string | number } = {
		connection_status: 'Disconnected',
		device_model: 'Unknown',
		device_version: 'Unknown',
		device_serial: 'Unknown',
		total_active_routes: 0,
		disconnected_outputs: outputCount,
		matrix_size: `${inputCount}x${outputCount}`,
	}

	// Add output source variables with custom labels (dynamic count)
	for (let i = 1; i <= outputCount; i++) {
		initialValues[`output_${i}_source`] = 'None'
	}

	// Add input usage count variables (dynamic count)
	for (let i = 1; i <= inputCount; i++) {
		initialValues[`input_${i}_usage_count`] = 0
	}

	self.setVariableValues(initialValues)
}
