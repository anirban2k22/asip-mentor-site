import { Metadata } from "next";
import { ShortlistClient } from "./ShortlistClient";

export const metadata: Metadata = {
  title: "Shortlist",
  description: "Your shortlisted ASIP problem statements.",
};

export default function ShortlistPage() {
  return <ShortlistClient />;
}
