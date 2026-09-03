import { Container } from '@nsheth/ui'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'

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
          { title: `${loaderData.title} | NSheth` },
          { name: 'description', content: loaderData.excerpt },
        ]
      : [],
  }),
  component: BlogPost,
})

function BlogPost() {
  const post = Route.useLoaderData()

  return (
    <article className="blog-article">
      <Container wide>
        <header className="blog-article__header">
          <div>
            <Link className="text-link" to="/blog">
              All notes
            </Link>
            <time dateTime={post.publishedAt}>
              Published {post.publishedAt.replaceAll('-', '.')}
            </time>
          </div>
          <div>
            <h1>{post.title}</h1>
            <p>{post.excerpt}</p>
          </div>
        </header>
        <div className="blog-article__body">{post.body}</div>
      </Container>
    </article>
  )
}
