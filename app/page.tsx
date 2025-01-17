import { fullName } from "app/sitemap";

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        {fullName}
      </h1>
      <p className="mb-4">Hi, 👋. I'm Yegeun.</p>
    </section>
  );
}
