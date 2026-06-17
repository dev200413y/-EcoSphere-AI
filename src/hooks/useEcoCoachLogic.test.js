import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useEcoCoachLogic } from './useEcoCoachLogic';

describe('useEcoCoachLogic', () => {
  it('should initialize with a welcome message', () => {
    const { result } = renderHook(() => useEcoCoachLogic());
    expect(result.current.messages.length).toBe(1);
    expect(result.current.messages[0].sender).toBe('ai');
    expect(result.current.messages[0].text).toContain('Hi! I\'m your contextual Eco Coach.');
  });

  it('should handle sending a message and getting a contextual driving response', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: "Driving has a high carbon footprint. Have you considered carpooling?" } }] })
      })
    );

    const { result } = renderHook(() => useEcoCoachLogic());

    await act(async () => {
      await result.current.handleSendMessage('I drove my car today.');
    });

    const msgs = result.current.messages;
    expect(msgs.length).toBe(3); // Welcome + User + AI Reply
    expect(msgs[1].sender).toBe('user');
    expect(msgs[1].text).toBe('I drove my car today.');
    expect(msgs[2].sender).toBe('ai');
    expect(msgs[2].text).toContain('Driving has a high carbon footprint');
  });

  it('should sanitize HTML input', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: "Beef has one of the highest carbon footprints." } }] })
      })
    );

    const { result } = renderHook(() => useEcoCoachLogic());

    await act(async () => {
      await result.current.handleSendMessage('<script>alert(1)</script> Hello meat');
    });

    const msgs = result.current.messages;
    expect(msgs[1].text).not.toContain('<script>');
    expect(msgs[2].text).toContain('Beef has one of the highest carbon footprints');
  });
});
