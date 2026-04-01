/*메모장 입력 영역*/
document.addEventListener('DOMContentLoaded', () => {
  const noteTitleInput = document.querySelector('#note_Title');
  const noteContentsInput = document.querySelector('#note_Contents');
  const saveBtn = document.querySelector('#notepad_save_button');
  const container = document.querySelector('.notepad_body_title_contents_box2');
  const modal = $('.model_box');
  let articleToDelete = null;

  // 로컬 스토리지에서 메모 불러오기
  loadNotes();

  function loadNotes() {
    try {
      const notes = JSON.parse(localStorage.getItem('notepad_notes')) || [];
      container.innerHTML = ''; // 기존 내용을 모두 지웁니다.
      notes.forEach(note => {
        // 저장된 내용이 없을 경우 기본 플레이스홀더를 사용합니다.
        const title = note.title.trim() === "" ? "제목 없음" : note.title;
        const contents = note.contents.trim() === "" ? "내용 없음" : note.contents;
        createMemo(title, contents, note.id);
      });
    } catch (e) {
      console.error("로컬 스토리지에서 메모를 불러오는 중 오류 발생:", e);
      // 오류 발생 시 사용자에게 알림 또는 기본값으로 복구하는 로직 추가 가능
    }
  }

  function saveNoteToStorage(title, contents) {
    try {
      const notes = JSON.parse(localStorage.getItem('notepad_notes')) || [];
      const newNote = {
        id: Date.now(), // 고유 ID 생성을 위해 현재 시간을 사용합니다.
        title: title.trim() === "" ? "제목 없음" : title, // 제목이 비어있을 경우 기본값 설정
        contents: contents.trim() === "" ? "내용 없음" : contents // 내용이 비어있을 경우 기본값 설정
      };
      notes.push(newNote);
      localStorage.setItem('notepad_notes', JSON.stringify(notes));
      return newNote.id;
    } catch (e) {
      console.error("로컬 스토리지에 메모를 저장하는 중 오류 발생:", e);
      return null; // 저장 실패 시 null 반환
    }
  }

  function deleteNoteFromStorage(id) {
    try {
      let notes = JSON.parse(localStorage.getItem('notepad_notes')) || [];
      notes = notes.filter(note => note.id != id);
      localStorage.setItem('notepad_notes', JSON.stringify(notes));
    } catch (e) {
      console.error("로컬 스토리지에서 메모를 삭제하는 중 오류 발생:", e);
    }
  }

  // 메모를 생성하고 DOM에 추가하는 함수
  // 이곳은 UI 렌더링에 집중하며, 데이터 관리는 별도 함수에서 처리합니다.
  function createMemo(title, contents, id) {
    const memoElement = document.createElement('article');
    memoElement.className = 'box';
    memoElement.dataset.id = id;
    memoElement.innerHTML = `
      <p class='title_box'>${title}</p>
      <p class='contents_box'>${contents}</p>
      <div class='button_container'>
        <button class='edit_btn'><i class="xi-edit"></i> 수정</button>
        <button class='delete_btn'><i class="xi-trash"></i> 삭제</button>
      </div>
    `;
    container.appendChild(memoElement);
  }

  /*저장 버튼 클릭 이벤트*/
  saveBtn.addEventListener('click', (e) => {
    e.preventDefault(); // 기본 폼 제출 동작을 막아 페이지 새로고침 방지
    const title = noteTitleInput.value.trim();
    const contents = noteContentsInput.value.trim();

    // 제목과 내용이 모두 입력되었는지 확인합니다.
    if (title === "" || contents === "") {
        alert("제목과 내용을 모두 입력해주세요.");
        return; // 입력되지 않은 필드가 있으면 저장하지 않고 함수 종료
    }

    /* 로컬 스토리지에 저장하고 메모 생성 */
    const id = saveNoteToStorage(title, contents);
    if (id !== null) { // 저장 성공 시에만 UI 업데이트
        // createMemo 함수는 이제 저장 시 빈 문자열이 아닌 실제 입력된 값을 그대로 사용합니다.
        // 로드 시 기본값 처리는 loadNotes 함수에서 담당합니다.
        createMemo(title, contents, id);

        /*입력창 초기화*/
        noteTitleInput.value = "";
        noteContentsInput.value = "";
    } else {
        alert("메모 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  });

  /*수정 버튼 클릭 이벤트 (이벤트 위임)*/
  $(document).on('click', '.edit_btn', function() {
    const article = $(this).closest('article');
    const id = article.data('id');
    // 저장된 텍스트를 가져오되, 기본값("제목 없음", "내용 없음")은 실제 빈 값으로 처리하여 수정 입력창에 보여줍니다.
    const title = article.find('.title_box').text();
    const contents = article.find('.contents_box').text();
    
    noteTitleInput.value = (title === "제목 없음") ? "" : title;
    noteContentsInput.value = (contents === "내용 없음") ? "" : contents;
    
    /* 로컬 스토리지에서 해당 메모 삭제 후 수정된 내용으로 다시 저장 */
    deleteNoteFromStorage(id);
    article.remove(); // DOM에서 기존 메모 제거
    noteTitleInput.focus(); // 제목 입력란에 포커스
  });

  /*삭제 버튼 클릭 이벤트(모달 표시)*/
  $(document).on('click', '.delete_btn', function() {
    articleToDelete = $(this).closest('article');
    modal.show(); // jQuery를 사용하여 모달 표시
  });

  /*모달 삭제 확인 버튼*/
  $('.model_box .delete_button').on('click', function() {
    if (articleToDelete) {
      const id = articleToDelete.data('id');
      deleteNoteFromStorage(id);
      articleToDelete.remove(); // DOM에서 메모 제거
      articleToDelete = null;
    }
    modal.hide(); // jQuery를 사용하여 모달 숨김
  });

  /*모달 취소 버튼*/
  $('.model_box .cancel_button').on('click', function() {
    articleToDelete = null;
    modal.hide(); // jQuery를 사용하여 모달 숨김
  });
});