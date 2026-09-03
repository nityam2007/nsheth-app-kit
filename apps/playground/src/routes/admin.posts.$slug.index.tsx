import {
  Link,
  createFileRoute,
  notFound,
  useNavigate,
} from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'

import { Button } from '@/components/base/buttons/button'

import { deleteAdminPost, getAdminPost } from '../content.functions'

export const Route = createFileRoute('/admin/posts/$slug/')({
  loader: async ({ params }) => {
    const post = await getAdminPost({ data: { slug: params.slug } })
    if (!post) throw notFound()
    return post
  },
  component: PostDetail,
})

function PostDetail() {
  const post = Route.useLoaderData()
  const removePost = useServerFn(deleteAdminPost)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`))
      return

    setError('')
    setIsDeleting(true)
    try {
      await removePost({ data: { slug: post.slug } })
      await navigate({ to: '/admin/posts' })
    } catch {
      setError('Could not delete this post.')
      setIsDeleting(false)
    }
  }

  return (
    <article aria-labelledby="post-title">
      <Link
        className="text-sm font-semibold text-brand-secondary"
        to="/admin/posts"
      >
        Posts
      </Link>
      <header className="mt-5 flex flex-col gap-6 border-b border-secondary pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-secondary">Content</p>
          <h1
            className="mt-2 text-display-sm font-semibold text-primary"
            id="post-title"
          >
            {post.title}
          </h1>
          <p className="mt-2 text-sm text-tertiary">/blog/{post.slug}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {post.status === 'PUBLISHED' ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-secondary shadow-xs-skeuomorphic ring-1 ring-primary ring-inset hover:bg-primary_hover"
              to="/blog/$slug"
              params={{ slug: post.slug }}
            >
              View note
            </Link>
          ) : null}
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-solid px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs-skeuomorphic hover:bg-brand-solid_hover"
            to="/admin/posts/$slug/edit"
            params={{ slug: post.slug }}
          >
            Edit post
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary sm:p-8">
          <p className="text-lg text-tertiary">{post.excerpt}</p>
          <div className="mt-8 whitespace-pre-wrap border-t border-secondary pt-8 text-md leading-8 text-secondary">
            {post.body}
          </div>
        </div>
        <aside className="space-y-6">
          <dl className="divide-y divide-secondary rounded-xl bg-primary px-5 shadow-xs ring-1 ring-secondary">
            {[
              ['Status', post.status === 'PUBLISHED' ? 'Published' : 'Draft'],
              ['Published', post.publishedAt ?? 'Not published'],
              ['Created', post.createdAt],
              ['Updated', post.updatedAt],
            ].map(([term, value]) => (
              <div className="py-4" key={term}>
                <dt className="text-xs font-semibold text-tertiary">{term}</dt>
                <dd className="mt-1 text-sm font-medium text-primary">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary">
            <h2 className="text-sm font-semibold text-primary">Danger zone</h2>
            <p className="mt-2 text-sm text-tertiary">
              Permanently remove this post.
            </p>
            <Button
              className="mt-4 text-error-primary"
              color="secondary"
              isDisabled={isDeleting}
              isLoading={isDeleting}
              showTextWhileLoading
              onPress={handleDelete}
            >
              Delete post
            </Button>
            {error ? (
              <p className="mt-3 text-sm text-error-primary" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </article>
  )
}
