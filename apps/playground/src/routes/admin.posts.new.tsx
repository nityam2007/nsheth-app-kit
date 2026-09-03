import { Link, createFileRoute } from '@tanstack/react-router'

import { PostForm } from '@/components/admin/post-form'

export const Route = createFileRoute('/admin/posts/new')({
  component: NewPost,
})

function NewPost() {
  return (
    <section aria-labelledby="new-post-title">
      <Link
        className="text-sm font-semibold text-brand-secondary"
        to="/admin/posts"
      >
        Posts
      </Link>
      <header className="mt-5 border-b border-secondary pb-6">
        <p className="text-sm font-semibold text-brand-secondary">Content</p>
        <h1
          className="mt-2 text-display-sm font-semibold text-primary"
          id="new-post-title"
        >
          New post
        </h1>
        <p className="mt-2 max-w-2xl text-md text-tertiary">
          Draft privately or publish immediately to Notes.
        </p>
      </header>
      <div className="mt-8">
        <PostForm />
      </div>
    </section>
  )
}
