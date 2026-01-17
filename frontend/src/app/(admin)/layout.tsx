import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-950">
            <AdminSidebar />
            <div className="md:ml-64 pt-20 p-8">
                {children}
            </div>
        </div>
    );
}
