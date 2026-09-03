import { Container } from '@nsheth/ui'
import { Link, createFileRoute } from '@tanstack/react-router'

import { getPublishedPosts } from '../content.functions'

export const Route = createFileRoute('/blog/')({
  loader: () => getPublishedPosts(),
  component: BlogIndex,
})

function BlogIndex() {
  const posts = Route.useLoaderData()

  return (
    <>
      <section className="blog-intro" aria-labelledby="blog-title">
        <Container wide>
          <p className="blog-kicker">Field notes / Product and code</p>
          <h1 id="blog-title">Useful work, explained.</h1>
          <p>
            Decisions, implementation details, and lessons from building focused
            digital products.
          </p>
        </Container>
      </section>

      <Container className="blog-index" wide>
        {posts.length ? (
          <ol className="blog-posts">
            {posts.map((post, index) => (
              <li key={post.id}>
                <Link to="/blog/$slug" params={{ slug: post.slug }}>
                  <span className="blog-posts__number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <strong>{post.title}</strong>
                    <small>{post.excerpt}</small>
                  </span>
                  <time dateTime={post.publishedAt}>
                    {post.publishedAt.replaceAll('-', '.')}
                  </time>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <div className="blog-empty">
            <h2>No published notes yet.</h2>
            <p>Drafts stay private until they are ready.</p>
          </div>
        )}
      </Container>
    </>
  )
}
