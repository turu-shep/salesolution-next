import { defineArrayMember, defineType } from 'sanity'

/**
 * Long-form body content. Block-based rich text with images, code, and callouts.
 * Used by `post`, `guide`, and `careerPath`.
 */
export const portableText = defineType({
  name: 'portableText',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
          { title: 'Code', value: 'code' },
          { title: 'Underline', value: 'underline' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              { name: 'href', type: 'url', title: 'URL' },
              {
                name: 'newTab',
                type: 'boolean',
                title: 'Open in new tab',
                initialValue: false,
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt text' },
        { name: 'caption', type: 'string', title: 'Caption' },
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'codeBlock',
      title: 'Code block',
      fields: [
        { name: 'language', type: 'string', title: 'Language (e.g. ts, html)' },
        { name: 'code', type: 'text', title: 'Code', rows: 6 },
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'callout',
      title: 'Callout',
      fields: [
        {
          name: 'tone',
          type: 'string',
          title: 'Tone',
          options: {
            list: ['info', 'tip', 'warning', 'danger'],
          },
          initialValue: 'info',
        },
        { name: 'body', type: 'text', title: 'Body', rows: 3 },
      ],
    }),
  ],
})
