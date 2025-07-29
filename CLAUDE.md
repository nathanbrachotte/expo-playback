# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native podcast app built with Expo that includes a custom native module for audio playback. The project has three main components:

1. **Native Module** (`/src/`, `/ios/`) - Expo module for audio playback functionality
2. **React Native App** (`/example/`) - Main podcast application
3. **Backend** (`/backend/`) - Hono + D1 + Drizzle backend for podcast data

**Important: The main React Native app is located in the `/example/` directory, not the root.**

## Common Commands

### Development Commands

```bash
# Start the React Native app
cd example && npm run start

# Run on iOS (requires Xcode)
cd example && npm run ios

# Run on Android
cd example && npm run android

# Install iOS dependencies
cd example/ios && pod install && cd ..

# Type checking
cd example && npm run type:check

# Generate database migrations
cd example && npm run db:generate
```

### Native Module Commands

```bash
# Build the native module
npm run build

# Clean build artifacts
npm run clean

# Lint the module
npm run lint

# Test the module
npm run test

# Open iOS project in Xcode
npm run open:ios
```

### Backend Commands

```bash
# Start backend development server
cd backend && npm run dev

# Deploy to Cloudflare Workers
cd backend && npm run deploy

# Database operations
cd backend && npm run db:generate
cd backend && npm run db:migrate
cd backend && npm run db:studio
```

### PNPM Commands

```bash
# Install dependencies
pnpm install

# Start the React Native app
pnpm --filter example start

# Run on iOS
pnpm --filter example ios

# Run on Android
pnpm --filter example android

# Type checking
pnpm --filter example type:check

# Generate database migrations
pnpm --filter example db:generate
```

## Architecture Overview

### React Native App Structure (`/example/`)

**Key Directories:**

- `/screens/` - Screen components organized by feature
- `/components/` - Reusable UI components including Layout, Player, PodcastCard
- `/providers/` - React Context providers (PlayerProvider, LangProvider)
- `/clients/` - Data fetching with TanStack Query (local, RSS, iTunes APIs)
- `/db/` - Drizzle ORM database layer with schema and client
- `/types/` - TypeScript definitions for navigation, database, and app types
- `/utils/` - Utility functions for episodes, images, metadata, time formatting

**Tech Stack:**

- **UI Framework**: Tamagui (design system and components)
- **Navigation**: React Navigation with TypeScript
- **State Management**: React Context + TanStack Query
- **Database**: Drizzle ORM with SQLite
- **Data Validation**: Zod schemas
- **Native Integration**: Expo modules

**Database Schema:**

- `podcasts` - Podcast metadata from iTunes/RSS
- `episodes` - Episode information from RSS feeds
- `episode_metadata` - Playback progress, download status (written by native module)

### Native Module (`/src/`, `/ios/`)

**Key Files:**

- `/src/ExpoPlaybackModule.ts` - TypeScript module interface
- `/ios/ExpoPlaybackModule.swift` - Swift implementation with AVFoundation
- `/ios/db/` - Swift database repositories for episodes, podcasts, metadata
- `/ios/downloader/` - Background episode downloading

**Functionality:**

- Audio playback with AVFoundation
- Background downloading with progress tracking
- Media controls integration (lock screen, control center)
- Real-time sync between native and React layers via events

### Backend (`/backend/`)

**Tech Stack:**

- **Framework**: Hono (lightweight web framework)
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle
- **Deployment**: Cloudflare Workers

## Development Guidelines

### Code Style Requirements

**Critical: Component Usage**

- Always use **Tamagui components**, never React Native components
- Use `PureXStack` and `PureYStack` instead of `View`, `Stack`, `XStack`, `YStack`
- Use `gap` instead of deprecated `space` property
- Using React Native styles will break the app - always use Tamagui
- With highest priority use to custom components, they usually start with "Pure" or "P" and then component name. Example: PureYStack, PureXStack, PureSection, etc.
- Otherwise use Tamagui components as default instead of React Native ones, unless stated otherwise.
- **Default to always use the custom components I've built first**

**TypeScript Requirements**

- **Never use `any`** - use Zod schemas for validation or `unknown` if type is unclear
- Follow strict TypeScript patterns throughout the codebase

**Business Logic Patterns**

- Use early return pattern for cleaner code
- Implement IoC (Inversion of Control) for reusable components
- Use TanStack Query for all data fetching (queries and mutations)
- Always prioritize using the IoC (Inversion of Control) pattern when writing components

### Navigation

- Use React Navigation with TypeScript for type-safe navigation
- Navigation types are defined in `/example/types/navigation.types.ts`

### Database Operations

- Use Drizzle ORM for type-safe database operations
- Live queries provide reactive UI updates
- Native module writes directly to database, React layer receives updates via events

### Native Module Integration

- Native module communicates with React layer via event listeners
- Use the exported functions from `expo-playback` module
- Player state is managed through PlayerProvider context

## Important Notes

- The main React Native app is in `/example/` directory
- When installing packages for the React Native app, use `/example/package.json`
- Native module handles audio playback, downloading, and database writes
- React layer focuses on UI, navigation, and data fetching
- Background downloads and audio playback work independently of the React layer
- All UI components must use Tamagui - React Native styles are not allowed

## Cursor Rules Integration

This project follows specific development guidelines:

- Expert level Mobile Apps, Expo, TypeScript, Swift, and Android development
- Follows Expo Native Module tutorial patterns
- Podcast app with auto-skipping ads and non-wanted segments
- React Navigation for navigation, TanStack Query for data fetching
- Strict TypeScript usage with Zod validation
- Early return pattern and IoC for business logic
