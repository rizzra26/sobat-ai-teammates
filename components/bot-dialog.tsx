"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon, ShuffleIcon, TrashIcon } from "lucide-react"
import { nanoid } from "nanoid"
import { useRouter } from "next/navigation"
import { useState, type ReactElement } from "react"
import { Controller, useForm } from "react-hook-form"

import { createBot, deleteBot, updateBot } from "@/actions/bot"
import { ChatAvatar } from "@/components/chat-avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { botInsertSchema, type BotInput } from "@/db/schema"

const SUGGESTIONS = [
  {
    job: "Research assistant",
    instructions:
      "Answer briefly, cite sources, and ask before running anything destructive.",
  },
  {
    job: "Code reviewer",
    instructions:
      "Review for bugs and clarity, suggest the smallest fix, and explain the why.",
  },
  {
    job: "Writing editor",
    instructions:
      "Tighten the draft, keep the author's voice, and flag anything unclear.",
  },
  {
    job: "Tutor",
    instructions:
      "Break problems into small steps, ask questions, and never hand over the answer first.",
  },
]

type BotDefaults = {
  id: string
  name: string
  avatar: string
  job: string
  instructions: string | null
}

export function BotDialog({
  open: openProp,
  onOpenChange,
  bot,
  trigger = (
    <Button variant="secondary">
      <PlusIcon data-icon="inline-start" />
      Create a new bot
    </Button>
  ),
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  bot?: BotDefaults
  trigger?: ReactElement | null
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = openProp ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <BotForm bot={bot} onCreated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function BotForm({
  bot,
  onCreated,
}: {
  bot?: BotDefaults
  onCreated: () => void
}) {
  const [initialSeed] = useState(() => nanoid())
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const form = useForm<BotInput>({
    resolver: zodResolver(botInsertSchema),
    defaultValues: bot
      ? {
          name: bot.name,
          job: bot.job,
          instructions: bot.instructions ?? "",
          avatar: bot.avatar,
        }
      : {
          name: "",
          job: "",
          instructions: "",
          avatar: initialSeed,
        },
  })

  async function onSubmit(values: BotInput) {
    try {
      if (bot) {
        await updateBot(bot.id, values)
        toast.add({
          title: "Bot updated",
          description: `${values.name} has been saved.`,
          type: "success",
        })
      } else {
        await createBot(values)
        toast.add({
          title: "Bot created",
          description: `${values.name} is ready to go.`,
          type: "success",
        })
      }
      onCreated()
    } catch (error) {
      toast.add({
        title: bot ? "Could not update bot" : "Could not create bot",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        type: "error",
      })
    }
  }

  async function onDelete() {
    if (!bot) return
    setIsDeleting(true)
    try {
      await deleteBot(bot.id)
      toast.add({
        title: "Bot deleted",
        description: `${bot.name} is gone.`,
        type: "success",
      })
      onCreated()
      router.push("/")
    } catch (error) {
      toast.add({
        title: "Could not delete bot",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        type: "error",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <DialogHeader>
        <DialogTitle>{bot ? "Edit bot" : "New bot"}</DialogTitle>
        <DialogDescription>
          {bot
            ? "Change its face, name, or job."
            : "Give it a face, a name, and a job to do."}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <Button
            key={suggestion.job}
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => {
              form.setValue("job", suggestion.job, { shouldValidate: true })
              form.setValue("instructions", suggestion.instructions, {
                shouldValidate: true,
              })
            }}
          >
            {suggestion.job}
          </Button>
        ))}
      </div>

      <FieldGroup>
        <Controller
          name="avatar"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <ChatAvatar seed={field.value ?? initialSeed} className="size-10" />
              <FieldContent>
                <FieldTitle>Face</FieldTitle>
                <FieldDescription>
                  Shuffle until you find one you like.
                </FieldDescription>
              </FieldContent>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => field.onChange(nanoid())}
              >
                <ShuffleIcon data-icon="inline-start" />
                Shuffle
              </Button>
            </Field>
          )}
        />

        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="Ada"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="job"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Job</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="Research assistant"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="instructions"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>How it should work</FieldLabel>
              <Textarea
                {...field}
                value={field.value ?? ""}
                id={field.name}
                placeholder="Answer briefly, cite sources, and ask before running anything destructive."
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <DialogFooter className={bot ? "sm:justify-between" : undefined}>
        {bot && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isDeleting || form.formState.isSubmitting}
                />
              }
            >
              <TrashIcon data-icon="inline-start" />
              Delete
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {bot.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This deletes the bot and its chats. It cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  type="button"
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={onDelete}
                >
                  {isDeleting && <Spinner data-icon="inline-start" />}
                  Delete bot
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || isDeleting}
          >
            {form.formState.isSubmitting && (
              <Spinner data-icon="inline-start" />
            )}
            {bot ? "Save changes" : "Create bot"}
          </Button>
        </div>
      </DialogFooter>
    </form>
  )
}
