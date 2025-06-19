# companion-module-extron-dxp-hd-4k-plus

Bitfocus Companion module for controlling the entire Extron DXP HD 4K Plus series of HDMI matrix switchers.

## Supported Devices

- **DXP 44 HD 4K Plus** - 4x4 HDMI matrix switcher
- **DXP 66 HD 4K Plus** - 6x6 HDMI matrix switcher
- **DXP 84 HD 4K Plus** - 8x4 HDMI matrix switcher
- **DXP 88 HD 4K Plus** - 8x8 HDMI matrix switcher
- **DXP 1212 HD 4K Plus** - 12x12 HDMI matrix switcher
- **DXP 1616 HD 4K Plus** - 16x16 HDMI matrix switcher

## Features

- **Dynamic Matrix Sizes**: Automatically adapts to your specific device model
- **Flexible HDMI Routing**: Control any matrix size from 4x4 up to 16x16
- **Save and Recall Presets**: Store up to 32 routing configurations
- **Audio Control**: Volume control and muting for supported models
- **Device Status Monitoring**: Real-time connection and routing feedback
- **Front Panel Control**: Lock/unlock device front panel
- **Custom Labeling**: Personalize input/output names for easier identification
- **Comprehensive Variables**: Integration-friendly variable system

## Setup

1. Install dependencies: `yarn install`
2. Build the module: `yarn build`
3. The module will be available in the `dist/` directory for Companion

## Configuration

### Quick Start

1. **Select Device Model**: Choose your specific DXP HD 4K Plus model
2. **IP Address**: Enter your Extron device IP address
3. **Port**: Typically 23 (Telnet) for Extron devices
4. **Custom Labels**: Optionally name your inputs/outputs for easier identification

### Dynamic Configuration

The module automatically adapts based on your selected device:

- **4x4 models** show 4 inputs and 4 outputs
- **8x8 models** show 8 inputs and 8 outputs
- **16x16 models** show 16 inputs and 16 outputs
- Only relevant configuration options are displayed

## Development

- Use `yarn dev` to build in watch mode during development
- Use `yarn lint` to check code style
- Use `yarn format` to format code with Prettier

## Protocol

Uses Extron's Simple Instruction Set (SIS) over TCP/Telnet connection. The module automatically handles the differences between various matrix sizes while maintaining the same SIS command structure.

## Migration from Single-Model Modules

If you're upgrading from a single-model Extron module:

1. Install this module
2. Select your specific device model in configuration
3. Your existing presets and configurations should work seamlessly

See [HELP.md](./companion/HELP.md) for detailed usage instructions and troubleshooting.
