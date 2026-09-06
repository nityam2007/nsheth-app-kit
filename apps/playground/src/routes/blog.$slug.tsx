import { appConfig } from '../app.config'
import { ArticleBody } from '../components/article-body'
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
          {
            title: `${loaderData.seoTitle || loaderData.title} | ${appConfig.name}`,
          },
          {
            name: 'description',
            content: loaderData.seoDescription || loaderData.excerpt,
          },
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
          <p className="mt-2 text-sm text-tertiary">
            {post.author} ·{' '}
            {Math.max(1, Math.ceil(post.body.split(/\s+/).length / 200))} min
            read
          </p>
          <h1 className="mt-3 text-display-md font-semibold text-primary sm:text-display-lg">
            {post.title}
          </h1>
          <p className="mt-5 text-lg text-tertiary sm:text-xl">
            {post.excerpt}
          </p>
        </header>
        {post.coverUrl && (
          <img
            src={post.coverUrl}
            alt={post.coverAlt}
            referrerPolicy="no-referrer"
            className="mx-auto mt-8 aspect-video w-full max-w-4xl rounded-lg object-cover"
          />
        )}
        <div className="mx-auto mt-10 max-w-3xl whitespace-pre-wrap text-md leading-8 text-secondary sm:mt-14 sm:text-lg">
          <ArticleBody body={post.body} />
        </div>
      </Container>
    </article>
  )
}
