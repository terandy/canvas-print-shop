export default function Loading({ message }: { message?: string }) {
    return (
        <div className="flex flex-col gap-3 items-center justify-center min-h-screen">
            {message && <p>{message}</p>}
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        </div>
    )
}