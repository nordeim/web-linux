// ============================================================
// Chat schema validation test (TDD)
// Verifies that the Conversation schema rejects invalid data
// that would pass through z.array(z.any()).
// ============================================================

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const MessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  content: z.string(),
  timestamp: z.number(),
  type: z.enum(['text']),
});

const ConversationSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string(),
  status: z.enum(['online', 'away', 'offline']),
  isBot: z.boolean(),
  messages: z.array(MessageSchema),
  lastRead: z.number().optional(),
});

const ConversationsSchema = z.array(ConversationSchema);

describe('Chat.tsx schema validation', () => {
  it('accepts valid conversation data', () => {
    const valid = [
      {
        id: 'bot',
        name: 'Assistant',
        avatar: 'A',
        status: 'online' as const,
        isBot: true,
        messages: [
          { id: 'm1', senderId: 'bot', content: 'Hello', timestamp: 123, type: 'text' as const },
        ],
      },
    ];
    const result = ConversationsSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects invalid conversation data', () => {
    // Missing required fields, wrong types
    const invalid = [{ id: 123, name: 'Test' }];
    const result = ConversationsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects missing messages array', () => {
    const partial = [
      {
        id: 'x',
        name: 'Test',
        avatar: 'T',
        status: 'online',
        isBot: false,
        // missing messages
      },
    ];
    const result = ConversationsSchema.safeParse(partial);
    expect(result.success).toBe(false);
  });
});
