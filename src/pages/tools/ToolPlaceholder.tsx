type ToolPlaceholderProps = {
    title: string;
    description: string;
};

export default function ToolPlaceholder({ title, description }: ToolPlaceholderProps) {
    return (
        <div className="w-full max-w-3xl text-center py-8 px-4">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-4">
                View bereit · Logik folgt
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{title}</h1>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">{description}</p>
        </div>
    );
}
