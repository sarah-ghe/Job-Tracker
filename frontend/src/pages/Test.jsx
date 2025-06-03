import JobCard from "../components/JobCard";

export default function Test() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <JobCard
        title="Frontend Developer"
        company="Meta"
        location="Remote"
        date="May 18, 2025"
      />
    </div>
  );
}
