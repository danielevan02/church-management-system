"use client";

import Link from "@tiptap/extension-link";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { MarkdownStorage } from "tiptap-markdown";
import {
  Bold,
  HelpCircle,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Markdown } from "tiptap-markdown";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function getMarkdown(editor: Editor): string {
  const storage = editor.storage as unknown as { markdown: MarkdownStorage };
  return storage.markdown.getMarkdown();
}

export function WysiwygEditor({ value, onChange, placeholder }: Props) {
  const t = useTranslations("markdown");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Disable StarterKit's bundled Link so our configured one isn't duplicated.
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          class: "text-primary underline",
        },
      }),
      Markdown.configure({
        html: false,
        breaks: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none min-h-[240px] px-3 py-2 focus:outline-none",
          "prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary",
          "prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5",
          "prose-blockquote:border-l-2 prose-blockquote:border-primary/30 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-muted-foreground",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const md = getMarkdown(editor);
      onChange(md);
    },
  });

  // Keep editor in sync when react-hook-form resets the field externally.
  useEffect(() => {
    if (!editor) return;
    const current = getMarkdown(editor);
    if (current !== value) {
      editor.commands.setContent(value || "", {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-md border border-input">
      <TooltipProvider delayDuration={200}>
        <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/30 p-1">
          <ToolbarButton
            tooltip={t("tools.bold")}
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip={t("tools.italic")}
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip={t("tools.heading")}
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <Separator />
          <ToolbarButton
            tooltip={t("tools.bullet")}
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip={t("tools.numbered")}
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip={t("tools.quote")}
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <Separator />
          <ToolbarButton
            tooltip={t("tools.link")}
            active={editor.isActive("link")}
            onClick={() => promptLink(editor, t("placeholders.linkUrl"))}
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          <div className="ml-auto">
            <HelpDialog />
          </div>
        </div>
      </TooltipProvider>
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
}

function promptLink(editor: Editor, placeholder: string) {
  const previous = editor.getAttributes("link").href as string | undefined;
  const url = window.prompt(placeholder, previous ?? "https://");
  if (url === null) return;
  if (url.trim() === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
}

function Separator() {
  return <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />;
}

function ToolbarButton({
  tooltip,
  onClick,
  active,
  children,
}: {
  tooltip: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={active ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function HelpDialog() {
  const t = useTranslations("markdown.help");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">{t("button")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitleWysiwyg")}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>{t("tipsWysiwyg.select")}</li>
          <li>{t("tipsWysiwyg.list")}</li>
          <li>{t("tipsWysiwyg.link")}</li>
          <li>{t("tipsWysiwyg.shortcut")}</li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}
