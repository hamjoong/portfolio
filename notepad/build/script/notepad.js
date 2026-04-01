// 상수 정의: localStorage 키 및 기본값
const STORAGE_KEY = 'notepad_notes';
const DEFAULT_TITLE = '제목 없음';
const DEFAULT_CONTENTS = '내용 없음';

// DOM 요소 캐싱
const noteTitleInput = document.querySelector('#note_Title');
const noteContentsInput = document.querySelector('#note_Contents');
const notesContainer = document.querySelector('.notepad_body_title_contents_box2');
const modal = $('.model_box'); // jQuery 사용
let articleToDelete = null; // 삭제 예정인 메모를 저장할 변수

// DOM 로드 완료 후 초기화 함수 실행
document.addEventListener('DOMContentLoaded', () => {
    loadNotes(); // 로컬 스토리지에서 메모 불러오기

    // 저장 버튼 클릭 이벤트 리스너
    // '저장' 버튼은 이제 input 요소들의 value를 직접 조작합니다.
    // form 태그는 제거되었습니다.
    document.querySelector('#notepad_save_button').addEventListener('click', () => {
        const title = noteTitleInput.value.trim();
        const contents = noteContentsInput.value.trim();

        // 제목 또는 내용이 비어있는 경우 사용자에게 알림
        if (title === "" || contents === "") {
            alert("제목과 내용을 모두 입력해주세요.");
            return; // 입력되지 않은 필드가 있으면 저장하지 않고 함수 종료
        }

        // 로컬 스토리지에 저장하고 메모 생성
        const id = saveNoteToStorage(title, contents);
        if (id !== null) {
            // 메모 생성 함수는 실제 입력된 값(title, contents)을 사용합니다.
            createMemo(title, contents, id);

            // 입력창 초기화
            noteTitleInput.value = "";
            noteContentsInput.value = "";
        } else {
            alert("메모 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    });

    // 수정 버튼 클릭 이벤트 (이벤트 위임)
    $(document).on('click', '.edit_btn', function() {
        const article = $(this).closest('article');
        const id = article.data('id');
        const titleText = article.find('.title_box').text();
        const contentsText = article.find('.contents_box').text();
        
        // 저장된 텍스트를 가져오되, 기본값("제목 없음", "내용 없음")은 실제 빈 값으로 변환하여 입력창에 보여줍니다.
        noteTitleInput.value = (titleText === DEFAULT_TITLE) ? "" : titleText;
        noteContentsInput.value = (contentsText === DEFAULT_CONTENTS) ? "" : contentsText;
        
        // 로컬 스토리지에서 해당 메모 삭제 후, 수정된 내용으로 다시 저장하기 위해 DOM에서 제거합니다.
        deleteNoteFromStorage(id);
        article.remove(); // DOM에서 기존 메모 제거
        noteTitleInput.focus(); // 제목 입력란에 포커스
    });

    // 삭제 버튼 클릭 이벤트 (모달 표시)
    $(document).on('click', '.delete_btn', function() {
        articleToDelete = $(this).closest('article'); // 삭제 대상 메모 저장
        modal.show(); // jQuery를 사용하여 모달 표시
    });

    // 모달 삭제 확인 버튼 클릭 이벤트
    $('.model_box .delete_button').on('click', function() {
        if (articleToDelete) {
            const id = articleToDelete.data('id');
            deleteNoteFromStorage(id);
            articleToDelete.remove(); // DOM에서 메모 제거
            articleToDelete = null; // 삭제 대상 초기화
        }
        modal.hide(); // jQuery를 사용하여 모달 숨김
    });

    // 모달 취소 버튼 클릭 이벤트
    $('.model_box .cancel_button').on('click', function() {
        articleToDelete = null; // 삭제 대상 초기화
        modal.hide(); // jQuery를 사용하여 모달 숨김
    });
});

// 로컬 스토리지에서 모든 메모를 불러오는 함수
function loadNotes() {
    try {
        const notes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        notesContainer.innerHTML = ''; // 컨테이너의 기존 내용을 모두 지웁니다.
        notes.forEach(note => {
            // 저장된 내용이 없으면 기본값을 사용하되, 그렇지 않으면 실제 저장된 값을 사용합니다.
            const title = note.title.trim() === "" ? DEFAULT_TITLE : note.title;
            const contents = note.contents.trim() === "" ? DEFAULT_CONTENTS : note.contents;
            createMemo(title, contents, note.id);
        });
    } catch (e) {
        console.error("로컬 스토리지에서 메모를 불러오는 중 오류 발생:", e);
        alert("메모를 불러오는 데 실패했습니다. 데이터를 복구하지 못할 수 있습니다.");
    }
}

// 메모를 로컬 스토리지에 저장하는 함수
function saveNoteToStorage(title, contents) {
    try {
        const notes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const newNote = {
            id: Date.now(), // 고유 ID 생성을 위해 현재 시간을 사용합니다.
            title: title, // trim()은 이미 외부에서 처리되었습니다.
            contents: contents // trim()은 이미 외부에서 처리되었습니다.
        };
        notes.push(newNote);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        return newNote.id; // 성공 시 새 메모의 ID 반환
    } catch (e) {
        console.error("로컬 스토리지에 메모를 저장하는 중 오류 발생:", e);
        return null; // 저장 실패 시 null 반환
    }
}

// 메모를 로컬 스토리지에서 삭제하는 함수
function deleteNoteFromStorage(id) {
    try {
        let notes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        notes = notes.filter(note => note.id != id); // 해당 ID의 메모를 제외하고 필터링
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
        console.error("로컬 스토리지에서 메모를 삭제하는 중 오류 발생:", e);
        alert("메모 삭제 중 오류가 발생했습니다.");
    }
}

// 메모 요소를 생성하여 DOM에 추가하는 함수
function createMemo(title, contents, id) {
    const memoElement = document.createElement('article');
    memoElement.className = 'box';
    memoElement.dataset.id = id; // data-id 속성 설정
    memoElement.innerHTML = `
        <p class='title_box'>${title}</p>
        <p class='contents_box'>${contents}</p>
        <div class='button_container'>
            <button class='edit_btn'><i class="xi-edit"></i> 수정</button>
            <button class='delete_btn'><i class="xi-trash"></i> 삭제</button>
        </div>
    `;
    notesContainer.appendChild(memoElement);
}