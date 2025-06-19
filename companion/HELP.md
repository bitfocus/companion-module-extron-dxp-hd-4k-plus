# Extron DXP HD 4K Plus Series Companion Module

This module provides control and monitoring for the entire Extron DXP HD 4K Plus series of HDMI matrix switchers.

## Supported Devices

- **DXP 44 HD 4K Plus** - 4x4 HDMI matrix switcher
- **DXP 66 HD 4K Plus** - 6x6 HDMI matrix switcher
- **DXP 84 HD 4K Plus** - 8x4 HDMI matrix switcher
- **DXP 88 HD 4K Plus** - 8x8 HDMI matrix switcher
- **DXP 1212 HD 4K Plus** - 12x12 HDMI matrix switcher
- **DXP 1616 HD 4K Plus** - 16x16 HDMI matrix switcher

## Configuration

### Device Selection

- **Device Model**: Select your specific DXP HD 4K Plus model from the dropdown
- **Extron DXP IP Address**: The IP address of your Extron DXP device
- **TCP Port**: Communication port (typically 23 for Telnet)
- **Reconnect Interval**: Time between reconnection attempts in milliseconds

### Custom Labels

You can customize the names for each input and output to make them easier to identify. The available inputs and outputs will automatically adjust based on your selected device model:

- **Input Labels**: Set custom names for your device's inputs (e.g., "Camera 1", "Laptop", "Blu-ray Player")
- **Output Labels**: Set custom names for your device's outputs (e.g., "Main Display", "Monitor 2", "Recording")

**Note**: Only the relevant input/output label fields will be shown based on your selected device model. For example, a DXP 44 will only show 4 input and 4 output label fields.

These custom labels will appear in:

- Action dropdown menus
- Feedback displays
- Variable names and values
- Button text displays

**Example**: Instead of seeing "Input 1 → Output 3", you might see "Camera 1 → Main Display"

## Features

### Actions Available:

- **Route Input to Output**: Route a specific input to a specific output
- **Route Input to All Outputs**: Route one input to all outputs simultaneously
- **Disconnect Output**: Disconnect all inputs from a specific output
- **Save Preset**: Save current routing configuration to a preset (1-32)
- **Recall Preset**: Recall a saved preset configuration
- **Get Device Information**: Query device model and version info
- **Get Routing Status**: Refresh current routing status
- **Front Panel Lock/Unlock**: Lock or unlock the device front panel
- **Set Audio Volume**: Control audio output levels (0-100%)
- **Mute/Unmute Audio Output**: Mute or unmute specific audio outputs
- **Reset Device**: Reboot the device (requires confirmation)

### Feedbacks Available:

- **Input Routed to Output**: Shows when specific input is routed to specific output
- **Connection Status**: Indicates if device is connected
- **Output Source Display**: Shows which input is currently routed to an output
- **Device Model**: Displays device model information
- **Output Disconnected**: Indicates when an output has no input routed
- **Input Routing Count**: Shows how many outputs an input is routed to

### Variables Available:

- Connection status and device information
- Matrix size (e.g., "8x8", "4x4", "16x16")
- Current source for each output (dynamic based on device model)
- Usage count for each input (dynamic based on device model)
- Total active routes and disconnected outputs count

## Extron SIS Commands

This module uses Extron's Simple Instruction Set (SIS) protocol:

- `1*2!` - Route input 1 to output 2
- `3*!` - Route input 3 to all outputs
- `0*4!` - Disconnect output 4
- `5,` - Save preset 5
- `5.` - Recall preset 5
- `I` - Get device information
- `0*!` - Get all routing status

## Network Setup

1. Ensure your Extron DXP HD 4K Plus device is connected to your network
2. Configure a static IP address on the device if needed
3. Verify Telnet access is enabled (usually port 23)
4. Test connectivity with a Telnet client before configuring Companion

## Switching Between Models

If you need to change your device model:

1. Go to the module configuration
2. Select the correct device model from the dropdown
3. The module will automatically:
   - Adjust available inputs and outputs
   - Update action and feedback options
   - Reinitialize the matrix state tracking
   - Show/hide relevant label configuration fields

## Troubleshooting

- **Connection Issues**: Verify IP address, port, and network connectivity
- **Commands Not Working**: Check device firmware version and SIS command compatibility
- **Wrong Matrix Size**: Ensure you've selected the correct device model in configuration
- **Missing Inputs/Outputs**: Verify your device model selection matches your physical device
- **Slow Response**: Adjust reconnect interval or check network latency
- **Missing Feedbacks**: Ensure device is properly responding to status queries

For more information about Extron SIS commands, consult your device manual or Extron's technical documentation.
