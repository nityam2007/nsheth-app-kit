import { articleBlocks } from '@nsheth/content'

export function ArticleBody({ body }: { body: string }) {
  return (
    <div className="grid gap-6 text-secondary leading-8">
      {articleBlocks(body).map((block, index) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2
                key={index}
                className="mt-4 text-2xl font-semibold text-primary"
              >
                {block.text}
              </h2>
            )
          case 'subheading':
            return (
              <h3
                key={index}
                className="mt-2 text-xl font-semibold text-primary"
              >
                {block.text}
              </h3>
            )
          case 'quote':
            return (
              <blockquote
                key={index}
                className="border-l-4 border-brand pl-5 text-tertiary"
              >
                {block.text}
              </blockquote>
            )
          case 'list':
            return (
              <ul key={index} className="list-disc space-y-2 pl-6">
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )
          default:
            return (
              <p key={index} className="whitespace-pre-wrap">
                {block.text}
              </p>
            )
        }
      })}
    </div>
  )
}
