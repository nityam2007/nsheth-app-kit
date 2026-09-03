import { Button, Field } from '@nsheth/ui'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'

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
    <section className="admin-resource" aria-labelledby="posts-title">
      <header className="admin-resource__header">
        <div>
          <p>Content / Posts</p>
          <h1 id="posts-title">Write once. Publish clearly.</h1>
        </div>
        <span>{posts.length} records</span>
      </header>

      <p className="admin-resource__intro">
        Create a plain-text article as a draft or publish it immediately. Drafts
        remain private to this workspace.
      </p>

      <div className="admin-posts-layout">
        <form className="admin-post-form" onSubmit={handleSubmit}>
          <h2>New post</h2>
          <Field
            label="Title"
            name="title"
            minLength={3}
            maxLength={160}
            required
          />
          <Field
            hint="Lowercase letters, numbers, and single hyphens."
            label="URL slug"
            name="slug"
            minLength={3}
            maxLength={160}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
          />
          <div className="admin-form-field">
            <label htmlFor="post-excerpt">Excerpt</label>
            <textarea
              id="post-excerpt"
              name="excerpt"
              maxLength={300}
              rows={3}
              required
            />
          </div>
          <div className="admin-form-field">
            <label htmlFor="post-body">Body</label>
            <textarea
              id="post-body"
              name="body"
              maxLength={100000}
              rows={12}
              required
            />
          </div>
          <div className="admin-form-field">
            <label htmlFor="post-status">Publication state</label>
            <select id="post-status" name="status" defaultValue="DRAFT">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
          {error ? (
            <p className="admin-form-error" role="alert">
              {error}
            </p>
          ) : null}
          <Button disabled={isSaving} type="submit">
            {isSaving ? 'Saving...' : 'Create post'}
          </Button>
        </form>

        <section className="admin-post-list" aria-labelledby="all-posts-title">
          <h2 id="all-posts-title">All posts</h2>
          {posts.length ? (
            <ol>
              {posts.map((post) => (
                <li key={post.id}>
                  <div>
                    <strong>{post.title}</strong>
                    <span>/{post.slug}</span>
                  </div>
                  <div>
                    <span className="admin-post-status">{post.status}</span>
                    <time dateTime={post.publishedAt ?? post.createdAt}>
                      {post.publishedAt ?? post.createdAt}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p>No posts yet. Create the first one here.</p>
          )}
        </section>
      </div>
    </section>
  )
}
