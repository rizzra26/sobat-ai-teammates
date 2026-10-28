"use client"

import { MonitorIcon } from "lucide-react"

import { BotDialog } from "@/components/bot-dialog"
import { ChatAvatar } from "@/components/chat-avatar"
import { Button } from "@/components/ui/button"
import type { ChatDetail } from "@/queries/chats"

export function ChatHeader({ chat }: { chat: ChatDetail }) {
  const label = (
    <Button variant="ghost" className="h-auto min-w-0 gap-2 px-2 py-1">
      <ChatAvatar seed={chat.avatar} size={32} />
      <span className="truncate text-sm">{chat.name}</span>
    </Button>
  )

  return (
    <header className="flex h-10 shrink-0 items-center gap-2 px-5 my-2">
      {chat.bot ? (
        <BotDialog bot={chat.bot} trigger={label} />
      ) : (
        <span className="flex items-center gap-2">
          <ChatAvatar seed={chat.avatar} size={32} />
          <span className="min-w-0 truncate text-sm">{chat.name}</span>
        </span>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Desktop"
        className="-mr-1.5 ml-auto"
      >
        <MonitorIcon />
      </Button>
    </header>
  )
}
