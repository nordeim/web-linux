#!/usr/bin/env python3
"""
Parse a JSONL agent session transcript and convert it to a well-structured,
viewable Markdown document.
"""

import json
import os
from datetime import datetime, timezone, timedelta

INPUT_PATH = "/home/z/my-project/upload/session.jsonl"
OUTPUT_PATH = "/home/z/my-project/download/agent_session_transcript.md"

# Timezone for display (Asia/Singapore = UTC+8)
SGT = timezone(timedelta(hours=8))


def fmt_ts(ts_str: str) -> str:
    """Format an ISO timestamp to a human-readable string in SGT."""
    try:
        dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        dt_sgt = dt.astimezone(SGT)
        return dt_sgt.strftime("%Y-%m-%d %H:%M:%S SGT")
    except Exception:
        return ts_str


def fmt_epoch_ms(ms: int) -> str:
    """Format epoch milliseconds to a human-readable string in SGT."""
    try:
        dt = datetime.fromtimestamp(ms / 1000, tz=timezone.utc)
        dt_sgt = dt.astimezone(SGT)
        return dt_sgt.strftime("%Y-%m-%d %H:%M:%S SGT")
    except Exception:
        return str(ms)


def truncate_text(text: str, max_len: int = 3000) -> str:
    """Truncate text with a clear indicator if too long."""
    if len(text) <= max_len:
        return text
    return text[:max_len] + f"\n\n> ... *[truncated — {len(text) - max_len:,} more characters]*"


def escape_md(text: str) -> str:
    """Lightweight markdown escaping for text inside code blocks is not needed;
    for normal text we just return as-is since we mostly wrap in code fences."""
    return text


def render_content_block(block: dict, indent: str = "") -> str:
    """Render a single content block from a message."""
    btype = block.get("type", "")

    if btype == "text":
        return block.get("text", "")

    elif btype == "thinking":
        thinking = block.get("thinking", "")
        signature = block.get("thinkingSignature", "")
        lines = [
            f"{indent}<details>",
            f"{indent}<summary>🧠 <strong>Thinking</strong>{' (signed)' if signature else ''}</summary>",
            f"{indent}",
            f"{indent}{truncate_text(thinking, 4000)}",
            f"{indent}",
            f"{indent}</details>",
        ]
        return "\n".join(lines)

    elif btype == "toolCall":
        tool_name = block.get("name", "unknown")
        tool_id = block.get("id", "")
        args = block.get("arguments", {})
        args_str = json.dumps(args, indent=2, ensure_ascii=False)
        lines = [
            f"{indent}🔧 **Tool Call**: `{tool_name}`",
            f"{indent}- **ID**: `{tool_id}`",
            f"{indent}- **Arguments**:",
            f"{indent}",
            f"{indent}```json",
        ]
        for line in args_str.split("\n"):
            lines.append(f"{indent}{line}")
        lines.append(f"{indent}```")
        return "\n".join(lines)

    elif btype == "tool_result":
        # Not typically rendered inline; handled at message level
        return ""

    else:
        return f"{indent}*[Unknown content block type: {btype}]*"


def render_tool_result_content(content_list: list) -> str:
    """Render the content of a tool result message."""
    parts = []
    for block in content_list:
        btype = block.get("type", "")
        if btype == "text":
            text = block.get("text", "")
            parts.append(truncate_text(text, 5000))
        else:
            parts.append(f"*[{btype} content]*")
    return "\n\n".join(parts)


