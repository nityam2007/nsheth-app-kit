import { Link, createFileRoute } from '@tanstack/react-router'

import { getAdminPosts } from '../content.functions'

export const Route = createFileRoute('/admin/posts/')({
  loader: () => getAdminPosts(),
  component: PostsIndex,
})

function PostsIndex() {
  const posts = Route.useLoaderData()

  return (
    <section aria-labelledby="posts-title">
      <header className="flex flex-col gap-5 border-b border-secondary pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-secondary">Content</p>
          <h1
            className="mt-2 text-display-sm font-semibold text-primary"
            id="posts-title"
          >
            Posts
          </h1>
          <p className="mt-2 text-md text-tertiary">
            Manage draft and published notes.
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 items-center justify-center self-start rounded-lg bg-brand-solid px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs-skeuomorphic hover:bg-brand-solid_hover sm:self-auto"
          to="/admin/posts/new"
        >
          New post
        </Link>
      </header>

      <div
        className="mt-8 overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary focus:outline-2 focus:outline-offset-2 focus:outline-brand"
        role="region"
        aria-label="Posts"
        tabIndex={0}
      >
        <table className="w-full min-w-176 border-collapse text-left">
          <thead className="border-b border-secondary bg-secondary">
            <tr>
              {['Post', 'Status', 'Published', 'Updated'].map((heading) => (
                <th
                  className="px-6 py-3 text-xs font-semibold text-tertiary"
                  key={heading}
                  scope="col"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary">
            {posts.length ? (
              posts.map((post) => (
                <tr className="hover:bg-primary_hover" key={post.id}>
                  <th className="px-6 py-4" scope="row">
                    <Link
                      className="font-medium text-primary hover:text-brand-secondary"
                      to="/admin/posts/$slug"
                      params={{ slug: post.slug }}
                    >
                      {post.title}
                    </Link>
                    <span className="mt-1 block text-xs text-tertiary">
                      /blog/{post.slug}
                    </span>
                  </th>
                  <td className="px-6 py-4 text-sm text-tertiary">
                    <span
                      className={
                        post.status === 'PUBLISHED'
                          ? 'inline-flex rounded-full bg-success-primary px-2.5 py-0.5 text-xs font-medium text-success-primary'
                          : 'inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary'
                      }
                    >
                      {post.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-tertiary">
                    {post.publishedAt ?? 'Not published'}
                  </td>
                  <td className="px-6 py-4 text-sm text-tertiary">
                    {post.updatedAt}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-6 py-12 text-center text-sm text-tertiary"
                  colSpan={4}
                >
                  No posts yet. Create the first note.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
