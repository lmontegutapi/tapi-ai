"use client";

import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Link from "next/link";

export function UploadLinkButton() {
  return (
    <Button asChild>
      <Link href="/dashboard/receivables/upload">
        <Upload className="mr-1 h-2 w-2" />
        Subir csv
      </Link>
    </Button>
  );
}