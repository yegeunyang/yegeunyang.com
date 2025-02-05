import { fullName } from "app/sitemap";

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        {fullName}
      </h1>
      <p className="mb-4">Hi, 👋. I&apos;m Yegeun.</p>

      <p className="mb-4">
        I&apos;m a senior studying Computer Science and Math at UW-Madison.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-semibold tracking-tighter">Fun side projects</h2>
      <ul>
        <li className="mb-4">
          <a href="https://odin-cv-application-weld.vercel.app" className="underline">Resumé builder</a>
          <p>A web application for creating resumés, developed with React.js.<br/>(Works only on a desktop)</p>
        </li>

        <li className="mb-4">
          <a href="https://github.com/yegeunyang/amicable_calculator_in_MIPS" className="underline">Amicable Number Calculator in MIPS Assembly</a>
          <p>A program that calculates all the pairs of amicable numbers that fall within the given range.<br/>(MARS MIPS simulator is needed to run)</p>
        </li>
      </ul>
    </section>
  );
}
