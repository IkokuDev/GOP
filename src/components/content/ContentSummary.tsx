"use client";

// NOTE: This is a placeholder component. It returns a substring of the content.
// The AI summarization flow has been removed.

type ContentSummaryProps = {
  content: string;
};

export default function ContentSummary({ content }: ContentSummaryProps) {
  const summary = content.substring(0, 150) + '...';

  return (
    <p className="text-muted-foreground text-sm">
      {summary}
    </p>
  );
}
