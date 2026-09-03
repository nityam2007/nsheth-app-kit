import { Link, createFileRoute } from '@tanstack/react-router'
import { useDeferredValue, useState } from 'react'

import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'

import { getAdminPosts } from '../content.functions'

export const Route = createFileRoute('/admin/posts/')({
  loader: () => getAdminPosts(),
  component: PostsIndex,
})

function PostsIndex() {
  const posts = Route.useLoaderData()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('ALL')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const visiblePosts = posts.filter(
    (post) =>
      (status === 'ALL' || post.status === status) &&
      (!deferredQuery ||
        post.title.toLowerCase().includes(deferredQuery) ||
        post.slug.includes(deferredQuery)),
  )
  const isFiltered = Boolean(query) || status !== 'ALL'

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

      <div className="mt-6 grid items-end gap-4 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
        <Input
          autoComplete="off"
          label="Search posts"
          placeholder="Title or slug…"
          value={query}
          onChange={setQuery}
        />
        <label
          className="grid gap-1.5 text-sm font-medium text-secondary"
          htmlFor="post-filter-status"
        >
          Status
          <select
            className="min-h-11 rounded-lg bg-primary px-3.5 py-2.5 text-md text-primary shadow-xs ring-1 ring-primary ring-inset outline-hidden focus:ring-2 focus:ring-brand"
            id="post-filter-status"
            value={status}
            onChange={(event) => setStatus(event.currentTarget.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </label>
        <div className="flex min-h-11 items-center justify-between gap-3 sm:justify-end">
          <span className="text-sm text-tertiary" aria-live="polite">
            {visiblePosts.length} of {posts.length}
          </span>
          {isFiltered ? (
            <Button
              color="tertiary"
              onPress={() => {
                setQuery('')
                setStatus('ALL')
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      <div
        className="mt-5 overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary focus:outline-2 focus:outline-offset-2 focus:outline-brand"
        role="region"
        aria-label="Posts"
        tabIndex={0}
      >
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-secondary bg-secondary">
            <tr>
              <th
                className="px-4 py-3 text-xs font-semibold text-tertiary sm:px-6"
                scope="col"
              >
                Post
              </th>
              <th
                className="px-4 py-3 text-xs font-semibold text-tertiary"
                scope="col"
              >
                Status
              </th>
              <th
                className="hidden px-4 py-3 text-xs font-semibold text-tertiary md:table-cell"
                scope="col"
              >
                Published
              </th>
              <th
                className="hidden px-4 py-3 text-xs font-semibold text-tertiary lg:table-cell"
                scope="col"
              >
                Updated
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-semibold text-tertiary sm:px-6"
                scope="col"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary">
            {visiblePosts.length ? (
              visiblePosts.map((post) => (
                <tr className="hover:bg-primary_hover" key={post.id}>
                  <th
                    className="max-w-48 px-4 py-4 sm:max-w-none sm:px-6"
                    scope="row"
                  >
                    <Link
                      className="block truncate font-medium text-primary hover:text-brand-secondary"
                      to="/admin/posts/$slug"
                      params={{ slug: post.slug }}
                    >
                      {post.title}
                    </Link>
                    <span className="mt-1 hidden truncate text-xs text-tertiary sm:block">
                      /blog/{post.slug}
                    </span>
                  </th>
                  <td className="px-4 py-4 text-sm text-tertiary">
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
                  <td className="hidden px-4 py-4 text-sm text-tertiary md:table-cell">
                    {post.publishedAt ?? 'Not published'}
                  </td>
                  <td className="hidden px-4 py-4 text-sm text-tertiary lg:table-cell">
                    {post.updatedAt}
                  </td>
                  <td className="px-4 py-4 text-right sm:px-6">
                    <Link
                      className="inline-flex min-h-10 items-center text-sm font-semibold text-brand-secondary hover:text-brand-secondary_hover"
                      to="/admin/posts/$slug/edit"
                      params={{ slug: post.slug }}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-6 py-12 text-center text-sm text-tertiary"
                  colSpan={5}
                >
                  {posts.length
                    ? 'No posts match these filters.'
                    : 'No posts yet. Create the first note.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
