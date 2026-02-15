import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";
export function ProtectedRoute({ children }) {
    const { user, loading } = useAppSelector((state) => state.auth);
    const navigate = useNavigate();
    useEffect(() => {
        if (!loading && !user) {
            navigate("/auth");
        }
    }, [user, loading, navigate]);
    if (loading) {
        return (<div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>);
    }
    if (!user) {
        return null;
    }
    return <>{children}</>;
}
