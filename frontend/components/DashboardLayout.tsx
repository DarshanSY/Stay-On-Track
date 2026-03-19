export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar is fixed, so we need left margin on main content matching sidebar width */}
            <div className="hidden md:block w-64 flex-shrink-0" /> {/* Spacer */}

            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
