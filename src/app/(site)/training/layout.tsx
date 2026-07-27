import { TrainingSubNav } from "@/components/layout/TrainingSubNav";

export default function TrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TrainingSubNav />
      {children}
    </>
  );
}
