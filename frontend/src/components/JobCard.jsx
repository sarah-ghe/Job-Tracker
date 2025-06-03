export default function JobCard({ title, company, location, date }) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-4 hover:shadow-lg transition">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <p className="text-sm text-gray-600">{company} — {location}</p>
      <p className="text-xs text-gray-400 mt-2">Posted on: {date}</p>
    </div>
  );
}
