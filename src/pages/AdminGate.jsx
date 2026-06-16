import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import AdminPage from "./AdminPage";
import AdminLogin from "./AdminLogin";

const ADMIN_EMAIL = "admin@lincoln.com";

function AdminGate() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error(error);
          setIsAdmin(false);
          return;
        }

        const user = data.session?.user;

        if (!user) {
          setIsAdmin(false);
          return;
        }

        if (user.email === ADMIN_EMAIL) {
          setIsAdmin(true);
        } else {
          await supabase.auth.signOut();
          setIsAdmin(false);
        }
      } catch (error) {
        console.error(error);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    checkAdmin();
  }, []);

  if (checking) {
    return <div style={{ padding: "40px" }}>관리자 확인 중...</div>;
  }

  if (!isAdmin) {
    return <AdminLogin />;
  }

  return <AdminPage />;
}

export default AdminGate;