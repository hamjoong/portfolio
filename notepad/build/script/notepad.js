/*메모장 입력 영역*/
window.addEventListener('load', () => {
  const noteTitle = document.querySelector('#note_Title');
  const noteContents = document.querySelector('#note_Contents');
  const saveBtn = document.querySelector('#notepad_save_button');
  const container = document.querySelector('.notepad_body_title_contents_box2');
  const modal = $('.model_box');
  let articleToDelete = null;

  /*메모 생성 함수*/
  function createMemo(title, contents, id) {
    const html = `
      <article class='box' data-id='${id}'>
        <p class='title_box'>${title}</p>
        <p class='contents_box'>${contents}</p>
        <div class='button_container'>
          <button class='edit_btn'><i class="xi-edit"></i> 수정</button>
          <button class='delete_btn'><i class="xi-trash"></i> 삭제</button>
        </div>
      </article>`;
    $(container).append(html);
  }

  /*저장 버튼 클릭 이벤트*/
  saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const title = noteTitle.value.trim();
    const contents = noteContents.value.trim();

    /*제목과 내용이 모두 입력되어 있는지 확인*/
    if (title === "" || contents === "") {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    /* AJAX 요청 */
    $.post('/', { Title: title, Contents: contents }, (response) => {
       createMemo(title, contents, response.id);
       /*입력창 초기화*/
       noteTitle.value = "";
       noteContents.value = "";
    });
  });

  /*수정 버튼 클릭 이벤트 (이벤트 위임)*/
  $(document).on('click', '.edit_btn', function() {
    const article = $(this).closest('article');
    const id = article.data('id');
    const title = article.find('.title_box').text();
    const contents = article.find('.contents_box').text();
    
    noteTitle.value = title === "제목 없음" ? "" : title;
    noteContents.value = contents === "내용 없음" ? "" : contents;
    
    /* DB에서도 삭제 */
    $.ajax({
        url: '/notes/' + id,
        type: 'DELETE',
        success: function(result) {
            article.remove();
            noteTitle.focus();
        }
    });
  });

  /*삭제 버튼 클릭 이벤트(모달 표시)*/
  $(document).on('click', '.delete_btn', function() {
    articleToDelete = $(this).closest('article');
    modal.show();
  });

  /*모달 삭제 확인 버튼*/
  $('.model_box .delete_button').on('click', function() {
    if (articleToDelete) {
      const id = articleToDelete.data('id');
      $.ajax({
        url: '/notes/' + id,
        type: 'DELETE',
        success: function(result) {
            articleToDelete.remove();
            articleToDelete = null;
        }
      });
    }
    modal.hide();
  });

  /*모달 취소 버튼*/
  $('.model_box .cancel_button').on('click', function() {
    articleToDelete = null;
    modal.hide();
  });

  /*초기 데이터 로드 (JSON)*/
  $.getJSON('/notes', (jsonData) => {
    if (jsonData && jsonData.length) {
      jsonData.forEach(item => {
        createMemo(item.title, item.contents, item.id);
      });
    }
  }).fail(() => {
    console.log("기본 메모 데이터가 없거나 로드에 실패했습니다.");
  });
});
