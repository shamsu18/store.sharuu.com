import Markdown from 'react-markdown';
import { useParams } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';

export default function CmsPageView() {
  const { slug } = useParams();
  const { pages } = useStore();

  const page = pages.find(
    item =>
      item.slug === slug &&
      item.status === 'published'
  );

  if (!page) {
    return (
      <main className="mx-auto min-h-[60vh] w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Page not found
            </h1>

            <p className="mt-3 text-base text-gray-600">
              The page you are looking for is unavailable.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.2em] text-blue-600 sm:text-sm">
          Information
        </span>

        <h1 className="mb-8 font-serif text-4xl font-extrabold leading-tight text-gray-950 sm:text-5xl lg:text-6xl">
          {page.title}
        </h1>

        <div className="text-base text-gray-700 sm:text-lg">
          <Markdown
            components={{
              h1: ({ node, children, ...props }) => (
                <h1
                  className="mb-4 mt-10 text-3xl font-extrabold leading-tight text-gray-950 sm:text-4xl"
                  {...props}
                >
                  {children}
                </h1>
              ),

              h2: ({ node, children, ...props }) => (
                <h2
                  className="mb-4 mt-9 border-b border-gray-200 pb-3 text-2xl font-extrabold leading-tight text-gray-950 sm:text-3xl"
                  {...props}
                >
                  {children}
                </h2>
              ),

              h3: ({ node, children, ...props }) => (
                <h3
                  className="mb-3 mt-7 text-xl font-extrabold leading-snug text-gray-900 sm:text-2xl"
                  {...props}
                >
                  {children}
                </h3>
              ),

              h4: ({ node, children, ...props }) => (
                <h4
                  className="mb-3 mt-6 text-lg font-bold text-gray-900 sm:text-xl"
                  {...props}
                >
                  {children}
                </h4>
              ),

              p: ({ node, children, ...props }) => (
                <p
                  className="mb-5 leading-8 text-gray-700"
                  {...props}
                >
                  {children}
                </p>
              ),

              strong: ({ node, children, ...props }) => (
                <strong
                  className="font-extrabold text-gray-950"
                  {...props}
                >
                  {children}
                </strong>
              ),

              ul: ({ node, children, ...props }) => (
                <ul
                  className="mb-6 ml-6 list-disc space-y-3 marker:text-blue-600"
                  {...props}
                >
                  {children}
                </ul>
              ),

              ol: ({ node, children, ...props }) => (
                <ol
                  className="mb-6 ml-6 list-decimal space-y-3 marker:font-bold marker:text-blue-600"
                  {...props}
                >
                  {children}
                </ol>
              ),

              li: ({ node, children, ...props }) => (
                <li
                  className="pl-1 leading-7 text-gray-700"
                  {...props}
                >
                  {children}
                </li>
              ),

              a: ({ node, children, ...props }) => (
                <a
                  className="font-semibold text-blue-600 underline decoration-blue-300 underline-offset-4 transition hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                >
                  {children}
                </a>
              ),

              blockquote: ({
                node,
                children,
                ...props
              }) => (
                <blockquote
                  className="my-6 rounded-r-xl border-l-4 border-blue-600 bg-blue-50 px-5 py-4 italic text-gray-700"
                  {...props}
                >
                  {children}
                </blockquote>
              ),

              hr: ({ node, ...props }) => (
                <hr
                  className="my-9 border-gray-200"
                  {...props}
                />
              ),
            }}
          >
            {page.content}
          </Markdown>
        </div>
      </div>
    </main>
  );
}