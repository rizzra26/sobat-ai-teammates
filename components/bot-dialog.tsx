"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon, ShuffleIcon } from "lucide-react"
import { nanoid } from "nanoid"
import { useState, type ReactElement } from "react"
import { Controller, useForm } from "react-hook-form"

import { createBot } from "@/actions/bot"
import { ChatAvatar } from "@/components/chat-avatar"
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

export function BotDialog({
  open: openProp,
  onOpenChange,
  trigger = (
    <Button variant="secondary">
      <PlusIcon data-icon="inline-start" />
      Create a new bot
    </Button>
  ),
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactElement | null
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = openProp ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <BotForm onCreated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function BotForm({ onCreated }: { onCreated: () => void }) {
  const [initialSeed] = useState(() => nanoid())

  const form = useForm<BotInput>({
    resolver: zodResolver(botInsertSchema),
    defaultValues: {
      name: "",
      job: "",
      instructions: "",
      avatar: initialSeed,
    },
  })

  async function onSubmit(values: BotInput) {
    try {
      await createBot(values)
      toast.add({
        title: "Bot created",
        description: `${values.name} is ready to go.`,
        type: "success",
      })
      onCreated()
    } catch (error) {
      toast.add({
        title: "Could not create bot",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        type: "error",
      })
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <DialogHeader>
        <DialogTitle>New bot</DialogTitle>
        <DialogDescription>
          Give it a face, a name, and a job to do.
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

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Spinner data-icon="inline-start" />}
          Create bot
        </Button>
      </DialogFooter>
    </form>
  )
}
