# Relay16 - Nostr Social Client with AI Integration

Relay16 is a modern Nostr social client that integrates AI-powered tools through DVMCP (Data Vending Machine Context Protocol) for enhanced social media experiences.

## ✅ Status: Ready to Run

The application has been successfully set up and is ready for development. All major dependencies have been installed and configuration issues have been resolved.

## Features

### 🌐 Nostr Protocol Support
- **Multi-relay connections** - Connect to multiple Nostr relays simultaneously
- **Real-time feed** - Live updates from the Nostr network
- **Profile management** - Create and edit your Nostr identity
- **Note publishing** - Compose and publish notes with rich formatting
- **Social interactions** - Like, reply, and repost notes

### 🤖 AI-Powered Features
- **Thread summarization** - AI-powered summaries of long conversations
- **Writing assistance** - Get AI suggestions for improving your posts
- **Content analysis** - Sentiment analysis and topic extraction
- **Smart hashtag generation** - AI-generated relevant hashtags

### 🔧 DVMCP Integration
- **Tool discovery** - Automatically discover available AI tools
- **Provider management** - Connect to multiple DVMCP providers
- **Request tracking** - Monitor AI tool usage and results
- **Extensible architecture** - Easy integration of new AI services

### 🎨 Modern UI/UX
- **Responsive design** - Works on desktop and mobile devices
- **Dark/light themes** - Automatic theme switching
- **Smooth animations** - Framer Motion powered transitions
- **Component library** - Built with HeroUI and shadcn/ui

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + HeroUI + shadcn/ui + tailwindcss-animate
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Nostr Protocol**: nostr-tools (SimplePool API)
- **AI Services**: OpenRouter API
- **Storage**: Local Storage with Zustand persistence
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd relay16
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Recent Fixes Applied



### Configuration

#### Nostr Setup
1. Go to Settings → Identity
2. Generate new keys or import existing private key
3. Add Nostr relays in Settings → Relays

#### AI Services Setup
1. Get an API key from [OpenRouter](https://openrouter.ai)
2. Go to Settings → AI Services
3. Enter your OpenRouter API key

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main app layout
│   └── ui/             # shadcn/ui components
├── pages/              # Main application pages
│   ├── Feed.tsx        # Social feed ✅
│   ├── Profile.tsx     # User profiles (needs fixes)
│   ├── Compose.tsx     # Note composition ✅
│   ├── Tools.tsx       # AI tools interface (needs fixes)
│   └── Settings.tsx    # App settings (needs fixes)
├── hooks/              # Custom React hooks
│   ├── useNostr.ts     # Nostr protocol integration ✅
│   └── useDVMCP.ts     # DVMCP tool integration ✅
├── stores/             # Zustand state stores
│   ├── nostr.ts        # Nostr state management ✅
│   ├── dvmcp.ts        # DVMCP state management ✅
│   └── ai.ts           # AI services state ✅
├── services/           # External service integrations
│   └── ai.ts           # OpenRouter AI service ✅
├── types/              # TypeScript type definitions
│   ├── nostr.ts        # Nostr protocol types ✅
│   ├── dvmcp.ts        # DVMCP types ✅
│   └── ai.ts           # AI service types ✅
├── lib/                # Utility functions
│   └── utils.ts        # Common utilities ✅
└── App.tsx             # Main application component ✅
```

## Development Status

### ✅ Completed & Working
- Basic project setup and configuration
- Dependency management and build system
- Core TypeScript types and interfaces
- Nostr protocol integration with SimplePool
- AI service integration foundation
- Basic UI components and layout
- Feed and Compose pages

### 🔧 Needs Additional Work
- Profile page (missing some hook methods)
- Tools page (DVMCP store property mapping)
- Settings page (some missing store properties)
- Complete DVMCP provider integration
- Advanced Nostr features (DMs, follows)

### Available Scripts

- `npm run dev` - Start development server ✅
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Next Steps for Development

1. **Complete Missing Store Properties**: Add missing properties to stores for Profile, Tools, and Settings pages
2. **Implement Real DVMCP Integration**: Replace mock data with actual DVMCP provider discovery
3. **Add Advanced Nostr Features**: Implement DMs, follows, and advanced relay management
4. **Enhance UI/UX**: Add more polished animations and responsive design improvements

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Architecture Highlights

### Nostr Integration
- Uses **SimplePool** from nostr-tools for efficient multi-relay management
- Proper key management with Uint8Array conversion for cryptographic operations
- Event signing and publishing with **finalizeEvent**

### State Management
- **Zustand** for lightweight, TypeScript-friendly global state
- **Persistent storage** for user data and preferences
- **Reactive updates** across all components

### AI Services
- **OpenRouter API** integration for multiple AI model access
- **DVMCP protocol** foundation for decentralized AI tool discovery
- **Modular service architecture** for easy extension

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**: Change port in `vite.config.ts` or kill existing process
2. **Module resolution errors**: Ensure all dependencies are installed with `npm install`
3. **TypeScript errors**: Run `npm run type-check` to identify and fix type issues

### Dependencies
All major dependencies are installed and configured:
- React ecosystem (React, React-DOM, React Router)
- UI libraries (HeroUI, Tailwind CSS, Framer Motion)
- Nostr tools and cryptographic libraries
- Development tools (Vite, TypeScript, ESLint)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Nostr Protocol](https://nostr.com/) - Decentralized social protocol
- [OpenRouter](https://openrouter.ai/) - AI model API aggregation
- [HeroUI](https://heroui.com/) - React component library
- [shadcn/ui](https://ui.shadcn.com/) - Component collection
- [Framer Motion](https://www.framer.com/motion/) - Animation library

---

**Relay16** - Bridging social media and AI for the decentralized future.

🚀 **Ready to develop! Start with `npm run dev` and navigate to http://localhost:3000**