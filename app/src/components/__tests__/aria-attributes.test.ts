/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Accessibility (ARIA) Source Code Validation Tests
 *
 * These tests validate that ARIA attributes exist in the source code
 * for critical components. This approach avoids infra issues (missing jsdom,
 * @/ alias resolution) while still providing automated verification.
 */

describe('Accessibility - ARIA Attributes in Source', () => {
  const readSource = (filePath: string): string => {
    return readFileSync(resolve(__dirname, filePath), 'utf-8');
  };

  describe('Dock.tsx', () => {
    const source = readSource('../Dock.tsx');

    it('has aria-label on Show Applications button', () => {
      expect(source).toContain('aria-label="Show Applications"');
    });

    it('has aria-pressed on Show Applications button', () => {
      expect(source).toContain('aria-pressed={state.appLauncherOpen}');
    });

    it('has dynamic aria-label on dock item buttons', () => {
      expect(source).toContain('aria-label={isTrash');
      expect(source).toContain('app?.name || appId}');
    });

    it('has aria-hidden on icon elements', () => {
      expect(source).toContain('aria-hidden="true"');
    });
  });

  describe('WindowFrame.tsx', () => {
    const source = readSource('../WindowFrame.tsx');

    it('has aria-label on Minimize button', () => {
      expect(source).toContain('aria-label="Minimize"');
    });

    it('has dynamic aria-label on Maximize/Restore button', () => {
      expect(source).toContain('aria-label={isMaximized');
    });

    it('has aria-label on Close button', () => {
      expect(source).toContain('aria-label="Close"');
    });
  });

  describe('Desktop.tsx', () => {
    const source = readSource('../Desktop.tsx');

    it('has role="list" on desktop container', () => {
      expect(source).toContain('role="list"');
    });

    it('has aria-label on desktop container', () => {
      expect(source).toContain('aria-label="Desktop"');
    });

    it('has role="listitem" on desktop icons', () => {
      expect(source).toContain('role="listitem"');
    });

    it('has tabIndex on desktop icons', () => {
      expect(source).toContain('tabIndex={0}');
    });

    it('has keyboard handler for Enter and Space', () => {
      expect(source).toContain("e.key === 'Enter' || e.key === ' '")
    });
  });

  describe('Calculator.tsx', () => {
    const source = readSource('../../apps/Calculator.tsx');

    it('has aria-label on history toggle button', () => {
      expect(source).toContain('aria-label="Toggle history"');
    });

    it('has aria-label on backspace action button', () => {
      expect(source).toContain('ariaLabel="Backspace"');
    });

    it('has aria-label on delete action button', () => {
      expect(source).toContain('ariaLabel="Delete"');
    });
  });

  describe('TextEditor.tsx', () => {
    const source = readSource('../../apps/TextEditor.tsx');

    it('has aria-label on zoom out button', () => {
      expect(source).toContain('aria-label="Zoom out"');
    });

    it('has aria-label on zoom in button', () => {
      expect(source).toContain('aria-label="Zoom in"');
    });

    it('has aria-label on close find button', () => {
      expect(source).toContain('aria-label="Close find"');
    });

    it('has aria-label on close tab button', () => {
      expect(source).toContain('aria-label="Close tab"');
    });
  });

  describe('FileManager.tsx', () => {
    const source = readSource('../../apps/FileManager.tsx');

    it('has aria-label on navigate up button', () => {
      expect(source).toContain('aria-label="Go to parent folder"');
    });

    it('has aria-label on grid view button', () => {
      expect(source).toContain('aria-label="Grid view"');
    });

    it('has aria-label on list view button', () => {
      expect(source).toContain('aria-label="List view"');
    });

    it('has aria-label on new folder button', () => {
      expect(source).toContain('aria-label="New Folder"');
    });

    it('has aria-label on new file button', () => {
      expect(source).toContain('aria-label="New File"');
    });
  });

  describe('Settings.tsx', () => {
    const source = readSource('../../apps/Settings.tsx');

    it('has aria-label on Toggle component', () => {
      expect(source).toContain('aria-label={ariaLabel || (value ?');
    });

    it('has aria-pressed on Toggle component', () => {
      expect(source).toContain('aria-pressed={value}');
    });

    it('has aria-label on accent color buttons', () => {
      expect(source).toContain('aria-label={`Accent color: ${c.name}`}');
    });

    it('has aria-pressed on accent color buttons', () => {
      expect(source).toContain('aria-pressed={state.theme.accent === c.value}');
    });
  });

  describe('Browser.tsx', () => {
    const source = readSource('../../apps/Browser.tsx');

    it('has aria-label on Go back button', () => {
      expect(source).toContain('aria-label="Go back"');
    });

    it('has aria-label on Go forward button', () => {
      expect(source).toContain('aria-label="Go forward"');
    });

    it('has aria-label on Refresh page button', () => {
      expect(source).toContain('aria-label="Refresh page"');
    });

    it('has aria-label on Go home button', () => {
      expect(source).toContain('aria-label="Go home"');
    });
  });

  describe('Calendar.tsx', () => {
    const source = readSource('../../apps/Calendar.tsx');

    it('has aria-label on Previous month button', () => {
      expect(source).toContain('aria-label="Previous month"');
    });

    it('has aria-label on Next month button', () => {
      expect(source).toContain('aria-label="Next month"');
    });
  });

  describe('Email.tsx', () => {
    const source = readSource('../../apps/Email.tsx');

    it('has aria-label on Close button', () => {
      expect(source).toContain('aria-label="Close"');
    });
  });

  describe('Chat.tsx', () => {
    const source = readSource('../../apps/Chat.tsx');

    it('has aria-label on Toggle emoji picker button', () => {
      expect(source).toContain('aria-label="Toggle emoji picker"');
    });

    it('has aria-label on Send message button', () => {
      expect(source).toContain('aria-label="Send message"');
    });
  });

  describe('Weather.tsx', () => {
    const source = readSource('../../apps/Weather.tsx');

    it('has aria-label on Refresh weather button', () => {
      expect(source).toContain('aria-label="Refresh weather"');
    });
  });

  describe('LoginScreen.tsx', () => {
    const source = readSource('../LoginScreen.tsx');

    it('has aria-label on the Power (shutdown) icon-only button', () => {
      expect(source).toMatch(/<button[^>]*aria-label="[^"]*[Pp]ower[^"]*"[^>]*>[\s\S]*?<Power/);
    });

    it('has aria-label on the Sleep (Moon) icon-only button', () => {
      expect(source).toMatch(/<button[^>]*aria-label="[^"]*[Ss]leep[^"]*"[^>]*>[\s\S]*?<Moon/);
    });

    it('has aria-label on the Log out (LogOut) icon-only button', () => {
      expect(source).toMatch(/<button[^>]*aria-label="[^"]*[Ll]og\s?out[^"]*"[^>]*>[\s\S]*?<LogOut/);
    });
  });

  describe('Whiteboard.tsx', () => {
    const source = readSource('../../apps/Whiteboard.tsx');
    it('has aria-label on icon-only buttons', () => {
      expect(source).toMatch(/<button[^>]*aria-label="Undo"[^>]*>/);
      expect(source).toMatch(/<button[^>]*aria-label="Redo"[^>]*>/);
      expect(source).toMatch(/<button[^>]*aria-label="Clear canvas"[^>]*>/);
      expect(source).toMatch(/<button[^>]*aria-label="Export canvas"[^>]*>/);
    });
  });

  describe('Drawing.tsx', () => {
    const source = readSource('../../apps/Drawing.tsx');
    it('has aria-label on icon-only buttons', () => {
      expect(source).toContain('aria-label="Undo"');
      expect(source).toContain('aria-label="Redo"');
      expect(source).toContain('aria-label="Toggle grid"');
      expect(source).toContain('aria-label="Clear canvas"');
      expect(source).toContain('aria-label="Export image"');
    });
  });

  describe('MarkdownPreview.tsx', () => {
    const source = readSource('../../apps/MarkdownPreview.tsx');
    it('has aria-label on toolbar buttons', () => {
      expect(source).toContain('aria-label="Bold"');
      expect(source).toContain('aria-label="Italic"');
      expect(source).toContain('aria-label="Heading"');
      expect(source).toContain('aria-label="Link"');
      expect(source).toContain('aria-label="Image"');
      expect(source).toContain('aria-label="Code"');
      expect(source).toContain('aria-label="Quote"');
      expect(source).toContain('aria-label="Bullet list"');
      expect(source).toContain('aria-label="Numbered list"');
      expect(source).toContain('aria-label="Task list"');
      expect(source).toContain('aria-label="Horizontal rule"');
    });
  });

  describe('ApiTester.tsx', () => {
    const source = readSource('../../apps/ApiTester.tsx');
    it('has aria-label on icon-only buttons', () => {
      expect(source).toContain('aria-label="Save request"');
      expect(source).toContain('aria-label="Remove parameter"');
      expect(source).toContain('aria-label="Remove header"');
    });
  });

  describe('Contacts.tsx', () => {
    const source = readSource('../../apps/Contacts.tsx');
    it('has aria-label on icon-only buttons', () => {
      expect(source).toContain('aria-label="Toggle favorite"');
      expect(source).toContain('aria-label="Edit contact"');
      expect(source).toContain('aria-label="Delete contact"');
    });
  });

  describe('ColorPicker.tsx', () => {
    const source = readSource('../../apps/ColorPicker.tsx');
    it('has aria-label on copy buttons', () => {
      expect(source).toContain('aria-label="Copy HEX value"');
      expect(source).toContain('aria-label="Copy RGB value"');
      expect(source).toContain('aria-label="Copy HSL value"');
      expect(source).toContain('aria-label="Copy CMYK value"');
    });
  });

  describe('NetworkTools.tsx', () => {
    const source = readSource('../../apps/NetworkTools.tsx');
    it('has aria-label on clear button', () => {
      expect(source).toContain('aria-label="Clear results"');
    });
  });

  describe('MediaConverter.tsx', () => {
    const source = readSource('../../apps/MediaConverter.tsx');
    it('has aria-label on icon-only buttons', () => {
      expect(source).toContain('aria-label="Toggle settings"');
      expect(source).toContain('aria-label="Download file"');
      expect(source).toContain('aria-label="Delete job"');
      expect(source).toContain('aria-label="Close file picker"');
    });
  });

  describe('Notes.tsx', () => {
    const source = readSource('../../apps/Notes.tsx');
    it('has aria-label on icon-only buttons', () => {
      expect(source).toContain('aria-label="Create folder"');
      expect(source).toContain('aria-label="Cancel new folder"');
    });
  });

  describe('RssReader.tsx', () => {
    const source = readSource('../../apps/RssReader.tsx');
    it('has aria-label on back button', () => {
      expect(source).toContain('aria-label="Back to feed list"');
    });
  });

  describe('Todo.tsx', () => {
    const source = readSource('../../apps/Todo.tsx');
    it('has aria-label on add new task button', () => {
      expect(source).toContain('aria-label="Add new task"');
    });
  });

  describe('CodeEditor.tsx', () => {
    const source = readSource('../../apps/CodeEditor.tsx');
    it('has aria-label on close tab button', () => {
      expect(source).toContain('aria-label="Close tab"');
    });
  });

  describe('ImageGallery.tsx', () => {
    const source = readSource('../../apps/ImageGallery.tsx');
    it('has aria-label on view toggle buttons', () => {
      expect(source).toContain('aria-label="Grid view"');
      expect(source).toContain('aria-label="Masonry view"');
    });
  });

  describe('PhotoEditor.tsx', () => {
    const source = readSource('../../apps/PhotoEditor.tsx');
    it('has aria-label on undo/redo buttons', () => {
      expect(source).toContain('aria-label="Undo"');
      expect(source).toContain('aria-label="Redo"');
    });
  });

  describe('FtpClient.tsx', () => {
    const source = readSource('../../apps/FtpClient.tsx');
    it('has aria-label on refresh button', () => {
      expect(source).toContain('aria-label="Refresh remote files"');
    });
  });

  describe('Base64Tool.tsx', () => {
    const source = readSource('../../apps/Base64Tool.tsx');
    it('has aria-label on clear button', () => {
      expect(source).toContain('aria-label="Clear all"');
    });
  });

  describe('Minesweeper.tsx', () => {
    const source = readSource('../../apps/Minesweeper.tsx');
    it('has aria-label on new game button', () => {
      expect(source).toContain('aria-label="New game"');
    });
  });

  describe('MusicPlayer.tsx', () => {
    const source = readSource('../../apps/MusicPlayer.tsx');
    it('has aria-label on icon-only buttons', () => {
      expect(source).toContain('aria-label="Toggle shuffle"');
      expect(source).toContain('aria-label="Previous track"');
      expect(source).toContain('aria-label={isPlaying ? "Pause" : "Play"}');
      expect(source).toContain('aria-label="Next track"');
      expect(source).toContain('aria-label="Toggle repeat"');
      expect(source).toContain('aria-label="Toggle mute"');
      expect(source).toContain('aria-label="Toggle playlist"');
    });
  });

  describe('PasswordManager.tsx', () => {
    const source = readSource('../../apps/PasswordManager.tsx');
    it('has aria-label on cancel PIN change button', () => {
      expect(source).toContain('aria-label="Cancel PIN change"');
    });
  });

  describe('VoiceRecorder.tsx', () => {
    const source = readSource('../../apps/VoiceRecorder.tsx');
    it('has aria-label on play/pause button', () => {
      expect(source).toContain('aria-label={playingId === recording.id ? "Pause" : "Play"}');
    });
    it('has aria-label on delete button', () => {
      expect(source).toContain('aria-label="Delete recording"');
    });
  });

  describe('Spreadsheet.tsx', () => {
    const source = readSource('../../apps/Spreadsheet.tsx');
    it('has aria-label on formatting and sheet buttons', () => {
      expect(source).toContain('aria-label="Bold"');
      expect(source).toContain('aria-label="Italic"');
      expect(source).toContain('aria-label="Background color"');
      expect(source).toContain('aria-label="Delete sheet"');
      expect(source).toContain('aria-label="Add sheet"');
    });
  });

  describe('ScreenRecorder.tsx', () => {
    const source = readSource('../../apps/ScreenRecorder.tsx');
    it('has aria-label on recording list buttons', () => {
      expect(source).toContain('aria-label="Download recording"');
      expect(source).toContain('aria-label="Delete recording"');
    });
  });

  describe('ArchiveManager.tsx', () => {
    const source = readSource('../../apps/ArchiveManager.tsx');
    it('has aria-label on icon-only buttons', () => {
      expect(source).toContain('aria-label={expanded ? "Collapse folder" : "Expand folder"}');
      expect(source).toContain('aria-label="Delete archive"');
    });
  });

  describe('DocumentViewer.tsx', () => {
    const source = readSource('../../apps/DocumentViewer.tsx');
    it('has aria-label on icon-only buttons', () => {
      expect(source).toContain('aria-label="Previous match"');
      expect(source).toContain('aria-label="Next match"');
      expect(source).toContain('aria-label="Close search"');
      expect(source).toContain('aria-label="Close file picker"');
    });
  });

  describe('ImageViewer.tsx', () => {
    const source = readSource('../../apps/ImageViewer.tsx');
    it('has aria-label on icon-only buttons', () => {
      expect(source).toContain('aria-label="Zoom out"');
      expect(source).toContain('aria-label="Zoom in"');
      expect(source).toContain('aria-label="Fit to window"');
      expect(source).toContain('aria-label="Actual size"');
      expect(source).toContain('aria-label={isSlideshow ? "Stop slideshow" : "Start slideshow"}');
      expect(source).toContain('aria-label="Toggle info"');
      expect(source).toContain('aria-label="Previous image"');
      expect(source).toContain('aria-label="Next image"');
      expect(source).toContain('aria-label="Close info"');
    });
  });

  describe('Reminders.tsx', () => {
    const source = readSource('../../apps/Reminders.tsx');
    it('has aria-label on icon-only buttons', () => {
      expect(source).toContain('aria-label="Close form"');
      expect(source).toContain('aria-label="Toggle complete"');
      expect(source).toContain('aria-label="Edit reminder"');
      expect(source).toContain('aria-label="Delete reminder"');
    });
  });
});

describe('Accessibility - Focus Visible Styles', () => {
  const readCssSource = (filePath: string): string => {
    return readFileSync(resolve(__dirname, filePath), 'utf-8');
  };

  it('has :focus-visible styles in index.css', () => {
    const cssSource = readCssSource('../../index.css');
    expect(cssSource).toContain(':focus-visible');
    expect(cssSource).toContain('outline:');
    expect(cssSource).toContain('var(--border-focus)');
  });

  it('removes default outline for mouse users', () => {
    const cssSource = readCssSource('../../index.css');
    expect(cssSource).toContain(':focus:not(:focus-visible)');
    expect(cssSource).toContain('outline: none;');
  });
});
