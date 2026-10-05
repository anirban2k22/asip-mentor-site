import { Suspense } from "react";
import { ProblemBrowser, ProblemBrowserStatic } from "@/components/ProblemBrowser";

export default function HomePage() {
  return (
    <Suspense fallback={<ProblemBrowserStatic />}>
      <ProblemBrowser />
    </Suspense>
  );
}
