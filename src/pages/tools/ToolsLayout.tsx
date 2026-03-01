import { Outlet } from 'react-router-dom';

export default function ToolsLayout() {
    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-12 md:py-20 animate-fade-in flex flex-col items-center">
            <Outlet />
        </div>
    );
}
