import { Link, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'

import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { TextArea } from '@/components/base/textarea/textarea'

import { createAdminPost, updateAdminPost } from '../../content.functions'

import type { PostInput } from '@nsheth/content'

interface PostFormProps {
  currentSlug?: string
  initial?: PostInput
}

export function PostForm({ currentSlug, initial }: PostFormProps) {
  const createPost = useServerFn(createAdminPost)
  const updatePost = useServerFn(updateAdminPost)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data: PostInput = {
      title: String(formData.get('title') ?? ''),
      slug: String(formData.get('slug') ?? ''),
      excerpt: String(formData.get('excerpt') ?? ''),
      body: String(formData.get('body') ?? ''),
      status: formData.get('status') === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
    }

    setError('')
    setIsSaving(true)

    try {
      const post = currentSlug
        ? await updatePost({ data: { ...data, currentSlug } })
        : await createPost({ data })
      await navigate({ to: '/admin/posts/$slug', params: { slug: post.slug } })
    } catch {
      setError('Could not save this post. Check the fields and slug.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form
      className="grid max-w-3xl gap-6 rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary sm:p-8"
      onSubmit={handleSubmit}
    >
      <Input
        defaultValue={initial?.title}
        isRequired
        label="Title"
        maxLength={160}
        minLength={3}
        name="title"
      />
      <Input
        defaultValue={initial?.slug}
        hint="Lowercase letters, numbers, and single hyphens."
        isRequired
        label="URL slug"
        maxLength={160}
        minLength={3}
        name="slug"
        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
      />
      <TextArea
        defaultValue={initial?.excerpt}
        isRequired
        label="Excerpt"
        maxLength={300}
        name="excerpt"
        rows={3}
      />
      <TextArea
        defaultValue={initial?.body}
        isRequired
        label="Body"
        maxLength={100000}
        name="body"
        rows={16}
      />
      <label
        className="grid gap-1.5 text-sm font-medium text-secondary"
        htmlFor="post-status"
      >
        Publication state
        <select
          className="min-h-11 w-full rounded-lg bg-primary px-3.5 py-2.5 text-md text-primary shadow-xs ring-1 ring-primary ring-inset outline-hidden focus:ring-2 focus:ring-brand"
          defaultValue={initial?.status ?? 'DRAFT'}
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
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-secondary shadow-xs-skeuomorphic ring-1 ring-primary ring-inset hover:bg-primary_hover"
          to={currentSlug ? '/admin/posts/$slug' : '/admin/posts'}
          params={currentSlug ? { slug: currentSlug } : {}}
        >
          Cancel
        </Link>
        <Button
          isDisabled={isSaving}
          isLoading={isSaving}
          showTextWhileLoading
          type="submit"
        >
          {currentSlug ? 'Save changes' : 'Create post'}
        </Button>
      </div>
    </form>
  )
}
