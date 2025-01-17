## Overview

This is source code for my personal website.

## Technologies used

- **Framework**: [Next.js](https://nextjs.org/)
- **Deployment**: [Vercel](https://vercel.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)

## Commands

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `pnpm install`    | Installs dependencies                       |
| `pnpm run dev`    | Starts local dev server at `localhost:3000` |
| `pnpm run build`  | Build your production site                  |
| `pnpm run start`  | Start your production site                  |
| `pnpm run lint`   | Fix lint errors                             |
| `pnpm run format` | Format your code                            |

## Configure

Edit `app/sitemap.ts` for site metadata and `app/page.tsx` for homepage.
Modify `app/global.css` for your own styling.

## Adding posts

Blog posts are saved in `blog` directory. Delete my posts and replace with yours.
The posts must be `.mdx` files with following frontmatter.

- title
- publishedOn
- modifiedOn
- summary

## Acknowledgment

The source code is based on this [template](https://vercel.com/templates/next.js/portfolio-starter-kit).
