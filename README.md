# MyApp Documentation

## About

This is a simple fullstack documentation management app created with Next.js and SQLite database. It includes built-in authentication, file management, and a WYSIWYG markdown editor. No need to connect to any cloud service or API - everything works right out of the box.

## Features

- **No-Code Documentation Management System** - Create, edit, and manage documentation without writing code
- **Built-in Authentication** - Secure access to admin features
- **Full Text Search** - With highlighted search results for easy navigation
- **Built-in File and Image Management** - Upload and manage files directly within the app
- **Admin Dashboard** - Comprehensive interface for managing documents
- **WYSIWYG Markdown Editor** - With realtime preview and fullscreen functionality
- **Server-Side Rendering** - For better SEO performance
- **Admin Password Reset** - Enhanced security features
- **Self-Contained** - No fancy cloud services connectivity required
- **Multilingual Support** - Full internationalization with English and Japanese language options

## Tech Stack

- **Next.js** - React framework for production
- **SQLite** - Lightweight, file-based database
- **NextAuth.js** - Authentication solution
- **react-markdown-editor-lite** - WYSIWYG markdown editor

## Language Support

The application supports multiple languages with a complete internationalization system:

- **English** - Default language
- **Japanese** - Full translation support
- **Language Switching** - Users can switch languages via the navbar
- **Locale-Based URLs** - All routes include language prefixes (e.g., `/en/docs`, `/ja/admin`)
- **Persistent Language Preferences** - User language choices are saved in cookies
- **Locale-Specific Content** - Documents are filtered by language


## Getting Started

### Installation

This project uses React 19 with some dependencies that require compatibility mode. To install all dependencies correctly, use the `--legacy-peer-deps` flag:

```bash
npm install --legacy-peer-deps
```

### Database Setup

This project uses SQLite as the database, which is a lightweight, file-based database that requires no additional setup or server installation.

#### Database Migration

Before running the application for the first time or after updating the codebase, you should run the database migration script to ensure all required tables are created:

```bash
node src/app/lib/db/migrate.js
```

#### Database Seeding

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

## Screenshots

Here are some screenshots of the application:

![Home](/docs/images/home.jpg)
*Home page view*

![Documents list](/docs/images/docs.jpg)
*Documents list and document detail view*

![Search](/docs/images/search.jpg)
*Search and Search result view*

![Login](/docs/images/login.jpg)
*Admin Login view*

![Dashboard](/docs/images/dashboard.jpg)
*Admin Dashboard view showing document list*

![Editor](/docs/images/editor.jpg)
*Content Creation and Editing WYSIWYG Markdown editor interface*

![Image Upload](/docs/images/image-manager.jpg)
*Image Upload and Image Manager interface*

![Account Settings](/docs/images/account-settings.jpg)
*Account Settings interface*

![Japanese Dashboard](/docs/images/jp1.jpg)
*Japanese Admin Dashboard view showing document list*

![Jp document detail](/docs/images/jp2.jpg)
*Japanese Document detail view*

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Contributing

We welcome contributions to improve this documentation management application! Please follow these steps to contribute:

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/MyApp-Documentation.git
   cd MyApp-Documentation
   ```
3. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes**
5. **Commit your changes**
   ```bash
   git commit -m "Add a descriptive commit message"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click on "Pull Requests" and then "New Pull Request"
   - Select your branch and create the PR
   - Provide a clear description of the changes and reference any related issues

### Pull Request Guidelines

When submitting a PR, please:
- Clearly describe what changes you've made and why
- Include screenshots for UI changes if applicable
- Make sure your code follows the existing style of the project
- Keep PRs focused on a single feature or fix

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Learn More

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) for more information about Next.js.
