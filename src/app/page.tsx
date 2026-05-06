import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        {/* Replace with logo: <img src="/logo.png" alt="Logo" className="w-64 mb-8" /> */}
        <h1 className="text-6xl md:text-8xl font-bold text-Accent mb-6">
          YourBrand
        </h1>
        <p className="text-xl md:text-2xl text-Text/80 max-w-xl mb-10">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <Link
          id="cta"
          href="/about"
          className="hover-glitch font-bold bg-Accent text-Primary px-8 py-4 rounded-lg hover:opacity-80 transition-all text-xl"
        >
          Learn More →
        </Link>
      </section>

      {/* About Teaser */}
      <section className="py-16 px-4 max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">What We Do</h2>
        <p className="text-lg text-Text/80 leading-relaxed">
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </p>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-Accent">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-Primary">Ready to get started?</h2>
          <p className="text-lg text-Primary/80 mb-8">
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum.
          </p>
          <Link href="/contact" className="hover-glitch text-Primary font-bold hover:underline">
            Contact us →
          </Link>
        </div>
      </section>
    </main>
  );
}
