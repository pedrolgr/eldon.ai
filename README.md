# Eldon.AI - Discord Voice Transcription Bot

A Discord bot that listens to voice channels and transcribes audio in real-time using Groq's Whisper model, optimized for Brazilian Portuguese (pt-BR).

## 🎯 Features

- **Real-time Voice Recording**: Automatically joins voice channels and records user audio
- **Smart Audio Chunking**: Processes audio in 9-second chunks for efficient transcription
- **Portuguese Transcription**: Optimized for Brazilian Portuguese (pt-BR) using Groq's Whisper-large-v3 model
- **Stream Processing**: Converts audio streams directly to WAV format without disk I/O
- **Silence Detection**: Automatically stops recording after periods of silence
- **Minimum Duration Filter**: Ignores audio snippets shorter than 0.5 seconds

## 🏗️ Project Structure

```
discord-bot/
├── services/
│   ├── bot/                    # Discord bot service
│   │   ├── src/
│   │   │   ├── index.ts        # Bot entry point
│   │   │   └── utils/
│   │   │       ├── voiceHandler.ts      # Voice recording logic
│   │   │       └── transcribeAudio.ts   # Groq transcription
│   │   └── package.json
│   └── ml/                     # Machine learning service (future)
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Discord Bot Token
- Groq API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:pedrolgr/eldon.ai.git
   cd discord-bot
   ```

2. **Install dependencies**
   ```bash
   cd services/bot
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in `services/bot/`:
   ```env
   DISCORD_TOKEN=your_discord_bot_token
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Update Guild and Channel IDs**
   
   Edit `services/bot/src/index.ts` and replace with your Discord server details:
   ```typescript
   const guild = await client.guilds.fetch('YOUR_GUILD_ID')
   const channel = await guild.channels.fetch('YOUR_CHANNEL_ID');
   ```

### Running the Bot

```bash
cd services/bot
npm start
```

The bot will automatically join the configured voice channel and start listening.

## 🔧 Configuration

### Audio Processing Settings

In `services/bot/src/utils/voiceHandler.ts`:

- **Max Chunk Duration**: 9 seconds (`MAX_BYTES`)
- **Min Audio Duration**: 0.5 seconds (`MIN_BYTES`)
- **Silence Duration**: 100ms (`AfterSilence` behavior)
- **Sample Rate**: 48kHz stereo

### Transcription Settings

In `services/bot/src/utils/transcribeAudio.ts`:

- **Model**: `whisper-large-v3`
- **Language**: `pt` (Portuguese)
- **Temperature**: 0 (deterministic output)
- **Response Format**: `verbose_json`

## 📦 Dependencies

### Core Dependencies
- `discord.js` - Discord API wrapper
- `@discordjs/voice` - Voice connection handling
- `groq-sdk` - Groq AI API client
- `prism-media` - Audio processing
- `ffmpeg-static` - Audio encoding/decoding

### Development Dependencies
- `typescript` - Type safety
- `tsx` - TypeScript execution
- `dotenv` - Environment variable management

## 🎤 How It Works

1. **Connection**: Bot joins the specified voice channel on startup
2. **Detection**: Listens for users starting to speak
3. **Recording**: Captures Opus audio stream and decodes to PCM
4. **Chunking**: Buffers audio in 9-second chunks or until silence
5. **Conversion**: Converts PCM to WAV format with proper headers
6. **Transcription**: Sends audio to Groq's Whisper API with pt-BR language hint
7. **Output**: Logs transcribed text to console

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Discord bot authentication token | ✅ |
| `GROQ_API_KEY` | Groq API key for transcription | ✅ |

## 🛠️ Development

### Project Setup

The bot uses TypeScript with ES modules. Key configurations:

- **Module Type**: ESM (`"type": "module"` in package.json)
- **Runtime**: tsx for direct TypeScript execution
- **Audio Format**: 48kHz, 16-bit, stereo PCM → WAV

### Adding Features

To extend functionality:

1. **Voice Handler**: Modify `voiceHandler.ts` for audio processing changes
2. **Transcription**: Update `transcribeAudio.ts` for API modifications
3. **Bot Logic**: Edit `index.ts` for connection and event handling

## 📝 Recent Updates

- ✅ Added Portuguese (pt-BR) language parameter to Groq transcription
- ✅ Implemented stream-to-blob audio processing
- ✅ Removed disk-based audio file storage
- ✅ Optimized chunking for real-time transcription

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 📄 License

This project is private and not licensed for public use.

## 🔗 Links

- [Discord.js Documentation](https://discord.js.org/)
- [Groq API Documentation](https://console.groq.com/docs)
- [Repository](https://github.com/pedrolgr/eldon.ai)

---

**Note**: Remember to keep your `.env` file secure and never commit it to version control.
