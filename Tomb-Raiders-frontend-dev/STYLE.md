# 프로젝트 코드 스타일 가이드 (Airbnb + Prettier)

본 프로젝트는 **ESLint (Airbnb 규칙)** 와 **Prettier**를 결합하여 일관된 코드 스타일을 유지하고 있습니다. 개발 생산성을 높이고 리뷰 시간을 단축하기 위해, 각 개발자의 IDE 환경에서 코드를 작성하고 저장할 때마다 **자동으로 코드 포맷팅**이 적용되도록 설정하는 것을 권장합니다.

아래 가이드를 따라 사용 중인 IDE에 자동 린트(Auto-Linting) 및 포맷팅 설정을 적용해 주세요.

---

## 1. WebStorm 사용자 설정 가이드

WebStorm에서는 파일 저장 시 ESLint와 Prettier가 자동으로 실행되어 코드를 교정하도록 설정할 수 있습니다.

### ⚙️ ESLint 자동 수정 켜기
1. WebStorm 설정 창 열기: `Ctrl + Alt + S` (macOS: `Cmd + ,`)
2. 좌측 메뉴에서 **Languages & Frameworks** > **JavaScript** > **Code Quality Tools** > **ESLint** 로 이동
3. 우측 설정에서 **Automatic ESLint configuration** 선택
4. **Run eslint --fix on save** (저장 시 자동 수정) 항목 체크박스 ✅ 확인
5. 적용(Apply) 클릭

### ⚙️ Prettier 자동 포맷 켜기
1. 동일한 설정 창에서 **Languages & Frameworks** > **JavaScript** > **Prettier** 로 이동
2. **On save** (저장 시 실행) 항목 체크박스 ✅ 확인
3. 확인(OK) 클릭하여 설정 창 닫기

이제 코드를 작성한 뒤 `Ctrl + S`(또는 `Cmd + S`)로 저장할 때마다, 띄어쓰기나 쉼표 등의 포맷이 자동으로 깔끔하게 정리됩니다.

---

## 2. VS Code (Visual Studio Code) 사용자 설정 가이드

VS Code 환경에서는 필수 확장 프로그램(Extensions)을 설치하고, 작업 영역 혹은 전역 설정(`settings.json`)을 수정하여 자동화할 수 있습니다.

### 📦 필수 확장 프로그램 설치
VS Code의 확장 프로그램(Extensions) 탭에서 다음 두 가지를 검색하여 설치합니다.
- `ESLint` (발행자: Microsoft)
- `Prettier - Code formatter` (발행자: Prettier)

### ⚙️ 저장 시 자동 포맷 설정 (`settings.json`)
1. 설정(Settings) 메뉴 열기: `Ctrl + ,` (macOS: `Cmd + ,`)
2. 우측 상단의 종이 아이콘(Open Settings (JSON))을 클릭하여 `settings.json` 파일 열기
3. 아래 설정값을 추가 및 저장:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## 3. 수동으로 전체 코드 검사 및 수정 (공통)

만약 IDE 자동화 없이 명령어로 전체 프로젝트의 스타일을 한 번에 검사하거나 고치고 싶다면 다음 명령어를 사용합니다.

- **문제 검사하기:**
  ```bash
  npm run lint
  ```
- **발견된 문제 자동 수정하기:**
  ```bash
  npm run lint -- --fix
  ```

---

## 🚨 참고 사항 (Windows 개발자 필독)
- Windows 환경에서는 기본 줄바꿈이 `CRLF`로 저장되는 문제가 있으나, 현재 본 프로젝트의 `.eslintrc.cjs` 설정에 `endOfLine: 'auto'`가 추가되어 있어 운영체제간 줄바꿈 충돌이 발생하지 않도록 조치되어 있습니다.
- 새로운 규칙을 추가하거나 수정하고 싶다면 최상위 디렉터리의 `.eslintrc.cjs` 파일을 수정해 주시기 바랍니다.
