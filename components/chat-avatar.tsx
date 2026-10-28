import { Avatar, Style } from "@dicebear/core"
import gaze from "@dicebear/styles/gaze.json"
import Image from "next/image"

import { cn } from "cn"

const gazeStyle = new Style(gaze)

type ChatAvatarProps = {
  seed: string
  animated?: boolean
  size?: number
  className?: string
}

export function ChatAvatar({
  seed,
  animated = false,
  size = 32,
  className,
}: ChatAvatarProps) {
  const src = new Avatar(gazeStyle, {
    seed,
    size,
    animationVariant: animated ? "medium" : "none",
  }).toDataUri()

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full", className)}
    />
  )
}
