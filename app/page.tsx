import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";

import { BotDialog } from "@/components/bot-dialog";
import { ChatAvatar } from "@/components/chat-avatar";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default async function Home() {
  await auth.protect();
  const seed = nanoid();

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <ChatAvatar seed={seed} />
          </EmptyMedia>
          <EmptyTitle>Meet your first bot</EmptyTitle>
          <EmptyDescription>
            Every bot gets its own personality, memory, and face. Spin one
            up and start the conversation.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <BotDialog />
        </EmptyContent>
      </Empty>
    </div>
  );
}