def parse_and_render():
    """Main function: parse JSONL and write Markdown."""
    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        lines = f.readlines()

    entries = []
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
            obj["_line"] = i + 1
            entries.append(obj)
        except json.JSONDecodeError as e:
            entries.append({"type": "parse_error", "_line": i + 1, "error": str(e), "raw": line[:200]})

    md_parts = []

    # ── Title & Session Metadata ──────────────────────────────────
    md_parts.append("# Agent Session Transcript\n")
    md_parts.append("> Auto-extracted from `session.jsonl` into a viewable Markdown document.\n")

    # Extract session entry
    session_entry = next((e for e in entries if e.get("type") == "session"), None)
    if session_entry:
        md_parts.append("## Session Metadata\n")
        md_parts.append(f"| Field | Value |")
        md_parts.append(f"|:------|:------|")
        md_parts.append(f"| **Session ID** | `{session_entry.get('id', 'N/A')}` |")
        md_parts.append(f"| **Version** | {session_entry.get('version', 'N/A')} |")
        md_parts.append(f"| **Started At** | {fmt_ts(session_entry.get('timestamp', ''))} |")
        md_parts.append(f"| **Working Directory** | `{session_entry.get('cwd', 'N/A')}` |")
        md_parts.append("")

    # Model & thinking level changes
    model_changes = [e for e in entries if e.get("type") == "model_change"]
    thinking_changes = [e for e in entries if e.get("type") == "thinking_level_change"]
    compactions = [e for e in entries if e.get("type") == "compaction"]

    if model_changes:
        md_parts.append("## Model Changes\n")
        md_parts.append("| # | Timestamp | Provider | Model ID |")
        md_parts.append("|:--|:----------|:---------|:---------|")
        for idx, mc in enumerate(model_changes, 1):
            md_parts.append(
                f"| {idx} | {fmt_ts(mc.get('timestamp', ''))} | "
                f"{mc.get('provider', 'N/A')} | `{mc.get('modelId', 'N/A')}` |"
            )
        md_parts.append("")

    if thinking_changes:
        md_parts.append("## Thinking Level Changes\n")
        md_parts.append("| # | Timestamp | Level |")
        md_parts.append("|:--|:----------|:------|")
        for idx, tc in enumerate(thinking_changes, 1):
            md_parts.append(
                f"| {idx} | {fmt_ts(tc.get('timestamp', ''))} | `{tc.get('thinkingLevel', 'N/A')}` |"
            )
        md_parts.append("")

    if compactions:
        md_parts.append("## Context Compactions\n")
        md_parts.append(f"Total compactions: **{len(compactions)}**\n")
        for idx, comp in enumerate(compactions, 1):
            md_parts.append(f"### Compaction {idx}\n")
            summary = comp.get("summary", "")
            if summary:
                md_parts.append(truncate_text(summary, 6000))
            md_parts.append("")

    # ── Conversation Transcript ───────────────────────────────────
    md_parts.append("---\n")
    md_parts.append("# Conversation Transcript\n")

    message_entries = [e for e in entries if e.get("type") == "message"]

    msg_counter = 0
    for entry in message_entries:
        msg = entry.get("message", {})
        role = msg.get("role", "unknown")
        content = msg.get("content", [])
        timestamp = msg.get("timestamp", None)
        api = msg.get("api", "")
        provider = msg.get("provider", "")
        model = msg.get("model", "")
        usage = msg.get("usage", {})
        stop_reason = msg.get("stopReason", "")
        response_id = msg.get("responseId", "")
        entry_id = entry.get("id", "")

        # Timestamp display
        ts_display = ""
        if timestamp:
            ts_display = fmt_epoch_ms(timestamp) if isinstance(timestamp, (int, float)) else fmt_ts(str(timestamp))

        msg_counter += 1

        # ── Role-specific rendering ──
        if role == "user":
            md_parts.append(f"## 👤 User Message {msg_counter}\n")
            if ts_display:
                md_parts.append(f"*{ts_display}*\n")
            for block in content:
                if block.get("type") == "text":
                    md_parts.append(truncate_text(block.get("text", ""), 8000))
                    md_parts.append("")
            md_parts.append("---\n")

        elif role == "assistant":
            # Collect metadata
            meta_parts = []
            if ts_display:
                meta_parts.append(f"⏰ {ts_display}")
            if provider:
                meta_parts.append(f"🔌 {provider}")
            if model:
                meta_parts.append(f"🤖 `{model}`")
            if stop_reason:
                meta_parts.append(f"⏹️ Stop: `{stop_reason}`")

            md_parts.append(f"## 🤖 Assistant Message {msg_counter}\n")
            if meta_parts:
                md_parts.append(" | ".join(meta_parts))
                md_parts.append("")

            # Usage stats
            if usage:
                total = usage.get("totalTokens", 0)
                inp = usage.get("input", 0)
                out = usage.get("output", 0)
                cache_r = usage.get("cacheRead", 0)
                md_parts.append(
                    f"> 📊 Tokens — Input: {inp:,} | Output: {out:,} | "
                    f"Cache Read: {cache_r:,} | **Total: {total:,}**"
                )
                md_parts.append("")

            # Content blocks
            has_thinking = False
            has_text = False
            has_tool_call = False
            text_parts = []
            thinking_parts = []
            tool_call_parts = []

            for block in content:
                btype = block.get("type", "")
                if btype == "thinking":
                    has_thinking = True
                    thinking_parts.append(render_content_block(block))
                elif btype == "text":
                    has_text = True
                    text_parts.append(block.get("text", ""))
                elif btype == "toolCall":
                    has_tool_call = True
                    tool_call_parts.append(render_content_block(block))

            # Render thinking (collapsible)
            if has_thinking:
                for tp in thinking_parts:
                    md_parts.append(tp)
                    md_parts.append("")

            # Render text
            if has_text:
                for tp in text_parts:
                    md_parts.append(tp)
                    md_parts.append("")

            # Render tool calls
            if has_tool_call:
                for tcp in tool_call_parts:
                    md_parts.append(tcp)
                    md_parts.append("")

            md_parts.append("---\n")

        elif role == "toolResult":
            tool_name = msg.get("toolName", "unknown")
            tool_call_id = msg.get("toolCallId", "")
            is_error = msg.get("isError", False)
            tool_content = msg.get("content", [])

            error_badge = " ❌ **ERROR**" if is_error else ""
            md_parts.append(f"### 📤 Tool Result{error_badge}\n")
            md_parts.append(f"- **Tool**: `{tool_name}`")
            md_parts.append(f"- **Call ID**: `{tool_call_id}`")
            md_parts.append("")

            rendered = render_tool_result_content(tool_content)
            # Wrap in code block for readability
            md_parts.append("````")
            md_parts.append(rendered)
            md_parts.append("````")
            md_parts.append("")

        else:
            md_parts.append(f"## ❓ Unknown Role: `{role}`\n")
            md_parts.append(f"```json")
            md_parts.append(json.dumps(msg, indent=2, ensure_ascii=False)[:2000])
            md_parts.append(f"```")
            md_parts.append("")

    # ── Summary Statistics ────────────────────────────────────────
    md_parts.append("---\n")
    md_parts.append("# Session Statistics\n")

    user_msgs = sum(1 for e in message_entries if e.get("message", {}).get("role") == "user")
    assistant_msgs = sum(1 for e in message_entries if e.get("message", {}).get("role") == "assistant")
    tool_result_msgs = sum(1 for e in message_entries if e.get("message", {}).get("role") == "toolResult")

    total_input = 0
    total_output = 0
    total_tokens = 0
    for e in message_entries:
        u = e.get("message", {}).get("usage", {})
        total_input += u.get("input", 0)
        total_output += u.get("output", 0)
        total_tokens += u.get("totalTokens", 0)

    md_parts.append("| Metric | Value |")
    md_parts.append("|:-------|:------|")
    md_parts.append(f"| Total Messages | {len(message_entries)} |")
    md_parts.append(f"| User Messages | {user_msgs} |")
    md_parts.append(f"| Assistant Messages | {assistant_msgs} |")
    md_parts.append(f"| Tool Results | {tool_result_msgs} |")
    md_parts.append(f"| Model Changes | {len(model_changes)} |")
    md_parts.append(f"| Thinking Level Changes | {len(thinking_changes)} |")
    md_parts.append(f"| Compactions | {len(compactions)} |")
    md_parts.append(f"| Total Input Tokens | {total_input:,} |")
    md_parts.append(f"| Total Output Tokens | {total_output:,} |")
    md_parts.append(f"| Total Tokens | {total_tokens:,} |")
    md_parts.append("")

    # Unique tools used
    tools_used = set()
    for e in message_entries:
        msg = e.get("message", {})
        if msg.get("role") == "assistant":
            for block in msg.get("content", []):
                if block.get("type") == "toolCall":
                    tools_used.add(block.get("name", "unknown"))
        elif msg.get("role") == "toolResult":
            tn = msg.get("toolName", "")
            if tn:
                tools_used.add(tn)

    if tools_used:
        md_parts.append("## Tools Used\n")
        for tool in sorted(tools_used):
            md_parts.append(f"- `{tool}`")
        md_parts.append("")

    # Write output
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(md_parts))

    print(f"✅ Markdown transcript written to: {OUTPUT_PATH}")
    print(f"   Lines: {len(lines)}, Messages: {len(message_entries)}, Output chars: {len(''.join(md_parts)):,}")


if __name__ == "__main__":
    parse_and_render()

