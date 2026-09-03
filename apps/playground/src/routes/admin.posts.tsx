import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'

import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { TextArea } from '@/components/base/textarea/textarea'

import { createAdminPost, getAdminPosts } from '../content.functions'

export const Route = createFileRoute('/admin/posts')({
  loader: () => getAdminPosts(),
  component: PostsResource,
})

function PostsResource() {
  const posts = Route.useLoaderData()
  const createPost = useServerFn(createAdminPost)
  const router = useRouter()
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    setError('')
    setIsSaving(true)

    try {
      await createPost({
        data: {
          title: String(formData.get('title') ?? ''),
          slug: String(formData.get('slug') ?? ''),
          excerpt: String(formData.get('excerpt') ?? ''),
          body: String(formData.get('body') ?? ''),
          status:
            formData.get('status') === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        },
      })
      form.reset()
      await router.invalidate({ sync: true })
    } catch {
      setError('Could not save this post. Check the fields and slug.')
    } finally {
      setIsSaving(false)
    }
  }

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
        </div>
        <span className="text-sm text-tertiary">{posts.length} records</span>
      </header>

      <p className="mt-6 max-w-3xl text-md text-tertiary">
        Create a plain-text article as a draft or publish it immediately. Drafts
        remain private to this workspace.
      </p>

      <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(22rem,0.8fr)_minmax(28rem,1.2fr)]">
        <form
          className="grid gap-5 rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary sm:p-6"
          onSubmit={handleSubmit}
        >
          <h2 className="text-lg font-semibold text-primary">New post</h2>
          <Input
            isRequired
            label="Title"
            maxLength={160}
            minLength={3}
            name="title"
          />
          <Input
            hint="Lowercase letters, numbers, and single hyphens."
            isRequired
            label="URL slug"
            maxLength={160}
            minLength={3}
            name="slug"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          />
          <TextArea
            isRequired
            label="Excerpt"
            maxLength={300}
            name="excerpt"
            rows={3}
          />
          <TextArea
            isRequired
            label="Body"
            maxLength={100000}
            name="body"
            rows={12}
          />
          <label
            className="grid gap-1.5 text-sm font-medium text-secondary"
            htmlFor="post-status"
          >
            Publication state
            <select
              className="min-h-11 w-full rounded-lg bg-primary px-3.5 py-2.5 text-md text-primary shadow-xs ring-1 ring-primary ring-inset outline-hidden focus:ring-2 focus:ring-brand"
              defaultValue="DRAFT"
              id="post-status"
              name="status"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </label>
          {error ? (
            <p className="m-0 text-sm text-error-primary" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            className="justify-self-start"
            isDisabled={isSaving}
            isLoading={isSaving}
            showTextWhileLoading
            type="submit"
          >
            Create post
          </Button>
        </form>

        <section
          className="min-w-0 rounded-xl bg-primary shadow-xs ring-1 ring-secondary"
          aria-labelledby="all-posts-title"
        >
          <div className="border-b border-secondary px-5 py-4 sm:px-6">
            <h2
              className="text-lg font-semibold text-primary"
              id="all-posts-title"
            >
              All posts
            </h2>
          </div>
          {posts.length ? (
            <ol className="divide-y divide-secondary">
              {posts.map((post) => (
                <li
                  className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-6"
                  key={post.id}
                >
                  <div className="min-w-0">
                    <strong className="block truncate text-sm font-medium text-primary">
                      {post.title}
                    </strong>
                    <span className="mt-1 block truncate text-sm text-tertiary">
                      /{post.slug}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span
                      className={
                        post.status === 'PUBLISHED'
                          ? 'inline-flex rounded-full bg-success-primary px-2.5 py-0.5 text-xs font-medium text-success-primary'
                          : 'inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary'
                      }
                    >
                      {post.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </span>
                    <time
                      className="mt-1 block text-xs text-tertiary"
                      dateTime={post.publishedAt ?? post.createdAt}
                    >
                      {post.publishedAt ?? post.createdAt}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="px-6 py-12 text-center text-sm text-tertiary">
              No posts yet. Create the first one here.
            </p>
          )}
        </section>
      </div>
    </section>
  )
}
