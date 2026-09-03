import { ArrowUpRight } from '@untitledui/icons'
import { Link, createFileRoute } from '@tanstack/react-router'

import { Container } from '@/components/container'

import { getPublishedPosts } from '../content.functions'

export const Route = createFileRoute('/blog/')({
  loader: () => getPublishedPosts(),
  component: BlogIndex,
})

function BlogIndex() {
  const posts = Route.useLoaderData()

  return (
    <>
      <section
        className="border-b border-secondary py-16 sm:py-24"
        aria-labelledby="blog-title"
      >
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-brand-secondary">
              Product and code
            </p>
            <h1
              className="mt-3 text-display-lg font-semibold text-primary sm:text-display-xl"
              id="blog-title"
            >
              Useful work, explained.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-tertiary sm:text-xl">
              Decisions, implementation details, and lessons from building
              focused digital products.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        {posts.length ? (
          <ol className="divide-y divide-secondary border-y border-secondary">
            {posts.map((post, index) => (
              <li key={post.id}>
                <Link
                  className="group grid min-h-36 gap-4 py-6 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center sm:gap-8"
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                >
                  <span className="text-sm font-medium text-quaternary">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <strong className="block text-display-xs font-semibold text-primary group-hover:text-brand-secondary sm:text-display-sm">
                      {post.title}
                    </strong>
                    <span className="mt-2 block max-w-2xl text-sm text-tertiary sm:text-md">
                      {post.excerpt}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 text-sm text-tertiary sm:justify-self-end">
                    <time dateTime={post.publishedAt}>
                      {post.publishedAt.replaceAll('-', '.')}
                    </time>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-5 text-brand-secondary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <div className="rounded-xl bg-secondary px-6 py-16 text-center ring-1 ring-secondary">
            <h2 className="text-lg font-semibold text-primary">
              No published notes yet.
            </h2>
            <p className="mt-2 text-md text-tertiary">
              Drafts stay private until they are ready.
            </p>
          </div>
        )}
      </Container>
    </>
  )
}
