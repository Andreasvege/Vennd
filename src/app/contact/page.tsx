export default function Contact() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-5xl font-bold mb-8 text-Accent">Contact</h1>

      <p className="text-lg text-Text/80 leading-relaxed mb-12">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Reach out to us
        through any of the channels below.
      </p>

      <div className="flex flex-col gap-4 text-lg">
        <p>
          <span className="text-Accent font-bold">Email: </span>
          <a
            href="mailto:hello@yourbrand.com"
            className="hover-glitch hover:text-Accent transition-colors"
          >
            hello@yourbrand.com
          </a>
        </p>
        <p>
          <span className="text-Accent font-bold">Instagram: </span>
          <a
            href="https://instagram.com"
            className="hover-glitch hover:text-Accent transition-colors"
          >
            @yourbrand
          </a>
        </p>
      </div>
    </main>
  );
}
