import { Extension, textblockTypeInputRule } from '@tiptap/core'

/**
 * 마크다운 스타일 단축키 확장
 * - # ~ #### : 제목
 * - > : 인용구
 * - ``` : 코드 블록
 * - --- : 구분선
 * - [] : 체크리스트
 */
export const MarkdownShortcuts = Extension.create({
  name: 'markdownShortcuts',

  addInputRules() {
    return [
      // # 제목 1
      textblockTypeInputRule({
        find: /^#\s$/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 1 }),
      }),

      // ## 제목 2
      textblockTypeInputRule({
        find: /^##\s$/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 2 }),
      }),

      // ### 제목 3
      textblockTypeInputRule({
        find: /^###\s$/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 3 }),
      }),

      // #### 제목 4
      textblockTypeInputRule({
        find: /^####\s$/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 4 }),
      }),

      // > 인용구
      textblockTypeInputRule({
        find: /^>\s$/,
        type: this.editor.schema.nodes.blockquote,
      }),

      // ``` 코드 블록
      textblockTypeInputRule({
        find: /^```$/,
        type: this.editor.schema.nodes.codeBlock,
      }),
    ]
  },

  addKeyboardShortcuts() {
    return {
      // --- 입력 시 구분선 삽입
      'Mod-Shift--': () => {
        return this.editor.commands.setHorizontalRule()
      },

      // Tab 키로 들여쓰기
      Tab: () => {
        if (this.editor.isActive('listItem')) {
          return this.editor.commands.sinkListItem('listItem')
        }
        return false
      },

      // Shift+Tab 키로 내어쓰기
      'Shift-Tab': () => {
        if (this.editor.isActive('listItem')) {
          return this.editor.commands.liftListItem('listItem')
        }
        return false
      },

      // Ctrl+Shift+C 코드 블록 토글
      'Mod-Shift-c': () => {
        return this.editor.commands.toggleCodeBlock()
      },

      // Ctrl+Shift+Q 인용구 토글
      'Mod-Shift-q': () => {
        return this.editor.commands.toggleBlockquote()
      },

      // Ctrl+Shift+1~4 제목 레벨
      'Mod-Shift-1': () => {
        return this.editor.commands.toggleHeading({ level: 1 })
      },
      'Mod-Shift-2': () => {
        return this.editor.commands.toggleHeading({ level: 2 })
      },
      'Mod-Shift-3': () => {
        return this.editor.commands.toggleHeading({ level: 3 })
      },
      'Mod-Shift-4': () => {
        return this.editor.commands.toggleHeading({ level: 4 })
      },

      // Ctrl+Shift+8 글머리 기호 목록
      'Mod-Shift-8': () => {
        return this.editor.commands.toggleBulletList()
      },

      // Ctrl+Shift+9 번호 목록
      'Mod-Shift-9': () => {
        return this.editor.commands.toggleOrderedList()
      },
    }
  },
})
