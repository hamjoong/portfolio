import React, { useMemo } from 'react';

interface DayActivity {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  data: DayActivity[];
  days?: number;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const LEVEL_CLASSES = ['bg-slate-100', 'bg-green-200', 'bg-green-400', 'bg-green-600', 'bg-green-800'];

const toLevel = (count: number): number => {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
};

const formatDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * [Why] GitHub '잔디'처럼 하루 활동량(글·댓글·AI 리뷰·시니어 리뷰)을 한눈에 보여 준다.
 *       외부 차트 라이브러리 없이 CSS grid(주 단위 열 × 요일 행)로 그린다.
 */
export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data, days = 365 }) => {
  const { weeks, total } = useMemo(() => {
    const countByDate = new Map(data.map((d) => [d.date, d.count]));

    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    // 첫 열이 일요일부터 시작하도록 앞쪽을 비워 둔다
    const leading = start.getDay();

    const cells: ({ date: string; count: number } | null)[] = Array(leading).fill(null);
    let sum = 0;
    for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      const key = formatDate(cursor);
      const count = countByDate.get(key) ?? 0;
      sum += count;
      cells.push({ date: key, count });
    }

    const columns: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      columns.push(cells.slice(i, i + 7));
    }
    return { weeks: columns, total: sum };
  }, [data, days]);

  return (
    <div>
      <p className="text-sm font-bold text-slate-600 mb-4">
        최근 {days}일 동안 총 <span className="text-green-700 font-black">{total.toLocaleString()}</span>건의 활동
      </p>
      {/* [Why] 53주 폭은 좁은 화면을 넘치므로 이 영역 안에서만 가로 스크롤한다 */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1 w-max">
          <div className="flex flex-col gap-1 mr-1 text-[10px] text-slate-400 font-bold">
            {WEEKDAYS.map((w, i) => (
              <span key={w} className="h-3 leading-3">{i % 2 === 1 ? w : ''}</span>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell, ci) =>
                cell ? (
                  <div
                    key={cell.date}
                    title={`${cell.date} · ${cell.count}건`}
                    className={`w-3 h-3 rounded-sm ${LEVEL_CLASSES[toLevel(cell.count)]}`}
                  />
                ) : (
                  <div key={`empty-${ci}`} className="w-3 h-3" />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-500 font-bold">
        <span>적음</span>
        {LEVEL_CLASSES.map((c) => (
          <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span>많음</span>
      </div>
    </div>
  );
};
