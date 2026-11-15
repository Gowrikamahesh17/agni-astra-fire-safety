import type { Metadata } from "next";
import TeamSection from "@/components/TeamSection";

export const metadata: Metadata = { title: "Team" };

export default function Page() {
  return <TeamSection />;
}
