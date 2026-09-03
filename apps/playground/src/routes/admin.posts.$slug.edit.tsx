import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { PostForm } from '@/components/admin/post-form'

import { getAdminPost } from '../content.functions'

export const Route = createFileRoute('/admin/posts/$slug/edit')({
  loader: async ({ params }) => {
    const post = await getAdminPost({ data: { slug: params.slug } })
    if (!post) throw notFound()
    return post
  },
  component: EditPost,
})

function EditPost() {
  const post = Route.useLoaderData()

  return (
    <section aria-labelledby="edit-post-title">
      <Link
        className="text-sm font-semibold text-brand-secondary"
        to="/admin/posts/$slug"
        params={{ slug: post.slug }}
      >
        {post.title}
      </Link>
      <header className="mt-5 border-b border-secondary pb-6">
        <p className="text-sm font-semibold text-brand-secondary">Content</p>
        <h1
          className="mt-2 text-display-sm font-semibold text-primary"
          id="edit-post-title"
        >
          Edit post
        </h1>
        <p className="mt-2 max-w-2xl text-md text-tertiary">
          Update the note or change its publication state.
        </p>
      </header>
      <div className="mt-8">
        <PostForm currentSlug={post.slug} initial={post} />
      </div>
    </section>
  )
}
