import Sidebar from '../../components/Sidebar';

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 md:ml-64 transition-all duration-300">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
