import { experience } from "@content/experience";

export function ExperienceList() {
  return (
    <section id="experience" className="p-2 sm:p-6 space-y-4 fade-in">
      <div className="p-1 sm:p-5 space-y-4 max-w-[700px] mx-auto">
        {experience.map((role) => (
          <div key={role.id}>
            <h1 className="text-2xl md:text-4xl font-bold text-left">{role.title}</h1>
            <br />
            <p className="text-sm md:text-lg text-left">
              {role.company} | {role.period} | {role.location}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
