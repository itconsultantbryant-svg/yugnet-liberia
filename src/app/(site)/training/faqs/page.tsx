import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Training FAQs",
};

const faqs = [
  {
    q: "How do I enroll in a course?",
    a: "Open Courses, choose a program, and select Enroll Now. You will create a student account if you do not already have one.",
  },
  {
    q: "Are classes in person or online?",
    a: "Both. Each course lists its schedule and format. Online class links appear on your Student dashboard when scheduled.",
  },
  {
    q: "How do I verify a certificate?",
    a: "Use Verify Your Certificate with the graduate’s full name and certificate ID. Valid certificates return course and issue date only.",
  },
  {
    q: "Who can see my grades?",
    a: "Instructors submit grades; Admins approve them. You only see approved grades on your Student dashboard.",
  },
] as const;

export default function TrainingFaqsPage() {
  return (
    <>
      <PageHero
        eyebrow="Help"
        title="Training FAQs"
        description="Common questions about enrollment, classes, grades, and certificates."
      />
      <Section>
        <div className="mx-auto max-w-3xl space-y-8">
          {faqs.map((item) => (
            <div key={item.q} className="border-b border-line pb-6">
              <h3 className="font-display text-lg font-bold text-ink">{item.q}</h3>
              <p className="mt-2 text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
