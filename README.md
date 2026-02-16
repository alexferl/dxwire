# DXWire

A web-based patch editor and manager for the Yamaha DX7 synthesizer. Built with SolidJS and modern web technologies.

## Overview

DXWire is a browser-based editor for Yamaha DX7 synthesizer patches (voices). It provides a modern, intuitive interface for editing the complex FM synthesis parameters of the DX7, including:

- 6 operators with envelope generators, frequency settings, and modulation
- 32 FM algorithms with visual feedback
- Low-frequency oscillator (LFO) settings
- Pitch envelope generator
- Global voice parameters (feedback, transpose, etc.)
- Full bank management (32 voices per bank)
- MIDI SysEx import/export for hardware communication

## Features

### Voice Editing
- **Operator Editing**: Full control over all 6 operators including EG rates/levels, frequency (ratio/fixed), detune, key scaling, and output levels
- **Algorithm Visualization**: Interactive display showing the 32 DX7 FM algorithms and how operators modulate each other
- **Envelope Graphs**: Visual representation of amplitude and pitch envelope generators
- **Real-time Parameter Control**: Knobs, sliders, and switches for all voice parameters

### Bank Management
- Load and save DX7 voice banks (32 voices per bank)
- Import/Export SysEx files (.syx) compatible with hardware DX7
- Export single patches to KORG Volca FM/2 format
- Import/Export JSON format for easy sharing and version control
- Copy, rename, and initialize individual voices
- Manage multiple banks simultaneously

### MIDI Support
- Connect directly to DX7 hardware via Web MIDI API
- Send and receive voice data via System Exclusive (SysEx) messages
- Automatic device detection and connection status
- Browser-based MIDI input/output selection

### User Interface
- Clean, responsive design optimized for editing
- Visual algorithm display showing operator routing
- Keyboard shortcuts for common operations
- Dark mode support (follows system preferences)

## Getting Started

### Prerequisites

- A modern web browser with Web MIDI API support (Chrome/Edge, Firefox, Opera)
- For hardware communication: Yamaha DX7 or compatible synthesizer with MIDI interface

### Installation

```bash
# Clone the repository
git clone https://github.com/alexferl/dxwire.git
cd dxwire

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

### Loading Voices

1. **From SysEx files**: Click Import in the header and select a `.syx` file containing DX7 voices
2. **From JSON files**: Import `.json` files exported from DXWire
3. **From hardware**: Connect your DX7 via MIDI and use the MIDI controls

### Editing Voices

1. Select a voice from the bank dropdown
2. Adjust parameters using the operator panels and sidebar controls
3. The algorithm visualization shows how operators modulate each other
4. Use the envelope graphs to visualize amplitude changes over time

### Saving and Exporting

1. **To SysEx**: Click Export → Download SyX to save the current voice as a `.syx` file
2. **To KORG Volca FM/2**: Export single patches in Volca FM/2 format
3. **To JSON**: Export as JSON for sharing or version control
4. **To hardware**: Send voices directly to your DX7 via MIDI (if connected)

### Managing Banks

- Switch between loaded banks using the bank selector
- Rename banks by clicking the bank name
- Delete banks you no longer need
- Replace voices in a bank with your edited voice

## Development

### Available Scripts

| Command            | Description                              |
|--------------------|------------------------------------------|
| `npm run dev`      | Start development server with hot reload |
| `npm run build`    | Build for production                     |
| `npm run preview`  | Preview production build locally         |
| `npm test`         | Run unit tests in watch mode             |
| `npm run test:ui`  | Run tests with Vitest UI                 |
| `npm run coverage` | Generate test coverage report            |
| `npm run lint`     | Run Biome linter and formatter           |

### Tech Stack

- **[midiwire](https://github.com/alexferl/midiwire)** - MIDI device management and DX7 SysEx handling
- **[SolidJS](https://www.solidjs.com/)** - Simple and performant reactivity for building user interfaces
- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter
- **[Vitest](https://vitest.dev/)** - Unit testing framework

### Project Structure

```
src/
├── components/
│   ├── Editor/           # Main editor component
│   │   ├── Header/       # Import/export menus, MIDI controls
│   │   ├── Operators/    # 6 operator editor panels
│   │   ├── Sidebar/      # Algorithm, LFO, Pitch EG, General
│   │   ├── context/      # Voice and MIDI context providers
│   │   ├── dialogs/      # Copy/rename dialogs
│   │   ├── Voice.js      # Voice state management
│   │   └── storage.js    # Local storage persistence
│   ├── Knob/             # Rotary knob component
│   ├── Slider/           # Slider control component
│   ├── EnvelopeGraph/    # EG visualization
│   └── ...
├── pages/                # Route pages
└── index.jsx            # Application entry
```

## DX7 Compatibility

DXWire is designed to be fully compatible with the original Yamaha DX7 synthesizer:

- Supports all 32 FM algorithms
- Full SysEx compatibility for voice dumps
- Compatible with standard DX7 voice banks
- Supports both single voice and 32-voice bank dumps
- Export support for KORG Volca FM/2 synthesizers

## Browser Support

Requires browsers with [Web MIDI API](https://caniuse.com/midi) support:
- ✅ Chrome/Edge 43+
- ✅ Firefox 108+
- ✅ Opera 30+
- ❌ Safari (not supported)

**Note:** SysEx requires explicit user permission in Chrome.

## License

[MIT](LICENSE)

## Acknowledgments

- Yamaha for creating the legendary DX7 synthesizer
- Inspired by [Dexed](https://github.com/asb2m10/dexed)
