import { FormSection } from './workspace'
import { ArticleBody } from '../article-body'
import { errorMessage } from '../../errors'
import { Link, useBlocker, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { TextArea } from '@/components/base/textarea/textarea'

import { createAdminPost, updateAdminPost } from '../../content.functions'
import { slugify } from '../../slug'

import type { PostInput } from '@nsheth/content'

interface PostFormProps {
  currentSlug?: string
  initial?: PostInput & { version: number }
}

export function PostForm({ currentSlug, initial }: PostFormProps) {
  const createPost = useServerFn(createAdminPost)
  const updatePost = useServerFn(updateAdminPost)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [body, setBody] = useState(initial?.body ?? '')
  const [preview, setPreview] = useState(false)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugEdited, setSlugEdited] = useState(Boolean(initial))
  const [isDirty, setIsDirty] = useState(false)
  const bypassBlocker = useRef(false)
  const errorRef = useRef<HTMLParagraphElement>(null)

  useBlocker({
    enableBeforeUnload: isDirty,
    shouldBlockFn: () =>
      isDirty &&
      !bypassBlocker.current &&
      !window.confirm('Discard your unsaved post changes?'),
  })

  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data: PostInput = {
      title: String(formData.get('title') ?? ''),
      slug: String(formData.get('slug') ?? ''),
      excerpt: String(formData.get('excerpt') ?? ''),
      body: String(formData.get('body') ?? ''),
      author: String(formData.get('author')),
      coverUrl: String(formData.get('coverUrl')),
      coverAlt: String(formData.get('coverAlt')),
      tags: String(formData.get('tags'))
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      seoTitle: String(formData.get('seoTitle')),
      seoDescription: String(formData.get('seoDescription')),
      publishedAt: String(formData.get('publishedAt') ?? ''),
      status: formData.get('status') === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
    }

    setError('')
    setIsSaving(true)

    try {
      const post = currentSlug
        ? await updatePost({
            data: {
              ...data,
              currentSlug,
              expectedVersion: initial?.version ?? 0,
            },
          })
        : await createPost({ data })
      bypassBlocker.current = true
      await navigate({ to: '/admin/posts/$slug', params: { slug: post.slug } })
    } catch (failure) {
      bypassBlocker.current = false
      setError(errorMessage(failure))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form
      className="grid max-w-4xl gap-6"
      onChange={() => setIsDirty(true)}
      onSubmit={handleSubmit}
    >
      <FormSection
        title="Writing"
        description="Shape the article and preview its content."
      >
        <Input
          isRequired
          label="Title"
          maxLength={160}
          minLength={3}
          name="title"
          value={title}
          onChange={(value) => {
            setTitle(value)
            if (!slugEdited) setSlug(slugify(value))
          }}
        />
        <Input
          hint="Generated from the title. Edit it only when the URL needs to differ."
          isRequired
          label="URL slug"
          maxLength={160}
          minLength={3}
          name="slug"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          value={slug}
          onChange={(value) => {
            setSlug(value)
            setSlugEdited(true)
          }}
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
          value={body}
          onChange={setBody}
          isRequired
          label="Body"
          maxLength={100000}
          name="body"
          rows={16}
        />
        <p className="text-sm text-tertiary">
          Separate blocks with blank lines. Use ## headings, ### subheadings, -
          list items and &gt; quotations. HTML and inline markup are displayed
          as text.
        </p>
        <Button color="secondary" onPress={() => setPreview(!preview)}>
          {preview ? 'Hide preview' : 'Preview article'}
        </Button>
        {preview && (
          <section
            aria-label="Article preview"
            className="border-y border-secondary py-6"
          >
            <ArticleBody body={body} />
          </section>
        )}
      </FormSection>
      <FormSection
        title="Attribution & cover"
        description="Show who wrote it and choose its cover image."
      >
        <Input
          name="author"
          label="Author or byline"
          maxLength={120}
          defaultValue={initial?.author}
        />
        <Input
          name="coverUrl"
          label="Cover image URL (HTTPS)"
          type="url"
          maxLength={2000}
          defaultValue={initial?.coverUrl}
        />
        <Input
          name="coverAlt"
          label="Cover alternative text"
          maxLength={200}
          defaultValue={initial?.coverAlt}
        />
        <Input
          name="tags"
          label="Tags (comma separated)"
          maxLength={600}
          defaultValue={initial?.tags.join(', ')}
        />
      </FormSection>
      <FormSection
        title="Search appearance"
        description="Help readers find this article."
      >
        <Input
          name="seoTitle"
          label="Search title (optional)"
          maxLength={70}
          defaultValue={initial?.seoTitle}
        />
        <Input
          name="seoDescription"
          label="Search description (optional)"
          maxLength={180}
          defaultValue={initial?.seoDescription}
        />
      </FormSection>
      <FormSection
        title="Publication"
        description="Save a draft, publish now or choose a future date."
      >
        <Input
          name="publishedAt"
          label="Publication instant (UTC)"
          placeholder="2030-01-01T09:00:00Z"
          defaultValue={initial?.publishedAt}
          hint="Leave empty to publish now. Use an ISO UTC timestamp to schedule; drafts remain hidden."
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
      </FormSection>
      {error ? (
        <p
          className="m-0 text-sm text-error-primary"
          ref={errorRef}
          role="alert"
          tabIndex={-1}
        >
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
