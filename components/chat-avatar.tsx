import { Avatar, Style } from "@dicebear/core"
import gaze from "@dicebear/styles/gaze.json"
import Image from "next/image"

import { cn } from "cn"

const gazeStyle = new Style(gaze)

type ChatAvatarProps = {
  seed: string
  animated?: boolean
  className?: string
}

export function ChatAvatar({ seed, animated = false, className }: ChatAvatarProps) {
  const src = new Avatar(gazeStyle, {
    seed,
    size: 32,
    animationVariant: animated ? "medium" : "none",
  }).toDataUri()

  return (
    <Image
      src={src}
      alt=""
      width={32}
      height={32}
      className={cn("shrink-0 rounded-full", className)}
    />
  )
}
