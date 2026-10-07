window.addEventListener('DOMContentLoaded', event => {

    // 네비게이션 바 축소 함수
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // 네비게이션 바를 축소 
    navbarShrink();

    // 페이지를 스크롤할 때 네비게이션 바의 크기를 줄입니다.
    document.addEventListener('scroll', navbarShrink);

    // 메인 네비게이션 요소에 Bootstrap 스크롤스파이를 활성화합니다.
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 72,
        });
    };

    // 토글 버튼이 보일 때 반응형 내비게이션 바를 접습니다.
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = document.querySelectorAll('#navbarResponsive .nav-link');
    
    responsiveNavItems.forEach(responsiveNavItem => {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});
