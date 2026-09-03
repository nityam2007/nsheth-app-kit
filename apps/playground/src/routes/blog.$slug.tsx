import { ArrowLeft } from '@untitledui/icons'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { Container } from '@/components/container'

import { getPublishedPost } from '../content.functions'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const post = await getPublishedPost({ data: { slug: params.slug } })
    if (!post) throw notFound()
    return post
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} | NSheth App Kit` },
          { name: 'description', content: loaderData.excerpt },
        ]
      : [],
  }),
  component: BlogPost,
})

function BlogPost() {
  const post = Route.useLoaderData()

  return (
    <article className="py-12 sm:py-20">
      <Container>
        <header className="mx-auto max-w-3xl border-b border-secondary pb-10 sm:pb-14">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-secondary hover:text-brand-secondary_hover"
            to="/blog"
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
            All notes
          </Link>
          <time
            className="mt-8 block text-sm text-tertiary"
            dateTime={post.publishedAt}
          >
            Published {post.publishedAt.replaceAll('-', '.')}
          </time>
          <h1 className="mt-3 text-display-md font-semibold text-primary sm:text-display-lg">
            {post.title}
          </h1>
          <p className="mt-5 text-lg text-tertiary sm:text-xl">
            {post.excerpt}
          </p>
        </header>
        <div className="mx-auto mt-10 max-w-3xl whitespace-pre-wrap text-md leading-8 text-secondary sm:mt-14 sm:text-lg">
          {post.body}
        </div>
      </Container>
    </article>
  )
}
