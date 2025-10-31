import { Footer } from "@/components/footer";
import { useEffect } from "react";

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-muted text-foreground p-4 rounded-lg whitespace-pre-wrap break-words leading-6 max-h-72 overflow-auto text-xs sm:text-sm border border-border">
      {children}
    </pre>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="mb-6 bg-card border border-border rounded-xl p-5 shadow-sm"
    >
      <h2 className="text-xl font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function Docs() {
  useEffect(() => {
    const supports = "scrollRestoration" in window.history;
    const prev = supports ? window.history.scrollRestoration : null;
    if (supports) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    return () => {
      if (supports && prev) {
        window.history.scrollRestoration = prev;
      }
    };
  }, []);
  return (
    <div className="min-h-screen bg-white text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
          <aside className="bg-card border border-border rounded-xl p-4 h-max">
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              PDF Processing
            </div>
            <nav className="space-y-1 mb-5">
              <a
                href="#pdf"
                className="block px-3 py-2 rounded-md hover:bg-muted"
              >
                Extract PDF
              </a>
              <a
                href="#check-pdf"
                className="block px-3 py-2 rounded-md hover:bg-muted"
              >
                Check PDF
              </a>
              <a
                href="#ask-pdf"
                className="block px-3 py-2 rounded-md hover:bg-muted"
              >
                Ask PDF
              </a>
            </nav>
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              Verification
            </div>
            <nav className="space-y-1 mb-5">
              <a
                href="#message-verify"
                className="block px-3 py-2 rounded-md hover:bg-muted"
              >
                Message Verify
              </a>
              <a
                href="#form-verify"
                className="block px-3 py-2 rounded-md hover:bg-muted"
              >
                Form Verify
              </a>
            </nav>
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              System
            </div>
            <nav className="space-y-1">
              <a
                href="#health"
                className="block px-3 py-2 rounded-md hover:bg-muted"
              >
                Health
              </a>
            </nav>
          </aside>

          <main>
            <h1 className="text-3xl font-bold mb-6">API Documentation</h1>
            <p className="text-muted-foreground mb-6">
              Endpoints for uploading and analyzing PDF/DOCX files. Supports
              text extraction, encryption checks, PDF/DOCX processing, and
              asking natural language questions about the content.
            </p>

            <Section id="pdf" title="Extract PDF">
              <div>
                <span className="inline-block text-white bg-green-500 text-xs font-bold px-2 py-1 rounded-full mr-2">
                  POST
                </span>
                <code className="bg-muted px-2 py-1 rounded">/pdf</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a PDF/DOCX file and extract its text or images.
                Automatically applies processing if the document is scanned or
                encrypted.
              </p>
              <CodeBlock>{`curl -X POST "https://api-dev.levelingupdata.com/pdf" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@example.pdf" \
  -F "dpi=150" \
  -F "extract_images=true"`}</CodeBlock>
              <CodeBlock>{`{
  "status": "success",
  "text": "Extracted text content ...",
  "results": null,
  "message": null
}`}</CodeBlock>
            </Section>

            <Section id="check-pdf" title="Check PDF">
              <div>
                <span className="inline-block text-white bg-blue-500 text-xs font-bold px-2 py-1 rounded-full mr-2">
                  POST
                </span>
                <code className="bg-muted px-2 py-1 rounded">/check-pdf</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Quickly determine if a PDF is encrypted and get a sample of
                extracted text for verification.
              </p>
              <CodeBlock>{`curl -X POST "https://api-dev.levelingupdata.com/check-pdf" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@example.pdf"`}</CodeBlock>
              <CodeBlock>{`{
  "isEncrypted": false,
  "requiresPDFProcessing": false,
  "sampleText": "Hello World..."
}`}</CodeBlock>
            </Section>

            <Section id="ask-pdf" title="Ask PDF">
              <div>
                <span className="inline-block text-white bg-blue-500 text-xs font-bold px-2 py-1 rounded-full mr-2">
                  POST
                </span>
                <code className="bg-muted px-2 py-1 rounded">/ask-pdf</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Send natural language queries to extract semantic answers from
                the document. Useful for summaries, Q&A, and search.
              </p>
              <CodeBlock>{`curl -X POST "https://api-dev.levelingupdata.com/ask-pdf" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@example.pdf" \
  -F "question=What is the summary of this pdf?"`}</CodeBlock>
              <CodeBlock>{`{
  "status": "success",
  "summary": "This is a summary of the PDF content..."
}`}</CodeBlock>
            </Section>

            <Section id="message-verify" title="Message Verify">
              <div>
                <span className="inline-block text-white bg-blue-500 text-xs font-bold px-2 py-1 rounded-full mr-2">
                  POST
                </span>
                <code className="bg-muted px-2 py-1 rounded">
                  /message-verify
                </code>
              </div>
              <p className="text-sm text-muted-foreground">
                Ensures requests truly originate from Slack by validating
                signatures and timestamps.
              </p>
              <CodeBlock>{`curl -X POST "https://api-dev.levelingupdata.com/message-verify" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from Slack!", "timestamp": "2024-06-01T12:00:00Z"}'`}</CodeBlock>
              <CodeBlock>{`{
  "status": "verified",
  "message": "Request is authentic."
}`}</CodeBlock>
            </Section>

            <Section id="form-verify" title="Form Verify">
              <div>
                <span className="inline-block text-white bg-blue-500 text-xs font-bold px-2 py-1 rounded-full mr-2">
                  POST
                </span>
                <code className="bg-muted px-2 py-1 rounded">/form-verify</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Confirms that form submissions are genuine before they’re stored
                or processed.
              </p>
              <CodeBlock>{`curl -X POST "https://api-dev.levelingupdata.com/form-verify" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"form_data": {"name": "John Doe", "email": "john@example.com"}, "timestamp": "2024-06-01T12:00:00Z"}'`}</CodeBlock>
              <CodeBlock>{`{
  "status": "verified",
  "message": "Form submission is authentic."
}`}</CodeBlock>
            </Section>

            <Section id="health" title="Health">
              <div>
                <span className="inline-block text-white bg-green-500 text-xs font-bold px-2 py-1 rounded-full mr-2">
                  GET
                </span>
                <code className="bg-muted px-2 py-1 rounded">/health</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Returns a simple response confirming the API is online and
                healthy.
              </p>
              <CodeBlock>{`curl \
  https://api-dev.levelingupdata.com/health`}</CodeBlock>
              <CodeBlock>{`{ "status": "ok" }`}</CodeBlock>
            </Section>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
