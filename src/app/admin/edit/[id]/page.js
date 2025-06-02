import Navbar from '../../../components/navbar';
import AuthCheck from '../../../components/auth-check';
import EditDocumentForm from './edit-document-form';

// This is a server component that can properly handle params
export default async function EditDocumentPage({ params }) {
  // Properly await params in server component
  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;

  return (
    <div>
      <Navbar />
      <AuthCheck>
        <div className="container" style={{ padding: '0.5rem 0' }}>
          <h3>Edit Document</h3>
          <EditDocumentForm documentId={id} />
        </div>
      </AuthCheck>
    </div>
  );
}
