import { useState, useCallback } from 'react';
import { FaRegBookmark, FaBookmark } from 'react-icons/fa';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface BookmarkButtonProps {
    postId: number;
    initialBookmarked: boolean;
    onToggle?: (newBookmarkedStatus: boolean) => void;
}

/**
 * 북마크 토글 버튼 컴포넌트
 * GEMINI.md 규칙: 불필요한 useEffect 제거로 성능 최적화
 * initialBookmarked prop이 변경되면 key prop을 통해 리셋됩니다.
 */
const BookmarkButton: React.FC<BookmarkButtonProps> = ({ postId, initialBookmarked, onToggle }) => {
    const { isLoggedIn, role } = useAuthStore();
    const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = useCallback(async (event: React.MouseEvent) => {
        event.stopPropagation();

        if (!isLoggedIn || role === 'GUEST') {
            alert('북마크하려면 로그인해주세요.');
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        try {
            const response = await api.post(`/boards/${postId}/bookmark`);
            const newBookmarkStatus = response.data;
            setIsBookmarked(newBookmarkStatus);

            if (onToggle) {
                onToggle(newBookmarkStatus);
            }
        } catch (error) {
            console.error('[BookmarkButton] 북마크 처리 에러:', error);
            alert('북마크 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn, role, isLoading, postId, onToggle]);

    return (
        <button onClick={handleClick} disabled={isLoading} aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
            {isLoading ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            ) : isBookmarked ? (
                <FaBookmark className="w-5 h-5 text-blue-600" />
            ) : (
                <FaRegBookmark className="w-5 h-5 text-slate-400" />
            )}
        </button>
    );
};

export default BookmarkButton;
