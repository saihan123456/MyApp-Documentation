import EditDocumentForm from './edit-document-form';
import AuthCheck from '@/app/components/auth-check';
import Navbar from '@/app/components/navbar';
import { getTranslations } from '@/app/translations';

// This is a server component that can properly handle params
export default async function EditDocumentPage({ params }) {
  const { id, locale } = params;
  const t = await getTranslations(locale);

  return (
    <div>
      <Navbar />
      <AuthCheck>
        <div className="container" style={{ padding: '2rem 0', paddingTop: 'var(--navbar-height, 70px)' }}>
          <h1>{t.editDocument}</h1>
          <EditDocumentForm id={id} locale={locale} />
        </div>
      </AuthCheck>
    </div>
  );
}
