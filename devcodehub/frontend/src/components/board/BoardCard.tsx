import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import BookmarkButton from '../BookmarkButton';

export interface BoardCardData {
  id: number;
  title: string;
  authorNickname: string;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  tags: string[];
}

interface BoardCardProps {
  board: BoardCardData;
  onBookmarkToggle?: (postId: number, newBookmarkedStatus: boolean) => void;
}

const BoardCard = memo<BoardCardProps>(({ board, onBookmarkToggle }) => {
  const navigate = useNavigate();
  const handleCardClick = () => { navigate(`/boards/${board.id}`); };
  const handleBookmarkChange = (newStatus: boolean) => { if (onBookmarkToggle) onBookmarkToggle(board.id, newStatus); };

  return (
    <div className="p-8 bg-white rounded-3xl border border-slate-50 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
      <div onClick={handleCardClick} className="flex-1 cursor-pointer mr-4">
        <div className="mb-3.5">
          <h3 className="text-2xl font-black text-slate-900 mb-2">{board.title}</h3>
          <div className="flex gap-2">
            {board.tags.map(tagName => <span key={tagName} className="text-sm text-slate-500 font-semibold">#{tagName}</span>)}
          </div>
        </div>
        <div className="flex text-sm text-slate-400 font-medium items-center">
          <span>{board.authorNickname}</span>
          <span className="mx-3">|</span>
          <span>{new Date(board.createdAt).toLocaleDateString()}</span>
          <span className="mx-3">|</span>
          <span>조회 {board.viewCount}</span>
          <span className="mx-3">|</span>
          <span className="text-blue-600 font-black">👍 {board.likeCount}</span>
        </div>
      </div>
      <BookmarkButton postId={board.id} initialBookmarked={board.isBookmarked} onToggle={handleBookmarkChange} />
    </div>
  );
});

export default BoardCard;