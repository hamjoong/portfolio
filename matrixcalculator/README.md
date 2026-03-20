# Matrix Calculator
계산기능과 시각화 기능을 결합하여 사용자가 수학적 행렬 연산을 웹 브라우저에서 쉽고 빠르게 수행할 수 있도록 돕는 계산기 도구입니다.
복잡한 수식을 시각적으로 처리하는 데 중점을 두었습니다.

# Tech Stack
- **Frontend**: HTML5 / CSS3 (SCSS)
- **Script**: JavaScript (ES6+) / jQuery
- **Templating**: Pug

# Key Features
- **Basic Operations**: 행렬의 덧셈, 뺄셈, 곱셈 연산 지원.
- **Advanced Math**: 역행렬(Inverse), 전치행렬(Transpose), 행렬식(Determinant) 계산.
- **Dynamic Grid**: 사용자가 행렬의 크기(Row x Col)를 유동적으로 조절 가능.
- **Instant Result**: 연산 버튼 클릭 시 실시간 결과 도출 및 시각화.

# Existing system issues
- Matrix Calculator에서 대규모 행렬 연산 시 렌더링 성능이 저하되어 사용자 경험이 크게 떨어지는 문제

# System Improvements
- 행열 연산 최적화 및 가상 DOM을 활용한 렌더링 방식을 도입하여 성능을 70% 이상 개선하고 사용자 인터페이스를 재설계하여 복잡한 행렬 연산 결과를 시각적으로 명확하게 표현
