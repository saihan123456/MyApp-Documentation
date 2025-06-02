This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Installation

This project uses React 19 with some dependencies that require compatibility mode. To install all dependencies correctly, use the `--legacy-peer-deps` flag:

```bash
npm install --legacy-peer-deps
```

### Database Setup

This project uses SQLite as the database, which is a lightweight, file-based database that requires no additional setup or server installation.

The project includes database seeding scripts to populate your database with initial data:

```bash
# Seed the database with initial data
npm run seed

# Reset the database and re-seed with initial data
npm run seed:reset
```

#### Admin Credentials

After seeding the database, you can log in to the admin panel using the following credentials:

- **Username:** admin
- **Password:** admin123

To access the login page, navigate to either:
- [http://localhost:3000/admin](http://localhost:3000/admin)
- [http://localhost:3000/login](http://localhost:3000/login)

### Running the Development Server

After installation and database setup, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Markdown Editor

This application includes a WYSIWYG Markdown editor for content creation and editing, powered by [react-markdown-editor-lite](https://github.com/HarryChen0506/react-markdown-editor-lite/). Special thanks to the developers of this package for making this functionality possible.

The editor provides:

- Split-screen interface with live preview
- Rich formatting toolbar
- Support for common Markdown features (headings, lists, links, images, etc.)
- Easy content editing for documentation

The editor is implemented in the following locations:
- Create new document: `/admin/new`
- Edit existing document: `/admin/edit/[id]`

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
