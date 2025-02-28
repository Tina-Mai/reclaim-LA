import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ResearchHeaderProps {
  title: string;
}

export function ResearchHeader({ title }: ResearchHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="font-mono text-4xl">{title}</h1>
      <Button variant="secondary" asChild>
        <Link href="/research">Research New Topic</Link>
      </Button>
    </div>
  );
}
