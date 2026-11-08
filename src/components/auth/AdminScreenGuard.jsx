import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { isAdminRole } from '../../utils/authRoles';

const AdminScreenGuard = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAdminPage = isAdminRole(user?.role) && location.pathname.startsWith('/admin');
  const [isObscured, setIsObscured] = useState(() => (
    typeof document !== 'undefined' && document.hidden
  ));

  useEffect(() => {
    if (!isAdminPage) {
      setIsObscured(false);
      return undefined;
    }

    document.body.classList.add('admin-screen-protected');
    const hidePage = () => setIsObscured(true);
    const restorePage = () => {
      if (!document.hidden) setIsObscured(false);
    };
    const blockPrintScreen = (event) => {
      if (event.key === 'PrintScreen') event.preventDefault();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') event.preventDefault();
    };

    window.addEventListener('blur', hidePage);
    window.addEventListener('focus', restorePage);
    document.addEventListener('visibilitychange', restorePage);
    document.addEventListener('keydown', blockPrintScreen, true);
    return () => {
      window.removeEventListener('blur', hidePage);
      window.removeEventListener('focus', restorePage);
      document.removeEventListener('visibilitychange', restorePage);
      document.removeEventListener('keydown', blockPrintScreen, true);
      document.body.classList.remove('admin-screen-protected');
    };
  }, [isAdminPage]);

  if (!isAdminPage) return null;

  return (
    <>
      <style>{`
        @media print {
          body.admin-screen-protected .admin-route-view { visibility: hidden !important; }
          body.admin-screen-protected .admin-screen-guard__print { display: grid !important; }
        }
      `}</style>
      {isObscured ? (
        <div className="admin-screen-guard__obscured" role="status" aria-live="polite">
          <strong>Admin screen protected</strong>
          <span>ارجع إلى نافذة لوحة الإدارة لعرض المحتوى</span>
        </div>
      ) : null}
      <div className="admin-screen-guard__print" aria-hidden="true">Admin page — printing is disabled</div>
    </>
  );
};

export default AdminScreenGuard;
