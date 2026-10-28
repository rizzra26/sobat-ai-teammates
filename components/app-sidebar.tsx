"use client"

import { UserButton } from "@clerk/nextjs"
import { differenceInSeconds, formatDistanceToNowStrict } from "date-fns"
import { PlusIcon, SearchIcon, UsersIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { BotDialog } from "@/components/bot-dialog"
import { ChatAvatar } from "@/components/chat-avatar"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  sidebarMenuButtonVariants,
  useSidebar,
} from "@/components/ui/sidebar"
import type { ChatSummary } from "@/queries/bots"
import { cn } from "cn"

function timeAgo(date: Date) {
  if (differenceInSeconds(new Date(), date) < 60) return "now"
  return formatDistanceToNowStrict(date, { roundingMethod: "floor" }).replace(
    /^1 (\w+)$/,
    "1 $1s"
  )
}

function userButtonAppearance(collapsed: boolean) {
  return {
    elements: {
      rootBox: "w-full!",
      userButtonBox: cn(
        "flex w-full! items-center",
        collapsed ? "justify-center! gap-0!" : "justify-start! gap-2"
      ),
      userButtonTrigger: cn(
        sidebarMenuButtonVariants({ size: collapsed ? "default" : "lg" }),
        collapsed
          ? "justify-center! overflow-visible! text-sidebar-foreground! group-data-[collapsible=icon]:p-0! hover:bg-sidebar-accent! hover:text-sidebar-accent-foreground! active:bg-sidebar-accent! focus-visible:ring-2! focus-visible:ring-sidebar-ring!"
          : "h-12! w-full! justify-start! gap-2! p-2! text-sidebar-foreground! hover:bg-sidebar-accent! hover:text-sidebar-accent-foreground! active:bg-sidebar-accent! active:text-sidebar-accent-foreground! focus-visible:ring-2! focus-visible:ring-sidebar-ring!"
      ),
      userButtonAvatarBox: "order-first size-6!",
      userButtonOuterIdentifier:
        "min-w-0 truncate ps-0! text-sm! font-medium group-data-[collapsible=icon]:hidden",
    },
  }
}

export function AppSidebar({ chats }: { chats: ChatSummary[] }) {
  const [botOpen, setBotOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const router = useRouter()
  const { state, isMobile } = useSidebar()
  const collapsed = state === "collapsed" && !isMobile
  const openChat = (chatId: string) => router.push(`/chats/${chatId}`)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className={cn("flex", collapsed ? "justify-center" : "justify-end")}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="New chat"
                  className="aria-expanded:bg-transparent"
                >
                  <PlusIcon />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setBotOpen(true)}>
                <PlusIcon />
                Create a new bot
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UsersIcon />
                Create a group chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="border border-input dark:bg-input/30"
          >
            <SearchIcon className="opacity-50" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => setSearchOpen(true)}
            className="h-8 w-full min-w-0 justify-start gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base font-normal text-muted-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
          >
            <SearchIcon className="opacity-50" />
            Search
            <Kbd className="ml-auto">⌘K</Kbd>
          </Button>
        )}
        <BotDialog open={botOpen} onOpenChange={setBotOpen} trigger={null} />
        <CommandDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          title="Search chats"
          description="Find a chat with your bots."
        >
          <Command>
            <CommandInput placeholder="Search chats..." />
            <CommandList>
              <CommandEmpty>No chats found.</CommandEmpty>
              <CommandGroup heading="Chats">
                {chats.map((chat) => (
                  <CommandItem
                    key={chat.id}
                    value={`${chat.name} ${chat.preview ?? ""}`}
                    onSelect={() => {
                      setSearchOpen(false)
                      router.push(`/chats/${chat.id}`)
                    }}
                  >
                    <ChatAvatar seed={chat.avatar} className="size-8" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">{chat.name}</span>
                      {chat.preview && (
                        <span className="truncate text-xs text-muted-foreground">
                          {chat.preview}
                        </span>
                      )}
                    </span>
                    <CommandShortcut suppressHydrationWarning>
                      {timeAgo(chat.lastMessageAt)}
                    </CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    size={collapsed ? "default" : "lg"}
                    className={cn(
                      collapsed
                        ? "group-data-[collapsible=icon]:p-1!"
                        : "h-auto min-h-12 pr-16"
                    )}
                    tooltip={collapsed ? chat.name : undefined}
                    onClick={() => openChat(chat.id)}
                  >
                    <ChatAvatar seed={chat.avatar} size={collapsed ? 24 : 32} />
                    {!collapsed && (
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                        <span className="truncate font-medium">{chat.name}</span>
                        {chat.preview && (
                          <span className="truncate text-xs text-muted-foreground">
                            {chat.preview}
                          </span>
                        )}
                      </span>
                    )}
                  </SidebarMenuButton>
                  {!collapsed && (
                    <SidebarMenuBadge suppressHydrationWarning>
                      {timeAgo(chat.lastMessageAt)}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserButton
              showName={!collapsed}
              appearance={userButtonAppearance(collapsed)}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
