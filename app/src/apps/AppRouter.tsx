// ============================================================
// App Router — Maps appId to component using React.lazy + Suspense
// Eliminates eager imports of all 55 apps into a single bundle.
// ============================================================

import { lazy, Suspense } from 'react';
import NotImplemented from '@/components/NotImplemented';

const FileManager = lazy(() => import('./FileManager'));
const Terminal = lazy(() => import('./Terminal'));
const RealTerminal = lazy(() => import('./RealTerminal'));
const Calculator = lazy(() => import('./Calculator'));
const TextEditor = lazy(() => import('./TextEditor'));
const Settings = lazy(() => import('./Settings'));
const SystemMonitor = lazy(() => import('./SystemMonitor'));
const Calendar = lazy(() => import('./Calendar'));
const Notes = lazy(() => import('./Notes'));
const Todo = lazy(() => import('./Todo'));
const Clock = lazy(() => import('./Clock'));
const Spreadsheet = lazy(() => import('./Spreadsheet'));
const ArchiveManager = lazy(() => import('./ArchiveManager'));
const Browser = lazy(() => import('./Browser'));
const Email = lazy(() => import('./Email'));
const Chat = lazy(() => import('./Chat'));
const Weather = lazy(() => import('./Weather'));
const MusicPlayer = lazy(() => import('./MusicPlayer'));
const VideoPlayer = lazy(() => import('./VideoPlayer'));
const ImageViewer = lazy(() => import('./ImageViewer'));
const PhotoEditor = lazy(() => import('./PhotoEditor'));
const VoiceRecorder = lazy(() => import('./VoiceRecorder'));
const ScreenRecorder = lazy(() => import('./ScreenRecorder'));
const Minesweeper = lazy(() => import('./Minesweeper'));
const Snake = lazy(() => import('./Snake'));
const Tetris = lazy(() => import('./Tetris'));
const TicTacToe = lazy(() => import('./TicTacToe'));
const Game2048 = lazy(() => import('./Game2048'));
const Sudoku = lazy(() => import('./Sudoku'));
const Chess = lazy(() => import('./Chess'));
const Memory = lazy(() => import('./Memory'));
const Pong = lazy(() => import('./Pong'));
const Solitaire = lazy(() => import('./Solitaire'));
const CodeEditor = lazy(() => import('./CodeEditor'));
const JsonFormatter = lazy(() => import('./JsonFormatter'));
const RegexTester = lazy(() => import('./RegexTester'));
const MarkdownPreview = lazy(() => import('./MarkdownPreview'));
const GitClient = lazy(() => import('./GitClient'));
const ApiTester = lazy(() => import('./ApiTester'));
const Base64Tool = lazy(() => import('./Base64Tool'));
const ColorPalette = lazy(() => import('./ColorPalette'));
const Drawing = lazy(() => import('./Drawing'));
const ColorPicker = lazy(() => import('./ColorPicker'));
const ImageGallery = lazy(() => import('./ImageGallery'));
const AsciiArt = lazy(() => import('./AsciiArt'));
const DocumentViewer = lazy(() => import('./DocumentViewer'));
const Reminders = lazy(() => import('./Reminders'));
const Contacts = lazy(() => import('./Contacts'));
const PasswordManager = lazy(() => import('./PasswordManager'));
const Whiteboard = lazy(() => import('./Whiteboard'));
const RssReader = lazy(() => import('./RssReader'));
const FtpClient = lazy(() => import('./FtpClient'));
const NetworkTools = lazy(() => import('./NetworkTools'));
const MediaConverter = lazy(() => import('./MediaConverter'));
const FlappyBird = lazy(() => import('./FlappyBird'));
const MatrixRain = lazy(() => import('./MatrixRain'));

interface AppRouterProps {
  appId: string;
  windowId?: string;
}

const AppSkeleton = () => (
  <div
    className="flex items-center justify-center h-full w-full"
    style={{ background: 'var(--bg-window)', color: 'var(--text-primary)' }}
  >
    <div className="flex flex-col items-center gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin" />
      <span className="text-xs font-medium opacity-70">Loading App...</span>
    </div>
  </div>
);

export default function AppRouter({ appId, windowId }: AppRouterProps) {
  const renderApp = () => {
    switch (appId) {
      case 'filemanager': return <FileManager />;
      case 'terminal': return <Terminal />;
      case 'real-terminal': return <RealTerminal windowId={windowId} />;
      case 'calculator': return <Calculator />;
      case 'texteditor': return <TextEditor />;
      case 'settings': return <Settings />;
      case 'systemmonitor': return <SystemMonitor />;
      case 'calendar': return <Calendar />;
      case 'notes': return <Notes />;
      case 'todo': return <Todo />;
      case 'clock': return <Clock />;
      case 'spreadsheet': return <Spreadsheet />;
      case 'archivemanager': return <ArchiveManager />;
      case 'browser': return <Browser />;
      case 'email': return <Email />;
      case 'chat': return <Chat />;
      case 'weather': return <Weather />;
      case 'musicplayer': return <MusicPlayer />;
      case 'videoplayer': return <VideoPlayer />;
      case 'imageviewer': return <ImageViewer />;
      case 'photoeditor': return <PhotoEditor />;
      case 'voicerecorder': return <VoiceRecorder />;
      case 'screenrecorder': return <ScreenRecorder />;
      case 'minesweeper': return <Minesweeper />;
      case 'snake': return <Snake />;
      case 'tetris': return <Tetris />;
      case 'tictactoe': return <TicTacToe />;
      case 'game2048': return <Game2048 />;
      case 'sudoku': return <Sudoku />;
      case 'chess': return <Chess />;
      case 'memory': return <Memory />;
      case 'pong': return <Pong />;
      case 'solitaire': return <Solitaire />;
      case 'codeeditor': return <CodeEditor />;
      case 'jsonformatter': return <JsonFormatter />;
      case 'regextester': return <RegexTester />;
      case 'markdownpreview': return <MarkdownPreview />;
      case 'gitclient': return <GitClient />;
      case 'apitester': return <ApiTester />;
      case 'base64tool': return <Base64Tool />;
      case 'colorpalette': return <ColorPalette />;
      case 'drawing': return <Drawing />;
      case 'colorpicker': return <ColorPicker />;
      case 'imagegallery': return <ImageGallery />;
      case 'asciiart': return <AsciiArt />;
      case 'documentviewer': return <DocumentViewer />;
      case 'reminders': return <Reminders />;
      case 'contacts': return <Contacts />;
      case 'passwordmanager': return <PasswordManager />;
      case 'whiteboard': return <Whiteboard />;
      case 'rssreader': return <RssReader />;
      case 'ftpclient': return <FtpClient />;
      case 'networktools': return <NetworkTools />;
      case 'mediaconverter': return <MediaConverter />;
      case 'flappybird': return <FlappyBird />;
      case 'matrixrain': return <MatrixRain />;
      default: return <NotImplemented appId={appId} />;
    }
  };

  return (
    <Suspense fallback={<AppSkeleton />}>
      {renderApp()}
    </Suspense>
  );
}
